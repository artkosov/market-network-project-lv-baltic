import { z } from "zod";
import {
  createMatch,
  createNotification,
  getActiveCandidates,
  getActiveJobs,
  getCandidateByUserId,
  getEmployerById,
  getHighScoreUnnotifiedMatches,
  getJobById,
  getMatchesByCandidate,
  getMatchesByJob,
  updateMatch,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { getDb } from "../db";
import { matches } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";

// ─── Core Matching Algorithm ──────────────────────────────────────────────────

function scoreSkills(candidateSkills: string[], requiredSkills: string[], preferredSkills: string[]): number {
  if (!requiredSkills?.length && !preferredSkills?.length) return 70;
  const cSkills = (candidateSkills ?? []).map((s) => s.toLowerCase());
  const rSkills = (requiredSkills ?? []).map((s) => s.toLowerCase());
  const pSkills = (preferredSkills ?? []).map((s) => s.toLowerCase());

  const requiredMatches = rSkills.filter((s) => cSkills.some((c) => c.includes(s) || s.includes(c))).length;
  const preferredMatches = pSkills.filter((s) => cSkills.some((c) => c.includes(s) || s.includes(c))).length;

  const requiredScore = rSkills.length > 0 ? (requiredMatches / rSkills.length) * 70 : 70;
  const preferredScore = pSkills.length > 0 ? (preferredMatches / pSkills.length) * 30 : 30;
  return Math.round(requiredScore + preferredScore);
}

function scoreExperience(candidateYears: number, requiredYears: number): number {
  if (requiredYears === 0) return 100;
  if (candidateYears >= requiredYears) return 100;
  if (candidateYears >= requiredYears * 0.7) return 75;
  if (candidateYears >= requiredYears * 0.5) return 50;
  return 25;
}

function scoreSalary(cMin: number | null, cMax: number | null, jMin: number | null, jMax: number | null): number {
  if (!cMin && !cMax) return 80;
  if (!jMin && !jMax) return 80;
  const candidateMid = cMin && cMax ? (cMin + cMax) / 2 : cMin ?? cMax ?? 0;
  const jobMid = jMin && jMax ? (jMin + jMax) / 2 : jMin ?? jMax ?? 0;
  if (jobMid === 0) return 80;
  const diff = Math.abs(candidateMid - jobMid) / jobMid;
  if (diff <= 0.1) return 100;
  if (diff <= 0.2) return 85;
  if (diff <= 0.35) return 65;
  if (diff <= 0.5) return 45;
  return 20;
}

function scoreLocation(candidateCity: string | null, jobCity: string | null, remotePolicy: string, remotePreference: string): number {
  if (remotePolicy === "remote" || remotePreference === "remote") return 100;
  if (!candidateCity || !jobCity) return 70;
  if (candidateCity.toLowerCase() === jobCity.toLowerCase()) return 100;
  // Same region heuristic (simplified for Latvian cities)
  const rigaArea = ["rīga", "riga", "jūrmala", "jurmala", "ogre", "salaspils", "sigulda"];
  const bothRiga = rigaArea.some((c) => candidateCity.toLowerCase().includes(c)) && rigaArea.some((c) => jobCity.toLowerCase().includes(c));
  if (bothRiga) return 85;
  return 50;
}

export function calculateMatchScore(
  candidate: {
    skills: string[] | null;
    experienceYears: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    city: string | null;
    remotePreference: string | null;
  },
  job: {
    requiredSkills: string[] | null;
    preferredSkills: string[] | null;
    requiredExperienceYears: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    city: string | null;
    remotePolicy: string | null;
  }
): { total: number; skills: number; experience: number; salary: number; location: number } {
  const skills = scoreSkills(candidate.skills ?? [], job.requiredSkills ?? [], job.preferredSkills ?? []);
  const experience = scoreExperience(candidate.experienceYears ?? 0, job.requiredExperienceYears ?? 0);
  const salary = scoreSalary(candidate.salaryMin, candidate.salaryMax, job.salaryMin, job.salaryMax);
  const location = scoreLocation(candidate.city, job.city, job.remotePolicy ?? "onsite", candidate.remotePreference ?? "any");

  const total = Math.round(skills * 0.4 + experience * 0.25 + salary * 0.2 + location * 0.15);
  return { total, skills, experience, salary, location };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const matchmakerRouter = router({
  // Run matching for a specific candidate against all active jobs
  runForCandidate: protectedProcedure.mutation(async ({ ctx }) => {
    const candidate = await getCandidateByUserId(ctx.user.id);
    // Privacy by Design: require both GDPR base consent AND explicit matching consent
    if (!candidate || !candidate.gdprConsent || !candidate.consentMatching) return { matched: 0, reason: "consent_required" };

    const jobs = await getActiveJobs();
    const db = await getDb();
    if (!db) return { matched: 0 };

    let matched = 0;
    for (const job of jobs) {
      // Check if match already exists
      const existing = await db.select().from(matches).where(and(eq(matches.candidateId, candidate.id), eq(matches.jobId, job.id))).limit(1);
      if (existing.length > 0) continue;

      const scores = calculateMatchScore(candidate, job);
      if (scores.total < 30) continue; // Skip very low matches

      await createMatch({
        candidateId: candidate.id,
        jobId: job.id,
        score: scores.total,
        skillsScore: scores.skills,
        experienceScore: scores.experience,
        salaryScore: scores.salary,
        locationScore: scores.location,
        status: "pending",
      });
      matched++;
    }

    return { matched };
  }),

  // Run matching for a specific job against all active candidates
  runForJob: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .mutation(async ({ input }) => {
      const job = await getJobById(input.jobId);
      if (!job) return { matched: 0 };

      const candidates = await getActiveCandidates();
      const db = await getDb();
      if (!db) return { matched: 0 };

      let matched = 0;
      for (const candidate of candidates) {
        // Privacy by Design: skip candidates who have not consented to matching or employer visibility
        if (!candidate.gdprConsent || !candidate.consentMatching) continue;
        const existing = await db.select().from(matches).where(and(eq(matches.candidateId, candidate.id), eq(matches.jobId, job.id))).limit(1);
        if (existing.length > 0) continue;

        const scores = calculateMatchScore(candidate, job);
        if (scores.total < 30) continue;

        const matchId = await createMatch({
          candidateId: candidate.id,
          jobId: job.id,
          score: scores.total,
          skillsScore: scores.skills,
          experienceScore: scores.experience,
          salaryScore: scores.salary,
          locationScore: scores.location,
          status: "pending",
        });

        // Auto-notify for 90%+ matches — in-app notification + owner alert
        if (scores.total >= 90) {
          await createNotification({
            userId: candidate.userId,
            type: "match_found",
            title: "Izcila atbilstība atrasta!",
            message: `Mēs atradām ${scores.total}% atbilstību ar vakanci "${job.title}". Piesakies intervijā!`,
            relatedMatchId: matchId,
            relatedJobId: job.id,
          });
          await updateMatch(matchId, { status: "notified", notifiedAt: new Date(), notificationChannel: "in_app" });
          // Notify platform owner so they can follow up with the candidate via email
          try {
            await notifyOwner({
              title: `🎯 Jauna 90%+ atbilstība — ${scores.total}%`,
              content: `Kandidāts (ID: ${candidate.id}) atbilst vakancei "${job.title}" ar ${scores.total}% precizitāti.\n\nPrasmes: ${scores.skills}% | Pieredze: ${scores.experience}% | Alga: ${scores.salary}% | Atrašanās vieta: ${scores.location}%\n\nKandidāts ir saņēmis in-app paziņojumu un var sākt AI interviju.`,
            });
          } catch {
            // Non-fatal: in-app notification already sent
          }
        }

        matched++;
      }

      return { matched };
    }),

  // Get match details with score breakdown
  getMatchDetails: protectedProcedure
    .input(z.object({ matchId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(matches).where(eq(matches.id, input.matchId)).limit(1);
      return result[0] ?? null;
    }),

  // Process pending high-score notifications (called by background job)
  processNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    const highScoreMatches = await getHighScoreUnnotifiedMatches();
    let processed = 0;

    for (const match of highScoreMatches) {
      const job = await getJobById(match.jobId);
      if (!job) continue;

      const db = await getDb();
      if (!db) continue;

      const candidateResult = await db.select().from(matches).where(eq(matches.id, match.id)).limit(1);
      if (!candidateResult[0]) continue;

      await createNotification({
        userId: ctx.user.id,
        type: "match_found",
        title: "Augsta atbilstība!",
        message: `${match.score}% atbilstība ar "${job.title}"`,
        relatedMatchId: match.id,
        relatedJobId: job.id,
      });

      await updateMatch(match.id, { status: "notified", notifiedAt: new Date() });
      processed++;
    }

    return { processed };
  }),
});
