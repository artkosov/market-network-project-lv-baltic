import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, BriefcaseIcon, Users, Shield, Zap, MessageSquare,
  EyeOff, CheckCircle, ArrowRight, Star, ChevronDown, ChevronUp,
  Globe, Lock, BarChart2, Search,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: me } = trpc.auth.me.useQuery();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (me && me.userType !== "unset") {
      if (me.userType === "candidate") navigate("/kandidats");
      else if (me.userType === "employer") navigate("/darbadevetajs");
    }
  }, [me]);

  const features = [
    { icon: <Search className="w-5 h-5" />, title: "Darba Sentinel", desc: "Automātiska vakances meklēšana CV.lv, ss.lv un LinkedIn. Filtrē pēc pilsētas, algas un prasmēm." },
    { icon: <Sparkles className="w-5 h-5" />, title: "AI Matchmaker", desc: "Algoritms novērtē kandidāta-vakances saderību no 0 līdz 100%, ņemot vērā prasmes, pieredzi un algu." },
    { icon: <EyeOff className="w-5 h-5" />, title: "Anonimitātes Slānis", desc: "Kandidāti paliek anonīmi, kamēr paši nepiekrīt profila atklāšanai. Pilnīga privātuma kontrole." },
    { icon: <Zap className="w-5 h-5" />, title: "Automātiski Paziņojumi", desc: "90%+ atbilstības gadījumā sistēma automātiski paziņo kandidātam — bez manuālas darbības." },
    { icon: <MessageSquare className="w-5 h-5" />, title: "AI Intervija", desc: "Pirms cilvēka HR iesaistīšanās, AI uzdod 3–5 kvalificējošus jautājumus, lai pārbaudītu interesi." },
    { icon: <Shield className="w-5 h-5" />, title: "GDPR Atbilstība", desc: "Automātiska piekrišanas pārvaldība, datu dzēšanas pieprasījumi un pilns audita žurnāls." },
    { icon: <BarChart2 className="w-5 h-5" />, title: "Analītika", desc: "Detalizēta statistika par vakancēm, atbilstībām un kandidātu aktivitāti reāllaikā." },
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

  const testimonials = [
    { name: "Mārtiņš K.", role: "Senior Developer", company: "IT uzņēmums, Rīga", text: "Atradu darbu 3 nedēļu laikā! AI precīzi saskaņoja manas prasmes ar vakancēm. Vairs nav jātērē laiks CV sūtīšanai uz katru sludinājumu.", score: "96%" },
    { name: "Ilze B.", role: "HR Vadītāja", company: "Loģistikas uzņēmums", text: "Market Network ietaupa mums 20+ stundas nedēļā. AI veic sākotnējo atlasi, mēs tikai apstiprinām labākos kandidātus.", score: "Darba devējs" },
    { name: "Andris P.", role: "Projektu vadītājs", company: "Celtniecības firma", text: "Anonimitātes funkcija ir lieliska — varu meklēt darbu, kamēr esmu nodarbināts. Darba devējs redz tikai manas prasmes.", score: "89%" },
  ];

  const faqItems = [
    { q: "Kā darbojas AI atbilstības algoritms?", a: "Mūsu AI analizē kandidāta prasmes, pieredzi, algas cerības un atrašanās vietu, salīdzinot ar vakances prasībām. Rezultāts tiek aprēķināts no 0 līdz 100%, ņemot vērā 4 faktorus: prasmes (40%), pieredze (30%), alga (20%) un atrašanās vieta (10%)." },
    { q: "Vai mans darba devējs var redzēt, ka meklēju darbu?", a: "Nē. Pēc noklusējuma visi kandidātu profili ir anonīmi. Darba devēji redz tikai prasmes, pieredzi un algas cerības — bez vārda, kontaktinformācijas vai CV. Tikai jūs izlemjat, kad un vai atklāt savu identitāti." },
    { q: "Kā darbojas GDPR piekrišanas sistēma?", a: "Mēs izmantojam granulāru piekrišanas modeli — jūs varat atsevišķi kontrolēt piekrišanu platformas izmantošanai, AI saskaņošanai, profila rādīšanai darba devējiem un mārketinga paziņojumiem. Jebkuru piekrišanu var atsaukt jebkurā laikā." },
    { q: "Cik maksā kandidātiem?", a: "Kandidātiem platforma ir pilnīgi bezmaksas. Mēs iekasējam maksu tikai no darba devējiem par piekļuvi kandidātu profiliem un AI saskaņošanas funkcijām." },
    { q: "Kādas platformas skenē Job Sentinel?", a: "Job Sentinel automātiski importē vakances no cv.lv, ss.lv un LinkedIn Latvijas segmenta. Vakances tiek filtrētas pēc atrašanās vietas, algas un prasmēm." },
    { q: "Kā notiek AI intervija?", a: "Kad AI atrod 90%+ atbilstību, kandidāts saņem paziņojumu. Ja kandidāts piekrīt, AI ģenerē 3-5 specifiskus jautājumus par vakanci. Pēc atbilžu iesniegšanas AI izvērtē un sniedz ieteikumu — vai turpināt ar darba devēju." },
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
            <a href="#testimonials" className="hover:text-foreground transition-colors">Atsauksmes</a>
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
                <Button variant="ghost" size="sm" asChild><a href={getLoginUrl()}>Pieslēgties</a></Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" asChild>
                  <a href={getLoginUrl()}>Sākt bezmaksas</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-premium" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="container relative text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />AI-vadīta darba meklēšana Latvijā
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Darba tirgus <span className="text-gold-gradient">bez manuāla</span><br />darba
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Market Network automātiski saskaņo kandidātus ar vakancēm, nodrošina privātumu ar anonimitātes slāni un veic sākotnējo interviju ar AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl text-base px-8" asChild>
              <a href={getLoginUrl()}><Sparkles className="w-4 h-4 mr-2" />Sākt bezmaksas</a>
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 text-base px-8" asChild>
              <Link href="/cenas">Skatīt cenas <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">Bezmaksas sākums · Nav nepieciešama kredītkarte · GDPR atbilstīgs</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-gradient mb-2">{stat.value}</div>
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
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><Zap className="w-3 h-3 mr-1" />Funkcijas</Badge>
            <h2 className="text-4xl font-bold mb-4">Viss, kas nepieciešams</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Pilna ekosistēma darba meklēšanai un darbinieku atlasē Latvijas tirgū</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="glass-card hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">{feature.icon}</div>
                  <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-accent/20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><CheckCircle className="w-3 h-3 mr-1" />Kā strādā</Badge>
            <h2 className="text-4xl font-bold mb-4">4 soļi līdz jaunam darbam</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent z-0" />}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-4">{step.num}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><Star className="w-3 h-3 mr-1" />Atsauksmes</Badge>
            <h2 className="text-4xl font-bold mb-4">Ko saka mūsu lietotāji</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="glass-card hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                      <p className="text-xs text-muted-foreground">{t.company}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{t.score}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-24 bg-accent/20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6"><Users className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold mb-3">Esmu Kandidāts</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Augšupielādē savu CV, un AI automātiski izveidos tavu profilu. Saņem paziņojumus par labākajām vakancēm Latvijā.</p>
                <ul className="space-y-2 mb-8">
                  {["Bezmaksas profils", "AI CV parsēšana", "Anonimitātes aizsardzība", "GDPR kontrole", "Telegram paziņojumi"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <a href={getLoginUrl()}>Sākt kā kandidāts <ArrowRight className="w-4 h-4 ml-2" /></a>
                </Button>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 hover:border-border transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6"><BriefcaseIcon className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold mb-3">Esmu Darba Devējs</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Publicē vakanci vai importē no esošajām platformām. AI automātiski atrod labākos kandidātus un veic sākotnējo atlasi.</p>
                <ul className="space-y-2 mb-8">
                  {["AI vakances parsēšana", "Automātiska kandidātu atlase", "Anonīmi profili", "Stripe abonements", "Analītika un pārskati"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full border-border/60 hover:bg-accent" asChild>
                  <a href={getLoginUrl()}>Sākt kā darba devējs <ArrowRight className="w-4 h-4 ml-2" /></a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Biežāk uzdotie jautājumi</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <Card key={i} className="glass-card cursor-pointer hover:border-primary/20 transition-all" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-sm">{item.q}</p>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </div>
                  {openFaq === i && <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-t border-border/40 pt-3">{item.a}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center"><BriefcaseIcon className="w-3 h-3 text-primary-foreground" /></div>
                <span className="font-semibold text-sm"><span className="text-gold-gradient">Market</span> Network</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">AI-vadīta darba meklēšanas platforma Latvijas un Baltijas tirgum.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platforma</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Funkcijas</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Kā strādā</a></li>
                <li><Link href="/cenas" className="hover:text-foreground transition-colors">Cenas</Link></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Juridiskais</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/privatuma-politika" className="hover:text-foreground transition-colors">Privātuma politika</Link></li>
                <li><Link href="/lietosanas-noteikumi" className="hover:text-foreground transition-colors">Lietošanas noteikumi</Link></li>
                <li><Link href="/gdpr" className="hover:text-foreground transition-colors">GDPR Centrs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Kontakti</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Globe className="w-3 h-3" />Latvija, Rīga</li>
                <li className="flex items-center gap-1.5"><Lock className="w-3 h-3" />GDPR atbilstīgs</li>
                <li className="flex items-center gap-1.5"><Shield className="w-3 h-3" />AES-256-GCM šifrēšana</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Market Network SIA. Visas tiesības aizsargātas.</p>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><span>GDPR atbilstīgs · Latvija</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
