import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, Link } from "wouter";
import { Sparkles, Eye, EyeOff, MessageSquare, MapPin, Euro, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function Matches() {
  const { isAuthenticated } = useAuth();
  const params = useParams<{ jobId?: string }>();
  const jobId = params.jobId ? parseInt(params.jobId) : undefined;
  const isEmployer = !!jobId;

  const { data: candidateMatches, refetch: refetchCandidate } = trpc.candidate.getMatches.useQuery(undefined, { enabled: isAuthenticated && !isEmployer });
  const { data: jobMatches, refetch: refetchEmployer } = trpc.employer.getJobMatches.useQuery({ jobId: jobId! }, { enabled: isAuthenticated && !!isEmployer });
  const markRead = trpc.candidate.markNotificationRead.useMutation();
  const runMatching = trpc.matchmaker.runForCandidate.useMutation();

  const matches = isEmployer ? (jobMatches ?? []) : (candidateMatches ?? []);

  const scoreColor = (score: number) => score >= 90 ? "text-green-400" : score >= 70 ? "text-primary" : score >= 50 ? "text-yellow-400" : "text-muted-foreground";
  const statusMap: Record<string, string> = { pending: "Jauns", notified: "Pazinotss", interviewing: "Intervija", unlocked: "Atklats", rejected: "Noraidits" };

  return (
    <NavLayout userType={isEmployer ? "employer" : "candidate"}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{isEmployer ? "Kandidatu atbilstibas" : "Manas atbilstibas"}</h1>
            <p className="text-muted-foreground">{matches.length} atbilstibas atrasta</p>
          </div>
          {!isEmployer && (
            <Button onClick={() => runMatching.mutate()} disabled={runMatching.isPending} className="bg-primary text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />{runMatching.isPending ? "Mekle..." : "Atjaunot"}
            </Button>
          )}
        </div>
        {matches.length > 0 ? (
          <div className="space-y-4">
            {(matches as any[]).map((match: any) => (
              <Card key={match.matchId ?? match.id} className="glass-card hover:border-border/80 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className={`text-xl font-black ${scoreColor(match.score)}`}>{match.score}%</span>
                      <span className="text-xs text-muted-foreground">atbilstiba</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{isEmployer ? (match.isUnlocked ? match.fullName : "Anonims kandidats") : (match.jobTitle ?? "Vakance")}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{statusMap[match.status] ?? match.status}</span>
                        {match.isUnlocked && <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">Atklats</Badge>}
                        {!match.isUnlocked && isEmployer && <Badge variant="outline" className="text-xs"><EyeOff className="w-3 h-3 mr-1" />Anonims</Badge>}
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        {[["Prasmes", match.skillsScore], ["Pieredze", match.experienceScore], ["Alga", match.salaryScore], ["Atrašanās vieta", match.locationScore]].map(([label, score]) => (
                          <div key={label as string}>
                            <div className="text-xs text-muted-foreground mb-1">{label as string}</div>
                            <Progress value={score as number} className="h-1.5" />
                            <div className="text-xs text-right mt-0.5">{score as number}%</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {match.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.city}</span>}
                        {(match.salaryMin || match.salaryMax) && <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{match.salaryMin}–{match.salaryMax} EUR</span>}
                        {match.experienceYears != null && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{match.experienceYears} gadi</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
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
            <h3 className="text-lg font-semibold mb-2">Nav atbilstibu vel</h3>
            <p className="text-muted-foreground">{isEmployer ? "Pagaidiet, AI mekle kandidatus" : "Aizpildi profilu un nospied Meklet atbilstibas"}</p>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
