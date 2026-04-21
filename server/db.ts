import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  CandidateProfile,
  EmployerProfile,
  GdprAuditLog,
  InsertCandidateProfile,
  InsertEmployerProfile,
  InsertJobPosting,
  InsertMatch,
  InsertUser,
  JobPosting,
  Match,
  Notification,
  candidateProfiles,
  employerProfiles,
  gdprAuditLog,
  interviewSessions,
  jobPostings,
  matches,
  notifications,
  scrapeJobs,
  subscriptionPlans,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserType(userId: number, userType: "candidate" | "employer") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ userType }).where(eq(users.id, userId));
}

// ─── Candidate Profiles ───────────────────────────────────────────────────────

export async function getCandidateByUserId(userId: number): Promise<CandidateProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getCandidateById(id: number): Promise<CandidateProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidateProfiles).where(eq(candidateProfiles.id, id)).limit(1);
  return result[0];
}

export async function upsertCandidateProfile(userId: number, data: Partial<InsertCandidateProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await getCandidateByUserId(userId);
  if (existing) {
    await db.update(candidateProfiles).set({ ...data, updatedAt: new Date() }).where(eq(candidateProfiles.userId, userId));
  } else {
    await db.insert(candidateProfiles).values({ userId, ...data });
  }
}

export async function getActiveCandidates(): Promise<CandidateProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidateProfiles).where(and(eq(candidateProfiles.isActive, true), eq(candidateProfiles.gdprConsent, true)));
}

// ─── Employer Profiles ────────────────────────────────────────────────────────

export async function getEmployerByUserId(userId: number): Promise<EmployerProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function getEmployerById(id: number): Promise<EmployerProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employerProfiles).where(eq(employerProfiles.id, id)).limit(1);
  return result[0];
}

export async function upsertEmployerProfile(userId: number, data: Partial<InsertEmployerProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await getEmployerByUserId(userId);
  if (existing) {
    await db.update(employerProfiles).set({ ...data, updatedAt: new Date() }).where(eq(employerProfiles.userId, userId));
  } else {
    await db.insert(employerProfiles).values({ userId, companyName: data.companyName ?? "Uzņēmums", ...data });
  }
}

// ─── Job Postings ─────────────────────────────────────────────────────────────

export async function createJobPosting(data: InsertJobPosting): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(jobPostings).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function getJobsByEmployer(employerId: number): Promise<JobPosting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPostings).where(eq(jobPostings.employerId, employerId)).orderBy(desc(jobPostings.createdAt));
}

export async function getJobById(id: number): Promise<JobPosting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobPostings).where(eq(jobPostings.id, id)).limit(1);
  return result[0];
}

export async function getActiveJobs(): Promise<JobPosting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPostings).where(eq(jobPostings.status, "active")).orderBy(desc(jobPostings.createdAt));
}

export async function updateJobPosting(id: number, data: Partial<InsertJobPosting>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobPostings).set({ ...data, updatedAt: new Date() }).where(eq(jobPostings.id, id));
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(data: InsertMatch): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(matches).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function getMatchesByCandidate(candidateId: number): Promise<Match[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches).where(eq(matches.candidateId, candidateId)).orderBy(desc(matches.score));
}

export async function getMatchesByJob(jobId: number): Promise<Match[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches).where(eq(matches.jobId, jobId)).orderBy(desc(matches.score));
}

export async function getMatchById(id: number): Promise<Match | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return result[0];
}

export async function updateMatch(id: number, data: Partial<Match>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(matches).set({ ...data, updatedAt: new Date() }).where(eq(matches.id, id));
}

export async function getHighScoreUnnotifiedMatches(): Promise<Match[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(matches)
    .where(and(gte(matches.score, 90), eq(matches.status, "pending")));
}

// ─── Interview Sessions ───────────────────────────────────────────────────────

export async function createInterviewSession(matchId: number, candidateId: number, jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(interviewSessions).values({ matchId, candidateId, jobId, status: "pending" });
  return (result[0] as { insertId: number }).insertId;
}

export async function getInterviewByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(interviewSessions).where(eq(interviewSessions.matchId, matchId)).limit(1);
  return result[0];
}

export async function getInterviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(interviewSessions).where(eq(interviewSessions.id, id)).limit(1);
  return result[0];
}

export async function updateInterviewSession(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(interviewSessions).set({ ...data, updatedAt: new Date() }).where(eq(interviewSessions.id, id));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(data: {
  userId: number;
  type: "match_found" | "interview_request" | "profile_unlocked" | "system";
  title: string;
  message: string;
  relatedMatchId?: number;
  relatedJobId?: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUser(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

// ─── GDPR ─────────────────────────────────────────────────────────────────────

export async function logGdprAction(data: {
  userId?: number;
  action: GdprAuditLog["action"];
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(gdprAuditLog).values(data);
}

export async function getGdprLogByUser(userId: number): Promise<GdprAuditLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gdprAuditLog).where(eq(gdprAuditLog.userId, userId)).orderBy(desc(gdprAuditLog.createdAt));
}

// ─── Scrape Jobs ──────────────────────────────────────────────────────────────

export async function createScrapeJob(platform: string, searchQuery: string, city: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(scrapeJobs).values({ platform, searchQuery, city, status: "running" });
  return (result[0] as { insertId: number }).insertId;
}

export async function updateScrapeJob(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(scrapeJobs).set(data).where(eq(scrapeJobs.id, id));
}

export async function getRecentScrapeJobs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scrapeJobs).orderBy(desc(scrapeJobs.startedAt)).limit(20);
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
}

export async function seedSubscriptionPlans() {
  const db = await getDb();
  if (!db) return;
  const existing = await getSubscriptionPlans();
  if (existing.length > 0) return;

  await db.insert(subscriptionPlans).values([
    {
      name: "Bezmaksas",
      tier: "free",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "EUR",
      jobPostingsLimit: 2,
      candidateViewsLimit: 5,
      features: JSON.parse(JSON.stringify(["2 vakances", "5 kandidātu skatījumi", "Pamata atbilstība"])),
      isActive: true,
    },
    {
      name: "Pro",
      tier: "pro",
      priceMonthly: 4900,
      priceYearly: 49900,
      currency: "EUR",
      jobPostingsLimit: 20,
      candidateViewsLimit: 100,
      features: JSON.parse(JSON.stringify(["20 vakances", "100 kandidātu skatījumi", "AI atbilstība", "E-pasta paziņojumi", "Prioritārs atbalsts"])),
      isActive: true,
    },
    {
      name: "Enterprise",
      tier: "enterprise",
      priceMonthly: 14900,
      priceYearly: 149900,
      currency: "EUR",
      jobPostingsLimit: 999,
      candidateViewsLimit: 9999,
      features: JSON.parse(JSON.stringify(["Neierobežotas vakances", "Neierobežoti skatījumi", "AI intervijas", "API piekļuve", "Dedicated atbalsts", "GDPR pārskati"])),
      isActive: true,
    },
  ]);
}
