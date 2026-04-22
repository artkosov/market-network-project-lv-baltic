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
import { useTranslation } from "react-i18next";

export default function CandidateProfile() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

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
    if (file.size > 10 * 1024 * 1024) { toast.error(t("candidateProfile.fileTooLarge", { defaultValue: "Fails ir parāk liels (max 10MB)" })); return; }
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
      toast.success(t("candidateProfile.cvUploaded", { defaultValue: "CV augšupielādēts! Parsē ar AI..." }));
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
        toast.success(t("candidateProfile.cvParsed", { defaultValue: "AI veiksmīgi parsēja CV!" }));
      }
      refetch();
    } catch (err) { toast.error(t("candidateProfile.uploadError", { defaultValue: "Kļūda augšupielādējot" })); } finally { setUploading(false); setParsing(false); }
  };

  const handleSave = async () => {
    if (!form.gdprConsent) { toast.error(t("candidateProfile.gdprRequired", { defaultValue: "Lūdzu piekrīti GDPR noteikumiem" })); return; }
    setSaving(true);
    try {
      await upsert.mutateAsync(form as any);
      toast.success(t("candidateProfile.saved", { defaultValue: "Profils saglabāts!" }));
      refetch();
      navigate("/kandidats");
    } catch { toast.error(t("candidateProfile.saveError", { defaultValue: "Kļūda saglabājot" })); } finally { setSaving(false); }
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
          <h1 className="text-3xl font-bold mb-2">{t("candidateProfile.title")}</h1>
          <p className="text-muted-foreground">{t("candidateProfile.subtitle")}</p>
        </div>
        <div className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Upload className="w-4 h-4 text-primary" />{t("candidateProfile.cv")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{t("candidateProfile.cvDesc", { defaultValue: "Augšupielādē savu CV (PDF vai DOCX) un AI automātiski aizpildīs profila laukus" })}</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileUpload} />
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading || parsing}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading
                    ? t("candidateProfile.uploading", { defaultValue: "Augšupielādē..." })
                    : parsing
                    ? t("candidateProfile.parsing", { defaultValue: "AI parsē..." })
                    : t("candidateProfile.chooseFile", { defaultValue: "Izvēlēties failu" })}
                </Button>
                {cvUploaded && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{t("candidateProfile.cvUploadedLabel", { defaultValue: "CV augšupielādēts" })}</span>}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" />{t("candidateProfile.personalInfo")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("candidateProfile.name")} *</Label><Input className="mt-1 bg-input/50" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Jānis Bērziņš" /></div>
                <div><Label>{t("candidateProfile.phone")}</Label><Input className="mt-1 bg-input/50" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+371 2X XXX XXX" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("candidateProfile.city")}</Label><Input className="mt-1 bg-input/50" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Rīga" /></div>
                <div><Label>{t("candidateProfile.headline")}</Label><Input className="mt-1 bg-input/50" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder={t("candidateProfile.headlinePlaceholder", { defaultValue: "Programmatūras izstrādātājs" })} /></div>
              </div>
              <div><Label>{t("candidateProfile.about")}</Label><Textarea className="mt-1 bg-input/50 resize-none" rows={3} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder={t("candidateProfile.aboutPlaceholder", { defaultValue: "Īss apraksts par sevi un pieredzi..." })} /></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">{t("candidateProfile.jobPreferences")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{t("candidateProfile.minSalary")}</Label><Input type="number" className="mt-1 bg-input/50" value={form.salaryMin || ""} onChange={e => setForm(f => ({ ...f, salaryMin: Number(e.target.value) }))} /></div>
                <div><Label>{t("candidateProfile.maxSalary")}</Label><Input type="number" className="mt-1 bg-input/50" value={form.salaryMax || ""} onChange={e => setForm(f => ({ ...f, salaryMax: Number(e.target.value) }))} /></div>
                <div><Label>{t("candidateProfile.experience")}</Label><Input type="number" className="mt-1 bg-input/50" value={form.experienceYears || ""} onChange={e => setForm(f => ({ ...f, experienceYears: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("candidateProfile.remote")}</Label>
                  <Select value={form.remotePreference} onValueChange={v => setForm(f => ({ ...f, remotePreference: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">{t("candidateProfile.onsite")}</SelectItem>
                      <SelectItem value="hybrid">{t("candidateProfile.hybrid")}</SelectItem>
                      <SelectItem value="remote">{t("candidateProfile.remoteOnly")}</SelectItem>
                      <SelectItem value="any">{t("candidateProfile.anyRemote")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t("candidateProfile.education")}</Label>
                  <Select value={form.educationLevel} onValueChange={v => setForm(f => ({ ...f, educationLevel: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("candidateProfile.eduNone")}</SelectItem>
                      <SelectItem value="secondary">{t("candidateProfile.eduSecondary")}</SelectItem>
                      <SelectItem value="vocational">{t("candidateProfile.eduVocational")}</SelectItem>
                      <SelectItem value="bachelor">{t("candidateProfile.eduBachelor")}</SelectItem>
                      <SelectItem value="master">{t("candidateProfile.eduMaster")}</SelectItem>
                      <SelectItem value="phd">{t("candidateProfile.eduPhd")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="w-4 h-4" />{t("candidateProfile.skillsAndLanguages")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("candidateProfile.skills")}</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {form.skills.map(s => <Badge key={s} variant="secondary" className="gap-1 pr-1">{s}<button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}><X className="w-3 h-3" /></button></Badge>)}
                </div>
                <div className="flex gap-2">
                  <Input className="bg-input/50" placeholder={t("candidateProfile.addSkill", { defaultValue: "Pievienot prasmi..." })} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} />
                  <Button variant="outline" size="sm" onClick={addSkill}>+</Button>
                </div>
              </div>
              <div>
                <Label>{t("candidateProfile.languages")}</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {form.languages.map(l => <Badge key={l} variant="outline" className="gap-1 pr-1">{l}<button onClick={() => setForm(f => ({ ...f, languages: f.languages.filter(x => x !== l) }))}><X className="w-3 h-3" /></button></Badge>)}
                </div>
                <div className="flex gap-2">
                  <Input className="bg-input/50" placeholder={t("candidateProfile.addLanguage", { defaultValue: "Latviešu, Angļu..." })} value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addLang()} />
                  <Button variant="outline" size="sm" onClick={addLang}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield className="w-4 h-4 text-primary" />{t("candidateProfile.privacyGdpr")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                <div>
                  <p className="font-medium text-sm">{t("candidateProfile.anonymousProfile")}</p>
                  <p className="text-xs text-muted-foreground">{t("candidateProfile.anonymousProfileDesc", { defaultValue: "Darba devēji redz tikai prasmes un pieredzi, ne tavu vārdu" })}</p>
                </div>
                <Switch checked={form.isAnonymous} onCheckedChange={v => setForm(f => ({ ...f, isAnonymous: v }))} />
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <input type="checkbox" id="gdpr" className="mt-1" checked={form.gdprConsent} onChange={e => setForm(f => ({ ...f, gdprConsent: e.target.checked }))} />
                <label htmlFor="gdpr" className="text-sm cursor-pointer">
                  {t("candidateProfile.gdprText1", { defaultValue: "Es piekrītu" })} <span className="text-primary underline">{t("footer.privacyPolicy")}</span> {t("candidateProfile.gdprText2", { defaultValue: "un" })} <span className="text-primary underline">{t("footer.termsOfService")}</span>. {t("candidateProfile.gdprText3", { defaultValue: "Saprotu, ka mani dati tiks apstrādāti saskaņā ar GDPR." })}
                </label>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold">
            {saving
              ? t("candidateProfile.saving", { defaultValue: "Saglabā..." })
              : t("candidateProfile.saveProfile")}
          </Button>
        </div>
      </div>
    </NavLayout>
  );
}
