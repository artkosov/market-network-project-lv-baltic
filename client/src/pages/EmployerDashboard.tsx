import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  BriefcaseIcon, Users, Plus, ArrowRight, TrendingUp, Eye,
  Search, Zap, Crown, CreditCard, CheckCircle2, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const TIER_COLORS: Record<string, string> = {
  starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  professional: "bg-primary/10 text-primary border-primary/20",
  enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  free: "bg-muted/50 text-muted-foreground border-border",
};

export default function EmployerDashboard() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: profile } = trpc.employer.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const { data: jobs } = trpc.employer.getJobs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.stripe.getSubscriptionStatus.useQuery(undefined, { enabled: isAuthenticated });
  const scrape = trpc.sentinel.scrape.useMutation();
  const { t } = useTranslation();

  const TIER_LABELS: Record<string, string> = {
    starter: t("pricing.starterName", { defaultValue: "Sākuma plāns" }),
    professional: t("pricing.professionalName", { defaultValue: "Profesionālais plāns" }),
    enterprise: t("pricing.enterpriseName", { defaultValue: "Uzņēmuma plāns" }),
    free: t("pricing.free"),
  };

  useEffect(() => {
    if (isAuthenticated && profile !== undefined && profile === null) navigate("/onboarding");
  }, [profile, isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">{t("common.loading")}</h2>
        <Button asChild><a href={getLoginUrl()}>{t("nav.login")}</a></Button>
      </div>
    </div>
  );

  const activeJobs = (jobs ?? []).filter((j: any) => j.status === "active");
  const totalMatches = (jobs ?? []).reduce((sum: number, j: any) => sum + (j.matchCount ?? 0), 0);
  const isSubscribed = subscription && subscription.status === "active";
  const currentTier = subscription?.tier ?? "free";

  const handleScrape = async (platform: "cv.lv" | "ss.lv" | "linkedin") => {
    const result = await scrape.mutateAsync({ platform, city: "Rīga" });
    if (result.success) toast.success(`${platform}: ${t("employerDashboard.importedVacancies", { defaultValue: "importētas" })} ${result.imported} ${t("employerDashboard.newVacancies", { defaultValue: "jaunas vakances" })}`);
    else toast.error(t("employerDashboard.scrapeError", { defaultValue: "Skrāpēšana neizdevās" }));
  };

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{profile?.companyName ?? t("employerDashboard.myCompany", { defaultValue: "Mans Uzņēmums" })}</h1>
            <p className="text-muted-foreground">{t("employerDashboard.title")}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Subscription badge */}
            <Badge className={`gap-1.5 px-3 py-1.5 text-xs font-medium ${TIER_COLORS[currentTier] ?? TIER_COLORS.free}`}>
              <Crown className="w-3 h-3" />
              {TIER_LABELS[currentTier] ?? t("pricing.free")}
              {isSubscribed && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
            </Badge>
            {!isSubscribed && (
              <Button variant="outline" size="sm" asChild className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5">
                <Link href="/cenas"><CreditCard className="w-3 h-3" />{t("employerDashboard.upgradePlan", { defaultValue: "Uzlabot plānu" })}</Link>
              </Button>
            )}
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/darbadevetajs/vakances/jauna"><Plus className="w-4 h-4 mr-2" />{t("employerDashboard.newVacancy", { defaultValue: "Jauna vakance" })}</Link>
            </Button>
          </div>
        </div>

        {/* Subscription upgrade banner */}
        {!isSubscribed && (
          <Card className="glass-card border-primary/20 mb-6 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("employerDashboard.upgradeTitle", { defaultValue: "Paplašini iespējas ar Pro plānu" })}</p>
                  <p className="text-xs text-muted-foreground">{t("employerDashboard.upgradeDesc", { defaultValue: "Neierobežotas vakances, AI kandidātu meklēšana, prioritāra atbilstību apstrāde" })}</p>
                </div>
              </div>
              <Button size="sm" asChild className="flex-shrink-0 bg-primary text-primary-foreground">
                <Link href="/cenas">{t("employerDashboard.viewPlans", { defaultValue: "Skatīt plānus" })} <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <BriefcaseIcon className="w-5 h-5" />, value: activeJobs.length, label: t("employerDashboard.activeJobs") },
            { icon: <Users className="w-5 h-5" />, value: totalMatches, label: t("employerDashboard.totalMatches") },
            { icon: <Eye className="w-5 h-5" />, value: (jobs ?? []).filter((j: any) => j.status === "active").length, label: t("employerDashboard.openProfiles", { defaultValue: "Atvērti profili" }) },
            { icon: <TrendingUp className="w-5 h-5" />, value: "94%", label: t("home.matchAccuracy") },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{stat.icon}</div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Job Sentinel */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                {t("employerDashboard.sentinelTitle", { defaultValue: "Darba Sentinel" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">{t("employerDashboard.sentinelDesc", { defaultValue: "Importē vakances no Latvijas darba platformām" })}</p>
              <div className="space-y-2">
                {(["cv.lv", "ss.lv", "linkedin"] as const).map(platform => (
                  <Button
                    key={platform}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between hover:border-primary/40 hover:bg-primary/5 transition-all"
                    onClick={() => handleScrape(platform)}
                    disabled={scrape.isPending}
                  >
                    <span className="font-medium">{platform}</span>
                    {scrape.isPending ? (
                      <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />
                    ) : (
                      <Zap className="w-3 h-3 text-primary" />
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {t("employerDashboard.sentinelNote", { defaultValue: "Sentinel filtrē pēc pilsētas, algas un prasmēm, automātiski importējot atbilstošas vakances." })}
              </p>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card className="glass-card md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4" />
                {t("employerDashboard.activeJobsTitle", { defaultValue: "Aktīvas vakances" })}
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/darbadevetajs/vakances">{t("candidateDashboard.viewAll")} <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeJobs.length > 0 ? (
                <div className="space-y-3">
                  {activeJobs.slice(0, 4).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.city ?? "Latvija"} · {job.jobType === "full_time" ? t("employerDashboard.fullTime", { defaultValue: "Pilna slodze" }) : job.jobType === "part_time" ? t("employerDashboard.partTime", { defaultValue: "Nepilna slodze" }) : job.jobType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {job.source === "scraped" ? t("employerDashboard.imported", { defaultValue: "Importēts" }) : t("employerDashboard.manual", { defaultValue: "Manuāls" })}
                        </Badge>
                        <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                          <Link href={`/darbadevetajs/atbilstibas/${job.id}`}>{t("employerDashboard.candidates", { defaultValue: "Kandidāti" })}</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">{t("employerDashboard.noJobs")}</p>
                  <Button asChild size="sm">
                    <Link href="/darbadevetajs/vakances/jauna">{t("employerDashboard.addVacancy", { defaultValue: "Pievienot vakanci" })}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </NavLayout>
  );
}
