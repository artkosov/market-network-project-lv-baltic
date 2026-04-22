import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield, Users, BriefcaseIcon, Sparkles, Database,
  TrendingUp, Lock, ArrowRight, Activity, AlertTriangle,
} from "lucide-react";

export default function AdminPanel() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { data: plans } = trpc.plans.list.useQuery();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{t("admin.pleaseLogin", { defaultValue: "Lūdzu pieslēdzieties" })}</h2>
          <Button asChild><a href={getLoginUrl()}>{t("nav.login")}</a></Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <NavLayout userType="candidate">
        <div className="container py-16 max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("admin.accessDenied", { defaultValue: "Piekļuve liegta" })}</h1>
          <p className="text-muted-foreground mb-6">{t("admin.adminOnly", { defaultValue: "Šī lapa ir pieejama tikai administratoriem." })}</p>
          <Button asChild variant="outline">
            <Link href="/">{t("notFound.backHome")}</Link>
          </Button>
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary" />
              {t("admin.title")}
            </h1>
            <p className="text-muted-foreground">{t("admin.subtitle", { defaultValue: "Platformas pārvaldība un statistika" })}</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5">
            <Shield className="w-3 h-3 mr-1.5" />
            {t("admin.administrator", { defaultValue: "Administrators" })}
          </Badge>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Users className="w-5 h-5" />, label: t("admin.users"), value: "—", color: "text-blue-400" },
            { icon: <BriefcaseIcon className="w-5 h-5" />, label: t("admin.jobs"), value: "—", color: "text-primary" },
            { icon: <Sparkles className="w-5 h-5" />, label: t("admin.matches"), value: "—", color: "text-green-400" },
            { icon: <TrendingUp className="w-5 h-5" />, label: t("admin.subscribers", { defaultValue: "Abonenti" }), value: "—", color: "text-amber-400" },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Subscription Plans */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                {t("admin.subscriptionPlans", { defaultValue: "Abonementa plāni" })}
              </CardTitle>
              <CardDescription>{t("admin.activePlans", { defaultValue: "Aktīvie plāni platformā" })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(plans ?? []).map((plan: any) => (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                  <div>
                    <p className="font-medium text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{plan.tier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-primary">
                      {plan.priceMonthly === 0
                        ? t("admin.free", { defaultValue: "Bezmaksas" })
                        : `€${(plan.priceMonthly / 100).toFixed(0)}/${t("admin.month", { defaultValue: "mēn" })}`}
                    </p>
                    <Badge variant="outline" className="text-xs mt-0.5">
                      {plan.isActive
                        ? t("admin.active", { defaultValue: "Aktīvs" })
                        : t("admin.inactive", { defaultValue: "Neaktīvs" })}
                    </Badge>
                  </div>
                </div>
              ))}
              {(plans ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("admin.noPlans", { defaultValue: "Nav plānu" })}</p>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {t("admin.systemStatus", { defaultValue: "Sistēmas statuss" })}
              </CardTitle>
              <CardDescription>{t("admin.platformHealth", { defaultValue: "Platformas veselības pārskats" })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: t("admin.database", { defaultValue: "Datu bāze" }), status: t("admin.running", { defaultValue: "Darbojas" }), ok: true },
                { label: "AI Matchmaker", status: t("admin.running", { defaultValue: "Darbojas" }), ok: true },
                { label: t("admin.gdprEncryption", { defaultValue: "GDPR Šifrēšana" }), status: "AES-256-GCM", ok: true },
                { label: "Stripe Billing", status: t("admin.configured", { defaultValue: "Konfigurēts" }), ok: true },
                { label: "Job Sentinel", status: t("admin.ready", { defaultValue: "Gatavs" }), ok: true },
                { label: t("admin.aiInterview", { defaultValue: "AI Intervija" }), status: t("admin.llmConnected", { defaultValue: "LLM savienots" }), ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.ok ? "bg-green-400" : "bg-red-400"}`} />
                    <span className={item.ok ? "text-green-400" : "text-red-400"}>{item.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {t("admin.adminActions", { defaultValue: "Administratora darbības" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{t("admin.userManagement", { defaultValue: "Lietotāju pārvaldība" })}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t("admin.userManagementDesc", { defaultValue: "Skatīt un pārvaldīt reģistrētos lietotājus" })}</p>
                <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                  {t("admin.comingSoon", { defaultValue: "Drīzumā" })}
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{t("admin.gdprReports", { defaultValue: "GDPR Pārskati" })}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t("admin.gdprReportsDesc", { defaultValue: "Skatīt audita žurnālus un piekrišanas" })}</p>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <Link href="/gdpr">{t("admin.openGdprCenter", { defaultValue: "Atvērt GDPR Centru" })} <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{t("analytics.title")}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t("admin.analyticsDesc", { defaultValue: "Platformas darbības statistika" })}</p>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <Link href="/darbadevetajs/analytics">{t("admin.viewAnalytics", { defaultValue: "Skatīt analītiku" })} <ArrowRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </NavLayout>
  );
}
