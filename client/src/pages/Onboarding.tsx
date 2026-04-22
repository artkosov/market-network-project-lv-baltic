import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { User, Building2, ArrowRight, Sparkles, Shield, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<"candidate" | "employer" | null>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  // Granular GDPR consent state
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentPlatform, setConsentPlatform] = useState(false);
  const [consentMatching, setConsentMatching] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const setRole = trpc.auth.setUserRole.useMutation();
  const updateCandidateConsent = trpc.gdpr.updateCandidateConsent.useMutation();
  const updateEmployerConsent = trpc.gdpr.updateEmployerConsent.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">{t("onboarding.pleaseLogin", { defaultValue: "Lūdzu pieslēdzieties" })}</h2>
          <Button asChild><a href={getLoginUrl()}>{t("nav.login")}</a></Button>
        </div>
      </div>
    );
  }

  const requiredConsents = consentTerms && consentPrivacy && consentPlatform;

  const handleContinue = async () => {
    if (!selected) { toast.error(t("onboarding.selectRole", { defaultValue: "Lūdzu izvēlieties lomu" })); return; }
    if (!requiredConsents) { toast.error(t("onboarding.acceptRequired", { defaultValue: "Lūdzu apstipriniet visas obligātās piekrišanas" })); return; }
    setSaving(true);
    try {
      await setRole.mutateAsync({ role: selected });
      if (selected === "candidate") {
        await updateCandidateConsent.mutateAsync({
          platform: consentPlatform,
          matching: consentMatching,
          employerView: consentMatching,
          marketing: consentMarketing,
        });
        navigate("/kandidats/profils");
      } else {
        await updateEmployerConsent.mutateAsync({
          platform: consentPlatform,
          dpaAccepted: consentPlatform,
          marketing: consentMarketing,
        });
        navigate("/darbadevetajs/profils");
      }
    } catch { toast.error(t("onboarding.saveError", { defaultValue: "Kļūda saglabājot piekrišanas" })); }
    finally { setSaving(false); }
  };

  const roleOptions = [
    {
      type: "candidate" as const,
      icon: <User className="w-8 h-8" />,
      title: t("onboarding.candidateTitle", { defaultValue: "Es meklēju darbu" }),
      subtitle: t("onboarding.candidate"),
      desc: t("onboarding.candidateFullDesc", { defaultValue: "Atrodi savu ideālo darbu ar AI palīdzību. Mūsu sistēma automātiski saskaņo tevi ar labākajām vakancēm." }),
      features: t("onboarding.candidateFeatures", {
        returnObjects: true,
        defaultValue: ["AI profila saskaņošana", "Anonīmais profils", "Automātiski paziņojumi", "AI intervija"]
      }) as string[],
    },
    {
      type: "employer" as const,
      icon: <Building2 className="w-8 h-8" />,
      title: t("onboarding.employerTitle", { defaultValue: "Es meklēju darbiniekus" }),
      subtitle: t("onboarding.employer"),
      desc: t("onboarding.employerFullDesc", { defaultValue: "Atrod ideālos kandidātus bez manuālas CV šķirošanas. AI automātiski filtrē un saskaņo." }),
      features: t("onboarding.employerFeatures", {
        returnObjects: true,
        defaultValue: ["AI CV parsēšana", "Automātiska saskaņošana", "Anonīmie profili", "AI pirmā intervija"]
      }) as string[],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Language switcher top right */}
      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Market Network</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">{t("onboarding.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("onboarding.desc")}</p>
        </div>

        {/* Role cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roleOptions.map(opt => (
            <Card
              key={opt.type}
              className={`glass-card cursor-pointer transition-all duration-200 hover:border-primary/40 ${
                selected === opt.type ? "border-primary/60 shadow-lg shadow-primary/10 bg-primary/5" : "border-border/50"
              }`}
              onClick={() => setSelected(opt.type)}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  selected === opt.type ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {opt.icon}
                </div>
                <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{opt.subtitle}</div>
                <h3 className="text-xl font-bold mb-2">{opt.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{opt.desc}</p>
                <ul className="space-y-1.5">
                  {opt.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── GDPR Consent Section ─── */}
        <Card className="glass-card mb-6 border-primary/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm">{t("onboarding.consentsTitle", { defaultValue: "Piekrišanas un privātuma iestatījumi" })}</p>
            </div>

            <div className="space-y-4">
              {/* Required consents */}
              <ConsentRow
                id="consent-terms"
                checked={consentTerms}
                onChange={setConsentTerms}
                required
              >
                {t("onboarding.consentTerms1", { defaultValue: "Esmu izlasījis un piekrītu" })}{" "}
                <Link href="/lietosanas-noteikumi" className="text-primary underline" target="_blank">
                  {t("footer.termsOfService")}
                </Link>{" "}*
              </ConsentRow>

              <ConsentRow
                id="consent-privacy"
                checked={consentPrivacy}
                onChange={setConsentPrivacy}
                required
              >
                {t("onboarding.consentPrivacy1", { defaultValue: "Esmu izlasījis un piekrītu" })}{" "}
                <Link href="/privatuma-politika" className="text-primary underline" target="_blank">
                  {t("footer.privacyPolicy")}
                </Link>{" "}
                {t("onboarding.consentPrivacy2", { defaultValue: "un personas datu apstrādei" })} *
              </ConsentRow>

              <ConsentRow
                id="consent-platform"
                checked={consentPlatform}
                onChange={setConsentPlatform}
                required
              >
                {t("onboarding.consentPlatform", { defaultValue: "Piekrītu savu personas datu apstrādei platformas darbībai (VDAR 6(1)(b))" })} *
              </ConsentRow>

              {/* Divider */}
              <div className="border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground font-medium mb-3">{t("onboarding.optionalConsents", { defaultValue: "Izvēles piekrišanas (nav obligātas):" })}</p>

                <div className="space-y-4">
                  <ConsentRow
                    id="consent-matching"
                    checked={consentMatching}
                    onChange={setConsentMatching}
                  >
                    {t("onboarding.consentMatching", { defaultValue: "Piekrītu AI atbilstību meklēšanai" })}{selected === "candidate" && t("onboarding.consentMatchingCandidate", { defaultValue: " un rādīt manu anonīmo profilu darba devējiem" })} {t("onboarding.consentMatchingGdpr", { defaultValue: "(VDAR 6(1)(a))" })}
                  </ConsentRow>

                  <ConsentRow
                    id="consent-marketing"
                    checked={consentMarketing}
                    onChange={setConsentMarketing}
                  >
                    {t("onboarding.consentMarketing", { defaultValue: "Piekrītu mārketinga e-pastu saņemšanai par jaunumiem un darba tirgus ieskatiem (VDAR 6(1)(a))" })}
                  </ConsentRow>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                {t("onboarding.requiredNote", { defaultValue: "* Obligātas piekrišanas. Jūs varat jebkurā laikā mainīt izvēles piekrišanas" })}{" "}
                <Link href="/gdpr" className="text-primary underline">{t("nav.gdpr")} {t("onboarding.center", { defaultValue: "Centrā" })}</Link>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          disabled={!selected || saving || !requiredConsents}
          className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold disabled:opacity-40"
        >
          {saving ? t("onboarding.processing", { defaultValue: "Apstrādā..." }) : t("onboarding.continue")}
          {!saving && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <StatusDot ok={!!selected} label={t("onboarding.roleSelected", { defaultValue: "Loma izvēlēta" })} />
          <StatusDot ok={requiredConsents} label={t("onboarding.requiredConsents", { defaultValue: "Obligātās piekrišanas" })} />
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  id,
  checked,
  onChange,
  children,
  required,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(!!v)}
        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
      />
      <label
        htmlFor={id}
        className={`text-xs leading-relaxed cursor-pointer select-none ${
          required ? "text-foreground/90" : "text-muted-foreground"
        }`}
      >
        {children}
      </label>
    </div>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {ok ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-border" />
      )}
      <span className={ok ? "text-green-400" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
