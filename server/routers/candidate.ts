import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getCandidateByUserId,
  getGdprLogByUser,
  getMatchesByCandidate,
  getNotificationsByUser,
  logGdprAction,
  markNotificationRead,
  upsertCandidateProfile,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";
import { updateUserType } from "../db";

export const candidateRouter = router({
  // Get own profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateByUserId(ctx.user.id);
    return profile ?? null;
  }),

  // Create or update profile
  upsertProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        headline: z.string().optional(),
        summary: z.string().optional(),
        skills: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        experienceYears: z.number().min(0).max(50).optional(),
        educationLevel: z.enum(["none", "secondary", "vocational", "bachelor", "master", "phd"]).optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        jobTypes: z.array(z.string()).optional(),
        commuteRadius: z.number().optional(),
        remotePreference: z.enum(["onsite", "hybrid", "remote", "any"]).optional(),
        isActive: z.boolean().optional(),
        gdprConsent: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Ensure user type is set to candidate
      if (ctx.user.userType === "unset") {
        await updateUserType(ctx.user.id, "candidate");
      }

      const data: Record<string, unknown> = { ...input };
      if (input.skills !== undefined) data.skills = JSON.parse(JSON.stringify(input.skills));
      if (input.languages !== undefined) data.languages = JSON.parse(JSON.stringify(input.languages));
      if (input.jobTypes !== undefined) data.jobTypes = JSON.parse(JSON.stringify(input.jobTypes));

      if (input.gdprConsent === true) {
        data.gdprConsentAt = new Date();
        await logGdprAction({ userId: ctx.user.id, action: "consent_given" });
      } else if (input.gdprConsent === false) {
        data.gdprConsentAt = null;
        await logGdprAction({ userId: ctx.user.id, action: "consent_withdrawn" });
      }

      await upsertCandidateProfile(ctx.user.id, data as Parameters<typeof upsertCandidateProfile>[1]);
      return { success: true };
    }),

  // Upload CV file and parse with AI
  uploadCv: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
      if (!allowed.includes(input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Atļautie formāti: PDF, DOCX" });
      }

      const buffer = Buffer.from(input.fileBase64, "base64");
      if (buffer.length > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Faila izmērs nedrīkst pārsniegt 10MB" });
      }

      const fileKey = `cv/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      await upsertCandidateProfile(ctx.user.id, { cvFileKey: fileKey, cvFileUrl: url });

      return { success: true, fileKey, fileUrl: url };
    }),

  // AI parse CV and auto-populate profile
  parseCvWithAi: protectedProcedure
    .input(z.object({ cvText: z.string().max(20000) }))
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert CV parser. Extract structured profile data from the provided CV text.
Return a JSON object with these fields (use null if not found):
- fullName: string
- headline: string (professional title)
- summary: string (2-3 sentence professional summary)
- skills: string[] (technical and soft skills)
- languages: string[] (spoken languages)
- experienceYears: number
- educationLevel: "none"|"secondary"|"vocational"|"bachelor"|"master"|"phd"
- city: string
- salaryMin: number|null (monthly EUR)
- salaryMax: number|null (monthly EUR)
- jobTypes: string[] (e.g. ["full_time"])
- remotePreference: "onsite"|"hybrid"|"remote"|"any"`,
          },
          { role: "user", content: `Parse this CV:\n\n${input.cvText}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cv_profile",
            strict: true,
            schema: {
              type: "object",
              properties: {
                fullName: { type: ["string", "null"] },
                headline: { type: ["string", "null"] },
                summary: { type: ["string", "null"] },
                skills: { type: "array", items: { type: "string" } },
                languages: { type: "array", items: { type: "string" } },
                experienceYears: { type: ["number", "null"] },
                educationLevel: { type: ["string", "null"] },
                city: { type: ["string", "null"] },
                salaryMin: { type: ["number", "null"] },
                salaryMax: { type: ["number", "null"] },
                jobTypes: { type: "array", items: { type: "string" } },
                remotePreference: { type: ["string", "null"] },
              },
              required: ["fullName", "headline", "summary", "skills", "languages", "experienceYears", "educationLevel", "city", "salaryMin", "salaryMax", "jobTypes", "remotePreference"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI neatbildēja" });
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

      const parsed = JSON.parse(content);

      // Auto-populate profile
      const updateData: Record<string, unknown> = {};
      if (parsed.fullName) updateData.fullName = parsed.fullName;
      if (parsed.headline) updateData.headline = parsed.headline;
      if (parsed.summary) updateData.summary = parsed.summary;
      if (parsed.skills?.length) updateData.skills = JSON.parse(JSON.stringify(parsed.skills));
      if (parsed.languages?.length) updateData.languages = JSON.parse(JSON.stringify(parsed.languages));
      if (parsed.experienceYears != null) updateData.experienceYears = parsed.experienceYears;
      if (parsed.educationLevel) updateData.educationLevel = parsed.educationLevel;
      if (parsed.city) updateData.city = parsed.city;
      if (parsed.salaryMin) updateData.salaryMin = parsed.salaryMin;
      if (parsed.salaryMax) updateData.salaryMax = parsed.salaryMax;
      if (parsed.jobTypes?.length) updateData.jobTypes = JSON.parse(JSON.stringify(parsed.jobTypes));
      if (parsed.remotePreference) updateData.remotePreference = parsed.remotePreference;
      updateData.cvParsedAt = new Date();

      await upsertCandidateProfile(ctx.user.id, updateData as Parameters<typeof upsertCandidateProfile>[1]);

      return { success: true, parsed };
    }),

  // Get candidate's matches
  getMatches: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCandidateByUserId(ctx.user.id);
    if (!profile) return [];
    return getMatchesByCandidate(profile.id);
  }),

  // Get notifications
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return getNotificationsByUser(ctx.user.id);
  }),

  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markNotificationRead(input.id);
      return { success: true };
    }),

  // GDPR: request data deletion
  requestDataDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    await upsertCandidateProfile(ctx.user.id, { gdprDeleteRequestedAt: new Date() } as Parameters<typeof upsertCandidateProfile>[1]);
    await logGdprAction({ userId: ctx.user.id, action: "data_deletion_requested" });
    return { success: true };
  }),

  // GDPR: get audit log
  getGdprLog: protectedProcedure.query(async ({ ctx }) => {
    return getGdprLogByUser(ctx.user.id);
  }),
});
