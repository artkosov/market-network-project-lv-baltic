import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  ArrowRight,
  BriefcaseIcon,
  CheckCircle,
  Eye,
  EyeOff,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: me } = trpc.auth.me.useQuery();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (me && me.userType !== "unset") {
      if (me.userType === "candidate") navigate("/kandidats");
      else if (me.userType === "employer") navigate("/darbadevetajs");
    }
  }, [me]);

  const features = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Darba Sentinel",
      desc: "Automātiska vakances meklēšana CV.lv, ss.lv un LinkedIn. Filtrē pēc pilsētas, algas un prasmēm.",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Atbilstība",
      desc: "Mākslīgais intelekts novērtē kandidāta-vakances saderību no 0 līdz 100%, ņemot vērā prasmes, pieredzi un algu.",
    },
    {
      icon: <EyeOff className="w-5 h-5" />,
      title: "Anonimitātes Slānis",
      desc: "Kandidāti paliek anonīmi, kamēr paši nepiekrīt profila atklāšanai. Pilnīga privātuma kontrole.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Automātiskas Paziņojumi",
      desc: "90%+ atbilstības gadījumā sistēma automātiski paziņo kandidātam — bez manuālas darbības.",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "AI Intervija",
      desc: "Pirms cilvēka HR iesaistīšanās, AI uzdod 3–5 kvalificējošus jautājumus, lai pārbaudītu interesi.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "GDPR Atbilstība",
      desc: "Automātiska piekrišanas pārvaldība, datu dzēšanas pieprasījumi un pilns audita žurnāls.",
    },
  ];

  const stats = [
    { value: "2 400+", label: "Aktīvas vakances" },
    { value: "8 900+", label: "Reģistrēti kandidāti" },
    { value: "94%", label: "Atbilstības precizitāte" },
    { value: "48h", label: "Vidējais laiks līdz intervijam" },
  ];

  const steps = [
    { num: "01", title: "Izveido profilu", desc: "Augšupielādē CV vai aizpildi profilu manuāli. AI automātiski izvelk prasmes un pieredzi." },
    { num: "02", title: "AI meklē", desc: "Sistēma nepārtraukti skenē Latvijas darba tirgus platformas un aprēķina atbilstības." },
    { num: "03", title: "Saņem paziņojumu", desc: "Pie 90%+ atbilstības saņem tūlītēju paziņojumu ar vakances detaļām." },
    { num: "04", title: "Intervija & Lēmums", desc: "Atbildi uz AI jautājumiem un izlemj — atklāt profilu darba devējam vai nē." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
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

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funkcijas</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Kā strādā</a>
            <Link href="/cenas" className="hover:text-foreground transition-colors">Cenas</Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button size="sm" asChild>
                <Link href={me?.userType === "employer" ? "/darbadevetajs" : "/kandidats"}>
                  Uz paneli <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <a href={getLoginUrl()}>Pieslēgties</a>
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" asChild>
                  <a href={getLoginUrl()}>Sākt bezmaksas</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-premium" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="container relative text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />
            AI-vadīta darba meklēšana Latvijā
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Darba tirgus{" "}
            <span className="text-gold-gradient">bez manuāla</span>
            <br />
            darba
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Market Network automātiski saskaņo kandidātus ar vakancēm, nodrošina privātumu ar anonimitātes slāni
            un veic sākotnējo interviju ar AI — pirms cilvēka HR iesaistīšanās.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl px-8 py-6 text-base font-semibold glow-primary" asChild>
              <a href={getLoginUrl()}>
                <Users className="w-4 h-4 mr-2" />
                Esmu kandidāts
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 hover:bg-accent px-8 py-6 text-base font-semibold" asChild>
              <a href={getLoginUrl()}>
                <BriefcaseIcon className="w-4 h-4 mr-2" />
                Esmu darba devējs
              </a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Bezmaksas sākums · Nav nepieciešama kredītkarte · GDPR atbilstīgs
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
              Funkcijas
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Viss, kas nepieciešams</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No automātiskas vakances meklēšanas līdz AI intervijām — pilns cikls bez manuāla darba.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="glass-card hover:border-primary/30 transition-all group hover:shadow-xl hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
              Kā strādā
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Četri soļi līdz sapņu darbam</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-black text-primary/10 mb-3 leading-none">{step.num}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Candidate CTA */}
            <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Esmu Kandidāts</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Augšupielādē savu CV, un AI automātiski izveidos tavu profilu. Saņem paziņojumus par labākajām vakancēm Latvijā.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Bezmaksas profils", "AI CV parsēšana", "Anonimitātes aizsardzība", "GDPR kontrole"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <a href={getLoginUrl()}>
                    Sākt kā kandidāts <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Employer CTA */}
            <Card className="glass-card border-border/50 hover:border-border transition-all group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                  <BriefcaseIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Esmu Darba Devējs</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Publicē vakanci vai importē no esošajām platformām. AI automātiski atrod labākos kandidātus un veic sākotnējo atlasi.
                </p>
                <ul className="space-y-2 mb-8">
                  {["AI vakances parsēšana", "Automātiska kandidātu atlase", "Anonīmi profili", "Stripe abonements"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full border-border/60 hover:bg-accent" asChild>
                  <a href={getLoginUrl()}>
                    Sākt kā darba devējs <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <BriefcaseIcon className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">
                <span className="text-gold-gradient">Market</span> Network
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 Market Network. Latvijas darba tirgus platforma. GDPR atbilstīgs.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privātuma politika</a>
              <a href="#" className="hover:text-foreground transition-colors">Lietošanas noteikumi</a>
              <Link href="/cenas" className="hover:text-foreground transition-colors">Cenas</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
