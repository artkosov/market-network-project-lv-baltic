/**
 * Stripe subscription plan definitions for Market Network
 * B2B SaaS — employer-facing subscription tiers
 */
export const STRIPE_PLANS = {
  starter: {
    name: "Sākuma plāns",
    nameEn: "Starter",
    description: "Maziem uzņēmumiem, kas sāk darbu ar AI saskaņošanu",
    priceMonthly: 4900, // EUR cents = 49.00
    currency: "eur",
    features: [
      "3 aktīvas vakances",
      "50 AI atbilstības/mēnesī",
      "E-pasta paziņojumi",
      "Anonīmie profili",
      "AI intervija",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null,
  },
  professional: {
    name: "Profesionālais plāns",
    nameEn: "Professional",
    description: "Augošiem uzņēmumiem ar aktīvu darbinieku meklēšanu",
    priceMonthly: 14900, // EUR cents = 149.00
    currency: "eur",
    features: [
      "Neierobežotas vakances",
      "500 AI atbilstības/mēnesī",
      "Prioritāri paziņojumi",
      "Anonīmie profili",
      "AI intervija",
      "Job Sentinel skrāpis",
      "Prioritārs atbalsts",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? null,
  },
  enterprise: {
    name: "Uzņēmuma plāns",
    nameEn: "Enterprise",
    description: "Lieliem uzņēmumiem ar pielāgotām vajadzībām",
    priceMonthly: 49900, // EUR cents = 499.00
    currency: "eur",
    features: [
      "Neierobežotas vakances",
      "Neierobežotas AI atbilstības",
      "Reāllaika paziņojumi",
      "Anonīmie profili",
      "AI intervija",
      "Job Sentinel skrāpis",
      "API piekļuve",
      "Pielāgots SLA",
      "Veltīts konta pārvaldnieks",
    ],
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE ?? null,
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;
