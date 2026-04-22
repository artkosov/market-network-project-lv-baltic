import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
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
  const { data: jobs } = trpc.employer.getJobs.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Lūdzu pieslēdzieties</h2>
          <Button asChild><a href={getLoginUrl()}>Pieslēgties</a></Button>
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
    { name: "Aktīvas", value: activeJobs.length },
    { name: "Pauzētas", value: pausedJobs.length },
    { name: "Slēgtas", value: closedJobs.length },
  ].filter(d => d.value > 0);

  // Job type distribution
  const jobTypeMap: Record<string, number> = {};
  jobList.forEach((j: any) => {
    const label =
      j.jobType === "full_time" ? "Pilna slodze" :
      j.jobType === "part_time" ? "Nepilna slodze" :
      j.jobType === "contract" ? "Līgums" :
      j.jobType === "internship" ? "Prakse" :
      j.jobType === "freelance" ? "Freelance" : j.jobType;
    jobTypeMap[label] = (jobTypeMap[label] ?? 0) + 1;
  });
  const jobTypeData = Object.entries(jobTypeMap).map(([name, value]) => ({ name, value }));

  // Remote policy distribution
  const remotePolicyMap: Record<string, number> = {};
  jobList.forEach((j: any) => {
    const label =
      j.remotePolicy === "onsite" ? "Klātienē" :
      j.remotePolicy === "hybrid" ? "Hibrīds" :
      j.remotePolicy === "remote" ? "Attālināts" : j.remotePolicy;
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
              Analītika
            </h1>
            <p className="text-muted-foreground">Detalizēts pārskats par jūsu vakancēm un atbilstībām</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/darbadevetajs"><ArrowRight className="w-3 h-3 mr-1 rotate-180" />Uz paneli</Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <BriefcaseIcon className="w-5 h-5" />, value: jobList.length, label: "Kopā vakances", sub: `${activeJobs.length} aktīvas` },
            { icon: <Sparkles className="w-5 h-5" />, value: totalMatches, label: "Kopā atbilstības", sub: "Visi darbi" },
            { icon: <Users className="w-5 h-5" />, value: jobList.length > 0 ? (totalMatches / jobList.length).toFixed(1) : "0", label: "Vidēji atbilstības/vakance", sub: "AI saskaņošana" },
            { icon: <TrendingUp className="w-5 h-5" />, value: avgSalaryMin > 0 ? `€${Math.round(avgSalaryMin)}` : "—", label: "Vidējā min. alga", sub: "EUR/mēnesī" },
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
                Atbilstības pa vakancēm
              </CardTitle>
              <CardDescription>AI atrastās atbilstības katrai vakancei</CardDescription>
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
                    <Bar dataKey="atbilstibas" name="Atbilstības" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  Nav datu. Pievienojiet vakances.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vacancy Status Pie */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-primary" />
                Vacanču statusi
              </CardTitle>
              <CardDescription>Sadalījums pēc statusa</CardDescription>
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
                  Nav datu. Pievienojiet vakances.
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
                Darba veidi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={jobTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      dataKey="value"
                    >
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
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Nav datu</div>
              )}
            </CardContent>
          </Card>

          {/* Remote Policy */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Darba veids
              </CardTitle>
            </CardHeader>
            <CardContent>
              {remotePolicyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={remotePolicyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      dataKey="value"
                    >
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
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Nav datu</div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Ātrais kopsavilkums
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Aktīvas vakances", value: activeJobs.length, color: "text-green-400" },
                { label: "Pauzētas vakances", value: pausedJobs.length, color: "text-yellow-400" },
                { label: "Slēgtas vakances", value: closedJobs.length, color: "text-red-400" },
                { label: "Importētas (Sentinel)", value: jobList.filter((j: any) => j.source === "scraped").length, color: "text-blue-400" },
                { label: "Manuāli izveidotas", value: jobList.filter((j: any) => j.source === "manual").length, color: "text-primary" },
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
                Algu diapazons pa vakancēm (EUR/mēnesī)
              </CardTitle>
              <CardDescription>Min. un max. alga katrai vakancei</CardDescription>
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
                    formatter={(value) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{value === "min" ? "Min. alga" : "Max. alga"}</span>}
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
