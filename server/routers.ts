import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { candidateRouter } from "./routers/candidate";
import { employerRouter } from "./routers/employer";
import { interviewRouter } from "./routers/interview";
import { matchmakerRouter } from "./routers/matchmaker";
import { sentinelRouter } from "./routers/sentinel";
import { stripeRouter } from "./routers/stripe";
import { gdprRouter } from "./routers/gdpr";
import { seedSubscriptionPlans, getSubscriptionPlans, updateUserType } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    setUserRole: protectedProcedure
      .input(z.object({ role: z.enum(["candidate", "employer"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserType(ctx.user.id, input.role);
        return { success: true };
      }),
  }),

  candidate: candidateRouter,
  employer: employerRouter,
  interview: interviewRouter,
  matchmaker: matchmakerRouter,
  sentinel: sentinelRouter,
  stripe: stripeRouter,
  gdpr: gdprRouter,
  // Subscription planss
  plans: router({
    list: publicProcedure.query(async () => {
      await seedSubscriptionPlans();
      return getSubscriptionPlans();
    }),
  }),
});

export type AppRouter = typeof appRouter;
