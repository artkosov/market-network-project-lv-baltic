import Stripe from "stripe";
import type { Request, Response } from "express";
import { getDb } from "../db";
import { employerProfiles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-03-25.dahlia",
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const employerProfileId = session.metadata?.employer_profile_id;
        if (employerProfileId) {
          const db = await getDb();
          if (db) {
            const planTier = (session.metadata?.plan ?? "free") as "free" | "pro" | "enterprise";
            await db.update(employerProfiles)
              .set({
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                subscriptionStatus: "active",
                subscriptionTier: planTier,
              })
              .where(eq(employerProfiles.id, parseInt(employerProfileId)));
            console.log(`[Stripe] Subscription activated for employer profile ${employerProfileId}`);
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const db = await getDb();
        if (db) {
          const status = sub.status as "active" | "trialing" | "past_due" | "canceled" | "none";
          await db.update(employerProfiles)
            .set({ subscriptionStatus: status })
            .where(eq(employerProfiles.stripeSubscriptionId, sub.id));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const db = await getDb();
        if (db) {
          await db.update(employerProfiles)
            .set({ subscriptionStatus: "canceled", stripeSubscriptionId: null })
            .where(eq(employerProfiles.stripeSubscriptionId, sub.id));
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const db = await getDb();
        const subId = (invoice as any).subscription as string | undefined;
        if (db && subId) {
          await db.update(employerProfiles)
            .set({ subscriptionStatus: "past_due" })
            .where(eq(employerProfiles.stripeSubscriptionId, subId));
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  return res.json({ received: true });
}

export { stripe };
