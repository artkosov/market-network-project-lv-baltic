import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Sparkles, Zap, Building2, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const createCheckout = trpc.stripe.createCheckoutSession.useMutation();
  const { data: subStatus } = trpc.stripe.getSubscriptionStatus.useQuery(undefined, { enabled: isAuthenticated });
  const { t } = useTranslation();

  const currentPlan = subStatus?.tier ?? "free";
  const currentStatus = subStatus?.status ?? "none";

  const PLANS = [
    {
      key: "starter" as const,
      icon: <Zap className="w-6 h-6" />,
      name: t("pricing.starterName", { defaultValue: "Sākuma plāns" }),
      price: 49,
      description: t("pricing.starterDesc", { defaultValue: "Maziem uzņēmumiem, kas sāk darbu ar AI saskaņošanu" }),
      badge: null,
      features: t("pricing.starterFeatures", { returnObjects: true, defaultValue: ["3 aktīvas vakances", "50 AI atbilstības mēnesī", "E-pasta paziņojumi", "Anonīmie kandidātu profili", "AI kvalifikācijas intervija", "Pamata analītika"] }) as string[],
      highlight: false,
    },
    {
      key: "professional" as const,
      icon: <Sparkles className="w-6 h-6" />,
      name: t("pricing.professionalName", { defaultValue: "Profesionālais plāns" }),
      price: 149,
      description: t("pricing.professionalDesc", { defaultValue: "Augošiem uzņēmumiem ar aktīvu darbinieku meklēšanu" }),
      badge: t("pricing.mostPopular"),
      features: t("pricing.professionalFeatures", { returnObjects: true, defaultValue: ["Neierobežotas vakances", "500 AI atbilstības mēnesī", "Prioritāri paziņojumi", "Anonīmie kandidātu profili", "AI kvalifikācijas intervija", "Job Sentinel skrāpis", "Detalizēta analītika", "Prioritārs atbalsts"] }) as string[],
      highlight: true,
    },
    {
      key: "enterprise" as const,
      icon: <Crown className="w-6 h-6" />,
      name: t("pricing.enterpriseName", { defaultValue: "Uzņēmuma plāns" }),
      price: 499,
      description: t("pricing.enterpriseDesc", { defaultValue: "Lieliem uzņēmumiem ar pielāgotām vajadzībām" }),
      badge: null,
      features: t("pricing.enterpriseFeatures", { returnObjects: true, defaultValue: ["Neierobežotas vakances", "Neierobežotas AI atbilstības", "Reāllaika paziņojumi", "Anonīmie kandidātu profili", "AI kvalifikācijas intervija", "Job Sentinel skrāpis (visi avoti)", "API piekļuve", "Pielāgots SLA", "Veltīts konta pārvaldnieks"] }) as string[],
      highlight: false,
    },
  ];

  const handleSubscribe = async (plan: "starter" | "professional" | "enterprise") => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    setLoading(plan);
    try {
      const result = await createCheckout.mutateAsync({ plan, origin: window.location.origin });
      if (result.url) { toast.success(t("pricing.redirecting", { defaultValue: "Novirzām uz maksājumu lapu..." })); window.open(result.url, "_blank"); }
    } catch (err: any) { toast.error(err.message ?? t("pricing.checkoutError", { defaultValue: "Kļūda veidojot maksājumu sesiju" })); } finally { setLoading(null); }
  };

  return (
    <NavLayout userType="employer">
      <div className="container py-16 max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><Building2 className="w-3 h-3 mr-1" />{t("pricing.b2bBadge", { defaultValue: "B2B SaaS — Darba devējiem" })}</Badge>
          <h1 className="text-5xl font-bold mb-4">{t("pricing.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("pricing.desc")}</p>
        </div>
        {isAuthenticated && currentStatus === "active" && (
          <div className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm font-medium">{t("pricing.activePlan", { defaultValue: "Jūsu aktīvais plāns:" })} <span className="text-primary capitalize">{currentPlan}</span><span className="text-muted-foreground ml-2">— {t("pricing.activeStatus", { defaultValue: "Abonements ir aktīvs" })}</span></p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.key && currentStatus === "active";
            return (
              <Card key={plan.key} className={`glass-card relative ${plan.highlight ? "border-primary/40 shadow-lg shadow-primary/10 scale-105" : "border-border/50"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${plan.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>{plan.icon}</div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{t("pricing.month")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-2.5 h-2.5 text-primary" /></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                    disabled={loading === plan.key || isCurrentPlan}
                    onClick={() => handleSubscribe(plan.key)}
                  >
                    {loading === plan.key
                      ? t("pricing.processing", { defaultValue: "Apstrādā..." })
                      : isCurrentPlan
                      ? t("pricing.activePlanBtn", { defaultValue: "Aktīvais plāns" })
                      : t("pricing.choosePlan", { defaultValue: "Izvēlēties plānu" })}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="text-center p-8 rounded-3xl bg-accent/20 border border-border/30">
          <h3 className="text-xl font-semibold mb-2">{t("pricing.startFreeTitle", { defaultValue: "Sāc bez maksas" })}</h3>
          <p className="text-muted-foreground mb-4">{t("pricing.startFreeDesc", { defaultValue: "Kandidātiem platforma ir pilnīgi bezmaksas. Darba devēji var izmēģināt ar 1 vakanci bez maksas." })}</p>
          <p className="text-xs text-muted-foreground">{t("pricing.testCard", { defaultValue: "Testēšanai izmanto karti:" })} <code className="bg-accent px-2 py-0.5 rounded">4242 4242 4242 4242</code></p>
        </div>
      </div>
    </NavLayout>
  );
}
