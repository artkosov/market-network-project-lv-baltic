import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
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
  const { t } = useTranslation();

  useEffect(() => {
    if (me && me.userType !== "unset") {
      if (me.userType === "candidate") navigate("/kandidats");
      else if (me.userType === "employer") navigate("/darbadevetajs");
    }
  }, [me]);

  const featureIcons = [
    <Search className="w-5 h-5" />,
    <Sparkles className="w-5 h-5" />,
    <EyeOff className="w-5 h-5" />,
    <Zap className="w-5 h-5" />,
    <MessageSquare className="w-5 h-5" />,
    <Shield className="w-5 h-5" />,
    <BarChart2 className="w-5 h-5" />,
  ];

  const features = (t("home.features", { returnObjects: true }) as Array<{ title: string; desc: string }>).map(
    (f, i) => ({ ...f, icon: featureIcons[i] })
  );

  const stats = [
    { value: "2 400+", label: t("home.activeJobs") },
    { value: "8 900+", label: t("home.registeredCandidates") },
    { value: "94%", label: t("home.matchAccuracy") },
    { value: "48h", label: t("home.avgTimeToInterview") },
  ];

  const steps = t("home.steps", { returnObjects: true }) as Array<{ num: string; title: string; desc: string }>;
  const testimonials = t("home.testimonials", { returnObjects: true }) as Array<{ name: string; role: string; company: string; text: string; score: string }>;
  const faqItems = t("home.faqItems", { returnObjects: true }) as Array<{ q: string; a: string }>;

  const candidateFeatures = t("home.candidateFeatures", { returnObjects: true }) as string[];
  const employerFeatures = t("home.employerFeatures", { returnObjects: true }) as string[];

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
            <a href="#features" className="hover:text-foreground transition-colors">{t("nav.features")}</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">{t("nav.howItWorks")}</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">{t("nav.testimonials")}</a>
            <Link href="/cenas" className="hover:text-foreground transition-colors">{t("nav.pricing")}</Link>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            {/* Language Switcher */}
            <LanguageSwitcher />

            {isAuthenticated ? (
              <Button size="sm" asChild>
                <Link href={me?.userType === "employer" ? "/darbadevetajs" : "/kandidats"}>
                  {t("nav.toDashboard")} <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><a href={getLoginUrl()}>{t("nav.login")}</a></Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" asChild>
                  <a href={getLoginUrl()}>{t("nav.startFree")}</a>
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
            <Sparkles className="w-3 h-3 mr-2" />{t("home.heroBadge")}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            {t("home.heroTitle")} <span className="text-gold-gradient">{t("home.heroTitleHighlight")}</span><br />{t("home.heroTitleEnd")}
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("home.heroDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl text-base px-8" asChild>
              <a href={getLoginUrl()}><Sparkles className="w-4 h-4 mr-2" />{t("home.startFree")}</a>
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 text-base px-8" asChild>
              <Link href="/cenas">{t("home.viewPricing")} <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 text-base px-8" asChild>
              <Link href="/demo/vakances">
                <Search className="w-4 h-4 mr-2" />Demo vakances
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">{t("home.heroBadgeBottom")}</p>
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
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><Zap className="w-3 h-3 mr-1" />{t("home.featuresBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("home.featuresTitle")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("home.featuresDesc")}</p>
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
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><CheckCircle className="w-3 h-3 mr-1" />{t("home.howItWorksBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("home.howItWorksTitle")}</h2>
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
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><Star className="w-3 h-3 mr-1" />{t("home.testimonialsBadge")}</Badge>
            <h2 className="text-4xl font-bold mb-4">{t("home.testimonialsTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <Card key={item.name} className="glass-card hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{item.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                      <p className="text-xs text-muted-foreground">{item.company}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{item.score}</Badge>
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
                <h3 className="text-2xl font-bold mb-3">{t("home.candidatePlan")}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{t("home.candidatePlanDesc")}</p>
                <ul className="space-y-2 mb-8">
                  {candidateFeatures.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <a href={getLoginUrl()}>{t("home.startAsCandidate")} <ArrowRight className="w-4 h-4 ml-2" /></a>
                </Button>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 hover:border-border transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6"><BriefcaseIcon className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold mb-3">{t("home.employerPlan")}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{t("home.employerPlanDesc")}</p>
                <ul className="space-y-2 mb-8">
                  {employerFeatures.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full border-border/60 hover:bg-accent" asChild>
                  <a href={getLoginUrl()}>{t("home.startAsEmployer")} <ArrowRight className="w-4 h-4 ml-2" /></a>
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
            <h2 className="text-4xl font-bold mb-4">{t("home.faqTitle")}</h2>
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
              <p className="text-xs text-muted-foreground leading-relaxed">{t("footer.tagline")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("footer.platform")}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t("nav.features")}</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{t("nav.howItWorks")}</a></li>
                <li><Link href="/cenas" className="hover:text-foreground transition-colors">{t("nav.pricing")}</Link></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("footer.legal")}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/privatuma-politika" className="hover:text-foreground transition-colors">{t("footer.privacyPolicy")}</Link></li>
                <li><Link href="/lietosanas-noteikumi" className="hover:text-foreground transition-colors">{t("footer.termsOfService")}</Link></li>
                <li><Link href="/gdpr" className="hover:text-foreground transition-colors">{t("footer.gdprCenter")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("footer.contacts")}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Globe className="w-3 h-3" />{t("footer.location")}</li>
                <li className="flex items-center gap-1.5"><Lock className="w-3 h-3" />{t("footer.gdprCompliant")}</li>
                <li className="flex items-center gap-1.5"><Shield className="w-3 h-3" />{t("footer.encryption")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><span>{t("footer.gdprBadge")}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
