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

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<"candidate" | "employer" | null>(null);
  const [saving, setSaving] = useState(false);

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
          <h2 className="text-xl font-semibold mb-4">Lūdzu pieslēdzieties</h2>
          <Button asChild><a href={getLoginUrl()}>Pieslēgties</a></Button>
        </div>
      </div>
    );
  }

  const requiredConsents = consentTerms && consentPrivacy && consentPlatform;

  const handleContinue = async () => {
    if (!selected) { toast.error("Lūdzu izvēlieties lomu"); return; }
    if (!requiredConsents) { toast.error("Lūdzu apstipriniet visas obligātās piekrišanas"); return; }
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
    } catch { toast.error("Kļūda saglabājot piekrišanas"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Market Network</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Laipni lūgti!</h1>
          <p className="text-muted-foreground text-lg">Kā jūs vēlaties izmantot platformu?</p>
        </div>

        {/* Role cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            {
              type: "candidate" as const,
              icon: <User className="w-8 h-8" />,
              title: "Es meklēju darbu",
              subtitle: "Kandidāts",
              desc: "Atrodi savu ideālo darbu ar AI palīdzību. Mūsu sistēma automātiski saskaņo tevi ar labākajām vakancēm.",
              features: ["AI profila saskaņošana", "Anonīmais profils", "Automātiski paziņojumi", "AI intervija"],
            },
            {
              type: "employer" as const,
              icon: <Building2 className="w-8 h-8" />,
              title: "Es meklēju darbiniekus",
              subtitle: "Darba devējs",
              desc: "Atrod ideālos kandidātus bez manuālas CV šķirošanas. AI automātiski filtrē un saskaņo.",
              features: ["AI CV parsēšana", "Automātiska saskaņošana", "Anonīmie profili", "AI pirmā intervija"],
            },
          ].map(opt => (
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
              <p className="font-semibold text-sm">Piekrišanas un privātuma iestatījumi</p>
            </div>

            <div className="space-y-4">
              {/* Required consents */}
              <ConsentRow
                id="consent-terms"
                checked={consentTerms}
                onChange={setConsentTerms}
                required
              >
                Esmu izlasījis un piekrītu{" "}
                <Link href="/lietosanas-noteikumi" className="text-primary underline" target="_blank">
                  Lietošanas noteikumiem
                </Link>{" "}*
              </ConsentRow>

              <ConsentRow
                id="consent-privacy"
                checked={consentPrivacy}
                onChange={setConsentPrivacy}
                required
              >
                Esmu izlasījis un piekrītu{" "}
                <Link href="/privatuma-politika" className="text-primary underline" target="_blank">
                  Privātuma politikai
                </Link>{" "}
                un personas datu apstrādei *
              </ConsentRow>

              <ConsentRow
                id="consent-platform"
                checked={consentPlatform}
                onChange={setConsentPlatform}
                required
              >
                Piekrītu savu personas datu apstrādei platformas darbībai (VDAR 6(1)(b)) *
              </ConsentRow>

              {/* Divider */}
              <div className="border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground font-medium mb-3">Izvēles piekrišanas (nav obligātas):</p>

                <div className="space-y-4">
                  <ConsentRow
                    id="consent-matching"
                    checked={consentMatching}
                    onChange={setConsentMatching}
                  >
                    Piekrītu AI atbilstību meklēšanai — ļauj mūsu AI analizēt manu profilu un saskaņot ar
                    vakancēm{selected === "candidate" && " un rādīt manu anonīmo profilu darba devējiem"} (VDAR 6(1)(a))
                  </ConsentRow>

                  <ConsentRow
                    id="consent-marketing"
                    checked={consentMarketing}
                    onChange={setConsentMarketing}
                  >
                    Piekrītu mārketinga e-pastu saņemšanai par jaunumiem un darba tirgus ieskatiem (VDAR 6(1)(a))
                  </ConsentRow>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                * Obligātas piekrišanas. Jūs varat jebkurā laikā mainīt izvēles piekrišanas{" "}
                <Link href="/gdpr" className="text-primary underline">GDPR Centrā</Link>.
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
          {saving ? "Apstrādā..." : "Turpināt"}
          {!saving && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <StatusDot ok={!!selected} label="Loma izvēlēta" />
          <StatusDot ok={requiredConsents} label="Obligātās piekrišanas" />
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
