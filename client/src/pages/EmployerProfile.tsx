import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Building2, Globe, MapPin, Briefcase, CheckCircle2, Upload, Link2, Hash, ArrowRight, Shield } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function EmployerProfile() {
  const { isAuthenticated } = useAuth();
  const { data: profile, refetch } = trpc.employer.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const upsert = trpc.employer.upsertProfile.useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const INDUSTRY_OPTIONS = t("employerProfile.industries", {
    returnObjects: true,
    defaultValue: [
      "Informācijas tehnoloģijas",
      "Finanses un banku darbība",
      "Loģistika un transports",
      "Ražošana",
      "Tirdzniecība un mazumtirdzniecība",
      "Veselības aprūpe",
      "Izglītība",
      "Celtniecība un nekustamais īpašums",
      "Mārketings un reklāma",
      "Juridiskās pakalpojumi",
      "Viesmīlība un tūrisms",
      "Lauksaimniecība",
      "Enerģētika",
      "Cits",
    ]
  }) as string[];

  const [form, setForm] = useState({
    companyName: "",
    companySize: "1-10" as string,
    industry: "",
    website: "",
    description: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName ?? "",
        companySize: profile.companySize ?? "1-10",
        industry: profile.industry ?? "",
        website: profile.website ?? "",
        description: profile.description ?? "",
        city: profile.city ?? "",
      });
      if (profile.logoUrl) setLogoPreview(profile.logoUrl);
    }
  }, [profile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(t("employerProfile.logoImageRequired", { defaultValue: "Lūdzu augšupielādējiet attēlu" })); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error(t("employerProfile.logoTooLarge", { defaultValue: "Logo nedrīkst pārsniegt 2 MB" })); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    toast.success(t("employerProfile.logoPreviewAdded", { defaultValue: "Logo pievienots priekšskatam" }));
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) { toast.error(t("employerProfile.companyNameRequired", { defaultValue: "Uzņēmuma nosaukums ir obligāts" })); return; }
    setSaving(true);
    try {
      await upsert.mutateAsync({
        companyName: form.companyName,
        companySize: form.companySize as any,
        industry: form.industry || undefined,
        website: form.website || undefined,
        description: form.description || undefined,
        city: form.city || undefined,
      });
      toast.success(t("employerProfile.saved", { defaultValue: "Profils saglabāts!" }));
      refetch();
    } catch { toast.error(t("employerProfile.saveError", { defaultValue: "Kļūda saglabājot profilu" })); }
    finally { setSaving(false); }
  };

  const completionItems = [
    { label: t("employerProfile.completionName", { defaultValue: "Nosaukums" }), done: !!form.companyName },
    { label: t("employerProfile.completionIndustry", { defaultValue: "Nozare" }), done: !!form.industry },
    { label: t("employerProfile.completionCity", { defaultValue: "Pilsēta" }), done: !!form.city },
    { label: t("employerProfile.completionWebsite", { defaultValue: "Mājaslapa" }), done: !!form.website },
    { label: t("employerProfile.completionDesc", { defaultValue: "Apraksts" }), done: !!form.description },
    { label: t("employerProfile.completionLogo", { defaultValue: "Logo" }), done: !!logoPreview },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-3xl">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("employerProfile.title")}</h1>
            <p className="text-muted-foreground">{t("employerProfile.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("employerProfile.completion", { defaultValue: "Pilnīgums" })}</p>
              <p className="text-lg font-bold text-primary">{completionPct}%</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/darbadevetajs"><ArrowRight className="w-3 h-3 mr-1 rotate-180" />{t("employerProfile.toDashboard", { defaultValue: "Uz paneli" })}</Link>
            </Button>
          </div>
        </div>

        {/* Completion bar */}
        <div className="mb-6 p-4 rounded-xl bg-accent/30 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{t("employerProfile.profileCompletion", { defaultValue: "Profila aizpildīšana" })}</p>
            <span className="text-xs text-primary font-semibold">{completionPct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div className="bg-primary rounded-full h-2 transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {completionItems.map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                  {item.done && <CheckCircle2 className="w-2 h-2" />}
                </div>
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo & Company Name */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="w-4 h-4 text-primary" />{t("employerProfile.companyIdentity", { defaultValue: "Uzņēmuma identitāte" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Logo</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t("employerProfile.companyLogo", { defaultValue: "Uzņēmuma logo" })}</p>
                  <p className="text-xs text-muted-foreground mb-2">{t("employerProfile.logoFormats", { defaultValue: "JPG, PNG, WebP vai SVG. Maks. 2 MB." })}</p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">
                    <Upload className="w-3 h-3 mr-1.5" />{logoPreview ? t("employerProfile.changeLogo", { defaultValue: "Mainīt logo" }) : t("employerProfile.uploadLogo", { defaultValue: "Augšupielādēt logo" })}
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label>{t("employerProfile.companyName")} *</Label>
                <Input className="mt-1 bg-input/50" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="SIA Mans Uzņēmums" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("employerProfile.regNumber", { defaultValue: "Reģistrācijas numurs" })}</Label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="bg-input/50 pl-8" placeholder="40001234567" />
                  </div>
                </div>
                <div>
                  <Label>{t("employerProfile.companySize", { defaultValue: "Uzņēmuma lielums" })}</Label>
                  <Select value={form.companySize} onValueChange={v => setForm(f => ({ ...f, companySize: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1-10","11-50","51-200","201-500","500+"].map(s => <SelectItem key={s} value={s}>{s} {t("employerProfile.employees", { defaultValue: "darbinieki" })}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="w-4 h-4 text-primary" />{t("employerProfile.companyInfo", { defaultValue: "Uzņēmuma informācija" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("employerProfile.industry", { defaultValue: "Nozare" })}</Label>
                  <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                    <SelectTrigger className="mt-1 bg-input/50"><SelectValue placeholder={t("employerProfile.selectIndustry", { defaultValue: "Izvēlieties nozari..." })} /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("candidateProfile.city")}</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="bg-input/50 pl-8" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Rīga" />
                  </div>
                </div>
              </div>
              <div>
                <Label>{t("employerProfile.website", { defaultValue: "Mājaslapa" })}</Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input className="bg-input/50 pl-8" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://uznemums.lv" />
                </div>
              </div>
              <div>
                <Label>{t("employerProfile.description", { defaultValue: "Uzņēmuma apraksts" })}</Label>
                <Textarea className="mt-1 bg-input/50 resize-none" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t("employerProfile.descPlaceholder", { defaultValue: "Pastāsti par savu uzņēmumu, kultūru un vērtībām..." })} />
                <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500 {t("employerProfile.chars", { defaultValue: "rakstzīmes" })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="w-4 h-4 text-primary" />{t("employerProfile.socialLinks", { defaultValue: "Sociālie tīkli" })}
              </CardTitle>
              <CardDescription>{t("employerProfile.socialLinksDesc", { defaultValue: "Pievienojiet saites uz uzņēmuma profiliem" })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Label>LinkedIn</Label><Input className="mt-1 bg-input/50" placeholder="https://linkedin.com/company/mans-uznemums" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Twitter / X</Label><Input className="mt-1 bg-input/50" placeholder="https://twitter.com/uznemums" /></div>
                <div><Label>Facebook</Label><Input className="mt-1 bg-input/50" placeholder="https://facebook.com/uznemums" /></div>
              </div>
            </CardContent>
          </Card>

          {/* GDPR Notice */}
          <Card className="glass-card border-primary/10">
            <CardContent className="p-4 flex items-start gap-3">
              <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("employerProfile.gdprCompliance", { defaultValue: "GDPR atbilstība" })}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("employerProfile.gdprComplianceDesc", { defaultValue: "Uzņēmuma profila dati tiek glabāti šifrētā veidā saskaņā ar VDAR prasībām. Kontaktinformācija aizsargāta ar AES-256-GCM šifrēšanu." })}</p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold">
            {saving
              ? t("candidateProfile.saving", { defaultValue: "Saglabā..." })
              : t("employerProfile.saveProfile")}
          </Button>
        </div>
      </div>
    </NavLayout>
  );
}
