import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, BriefcaseIcon, MapPin, Euro, Users, Search, Trash2, Pause, Play, CheckCircle2, Clock, Zap, BarChart2 } from "lucide-react";
import { toast } from "sonner";

export default function JobPostings() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { data: jobs, refetch } = trpc.employer.getJobs.useQuery(undefined, { enabled: isAuthenticated });
  const updateStatus = trpc.employer.updateJobStatus.useMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleToggle = async (jobId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updateStatus.mutateAsync({ jobId, status: newStatus as any });
    toast.success(newStatus === "active"
      ? t("jobPostings.activated", { defaultValue: "Vakance aktivizēta" })
      : t("jobPostings.paused", { defaultValue: "Vakance pauzēta" }));
    refetch();
  };

  const handleClose = async (jobId: number) => {
    await updateStatus.mutateAsync({ jobId, status: "closed" });
    toast.success(t("jobPostings.closed", { defaultValue: "Vakance slēgta" }));
    setDeleteConfirmId(null);
    refetch();
  };

  const statusLabels: Record<string, string> = {
    active: t("jobPostings.statusActive", { defaultValue: "Aktīva" }),
    paused: t("jobPostings.statusPaused", { defaultValue: "Pauzēta" }),
    closed: t("jobPostings.statusClosed", { defaultValue: "Slēgta" }),
    draft: t("jobPostings.statusDraft", { defaultValue: "Melnraksts" }),
  };
  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    closed: "bg-red-500/10 text-red-400 border-red-500/20",
    draft: "bg-muted/50 text-muted-foreground border-border",
  };

  const allJobs = jobs ?? [];
  const filteredJobs = allJobs.filter((j: any) => {
    const matchesSearch = !searchQuery || j.title.toLowerCase().includes(searchQuery.toLowerCase()) || (j.city ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = allJobs.filter((j: any) => j.status === "active").length;
  const pausedCount = allJobs.filter((j: any) => j.status === "paused").length;
  const closedCount = allJobs.filter((j: any) => j.status === "closed").length;

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("jobPostings.title")}</h1>
            <p className="text-muted-foreground">{t("jobPostings.subtitle", { defaultValue: "Pārvaldi savas darba sludinājumus" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/darbadevetajs/analytics">
                <BarChart2 className="w-3.5 h-3.5 mr-1.5" />{t("nav.analytics")}
              </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/darbadevetajs/vakances/jauna">
                <Plus className="w-4 h-4 mr-2" />{t("employerDashboard.newVacancy")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: t("jobPostings.statusActive", { defaultValue: "Aktīvas" }), value: activeCount, color: "text-green-400", icon: <CheckCircle2 className="w-4 h-4" /> },
            { label: t("jobPostings.statusPaused", { defaultValue: "Pauzētas" }), value: pausedCount, color: "text-yellow-400", icon: <Pause className="w-4 h-4" /> },
            { label: t("jobPostings.statusClosed", { defaultValue: "Slēgtas" }), value: closedCount, color: "text-red-400", icon: <Clock className="w-4 h-4" /> },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                <div><div className="text-xl font-bold">{stat.value}</div><div className="text-xs text-muted-foreground">{stat.label}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-input/50"
              placeholder={t("jobPostings.searchPlaceholder", { defaultValue: "Meklēt vakances..." })}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "paused", "closed"].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? "bg-primary text-primary-foreground" : ""}
              >
                {status === "all" ? t("jobPostings.allStatuses", { defaultValue: "Visas" }) : statusLabels[status]}
              </Button>
            ))}
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="glass-card hover:border-border/80 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold truncate">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[job.status] ?? "bg-muted text-muted-foreground"}`}>
                          {statusLabels[job.status] ?? job.status}
                        </span>
                        {job.source === "scraped" && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-2.5 h-2.5 mr-1" />{t("employerDashboard.imported")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap mb-2">
                        {job.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}</span>}
                        {(job.salaryMin || job.salaryMax) && <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{job.salaryMin ?? "?"}–{job.salaryMax ?? "?"} EUR</span>}
                        <span>
                          {job.jobType === "full_time"
                            ? t("employerDashboard.fullTime")
                            : job.jobType === "part_time"
                              ? t("employerDashboard.partTime")
                              : job.jobType}
                        </span>
                        {job.requiredExperienceYears > 0 && <span>{job.requiredExperienceYears}+ {t("matches.years", { defaultValue: "gadi" })}</span>}
                      </div>
                      {(job.requiredSkills ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(job.requiredSkills ?? []).slice(0, 4).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs py-0">{skill}</Badge>
                          ))}
                          {(job.requiredSkills ?? []).length > 4 && (
                            <Badge variant="outline" className="text-xs py-0">+{(job.requiredSkills ?? []).length - 4}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                        <Link href={`/darbadevetajs/atbilstibas/${job.id}`}>
                          <Users className="w-3 h-3 mr-1" />{t("employerDashboard.candidates")}
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleToggle(job.id, job.status)}
                        disabled={updateStatus.isPending || job.status === "closed"}
                      >
                        {job.status === "active"
                          ? <><Pause className="w-3 h-3 mr-1" />{t("jobPostings.pause", { defaultValue: "Pauzēt" })}</>
                          : job.status === "paused"
                            ? <><Play className="w-3 h-3 mr-1" />{t("jobPostings.activate", { defaultValue: "Aktivizēt" })}</>
                            : t("jobPostings.statusClosed", { defaultValue: "Slēgta" })}
                      </Button>
                      {job.status !== "closed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => setDeleteConfirmId(job.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />{t("jobPostings.close", { defaultValue: "Slēgt" })}
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
            <BriefcaseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || statusFilter !== "all"
                ? t("jobPostings.noMatchingJobs", { defaultValue: "Nav atbilstošu vacanču" })
                : t("jobPostings.noJobs")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? t("jobPostings.tryChangingSearch", { defaultValue: "Mēģiniet mainīt meklēšanas kritērijus" })
                : t("jobPostings.noJobsDesc")}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/darbadevetajs/vakances/jauna">
                  {t("employerDashboard.addVacancy")}
                </Link>
              </Button>
            )}
          </div>
        )}

        <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("jobPostings.closeJobTitle", { defaultValue: "Slēgt vakanci?" })}</DialogTitle>
              <DialogDescription>
                {t("jobPostings.closeJobDesc", { defaultValue: "Vakance tiks slēgta un vairs nebūs redzama kandidātiem. Šo darbību nevar atcelt." })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t("common.cancel")}</Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleClose(deleteConfirmId)}
                disabled={updateStatus.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />{t("jobPostings.closeJobBtn", { defaultValue: "Slēgt vakanci" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NavLayout>
  );
}
