import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  TrendingUp, Users, BriefcaseIcon, Sparkles, Eye, Clock,
  CheckCircle2, ArrowRight, BarChart2,
} from "lucide-react";
import { Link } from "wouter";

const COLORS = ["#d4a853", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { data: jobs } = trpc.employer.getJobs.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{t("analytics.pleaseLogin", { defaultValue: "Lūdzu pieslēdzieties" })}</h2>
          <Button asChild><a href={getLoginUrl()}>{t("nav.login")}</a></Button>
        </div>
      </div>
    );
  }

  const jobList = jobs ?? [];
  const activeJobs = jobList.filter((j: any) => j.status === "active");
  const pausedJobs = jobList.filter((j: any) => j.status === "paused");
  const closedJobs = jobList.filter((j: any) => j.status === "closed");

  // Build per-job match data for bar chart
  const jobMatchData = jobList.slice(0, 8).map((j: any) => ({
    name: j.title.length > 18 ? j.title.slice(0, 18) + "…" : j.title,
    atbilstibas: j.matchCount ?? 0,
    status: j.status,
  }));

  // Status distribution for pie chart
  const statusData = [
    { name: t("jobPostings.statusActive", { defaultValue: "Aktīvas" }), value: activeJobs.length },
    { name: t("jobPostings.statusPaused", { defaultValue: "Pauzētas" }), value: pausedJobs.length },
    { name: t("jobPostings.statusClosed", { defaultValue: "Slēgtas" }), value: closedJobs.length },
  ].filter(d => d.value > 0);

  // Job type distribution
  const jobTypeMap: Record<string, number> = {};
  jobList.forEach((j: any) => {
    const label =
      j.jobType === "full_time" ? t("employerDashboard.fullTime") :
      j.jobType === "part_time" ? t("employerDashboard.partTime") :
      j.jobType === "contract" ? t("createJob.contract", { defaultValue: "Līgums" }) :
      j.jobType === "internship" ? t("createJob.internship", { defaultValue: "Prakse" }) :
      j.jobType === "freelance" ? "Freelance" : j.jobType;
    jobTypeMap[label] = (jobTypeMap[label] ?? 0) + 1;
  });
  const jobTypeData = Object.entries(jobTypeMap).map(([name, value]) => ({ name, value }));

  // Remote policy distribution
  const remotePolicyMap: Record<string, number> = {};
  jobList.forEach((j: any) => {
    const label =
      j.remotePolicy === "onsite" ? t("candidateProfile.onsite") :
      j.remotePolicy === "hybrid" ? t("candidateProfile.hybrid") :
      j.remotePolicy === "remote" ? t("candidateProfile.remoteOnly") : j.remotePolicy;
    remotePolicyMap[label] = (remotePolicyMap[label] ?? 0) + 1;
  });
  const remotePolicyData = Object.entries(remotePolicyMap).map(([name, value]) => ({ name, value }));

  // Salary range data
  const salaryData = jobList
    .filter((j: any) => j.salaryMin && j.salaryMax)
    .slice(0, 6)
    .map((j: any) => ({
      name: j.title.length > 14 ? j.title.slice(0, 14) + "…" : j.title,
      min: j.salaryMin,
      max: j.salaryMax,
    }));

  const totalMatches = jobList.reduce((sum: number, j: any) => sum + (j.matchCount ?? 0), 0);
  const avgSalaryMin = jobList.filter((j: any) => j.salaryMin).reduce((sum: number, j: any) => sum + j.salaryMin, 0) / (jobList.filter((j: any) => j.salaryMin).length || 1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-lg">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <BarChart2 className="w-7 h-7 text-primary" />
              {t("analytics.title")}
            </h1>
            <p className="text-muted-foreground">{t("analytics.subtitle", { defaultValue: "Detalizēts pārskats par jūsu vakancēm un atbilstībām" })}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/darbadevetajs">
              <ArrowRight className="w-3 h-3 mr-1 rotate-180" />
              {t("analytics.toDashboard", { defaultValue: "Uz paneli" })}
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: <BriefcaseIcon className="w-5 h-5" />,
              value: jobList.length,
              label: t("analytics.totalJobs", { defaultValue: "Kopā vakances" }),
              sub: `${activeJobs.length} ${t("jobPostings.statusActive", { defaultValue: "aktīvas" }).toLowerCase()}`
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              value: totalMatches,
              label: t("analytics.totalMatches", { defaultValue: "Kopā atbilstības" }),
              sub: t("analytics.allJobs", { defaultValue: "Visi darbi" })
            },
            {
              icon: <Users className="w-5 h-5" />,
              value: jobList.length > 0 ? (totalMatches / jobList.length).toFixed(1) : "0",
              label: t("analytics.avgMatchesPerJob", { defaultValue: "Vidēji atbilstības/vakance" }),
              sub: t("analytics.aiMatching", { defaultValue: "AI saskaņošana" })
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              value: avgSalaryMin > 0 ? `€${Math.round(avgSalaryMin)}` : "—",
              label: t("analytics.avgMinSalary", { defaultValue: "Vidējā min. alga" }),
              sub: t("analytics.eurPerMonth", { defaultValue: "EUR/mēnesī" })
            },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{stat.icon}</div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="text-xs text-primary/70 mt-0.5">{stat.sub}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Matches per Job Bar Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("analytics.matchesByJob", { defaultValue: "Atbilstības pa vakancēm" })}
              </CardTitle>
              <CardDescription>{t("analytics.matchesByJobDesc", { defaultValue: "AI atrastās atbilstības katrai vakancei" })}</CardDescription>
            </CardHeader>
            <CardContent>
              {jobMatchData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={jobMatchData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="atbilstibas" name={t("analytics.matches", { defaultValue: "Atbilstības" })} fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  {t("analytics.noData")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vacancy Status Pie */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-primary" />
                {t("analytics.vacancyStatuses", { defaultValue: "Vacanču statusi" })}
              </CardTitle>
              <CardDescription>{t("analytics.distributionByStatus", { defaultValue: "Sadalījums pēc statusa" })}</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  {t("analytics.noData")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Job Type Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t("analytics.jobTypes", { defaultValue: "Darba veidi" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={jobTypeData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                      {jobTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  {t("analytics.noData")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Remote Policy */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                {t("analytics.workFormat", { defaultValue: "Darba veids" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {remotePolicyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={remotePolicyData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                      {remotePolicyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  {t("analytics.noData")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {t("analytics.quickSummary", { defaultValue: "Ātrais kopsavilkums" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: t("analytics.activeJobs", { defaultValue: "Aktīvas vakances" }), value: activeJobs.length, color: "text-green-400" },
                { label: t("analytics.pausedJobs", { defaultValue: "Pauzētas vakances" }), value: pausedJobs.length, color: "text-yellow-400" },
                { label: t("analytics.closedJobs", { defaultValue: "Slēgtas vakances" }), value: closedJobs.length, color: "text-red-400" },
                { label: t("analytics.importedSentinel", { defaultValue: "Importētas (Sentinel)" }), value: jobList.filter((j: any) => j.source === "scraped").length, color: "text-blue-400" },
                { label: t("analytics.manuallyCreated", { defaultValue: "Manuāli izveidotas" }), value: jobList.filter((j: any) => j.source === "manual").length, color: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Salary Range Chart */}
        {salaryData.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t("analytics.salaryRange", { defaultValue: "Algu diapazons pa vakancēm (EUR/mēnesī)" })}
              </CardTitle>
              <CardDescription>{t("analytics.salaryRangeDesc", { defaultValue: "Min. un max. alga katrai vakancei" })}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salaryData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        {value === "min"
                          ? t("analytics.minSalary", { defaultValue: "Min. alga" })
                          : t("analytics.maxSalary", { defaultValue: "Max. alga" })}
                      </span>
                    )}
                  />
                  <Bar dataKey="min" name="min" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" name="max" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </NavLayout>
  );
}
