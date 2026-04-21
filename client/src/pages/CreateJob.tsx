import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Sparkles, X } from "lucide-react";

export default function CreateJob() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const createJob = trpc.employer.createJob.useMutation();
  const parseDesc = trpc.employer.parseJobDescription.useMutation();
  const runForJob = trpc.matchmaker.runForJob.useMutation();
  const [form, setForm] = useState({ title: "", description: "", city: "", jobType: "full_time", remotePolicy: "onsite", salaryMin: 0, salaryMax: 0, requiredSkills: [] as string[], preferredSkills: [] as string[], requiredExperienceYears: 0, requiredEducation: "none", requiredLanguages: [] as string[] });
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleParse = async () => {
    setParsing(true);
    try {
      const result = await parseDesc.mutateAsync({ description: form.description });
      setForm(f => ({ ...f, title: result.title || f.title, city: result.city || f.city, jobType: result.jobType || f.jobType, remotePolicy: result.remotePolicy || f.remotePolicy, salaryMin: result.salaryMin || f.salaryMin, salaryMax: result.salaryMax || f.salaryMax, requiredSkills: result.requiredSkills?.length ? result.requiredSkills : f.requiredSkills, preferredSkills: result.preferredSkills?.length ? result.preferredSkills : f.preferredSkills, requiredExperienceYears: result.requiredExperienceYears || f.requiredExperienceYears, requiredEducation: result.requiredEducation || f.requiredEducation, requiredLanguages: result.requiredLanguages?.length ? result.requiredLanguages : f.requiredLanguages }));
    } catch { toast.error("Kludda parsejot"); } finally { setParsing(false); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const result = await createJob.mutateAsync(form as any);
      if (result.jobId) await runForJob.mutateAsync({ jobId: result.jobId });
      navigate("/darbadevetajs/vakances");
    } catch { toast.error("Kludda veidojot vakanci"); } finally { setSaving(false); }
  };

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-3xl">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Jauna vakance</h1><p className="text-muted-foreground">Aizpildi vakances informaciju vai lauji AI to parsejot automatiski</p></div>
        <div className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="w-4 h-4 text-primary" />AI Vakances Parsesana</CardTitle></CardHeader>
            <CardContent>
              <Textarea className="bg-input/50 resize-none mb-3" rows={5} placeholder="Ielimi vakances aprakstu seit un AI automatiski aizpildis laukus..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <Button onClick={handleParse} disabled={parsing} variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />{parsing ? "AI parse..." : "Parsejot ar AI"}
              </Button>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Pamatinformacija</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Amata nosaukums *</Label><Input className="mt-1 bg-input/50" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Senior React Izstrādātājs" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pilseta</Label><Input className="mt-1 bg-input/50" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Riga" /></div>
                <div><Label>Darba veids</Label>
                  <Select value={form.jobType} onValueChange={v => setForm(f => ({ ...f, jobType: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Pilna slodze</SelectItem>
                      <SelectItem value="part_time">Nepilna slodze</SelectItem>
                      <SelectItem value="contract">Ligums</SelectItem>
                      <SelectItem value="internship">Prakse</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Attalinat darbs</Label>
                  <Select value={form.remotePolicy} onValueChange={v => setForm(f => ({ ...f, remotePolicy: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Klatiene</SelectItem>
                      <SelectItem value="hybrid">Hibrids</SelectItem>
                      <SelectItem value="remote">Attalinat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Min. alga (EUR)</Label><Input type="number" className="mt-1 bg-input/50" value={form.salaryMin || ""} onChange={e => setForm(f => ({ ...f, salaryMin: Number(e.target.value) }))} placeholder="2000" /></div>
                <div><Label>Max. alga (EUR)</Label><Input type="number" className="mt-1 bg-input/50" value={form.salaryMax || ""} onChange={e => setForm(f => ({ ...f, salaryMax: Number(e.target.value) }))} placeholder="4000" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Prasibas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Obligatas prasmes</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">{form.requiredSkills.map(s => <Badge key={s} variant="secondary" className="gap-1 pr-1">{s}<button onClick={() => setForm(f => ({ ...f, requiredSkills: f.requiredSkills.filter(x => x !== s) }))}><X className="w-3 h-3" /></button></Badge>)}</div>
                <div className="flex gap-2">
                  <Input className="bg-input/50" placeholder="Pievienot prasmi..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, skillInput.trim()] })); setSkillInput(""); }}} />
                  <Button variant="outline" size="sm" onClick={() => { if (skillInput.trim()) { setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, skillInput.trim()] })); setSkillInput(""); }}}>+</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Min. pieredze (gadi)</Label><Input type="number" className="mt-1 bg-input/50" value={form.requiredExperienceYears || ""} onChange={e => setForm(f => ({ ...f, requiredExperienceYears: Number(e.target.value) }))} /></div>
                <div><Label>Izglitiba</Label>
                  <Select value={form.requiredEducation} onValueChange={v => setForm(f => ({ ...f, requiredEducation: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nav</SelectItem>
                      <SelectItem value="secondary">Videja</SelectItem>
                      <SelectItem value="vocational">Profesionala</SelectItem>
                      <SelectItem value="bachelor">Bakalaurs</SelectItem>
                      <SelectItem value="master">Magistrs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Nepieciesamaas valodas</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">{form.requiredLanguages.map(l => <Badge key={l} variant="outline" className="gap-1 pr-1">{l}<button onClick={() => setForm(f => ({ ...f, requiredLanguages: f.requiredLanguages.filter(x => x !== l) }))}><X className="w-3 h-3" /></button></Badge>)}</div>
                <div className="flex gap-2">
                  <Input className="bg-input/50" placeholder="Latviesu, Anglu..." value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && langInput.trim()) { setForm(f => ({ ...f, requiredLanguages: [...f.requiredLanguages, langInput.trim()] })); setLangInput(""); }}} />
                  <Button variant="outline" size="sm" onClick={() => { if (langInput.trim()) { setForm(f => ({ ...f, requiredLanguages: [...f.requiredLanguages, langInput.trim()] })); setLangInput(""); }}}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleCreate} disabled={saving} className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold">{saving ? "Veido..." : "Izveidot vakanci & saket atbilstibu meklesanu"}</Button>
        </div>
      </div>
    </NavLayout>
  );
}
