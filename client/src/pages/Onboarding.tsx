import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { User, Building2, ArrowRight, Sparkles } from "lucide-react";

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<"candidate" | "employer" | null>(null);
  const [saving, setSaving] = useState(false);
  const setRole = trpc.auth.setUserRole.useMutation();

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Lūdzu pieslēdzieties</h2>
        <Button asChild><a href={getLoginUrl()}>Pieslēgties</a></Button>
      </div>
    </div>
  );

  const handleContinue = async () => {
    if (!selected) { toast.error("Lūdzu izvēlieties lomu"); return; }
    setSaving(true);
    try {
      await setRole.mutateAsync({ role: selected });
      if (selected === "candidate") navigate("/kandidats/profils");
      else navigate("/darbadevetajs/profils");
    } catch { toast.error("Kļūda"); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary-foreground" /></div>
            <span className="text-xl font-bold">Market Network</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Laipni lūgti!</h1>
          <p className="text-muted-foreground text-lg">Kā jūs vēlaties izmantot platformu?</p>
        </div>
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
              className={`glass-card cursor-pointer transition-all duration-200 hover:border-primary/40 ${selected === opt.type ? "border-primary/60 shadow-lg shadow-primary/10 bg-primary/5" : "border-border/50"}`}
              onClick={() => setSelected(opt.type)}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${selected === opt.type ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
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
        <Button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold"
        >
          {saving ? "Apstrādā..." : "Turpināt"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
