import Stripe from "stripe";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getEmployerByUserId } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-03-25.dahlia",
});

const PLAN_PRICES: Record<string, { monthly: number; name: string }> = {
  starter: { monthly: 4900, name: "Market Network Sākuma plāns" },
  professional: { monthly: 14900, name: "Market Network Profesionālais plāns" },
  enterprise: { monthly: 49900, name: "Market Network Uzņēmuma plāns" },
};

export const stripeRouter = router({
  createCheckoutSession: protectedProcedure
    .input(z.object({ plan: z.enum(["starter", "professional", "enterprise"]), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const employer = await getEmployerByUserId(ctx.user.id);
      if (!employer) throw new TRPCError({ code: "NOT_FOUND", message: "Darba devēja profils nav atrasts" });

      const planConfig = PLAN_PRICES[input.plan];
      if (!planConfig) throw new TRPCError({ code: "BAD_REQUEST", message: "Nezināms plāns" });

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: ctx.user.email ?? undefined,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: { name: planConfig.name },
              unit_amount: planConfig.monthly,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: ctx.user.id.toString(),
          employer_profile_id: employer.id.toString(),
          plan: input.plan,
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
        },
        client_reference_id: ctx.user.id.toString(),
        allow_promotion_codes: true,
        success_url: `${input.origin}/darbadevetajs?subscription=success`,
        cancel_url: `${input.origin}/cenas?subscription=canceled`,
      });

      return { url: session.url };
    }),

  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const employer = await getEmployerByUserId(ctx.user.id);
    if (!employer) return { status: "none", tier: "free" };
    return {
      status: employer.subscriptionStatus ?? "none",
      tier: employer.subscriptionTier ?? "free",
      stripeCustomerId: employer.stripeCustomerId,
    };
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const employer = await getEmployerByUserId(ctx.user.id);
    if (!employer?.stripeSubscriptionId) throw new TRPCError({ code: "NOT_FOUND", message: "Nav aktīva abonementa" });

    await stripe.subscriptions.cancel(employer.stripeSubscriptionId);
    return { success: true };
  }),
});
