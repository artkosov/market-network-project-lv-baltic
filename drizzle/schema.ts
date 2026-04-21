import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["candidate", "employer", "unset"]).default("unset").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Candidate Profiles ───────────────────────────────────────────────────────

export const candidateProfiles = mysqlTable("candidate_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fullName: text("fullName"),
  phone: varchar("phone", { length: 32 }),
  city: varchar("city", { length: 128 }),
  country: varchar("country", { length: 64 }).default("Latvia"),
  headline: text("headline"),
  summary: text("summary"),
  skills: json("skills").$type<string[]>(),
  languages: json("languages").$type<string[]>(),
  experienceYears: int("experienceYears").default(0),
  educationLevel: mysqlEnum("educationLevel", ["none", "secondary", "vocational", "bachelor", "master", "phd"]).default("none"),
  salaryMin: int("salaryMin"),
  salaryMax: int("salaryMax"),
  salaryCurrency: varchar("salaryCurrency", { length: 8 }).default("EUR"),
  jobTypes: json("jobTypes").$type<string[]>(),
  commuteRadius: int("commuteRadius").default(30),
  remotePreference: mysqlEnum("remotePreference", ["onsite", "hybrid", "remote", "any"]).default("any"),
  cvFileKey: text("cvFileKey"),
  cvFileUrl: text("cvFileUrl"),
  cvParsedAt: timestamp("cvParsedAt"),
  isActive: boolean("isActive").default(true),
  isAnonymous: boolean("isAnonymous").default(true),
  gdprConsent: boolean("gdprConsent").default(false),
  gdprConsentAt: timestamp("gdprConsentAt"),
  gdprDeleteRequestedAt: timestamp("gdprDeleteRequestedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type InsertCandidateProfile = typeof candidateProfiles.$inferInsert;

// ─── Employer Profiles ────────────────────────────────────────────────────────

export const employerProfiles = mysqlTable("employer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  companyName: text("companyName").notNull(),
  companySize: mysqlEnum("companySize", ["1-10", "11-50", "51-200", "201-500", "500+"]).default("1-10"),
  industry: varchar("industry", { length: 128 }),
  website: text("website"),
  description: text("description"),
  logoKey: text("logoKey"),
  logoUrl: text("logoUrl"),
  city: varchar("city", { length: 128 }),
  country: varchar("country", { length: 64 }).default("Latvia"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro", "enterprise"]).default("free"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "past_due", "canceled", "none"]).default("none"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type InsertEmployerProfile = typeof employerProfiles.$inferInsert;

// ─── Job Postings ─────────────────────────────────────────────────────────────

export const jobPostings = mysqlTable("job_postings", {
  id: int("id").autoincrement().primaryKey(),
  employerId: int("employerId").notNull().references(() => employerProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: json("requiredSkills").$type<string[]>(),
  preferredSkills: json("preferredSkills").$type<string[]>(),
  requiredExperienceYears: int("requiredExperienceYears").default(0),
  requiredEducation: mysqlEnum("requiredEducation", ["none", "secondary", "vocational", "bachelor", "master", "phd"]).default("none"),
  requiredLanguages: json("requiredLanguages").$type<string[]>(),
  city: varchar("city", { length: 128 }),
  country: varchar("country", { length: 64 }).default("Latvia"),
  jobType: mysqlEnum("jobType", ["full_time", "part_time", "contract", "internship", "freelance"]).default("full_time"),
  remotePolicy: mysqlEnum("remotePolicy", ["onsite", "hybrid", "remote"]).default("onsite"),
  salaryMin: int("salaryMin"),
  salaryMax: int("salaryMax"),
  salaryCurrency: varchar("salaryCurrency", { length: 8 }).default("EUR"),
  source: mysqlEnum("source", ["manual", "scraped"]).default("manual"),
  sourceUrl: text("sourceUrl"),
  sourcePlatform: varchar("sourcePlatform", { length: 64 }),
  status: mysqlEnum("status", ["active", "paused", "closed", "draft"]).default("active"),
  aiParsedAt: timestamp("aiParsedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = typeof jobPostings.$inferInsert;

// ─── Matches ──────────────────────────────────────────────────────────────────

export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull().references(() => candidateProfiles.id),
  jobId: int("jobId").notNull().references(() => jobPostings.id),
  score: float("score").notNull(),
  skillsScore: float("skillsScore").default(0),
  experienceScore: float("experienceScore").default(0),
  salaryScore: float("salaryScore").default(0),
  locationScore: float("locationScore").default(0),
  status: mysqlEnum("status", ["pending", "notified", "interviewing", "unlocked", "rejected", "hired"]).default("pending"),
  isUnlocked: boolean("isUnlocked").default(false),
  unlockedAt: timestamp("unlockedAt"),
  notifiedAt: timestamp("notifiedAt"),
  notificationChannel: varchar("notificationChannel", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// ─── AI Interview Sessions ────────────────────────────────────────────────────

export const interviewSessions = mysqlTable("interview_sessions", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull().references(() => matches.id),
  candidateId: int("candidateId").notNull().references(() => candidateProfiles.id),
  jobId: int("jobId").notNull().references(() => jobPostings.id),
  questions: json("questions").$type<string[]>(),
  answers: json("answers").$type<{ question: string; answer: string }[]>(),
  aiEvaluation: text("aiEvaluation"),
  aiApproved: boolean("aiApproved"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "abandoned"]).default("pending"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertInterviewSession = typeof interviewSessions.$inferInsert;

// ─── Job Sentinel Scrape Logs ─────────────────────────────────────────────────

export const scrapeJobs = mysqlTable("scrape_jobs", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 64 }).notNull(),
  searchQuery: text("searchQuery"),
  city: varchar("city", { length: 128 }),
  totalFound: int("totalFound").default(0),
  newImported: int("newImported").default(0),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ScrapeJob = typeof scrapeJobs.$inferSelect;

// ─── GDPR Audit Log ───────────────────────────────────────────────────────────

export const gdprAuditLog = mysqlTable("gdpr_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: mysqlEnum("action", [
    "consent_given",
    "consent_withdrawn",
    "data_export_requested",
    "data_deletion_requested",
    "data_deleted",
    "profile_unlocked",
    "profile_viewed",
    "data_accessed",
  ]).notNull(),
  details: json("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GdprAuditLog = typeof gdprAuditLog.$inferSelect;

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["match_found", "interview_request", "profile_unlocked", "system"]).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  relatedMatchId: int("relatedMatchId"),
  relatedJobId: int("relatedJobId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── Subscription Plans ───────────────────────────────────────────────────────

export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).notNull(),
  priceMonthly: int("priceMonthly").notNull(),
  priceYearly: int("priceYearly").notNull(),
  currency: varchar("currency", { length: 8 }).default("EUR"),
  stripePriceIdMonthly: varchar("stripePriceIdMonthly", { length: 128 }),
  stripePriceIdYearly: varchar("stripePriceIdYearly", { length: 128 }),
  features: json("features").$type<string[]>(),
  jobPostingsLimit: int("jobPostingsLimit").default(3),
  candidateViewsLimit: int("candidateViewsLimit").default(10),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
