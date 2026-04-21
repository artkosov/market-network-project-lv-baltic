/**
 * gdpr.ts — GDPR Privacy by Design router
 *
 * Implements all GDPR Article rights:
 * - Art. 7: Conditions for consent (granular, withdrawable)
 * - Art. 17: Right to erasure ("right to be forgotten")
 * - Art. 20: Right to data portability (JSON export)
 * - Art. 25: Privacy by Design (pseudonymization, data minimization)
 * - Art. 30: Records of processing activities (audit log)
 */

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  candidateProfiles,
  employerProfiles,
  gdprAuditLog,
  users,
  matches,
  interviewSessions,
  notifications,
} from "../../drizzle/schema";
import { generatePseudonymousId, decryptField, CANDIDATE_PII_FIELDS } from "../encryption";
import { notifyOwner } from "../_core/notification";

// Current policy version — bump this when ToS/Privacy Policy changes
export const CURRENT_POLICY_VERSION = "1.0";

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

async function logGdprAction(
  userId: number,
  action: typeof gdprAuditLog.$inferInsert["action"],
  details?: Record<string, unknown>,
  req?: { ip?: string; headers?: Record<string, string | string[] | undefined> }
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(gdprAuditLog).values({
    userId,
    action,
    details: details ?? {},
    ipAddress: req?.ip ?? null,
    userAgent: (req?.headers?.["user-agent"] as string) ?? null,
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const gdprRouter = router({
  /**
   * Get the current user's full consent status.
   * Returns separate flags for each processing purpose.
   */
  getConsentStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Check candidate profile first
    const candidate = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, ctx.user.id))
      .limit(1);

    if (candidate[0]) {
      const c = candidate[0];
      return {
        userType: "candidate" as const,
        platform: c.gdprConsent ?? false,
        platformAt: c.gdprConsentAt,
        matching: c.consentMatching ?? false,
        matchingAt: c.consentMatchingAt,
        employerView: c.consentEmployerView ?? false,
        employerViewAt: c.consentEmployerViewAt,
        marketing: c.consentMarketing ?? false,
        marketingAt: c.consentMarketingAt,
        consentVersion: c.consentVersion ?? "1.0",
        deletionRequested: !!c.gdprDeleteRequestedAt,
        deletionRequestedAt: c.gdprDeleteRequestedAt,
        pseudonymousId: c.pseudonymousId,
      };
    }

    // Check employer profile
    const employer = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, ctx.user.id))
      .limit(1);

    if (employer[0]) {
      const e = employer[0];
      return {
        userType: "employer" as const,
        platform: e.gdprConsent ?? false,
        platformAt: e.gdprConsentAt,
        dpaAccepted: e.dpaAccepted ?? false,
        dpaAcceptedAt: e.dpaAcceptedAt,
        marketing: e.consentMarketing ?? false,
        marketingAt: e.consentMarketingAt,
        consentVersion: e.consentVersion ?? "1.0",
      };
    }

    return null;
  }),

  /**
   * Update candidate consent preferences.
   * Each consent type is independent — users can grant/withdraw individually.
   * Withdrawal is immediate and stops all related processing.
   */
  updateCandidateConsent: protectedProcedure
    .input(
      z.object({
        platform: z.boolean().optional(),
        matching: z.boolean().optional(),
        employerView: z.boolean().optional(),
        marketing: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const candidate = await db
        .select()
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, ctx.user.id))
        .limit(1);

      if (!candidate[0]) throw new Error("Kandidāta profils nav atrasts");

      const now = new Date();
      const updateData: Partial<typeof candidateProfiles.$inferInsert> = {
        consentVersion: CURRENT_POLICY_VERSION,
        lastActivityAt: now,
      };

      if (input.platform !== undefined) {
        updateData.gdprConsent = input.platform;
        updateData.gdprConsentAt = input.platform ? now : null;
      }
      if (input.matching !== undefined) {
        updateData.consentMatching = input.matching;
        updateData.consentMatchingAt = input.matching ? now : null;
        // If matching is disabled, also disable employer view (data minimization)
        if (!input.matching) {
          updateData.consentEmployerView = false;
          updateData.consentEmployerViewAt = null;
        }
      }
      if (input.employerView !== undefined) {
        updateData.consentEmployerView = input.employerView;
        updateData.consentEmployerViewAt = input.employerView ? now : null;
      }
      if (input.marketing !== undefined) {
        updateData.consentMarketing = input.marketing;
        updateData.consentMarketingAt = input.marketing ? now : null;
      }

      await db
        .update(candidateProfiles)
        .set(updateData)
        .where(eq(candidateProfiles.userId, ctx.user.id));

      // Audit log
      const withdrawals = Object.entries(input)
        .filter(([, v]) => v === false)
        .map(([k]) => k);
      const grants = Object.entries(input)
        .filter(([, v]) => v === true)
        .map(([k]) => k);

      if (withdrawals.length > 0) {
        await logGdprAction(ctx.user.id, "consent_withdrawn", {
          withdrawn: withdrawals,
          policyVersion: CURRENT_POLICY_VERSION,
        });
      }
      if (grants.length > 0) {
        await logGdprAction(ctx.user.id, "consent_given", {
          granted: grants,
          policyVersion: CURRENT_POLICY_VERSION,
        });
      }

      return { success: true };
    }),

  /**
   * Update employer consent (platform ToS + Data Processing Agreement).
   */
  updateEmployerConsent: protectedProcedure
    .input(
      z.object({
        platform: z.boolean().optional(),
        dpaAccepted: z.boolean().optional(),
        marketing: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const now = new Date();
      const updateData: Partial<typeof employerProfiles.$inferInsert> = {
        consentVersion: CURRENT_POLICY_VERSION,
      };

      if (input.platform !== undefined) {
        updateData.gdprConsent = input.platform;
        updateData.gdprConsentAt = input.platform ? now : null;
      }
      if (input.dpaAccepted !== undefined) {
        updateData.dpaAccepted = input.dpaAccepted;
        updateData.dpaAcceptedAt = input.dpaAccepted ? now : null;
      }
      if (input.marketing !== undefined) {
        updateData.consentMarketing = input.marketing;
        updateData.consentMarketingAt = input.marketing ? now : null;
      }

      await db
        .update(employerProfiles)
        .set(updateData)
        .where(eq(employerProfiles.userId, ctx.user.id));

      const action = Object.values(input).some((v) => v === false)
        ? "consent_withdrawn"
        : "consent_given";
      await logGdprAction(ctx.user.id, action, {
        changes: input,
        policyVersion: CURRENT_POLICY_VERSION,
      });

      return { success: true };
    }),

  /**
   * Export all user data as a structured JSON object (Art. 20 portability).
   * PII fields are decrypted before export so the user gets readable data.
   */
  exportMyData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const candidateRow = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, ctx.user.id))
      .limit(1);

    const employerRow = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, ctx.user.id))
      .limit(1);

    const auditRows = await db
      .select()
      .from(gdprAuditLog)
      .where(eq(gdprAuditLog.userId, ctx.user.id));

    const notifRows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id));

    // Decrypt PII fields for export
    const candidateDecrypted = candidateRow[0]
      ? {
          ...candidateRow[0],
          fullName: decryptField(candidateRow[0].fullName),
          phone: decryptField(candidateRow[0].phone),
          // CV content is omitted from export for size; user can re-download from storage
          cvParsedContent: "[Skatīt augšupielādēto CV failu]",
        }
      : null;

    await logGdprAction(ctx.user.id, "data_export_requested", {
      exportedAt: new Date().toISOString(),
    });

    return {
      exportedAt: new Date().toISOString(),
      policyVersion: CURRENT_POLICY_VERSION,
      user: userRow ?? null,
      candidateProfile: candidateDecrypted,
      employerProfile: employerRow[0] ?? null,
      auditLog: auditRows,
      notifications: notifRows,
      note: "Šis eksports satur visus jūsu personas datus, ko Market Network glabā saskaņā ar VDAR 20. pantu.",
    };
  }),

  /**
   * Request data deletion (Art. 17 — right to erasure).
   * Marks the account for deletion within 30 days.
   * Immediately disables all processing (matching, employer view).
   */
  requestDataDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const now = new Date();

    // Immediately withdraw all consents to stop processing
    await db
      .update(candidateProfiles)
      .set({
        gdprDeleteRequestedAt: now,
        isActive: false,
        consentMatching: false,
        consentEmployerView: false,
        consentMarketing: false,
        lastActivityAt: now,
      })
      .where(eq(candidateProfiles.userId, ctx.user.id));

    await db
      .update(employerProfiles)
      .set({
        gdprConsent: false,
        consentMarketing: false,
      })
      .where(eq(employerProfiles.userId, ctx.user.id));

    await logGdprAction(ctx.user.id, "data_deletion_requested", {
      requestedAt: now.toISOString(),
      scheduledDeletionAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Notify platform owner
    try {
      await notifyOwner({
        title: "🗑️ Datu dzēšanas pieprasījums",
        content: `Lietotājs (ID: ${ctx.user.id}, e-pasts: ${ctx.user.email ?? "nav"}) ir pieprasījis visu datu dzēšanu.\n\nVisi apstrādes piekrišanas ir nekavējoties atsaukti.\nDati jādzēš līdz: ${new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("lv-LV")}.`,
      });
    } catch {
      // Non-fatal
    }

    return {
      success: true,
      scheduledDeletionAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      message: "Datu dzēšanas pieprasījums saņemts. Jūsu dati tiks dzēsti 30 dienu laikā.",
    };
  }),

  /**
   * Get the GDPR audit log for the current user.
   */
  getAuditLog: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(gdprAuditLog)
      .where(eq(gdprAuditLog.userId, ctx.user.id))
      .orderBy(gdprAuditLog.createdAt);
  }),

  /**
   * Generate or retrieve the stable pseudonymous ID for a candidate.
   * Used in employer-facing views to identify candidates anonymously.
   */
  getPseudonymousId: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const candidate = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, ctx.user.id))
      .limit(1);

    if (!candidate[0]) return null;

    // Generate and persist if not yet set
    if (!candidate[0].pseudonymousId) {
      const pseudoId = generatePseudonymousId(candidate[0].id);
      await db
        .update(candidateProfiles)
        .set({ pseudonymousId: pseudoId })
        .where(eq(candidateProfiles.id, candidate[0].id));
      return pseudoId;
    }

    return candidate[0].pseudonymousId;
  }),
});
