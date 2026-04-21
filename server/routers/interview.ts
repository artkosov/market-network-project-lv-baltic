import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createInterviewSession,
  createNotification,
  getCandidateByUserId,
  getEmployerById,
  getInterviewByMatchId,
  getInterviewById,
  getJobById,
  getMatchById,
  updateInterviewSession,
  updateMatch,
  logGdprAction,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

export const interviewRouter = router({
  // Start AI interview for a match
  startInterview: protectedProcedure
    .input(z.object({ matchId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const match = await getMatchById(input.matchId);
      if (!match) throw new TRPCError({ code: "NOT_FOUND", message: "Atbilstība nav atrasta" });

      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate || candidate.id !== match.candidateId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Piekļuve liegta" });
      }

      const job = await getJobById(match.jobId);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Vakance nav atrasta" });

      // Check if interview already exists
      const existing = await getInterviewByMatchId(input.matchId);
      if (existing) return { interviewId: existing.id, questions: existing.questions ?? [] };

      // Generate qualifying questions with AI
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert HR interviewer for the Latvian job market. 
Generate 3-5 concise qualifying questions in Latvian for a candidate applying to this position.
Questions should verify key requirements and interest. Be specific to the job context.
Return a JSON array of question strings only.
Example: ["Vai jums ir derīga B kategorijas autovadītāja apliecība?", "Vai varat strādāt maiņu darbu?"]`,
          },
          {
            role: "user",
            content: `Job title: ${job.title}
Job description: ${job.description.substring(0, 500)}
Required skills: ${(job.requiredSkills ?? []).join(", ")}
Required experience: ${job.requiredExperienceYears} years
Location: ${job.city ?? "Latvia"}
Remote policy: ${job.remotePolicy}

Generate qualifying questions in Latvian.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "interview_questions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 5,
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      const parsed = JSON.parse(content);
      const questions: string[] = parsed.questions ?? [];

      const interviewId = await createInterviewSession(input.matchId, candidate.id, job.id);
      await updateInterviewSession(interviewId, {
        questions: JSON.parse(JSON.stringify(questions)),
        status: "in_progress",
        startedAt: new Date(),
      });

      await updateMatch(input.matchId, { status: "interviewing" });

      return { interviewId, questions };
    }),

  // Get interview session
  getInterview: protectedProcedure
    .input(z.object({ interviewId: z.number() }))
    .query(async ({ ctx, input }) => {
      const interview = await getInterviewById(input.interviewId);
      if (!interview) throw new TRPCError({ code: "NOT_FOUND" });

      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate || candidate.id !== interview.candidateId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return interview;
    }),

  // Submit answers
  submitAnswers: protectedProcedure
    .input(
      z.object({
        interviewId: z.number(),
        answers: z.array(z.object({ question: z.string(), answer: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const interview = await getInterviewById(input.interviewId);
      if (!interview) throw new TRPCError({ code: "NOT_FOUND" });

      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate || candidate.id !== interview.candidateId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const job = await getJobById(interview.jobId);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });

      // AI evaluates answers
      const qaText = input.answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n");

      const evalResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an HR evaluator. Evaluate the candidate's interview answers for the position of "${job.title}".
Return JSON with:
- approved: boolean (true if candidate seems suitable based on answers)
- evaluation: string (brief evaluation in Latvian, 2-3 sentences)`,
          },
          {
            role: "user",
            content: `Job: ${job.title}\nRequired skills: ${(job.requiredSkills ?? []).join(", ")}\n\nAnswers:\n${qaText}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "interview_eval",
            strict: true,
            schema: {
              type: "object",
              properties: {
                approved: { type: "boolean" },
                evaluation: { type: "string" },
              },
              required: ["approved", "evaluation"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawEval = evalResponse.choices[0]?.message?.content;
      const evalContent = typeof rawEval === "string" ? rawEval : JSON.stringify(rawEval ?? "{}");
      const evaluation = JSON.parse(evalContent);

      await updateInterviewSession(input.interviewId, {
        answers: JSON.parse(JSON.stringify(input.answers)),
        aiEvaluation: evaluation.evaluation,
        aiApproved: evaluation.approved,
        status: "completed",
        completedAt: new Date(),
      });

      // If AI approves, ask candidate to unlock profile
      if (evaluation.approved) {
        await createNotification({
          userId: ctx.user.id,
          type: "interview_request",
          title: "Intervija veiksmīga!",
          message: `Jūsu atbildes ir novērtētas pozitīvi. Vai vēlaties atklāt savu pilno profilu darba devējam?`,
          relatedMatchId: interview.matchId,
          relatedJobId: interview.jobId,
        });
      }

      return { success: true, approved: evaluation.approved, evaluation: evaluation.evaluation };
    }),

  // Candidate consents to unlock their profile
  unlockProfile: protectedProcedure
    .input(z.object({ matchId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const match = await getMatchById(input.matchId);
      if (!match) throw new TRPCError({ code: "NOT_FOUND" });

      const candidate = await getCandidateByUserId(ctx.user.id);
      if (!candidate || candidate.id !== match.candidateId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await updateMatch(input.matchId, {
        isUnlocked: true,
        unlockedAt: new Date(),
        status: "unlocked",
      });

      await logGdprAction({
        userId: ctx.user.id,
        action: "profile_unlocked",
        details: { matchId: input.matchId, jobId: match.jobId },
      });

      // Notify employer
      const job = await getJobById(match.jobId);
      if (job) {
        const employer = await getEmployerById(job.employerId);
        if (employer) {
          await createNotification({
            userId: employer.userId,
            type: "profile_unlocked",
            title: "Kandidāts atklājis profilu!",
            message: `Kandidāts ir piekritis atklāt savu pilno profilu vakancei "${job.title}".`,
            relatedMatchId: input.matchId,
            relatedJobId: job.id,
          });
        }
      }

      return { success: true };
    }),
});
