import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, Link } from "wouter";
import { useState } from "react";
import {
  Sparkles, Eye, EyeOff, MessageSquare, MapPin, Euro, Briefcase,
  Search, SlidersHorizontal, TrendingUp, CheckCircle2, ArrowUpDown,
} from "lucide-react";

export default function Matches() {
  const { isAuthenticated } = useAuth();
  const params = useParams<{ jobId?: string }>();
  const jobId = params.jobId ? parseInt(params.jobId) : undefined;
  const isEmployer = !!jobId;

  const { data: candidateMatches } = trpc.candidate.getMatches.useQuery(undefined, { enabled: isAuthenticated && !isEmployer });
  const { data: jobMatches } = trpc.employer.getJobMatches.useQuery({ jobId: jobId! }, { enabled: isAuthenticated && !!isEmployer });
  const runMatching = trpc.matchmaker.runForCandidate.useMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [minScore, setMinScore] = useState(0);

  const allMatches = (isEmployer ? (jobMatches ?? []) : (candidateMatches ?? [])) as any[];

  const filteredMatches = allMatches
    .filter((m: any) => {
      const matchesSearch = !searchQuery ||
        (isEmployer
          ? (m.skills ?? []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
          : (m.jobTitle ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || (m.city ?? "").toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      const matchesScore = m.score >= minScore;
      return matchesSearch && matchesStatus && matchesScore;
    })
    .sort((a: any, b: any) => sortBy === "score" ? b.score - a.score : 0);

  const scoreColor = (score: number) =>
    score >= 90 ? "text-green-400" :
    score >= 70 ? "text-primary" :
    score >= 50 ? "text-yellow-400" : "text-muted-foreground";

  const scoreBg = (score: number) =>
    score >= 90 ? "bg-green-500/10 border-green-500/20" :
    score >= 70 ? "bg-primary/10 border-primary/20" :
    score >= 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-muted/30 border-border";

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Jauns", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    notified: { label: "Paziņots", color: "bg-primary/10 text-primary border-primary/20" },
    interviewing: { label: "Intervija", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    unlocked: { label: "Atklāts", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    rejected: { label: "Noraidīts", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  };

  const highScoreCount = allMatches.filter((m: any) => m.score >= 90).length;
  const avgScore = allMatches.length > 0
    ? Math.round(allMatches.reduce((sum: number, m: any) => sum + m.score, 0) / allMatches.length)
    : 0;

  return (
    <NavLayout userType={isEmployer ? "employer" : "candidate"}>
      <div className="container py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{isEmployer ? "Kandidātu atbilstības" : "Manas atbilstības"}</h1>
            <p className="text-muted-foreground">{filteredMatches.length} no {allMatches.length} atbilstībām</p>
          </div>
          {!isEmployer && (
            <Button onClick={() => runMatching.mutate()} disabled={runMatching.isPending} className="bg-primary text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />{runMatching.isPending ? "Meklē..." : "Atjaunot atbilstības"}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Sparkles className="w-4 h-4" />, value: allMatches.length, label: "Kopā atbilstības" },
            { icon: <TrendingUp className="w-4 h-4" />, value: highScoreCount, label: "90%+ atbilstības" },
            { icon: <CheckCircle2 className="w-4 h-4" />, value: avgScore > 0 ? `${avgScore}%` : "—", label: "Vidējais rezultāts" },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{stat.icon}</div>
                <div><div className="text-xl font-bold">{stat.value}</div><div className="text-xs text-muted-foreground">{stat.label}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 bg-input/50" placeholder={isEmployer ? "Meklēt pēc prasmēm..." : "Meklēt vakances..."} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-input/50">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-2" /><SelectValue placeholder="Statuss" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi statusi</SelectItem>
              <SelectItem value="pending">Jauns</SelectItem>
              <SelectItem value="notified">Paziņots</SelectItem>
              <SelectItem value="interviewing">Intervija</SelectItem>
              <SelectItem value="unlocked">Atklāts</SelectItem>
              <SelectItem value="rejected">Noraidīts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(minScore)} onValueChange={v => setMinScore(Number(v))}>
            <SelectTrigger className="w-[140px] bg-input/50">
              <TrendingUp className="w-3.5 h-3.5 mr-2" /><SelectValue placeholder="Min. rezultāts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Visi rezultāti</SelectItem>
              <SelectItem value="50">50%+</SelectItem>
              <SelectItem value="70">70%+</SelectItem>
              <SelectItem value="90">90%+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => setSortBy(v as "score" | "date")}>
            <SelectTrigger className="w-[140px] bg-input/50">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Pēc rezultāta</SelectItem>
              <SelectItem value="date">Pēc datuma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match: any) => (
              <Card key={match.matchId ?? match.id} className={`glass-card hover:border-border/80 transition-all ${match.score >= 90 ? "border-green-500/20" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreBg(match.score)}`}>
                      <span className={`text-xl font-black ${scoreColor(match.score)}`}>{match.score}%</span>
                      <span className="text-xs text-muted-foreground">atbilstība</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold">{isEmployer ? (match.isUnlocked ? (match.fullName ?? "Kandidāts") : "Anonīms kandidāts") : (match.jobTitle ?? "Vakance")}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusMap[match.status]?.color ?? "bg-muted text-muted-foreground"}`}>
                          {statusMap[match.status]?.label ?? match.status}
                        </span>
                        {match.isUnlocked && <Badge variant="outline" className="text-xs text-green-400 border-green-400/30"><Eye className="w-3 h-3 mr-1" />Atklāts</Badge>}
                        {!match.isUnlocked && isEmployer && <Badge variant="outline" className="text-xs"><EyeOff className="w-3 h-3 mr-1" />Anonīms</Badge>}
                        {match.score >= 90 && <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20"><Sparkles className="w-2.5 h-2.5 mr-1" />Izcils</Badge>}
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[["Prasmes", match.skillsScore], ["Pieredze", match.experienceScore], ["Alga", match.salaryScore], ["Atrašanās", match.locationScore]].map(([label, score]) => (
                          <div key={label as string}>
                            <div className="text-xs text-muted-foreground mb-1">{label as string}</div>
                            <Progress value={score as number} className="h-1.5" />
                            <div className="text-xs text-right mt-0.5 font-medium">{score as number}%</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {match.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.city}</span>}
                        {(match.salaryMin || match.salaryMax) && <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{match.salaryMin ?? "?"}–{match.salaryMax ?? "?"} EUR</span>}
                        {match.experienceYears != null && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{match.experienceYears} gadi</span>}
                        {isEmployer && (match.skills ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 w-full">
                            {(match.skills ?? []).slice(0, 5).map((s: string) => <Badge key={s} variant="secondary" className="text-xs py-0">{s}</Badge>)}
                            {(match.skills ?? []).length > 5 && <Badge variant="outline" className="text-xs py-0">+{(match.skills ?? []).length - 5}</Badge>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!isEmployer && match.status === "notified" && (
                        <Button asChild size="sm" className="bg-primary text-primary-foreground">
                          <Link href={"/intervija/" + (match.matchId ?? match.id)}><MessageSquare className="w-3 h-3 mr-1" />Intervija</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchQuery || statusFilter !== "all" || minScore > 0 ? "Nav atbilstošu rezultātu" : "Nav atbilstību vēl"}</h3>
            <p className="text-muted-foreground">{searchQuery || statusFilter !== "all" || minScore > 0 ? "Mēģiniet mainīt filtrus" : isEmployer ? "Pagaidiet, AI meklē kandidātus" : "Aizpildi profilu un nospied 'Atjaunot atbilstības'"}</p>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
