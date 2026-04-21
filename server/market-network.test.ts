import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";
import * as dbModule from "./db";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getCandidateByUserId: vi.fn(),
    getEmployerByUserId: vi.fn(),
    upsertCandidateProfile: vi.fn(),
    upsertEmployerProfile: vi.fn(),
    getMatchesByCandidate: vi.fn().mockResolvedValue([]),
    getNotificationsByCandidate: vi.fn().mockResolvedValue([]),
    getNotificationsByUser: vi.fn().mockResolvedValue([]),
    getJobsByEmployer: vi.fn().mockResolvedValue([]),
    getMatchesByJob: vi.fn().mockResolvedValue([]),
    getActiveCandidates: vi.fn().mockResolvedValue([]),
    getActiveJobs: vi.fn().mockResolvedValue([]),
    createMatch: vi.fn(),
    updateMatch: vi.fn(),
    createNotification: vi.fn(),
    getHighScoreUnnotifiedMatches: vi.fn().mockResolvedValue([]),
    logGdprAction: vi.fn(),
    getGdprLog: vi.fn().mockResolvedValue([]),
    getSubscriptionPlans: vi.fn().mockResolvedValue([]),
    seedSubscriptionPlans: vi.fn(),
    updateUserType: vi.fn(),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
    getDb: vi.fn().mockResolvedValue(null),
  };
});

// ─── Context helpers ──────────────────────────────────────────────────────────
type AuthUser = NonNullable<TrpcContext["user"]>;

function makeCtx(overrides: Partial<AuthUser> = {}): TrpcContext {
  const clearedCookies: any[] = [];
  const user: AuthUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    userType: "candidate",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, opts: any) => clearedCookies.push({ name, opts }),
    } as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: any[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "u1", email: "a@b.com", name: "A", loginMethod: "manus",
        role: "user", userType: "candidate", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: (n: string, o: any) => clearedCookies.push({ n, o }) } as any,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.n).toBe(COOKIE_NAME);
  });

  it("returns current user on auth.me", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me?.id).toBe(1);
    expect(me?.email).toBe("test@example.com");
  });
});

// ─── Candidate Tests ──────────────────────────────────────────────────────────
describe("candidate router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProfile returns null when no profile exists", async () => {
    vi.mocked(dbModule.getCandidateByUserId).mockResolvedValue(null);
    const ctx = makeCtx({ userType: "candidate" });
    const caller = appRouter.createCaller(ctx);
    const profile = await caller.candidate.getProfile();
    expect(profile).toBeNull();
  });

  it("getProfile returns profile when it exists", async () => {
    const mockProfile = {
      id: 1, userId: 1, fullName: "Jānis Bērziņš", skills: ["JavaScript", "React"],
      city: "Rīga", salaryMin: 2000, salaryMax: 3500, isAnonymous: true,
      phone: null, country: "Latvia", headline: null, summary: null, languages: null,
      experienceYears: 3, educationLevel: "bachelor" as const, salaryCurrency: "EUR",
      jobTypes: null, commuteRadius: 30, remotePreference: "any" as const,
      cvFileKey: null, cvFileUrl: null, cvParsedAt: null, isActive: true,
      gdprConsent: true, gdprConsentAt: new Date(), gdprDeleteRequestedAt: null,
      createdAt: new Date(), updatedAt: new Date(),
    };
    vi.mocked(dbModule.getCandidateByUserId).mockResolvedValue(mockProfile);
    const ctx = makeCtx({ userType: "candidate" });
    const caller = appRouter.createCaller(ctx);
    const profile = await caller.candidate.getProfile();
    expect(profile?.fullName).toBe("Jānis Bērziņš");
    expect(profile?.isAnonymous).toBe(true);
  });

  it("getMatches returns empty array when no matches", async () => {
    vi.mocked(dbModule.getCandidateByUserId).mockResolvedValue({ id: 1, userId: 1 } as any);
    vi.mocked(dbModule.getMatchesByCandidate).mockResolvedValue([]);
    const ctx = makeCtx({ userType: "candidate" });
    const caller = appRouter.createCaller(ctx);
    const matches = await caller.candidate.getMatches();
    expect(Array.isArray(matches)).toBe(true);
    expect(matches).toHaveLength(0);
  });

  it("getNotifications returns empty array when no notifications", async () => {
    vi.mocked(dbModule.getCandidateByUserId).mockResolvedValue({ id: 1, userId: 1 } as any);
    vi.mocked(dbModule.getNotificationsByCandidate).mockResolvedValue([]);
    const ctx = makeCtx({ userType: "candidate" });
    const caller = appRouter.createCaller(ctx);
    const notifications = await caller.candidate.getNotifications();
    expect(Array.isArray(notifications)).toBe(true);
  });
});

// ─── Employer Tests ───────────────────────────────────────────────────────────
describe("employer router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProfile returns null when no employer profile exists", async () => {
    vi.mocked(dbModule.getEmployerByUserId).mockResolvedValue(null);
    const ctx = makeCtx({ userType: "employer" });
    const caller = appRouter.createCaller(ctx);
    const profile = await caller.employer.getProfile();
    expect(profile).toBeNull();
  });

  it("getJobs returns empty array when no jobs", async () => {
    vi.mocked(dbModule.getEmployerByUserId).mockResolvedValue({ id: 1, userId: 1, companyName: "Test Corp" } as any);
    vi.mocked(dbModule.getJobsByEmployer).mockResolvedValue([]);
    const ctx = makeCtx({ userType: "employer" });
    const caller = appRouter.createCaller(ctx);
    const jobs = await caller.employer.getJobs();
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs).toHaveLength(0);
  });
});

// ─── Matchmaker Tests ─────────────────────────────────────────────────────────
describe("matchmaker — skill scoring algorithm", () => {
  it("returns 70 when no required or preferred skills defined", () => {
    // Internal scoring: no skills = default 70
    const score = computeSkillScore([], [], []);
    expect(score).toBe(70);
  });

  it("returns 100 when candidate has all required skills", () => {
    const score = computeSkillScore(["javascript", "react", "node"], ["javascript", "react", "node"], []);
    expect(score).toBe(100);
  });

  it("returns 30 when candidate has none of the required skills (preferred default applies)", () => {
    // No preferred skills defined, so preferred score defaults to 30
    // required: 0/3 = 0 * 70 = 0; preferred: no preferred = 30; total = 30
    const score = computeSkillScore([], ["java", "spring", "sql"], []);
    expect(score).toBe(30);
  });

  it("partial match returns proportional score", () => {
    // 1 out of 2 required skills = 35 (70 * 0.5) + 30 (no preferred defined) = 65
    const score = computeSkillScore(["javascript"], ["javascript", "typescript"], []);
    expect(score).toBe(65);
  });

  it("preferred skills add bonus points", () => {
    // All required + 1 preferred = 70 + 30 = 100
    const score = computeSkillScore(["js", "bonus"], ["js"], ["bonus"]);
    expect(score).toBe(100);
  });
});

// ─── Plans Tests ──────────────────────────────────────────────────────────────
describe("plans.list", () => {
  it("returns an array (possibly empty) of subscription plans", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const plans = await caller.plans.list();
    expect(Array.isArray(plans)).toBe(true);
  });
});

// ─── Skill Score Helper (mirrors server logic for unit testing) ───────────────
function computeSkillScore(
  candidateSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): number {
  if (!requiredSkills.length && !preferredSkills.length) return 70;
  const cSkills = candidateSkills.map((s) => s.toLowerCase());
  const rSkills = requiredSkills.map((s) => s.toLowerCase());
  const pSkills = preferredSkills.map((s) => s.toLowerCase());
  const requiredMatches = rSkills.filter((s) =>
    cSkills.some((c) => c.includes(s) || s.includes(c))
  ).length;
  const preferredMatches = pSkills.filter((s) =>
    cSkills.some((c) => c.includes(s) || s.includes(c))
  ).length;
  const requiredScore = rSkills.length > 0 ? (requiredMatches / rSkills.length) * 70 : 70;
  const preferredScore = pSkills.length > 0 ? (preferredMatches / pSkills.length) * 30 : 30;
  return Math.round(requiredScore + preferredScore);
}
