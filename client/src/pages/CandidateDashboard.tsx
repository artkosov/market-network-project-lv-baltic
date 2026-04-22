import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Sparkles, Bell, User, TrendingUp, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CandidateDashboard() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: profile } = trpc.candidate.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const { data: matches } = trpc.candidate.getMatches.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications } = trpc.candidate.getNotifications.useQuery(undefined, { enabled: isAuthenticated });
  const runMatching = trpc.matchmaker.runForCandidate.useMutation();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && profile !== undefined && profile === null) {
      navigate("/onboarding");
    }
  }, [profile, isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><h2 className="text-xl font-semibold mb-4">{t("common.loading")}</h2><Button asChild><a href={getLoginUrl()}>{t("nav.login")}</a></Button></div>
    </div>
  );

  const topMatches = (matches ?? []).filter((m: any) => m.score >= 70).slice(0, 3);
  const unread = (notifications ?? []).filter((n: any) => !n.isRead).length;

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: t("candidateDashboard.statusNew", { defaultValue: "Jauns" }), color: "bg-blue-500/10 text-blue-400" },
    notified: { label: t("candidateDashboard.statusNotified", { defaultValue: "Paziņots" }), color: "bg-primary/10 text-primary" },
    interviewing: { label: t("candidateDashboard.statusInterviewing", { defaultValue: "Intervija" }), color: "bg-yellow-500/10 text-yellow-400" },
    unlocked: { label: t("candidateDashboard.statusUnlocked", { defaultValue: "Atklāts" }), color: "bg-green-500/10 text-green-400" },
    rejected: { label: t("candidateDashboard.statusRejected", { defaultValue: "Noraidīts" }), color: "bg-red-500/10 text-red-400" },
  };

  return (
    <NavLayout userType="candidate">
      <div className="container py-8 max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t("candidateDashboard.greeting", { defaultValue: "Labdien! 👋" })}</h1>
            <p className="text-muted-foreground">{t("candidateDashboard.overviewDesc", { defaultValue: "Šeit ir jūsu darba meklēšanas pārskats" })}</p>
          </div>
          <Button onClick={() => runMatching.mutate()} disabled={runMatching.isPending} className="bg-primary text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            {runMatching.isPending
              ? t("candidateDashboard.searching", { defaultValue: "Meklē..." })
              : t("candidateDashboard.findMatches", { defaultValue: "Meklēt atbilstības" })}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <TrendingUp className="w-5 h-5" />, value: matches?.length ?? 0, label: t("candidateDashboard.activeMatches") },
            { icon: <Sparkles className="w-5 h-5" />, value: (matches ?? []).filter((m: any) => m.score >= 90).length, label: t("candidateDashboard.topMatches", { defaultValue: "90%+ atbilstības" }) },
            { icon: <Bell className="w-5 h-5" />, value: unread, label: t("candidateDashboard.newNotifications", { defaultValue: "Jauni paziņojumi" }) },
            { icon: <CheckCircle className="w-5 h-5" />, value: (matches ?? []).filter((m: any) => m.status === "unlocked").length, label: t("candidateDashboard.unlockedProfiles", { defaultValue: "Atklātie profili" }) },
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
          {/* Profile completion */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />{t("candidateDashboard.profileStatus", { defaultValue: "Profila stāvoklis" })}</CardTitle></CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-2">
                  {[
                    { label: t("candidateProfile.name"), done: !!profile.fullName },
                    { label: t("candidateProfile.skills"), done: !!(profile.skills as string[])?.length },
                    { label: t("candidateProfile.salary"), done: !!profile.salaryMin },
                    { label: t("gdpr.consents"), done: !!profile.gdprConsent },
                    { label: t("candidateProfile.cv"), done: !!profile.cvFileUrl },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                        {item.done ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                    </div>
                  ))}
                  <Button asChild variant="outline" size="sm" className="w-full mt-3">
                    <Link href="/kandidats/profils">{t("candidateDashboard.editProfile", { defaultValue: "Rediģēt profilu" })} <ArrowRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">{t("candidateDashboard.noProfile", { defaultValue: "Profils nav izveidots" })}</p>
                  <Button asChild size="sm"><Link href="/kandidats/profils">{t("candidateDashboard.createProfile", { defaultValue: "Izveidot profilu" })}</Link></Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top matches */}
          <Card className="glass-card md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4" />{t("candidateDashboard.bestMatches", { defaultValue: "Labākās atbilstības" })}</CardTitle>
              <Button asChild variant="ghost" size="sm"><Link href="/kandidats/atbilstibas">{t("candidateDashboard.viewAll")} <ArrowRight className="w-3 h-3 ml-1" /></Link></Button>
            </CardHeader>
            <CardContent>
              {topMatches.length > 0 ? (
                <div className="space-y-3">
                  {topMatches.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{match.score}%</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{match.jobTitle ?? t("candidateDashboard.vacancy", { defaultValue: "Vakance" })}</p>
                          <p className="text-xs text-muted-foreground">{match.jobCity ?? "Latvija"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusMap[match.status]?.color ?? "bg-muted text-muted-foreground"}`}>
                          {statusMap[match.status]?.label ?? match.status}
                        </span>
                        {match.status === "notified" && (
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                            <Link href={`/intervija/${match.id}`}>{t("candidateDashboard.startInterview", { defaultValue: "Sākt interviju" })}</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">{t("candidateDashboard.noMatches")}</p>
                  <p className="text-xs text-muted-foreground">{t("candidateDashboard.noMatchesDesc")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent notifications */}
        {(notifications ?? []).length > 0 && (
          <Card className="glass-card mt-6">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />{t("candidateDashboard.notifications", { defaultValue: "Paziņojumi" })}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(notifications ?? []).slice(0, 5).map((n: any) => (
                  <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? "opacity-60" : "bg-primary/5 border border-primary/10"}`}>
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </NavLayout>
  );
}
