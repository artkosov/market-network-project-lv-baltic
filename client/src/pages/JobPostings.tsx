import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Plus, BriefcaseIcon, MapPin, Euro, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function JobPostings() {
  const { isAuthenticated } = useAuth();
  const { data: jobs, refetch } = trpc.employer.getJobs.useQuery(undefined, { enabled: isAuthenticated });
  const updateStatus = trpc.employer.updateJobStatus.useMutation();

  const handleToggle = async (jobId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updateStatus.mutateAsync({ jobId, status: newStatus as any });
    toast.success(newStatus === "active" ? "Vakance aktivizēta" : "Vakance pauzēta");
    refetch();
  };

  const statusLabels: Record<string, string> = { active: "Aktīva", paused: "Pauzēta", closed: "Slēgta", draft: "Melnraksts" };
  const statusColors: Record<string, string> = { active: "bg-green-500/10 text-green-400", paused: "bg-yellow-500/10 text-yellow-400", closed: "bg-red-500/10 text-red-400", draft: "bg-muted text-muted-foreground" };

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-3xl font-bold mb-2">Vakances</h1><p className="text-muted-foreground">Pārvaldi savas darba sludinājumus</p></div>
          <Button asChild className="bg-primary text-primary-foreground"><Link href="/darbadevetajs/vakances/jauna"><Plus className="w-4 h-4 mr-2" />Jauna vakance</Link></Button>
        </div>
        {(jobs ?? []).length > 0 ? (
          <div className="space-y-4">
            {(jobs ?? []).map((job: any) => (
              <Card key={job.id} className="glass-card hover:border-border/80 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status] ?? "bg-muted text-muted-foreground"}`}>{statusLabels[job.status] ?? job.status}</span>
                        {job.source === "scraped" && <Badge variant="outline" className="text-xs">Importēts</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {job.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}</span>}
                        {(job.salaryMin || job.salaryMax) && <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{job.salaryMin}–{job.salaryMax} EUR</span>}
                        <span>{job.jobType === "full_time" ? "Pilna slodze" : job.jobType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                        <Link href={`/darbadevetajs/atbilstibas/${job.id}`}><Users className="w-3 h-3 mr-1" />Kandidāti</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleToggle(job.id, job.status)}>
                        {job.status === "active" ? "Pauzēt" : "Aktivizēt"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BriefcaseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nav vacanču vēl</h3>
            <p className="text-muted-foreground mb-6">Pievienojiet savu pirmo vakanci vai importējiet no darba platformām</p>
            <Button asChild className="bg-primary text-primary-foreground"><Link href="/darbadevetajs/vakances/jauna">Pievienot vakanci</Link></Button>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
