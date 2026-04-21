import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { User, Upload, Sparkles, X, Shield, CheckCircle } from "lucide-react";

export default function CandidateProfile() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, refetch } = trpc.candidate.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const upsert = trpc.candidate.upsertProfile.useMutation();
  const uploadCv = trpc.candidate.uploadCv.useMutation();
  const parseCvWithAi = trpc.candidate.parseCvWithAi.useMutation();

  const [form, setForm] = useState({
    fullName: "", phone: "", city: "", headline: "",
    salaryMin: 0, salaryMax: 0, experienceYears: 0,
    educationLevel: "none", skills: [] as string[],
    languages: [] as string[], remotePreference: "onsite" as string,
    gdprConsent: false, isAnonymous: true,
    summary: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        headline: profile.headline ?? "",
        salaryMin: profile.salaryMin ?? 0,
        salaryMax: profile.salaryMax ?? 0,
        experienceYears: profile.experienceYears ?? 0,
        educationLevel: profile.educationLevel ?? "none",
        skills: (profile.skills as string[]) ?? [],
        languages: (profile.languages as string[]) ?? [],
        remotePreference: profile.remotePreference ?? "onsite",
        gdprConsent: profile.gdprConsent ?? false,
        isAnonymous: profile.isAnonymous ?? true,
        summary: profile.summary ?? "",
      });
      if (profile.cvFileUrl) setCvUploaded(true);
    }
  }, [profile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Fails ir parāk liels (max 10MB)"); return; }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await uploadCv.mutateAsync({ fileName: file.name, fileBase64: base64, mimeType: file.type });
      setCvUploaded(true);
      toast.success("CV augšupielādēts! Parsē ar AI...");
      setParsing(true);
      const parseResult = await parseCvWithAi.mutateAsync({ cvText: `CV file: ${file.name}` });
      if (parseResult.parsed) {
        const p = parseResult.parsed as any;
        setForm(f => ({
          ...f,
          fullName: p.fullName || f.fullName,
          city: p.city || f.city,
          headline: p.headline || f.headline,
          salaryMin: p.salaryMin || f.salaryMin,
          salaryMax: p.salaryMax || f.salaryMax,
          experienceYears: p.experienceYears || f.experienceYears,
          educationLevel: p.educationLevel || f.educationLevel,
          skills: p.skills?.length ? p.skills : f.skills,
          languages: p.languages?.length ? p.languages : f.languages,
          summary: p.summary || f.summary,
          remotePreference: p.remotePreference || f.remotePreference,
        }));
        toast.success("AI veiksmigi parseja CV!");
      }
      refetch();
    } catch (err) { toast.error("Kludda augšupielādejot"); } finally { setUploading(false); setParsing(false); }
  };

  const handleSave = async () => {
    if (!form.gdprConsent) { toast.error("Ludzu piekrīti GDPR noteikumiem"); return; }
    setSaving(true);
    try {
      await upsert.mutateAsync(form as any);
      toast.success("Profils saglabats!");
      refetch();
      navigate("/kandidats");
    } catch { toast.error("Kludda saglabajot"); } finally { setSaving(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
    }
    setSkillInput("");
  };

  const addLang = () => {
    if (langInput.trim() && !form.languages.includes(langInput.trim())) {
      setForm(f => ({ ...f, languages: [...f.languages, langInput.trim()] }));
    }
    setLangInput("");
  };

  return (
    <NavLayout userType="candidate">
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mans profils</h1>
          <p className="text-muted-foreground">Aizpildi savu profilu, lai AI varetu atrast labakās vakances</p>
        </div>
        <div className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Upload className="w-4 h-4 text-primary" />CV Augšupielāde</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Augšupielādē savu CV (PDF vai DOCX) un AI automātiski aizpildīs profila laukus</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileUpload} />
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading || parsing}>
                  <Upload className="w-4 h-4 mr-2" />{uploading ? "Augšupielādē..." : parsing ? "AI parsē..." : "Izvēlēties failu"}
                </Button>
                {cvUploaded && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />CV augšupielādēts</span>}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" />Personiskā informācija</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Vārds Uzvārds *</Label><Input className="mt-1 bg-input/50" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Jānis Bērziņš" /></div>
                <div><Label>Tālrunis</Label><Input className="mt-1 bg-input/50" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+371 2X XXX XXX" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pilsēta</Label><Input className="mt-1 bg-input/50" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Rīga" /></div>
                <div><Label>Profesionālais nosaukums</Label><Input className="mt-1 bg-input/50" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="Programmatūras izstrādātājs" /></div>
              </div>
              <div><Label>Par sevi</Label><Textarea className="mt-1 bg-input/50 resize-none" rows={3} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Īss apraksts par sevi un pieredzi..." /></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Darba vēlmes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Min. alga (EUR)</Label><Input type="number" className="mt-1 bg-input/50" value={form.salaryMin || ""} onChange={e => setForm(f => ({ ...f, salaryMin: Number(e.target.value) }))} /></div>
                <div><Label>Max. alga (EUR)</Label><Input type="number" className="mt-1 bg-input/50" value={form.salaryMax || ""} onChange={e => setForm(f => ({ ...f, salaryMax: Number(e.target.value) }))} /></div>
                <div><Label>Pieredze (gadi)</Label><Input type="number" className="mt-1 bg-input/50" value={form.experienceYears || ""} onChange={e => setForm(f => ({ ...f, experienceYears: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Attālinātais darbs</Label>
                  <Select value={form.remotePreference} onValueChange={v => setForm(f => ({ ...f, remotePreference: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Klātienē</SelectItem>
                      <SelectItem value="hybrid">Hibrīds</SelectItem>
                      <SelectItem value="remote">Attālināts</SelectItem>
                      <SelectItem value="any">Jebkurš</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Izglītība</Label>
                  <Select value={form.educationLevel} onValueChange={v => setForm(f => ({ ...f, educationLevel: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nav</SelectItem>
                      <SelectItem value="secondary">Vidējā</SelectItem>
                      <SelectItem value="vocational">Profesionālā</SelectItem>
                      <SelectItem value="bachelor">Bakalaurs</SelectItem>
                      <SelectItem value="master">Maģistrs</SelectItem>
                      <SelectItem value="phd">Doktors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="w-4 h-4" />Prasmes un valodas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Prasmes</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {form.skills.map(s => <Badge key={s} variant="secondary" className="gap-1 pr-1">{s}<button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}><X className="w-3 h-3" /></button></Badge>)}
                </div>
                <div className="flex gap-2">
                  <Input className="bg-input/50" placeholder="Pievienot prasmi..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} />
                  <Button variant="outline" size="sm" onClick={addSkill}>+</Button>
                </div>
              </div>
              <div>
                <Label>Valodas</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {form.languages.map(l => <Badge key={l} variant="outline" className="gap-1 pr-1">{l}<button onClick={() => setForm(f => ({ ...f, languages: f.languages.filter(x => x !== l) }))}><X className="w-3 h-3" /></button></Badge>)}
                </div>
                <div className="flex gap-2">
                  <Input className="bg-input/50" placeholder="Latviešu, Angļu..." value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addLang()} />
                  <Button variant="outline" size="sm" onClick={addLang}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield className="w-4 h-4 text-primary" />Privātums un GDPR</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                <div>
                  <p className="font-medium text-sm">Anonīmais profils</p>
                  <p className="text-xs text-muted-foreground">Darba devēji redz tikai prasmes un pieredzi, ne tavu vārdu</p>
                </div>
                <Switch checked={form.isAnonymous} onCheckedChange={v => setForm(f => ({ ...f, isAnonymous: v }))} />
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <input type="checkbox" id="gdpr" className="mt-1" checked={form.gdprConsent} onChange={e => setForm(f => ({ ...f, gdprConsent: e.target.checked }))} />
                <label htmlFor="gdpr" className="text-sm cursor-pointer">
                  Es piekrītu <span className="text-primary underline">Privātuma politikai</span> un <span className="text-primary underline">Lietošanas noteikumiem</span>. Saprotu, ka mani dati tiks apstrādāti saskaņā ar GDPR.
                </label>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold">
            {saving ? "Saglabā..." : "Saglabāt profilu"}
          </Button>
        </div>
      </div>
    </NavLayout>
  );
}
