import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createJobPosting,
  getActiveJobs,
  getCandidateById,
  getEmployerByUserId,
  getJobById,
  getJobsByEmployer,
  getMatchesByJob,
  logGdprAction,
  updateJobPosting,
  updateMatch,
  upsertEmployerProfile,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { updateUserType } from "../db";

export const employerRouter = router({
  // Get own employer profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getEmployerByUserId(ctx.user.id);
    return profile ?? null;
  }),

  // Create or update employer profile
  upsertProfile: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
        industry: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
        city: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.userType === "unset") {
        await updateUserType(ctx.user.id, "employer");
      }
      await upsertEmployerProfile(ctx.user.id, input);
      return { success: true };
    }),

  // Get all jobs for this employer
  getJobs: protectedProcedure.query(async ({ ctx }) => {
    const employer = await getEmployerByUserId(ctx.user.id);
    if (!employer) return [];
    return getJobsByEmployer(employer.id);
  }),

  // Create a job posting
  createJob: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(10),
        city: z.string().optional(),
        jobType: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]).optional(),
        remotePolicy: z.enum(["onsite", "hybrid", "remote"]).optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        requiredSkills: z.array(z.string()).optional(),
        preferredSkills: z.array(z.string()).optional(),
        requiredExperienceYears: z.number().optional(),
        requiredEducation: z.enum(["none", "secondary", "vocational", "bachelor", "master", "phd"]).optional(),
        requiredLanguages: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const employer = await getEmployerByUserId(ctx.user.id);
      if (!employer) throw new TRPCError({ code: "NOT_FOUND", message: "Darba devēja profils nav atrasts" });

      const jobId = await createJobPosting({
        employerId: employer.id,
        title: input.title,
        description: input.description,
        city: input.city,
        jobType: input.jobType ?? "full_time",
        remotePolicy: input.remotePolicy ?? "onsite",
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        requiredSkills: input.requiredSkills ? JSON.parse(JSON.stringify(input.requiredSkills)) : null,
        preferredSkills: input.preferredSkills ? JSON.parse(JSON.stringify(input.preferredSkills)) : null,
        requiredExperienceYears: input.requiredExperienceYears ?? 0,
        requiredEducation: input.requiredEducation ?? "none",
        requiredLanguages: input.requiredLanguages ? JSON.parse(JSON.stringify(input.requiredLanguages)) : null,
        status: "active",
        source: "manual",
      });

      return { success: true, jobId };
    }),

  // Update job status
  updateJobStatus: protectedProcedure
    .input(z.object({ jobId: z.number(), status: z.enum(["active", "paused", "closed", "draft"]) }))
    .mutation(async ({ ctx, input }) => {
      const employer = await getEmployerByUserId(ctx.user.id);
      if (!employer) throw new TRPCError({ code: "NOT_FOUND" });
      const job = await getJobById(input.jobId);
      if (!job || job.employerId !== employer.id) throw new TRPCError({ code: "FORBIDDEN" });
      await updateJobPosting(input.jobId, { status: input.status });
      return { success: true };
    }),

  // AI: parse job description into structured profile
  parseJobDescription: protectedProcedure
    .input(z.object({ description: z.string().min(50) }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert job description analyzer for the Latvian job market.
Extract structured requirements from the job description.
Return JSON with these fields:
- title: string (job title)
- requiredSkills: string[] (must-have skills)
- preferredSkills: string[] (nice-to-have skills)
- requiredExperienceYears: number
- requiredEducation: "none"|"secondary"|"vocational"|"bachelor"|"master"|"phd"
- requiredLanguages: string[] (e.g. ["Latvian","English"])
- jobType: "full_time"|"part_time"|"contract"|"internship"|"freelance"
- remotePolicy: "onsite"|"hybrid"|"remote"
- salaryMin: number|null (monthly EUR)
- salaryMax: number|null (monthly EUR)
- city: string|null`,
          },
          { role: "user", content: `Analyze this job description:\n\n${input.description}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_profile",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                requiredSkills: { type: "array", items: { type: "string" } },
                preferredSkills: { type: "array", items: { type: "string" } },
                requiredExperienceYears: { type: "number" },
                requiredEducation: { type: "string" },
                requiredLanguages: { type: "array", items: { type: "string" } },
                jobType: { type: "string" },
                remotePolicy: { type: "string" },
                salaryMin: { type: ["number", "null"] },
                salaryMax: { type: ["number", "null"] },
                city: { type: ["string", "null"] },
              },
              required: ["title", "requiredSkills", "preferredSkills", "requiredExperienceYears", "requiredEducation", "requiredLanguages", "jobType", "remotePolicy", "salaryMin", "salaryMax", "city"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI neatbildēja" });
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      return JSON.parse(content);
    }),

  // Get matches for a job (anonymous candidate profiles)
  getJobMatches: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      const employer = await getEmployerByUserId(ctx.user.id);
      if (!employer) throw new TRPCError({ code: "NOT_FOUND" });
      const job = await getJobById(input.jobId);
      if (!job || job.employerId !== employer.id) throw new TRPCError({ code: "FORBIDDEN" });

      const jobMatches = await getMatchesByJob(input.jobId);

      // Return anonymised profiles unless unlocked
      const results = await Promise.all(
        jobMatches.map(async (match) => {
          const candidate = await getCandidateById(match.candidateId);
          if (!candidate) return null;

          const isUnlocked = match.isUnlocked;

          return {
            matchId: match.id,
            score: match.score,
            skillsScore: match.skillsScore,
            experienceScore: match.experienceScore,
            salaryScore: match.salaryScore,
            locationScore: match.locationScore,
            status: match.status,
            isUnlocked,
            // Always visible (anonymous)
            skills: candidate.skills,
            languages: candidate.languages,
            experienceYears: candidate.experienceYears,
            educationLevel: candidate.educationLevel,
            salaryMin: candidate.salaryMin,
            salaryMax: candidate.salaryMax,
            remotePreference: candidate.remotePreference,
            city: isUnlocked ? candidate.city : null,
            // Only visible when unlocked
            fullName: isUnlocked ? candidate.fullName : null,
            phone: isUnlocked ? candidate.phone : null,
            headline: isUnlocked ? candidate.headline : null,
            summary: isUnlocked ? candidate.summary : null,
            cvFileUrl: isUnlocked ? candidate.cvFileUrl : null,
          };
        })
      );

      return results.filter(Boolean);
    }),

  // Get all active jobs (public listing for candidates)
  listActiveJobs: protectedProcedure.query(async () => {
    return getActiveJobs();
  }),

  // Log profile view for GDPR
  logCandidateView: protectedProcedure
    .input(z.object({ candidateId: z.number(), matchId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await logGdprAction({
        userId: ctx.user.id,
        action: "profile_viewed",
        details: { candidateId: input.candidateId, matchId: input.matchId },
      });
      return { success: true };
    }),
});
