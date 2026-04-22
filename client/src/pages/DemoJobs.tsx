import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BriefcaseIcon, Search, MapPin, Euro, ExternalLink,
  Building2, Wifi, Laptop, Filter, ArrowLeft,
} from "lucide-react";
import scrapedJobs from "@/data/scrapedJobs";

const REMOTE_LABELS: Record<string, string> = {
  onsite: "Klātienē",
  hybrid: "Hibrīds",
  remote: "Attālināti",
};

const REMOTE_COLORS: Record<string, string> = {
  onsite: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  hybrid: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  remote: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const CATEGORIES = ["Visas", ...Array.from(new Set(scrapedJobs.map((j) => j.category)))];

export default function DemoJobs() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Visas");
  const [selectedRemote, setSelectedRemote] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return scrapedJobs.filter((job) => {
      const matchSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "Visas" || job.category === selectedCategory;
      const matchRemote = !selectedRemote || job.remotePolicy === selectedRemote;
      return matchSearch && matchCat && matchRemote;
    });
  }, [search, selectedCategory, selectedRemote]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BriefcaseIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-gold-gradient">Market</span>
              <span className="text-foreground"> Network</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />Atpakaļ</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/30 py-10">
        <div className="container max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 px-4 py-1.5">
            <Search className="w-3 h-3 mr-2" />
            Reāli sludinājumi no ss.lv
          </Badge>
          <h1 className="text-3xl font-bold mb-2">
            Darba vakances <span className="text-gold-gradient">Latvijā</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            {scrapedJobs.length} reāli sludinājumi no ss.lv — atjaunināti {new Date().toLocaleDateString("lv-LV")}
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Meklēt pēc amata, prasmes vai uzņēmuma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base bg-background border-border/60"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
            <Filter className="w-4 h-4" />Filtri:
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {["onsite", "hybrid", "remote"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRemote(selectedRemote === r ? null : r)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedRemote === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50 text-muted-foreground"
                }`}
              >
                {r === "onsite" ? <Building2 className="w-3 h-3" /> : r === "hybrid" ? <Laptop className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                {REMOTE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Atrasti <span className="font-semibold text-foreground">{filtered.length}</span> sludinājumi
        </p>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nav atrasts neviens sludinājums ar šādiem filtriem.</p>
            </div>
          ) : (
            filtered.map((job, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setExpandedJob(expandedJob === idx ? null : idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BriefcaseIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight mb-1">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Euro className="w-3.5 h-3.5" />
                            {job.salaryMin}{job.salaryMax && job.salaryMax !== job.salaryMin ? `–${job.salaryMax}` : "+"} €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${REMOTE_COLORS[job.remotePolicy]}`}>
                      {REMOTE_LABELS[job.remotePolicy]}
                    </span>
                    <Badge variant="outline" className="text-xs">{job.category}</Badge>
                  </div>
                </div>

                {job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pl-13">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {expandedJob === idx && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />Skatīt ss.lv
                      </a>
                      <span className="text-xs text-muted-foreground">Avots: {job.sourcePlatform}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/30 text-sm text-muted-foreground text-center">
          <p>
            Šie ir reāli darba sludinājumi, kas skreipoti no{" "}
            <a href="https://www.ss.lv" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ss.lv</a>{" "}
            demonstrācijas nolūkos. Market Network platformā šie sludinājumi tiktu automātiski saskaņoti ar kandidātu profiliem.
          </p>
        </div>
      </div>
    </div>
  );
}
