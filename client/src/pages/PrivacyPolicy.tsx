import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

const LAST_UPDATED = "2025. gada 1. janvāris";
const POLICY_VERSION = "1.0";
const COMPANY_NAME = "Market Network SIA";
const COMPANY_REG = "40000000000"; // placeholder
const COMPANY_ADDRESS = "Brīvības iela 1, Rīga, LV-1001, Latvija";
const CONTACT_EMAIL = "privacy@market-network.lv";
const DPA_AUTHORITY = "Datu valsts inspekcija (DVI)";
const DPA_URL = "https://www.dvi.gov.lv";

export default function PrivacyPolicy() {
  return (
    <NavLayout userType="candidate">
      <div className="container py-10 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Privātuma politika</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                  Versija {POLICY_VERSION}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Atjaunināta: {LAST_UPDATED}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground leading-relaxed">
            Šī privātuma politika apraksta, kā <strong className="text-foreground">{COMPANY_NAME}</strong> ("mēs", "mums", "mūsu")
            vāc, izmanto, glabā un aizsargā jūsu personas datus, kad jūs izmantojat Market Network platformu.
            Mēs apstrādājam jūsu datus saskaņā ar Eiropas Parlamenta un Padomes Regulu (ES) 2016/679
            (Vispārīgā datu aizsardzības regula, "VDAR") un Latvijas Fizisko personu datu apstrādes likumu.
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          {/* 1. Datu pārzinis */}
          <Section number="1" title="Datu pārzinis">
            <p>
              Personas datu pārzinis ir <strong>{COMPANY_NAME}</strong>, reģistrācijas Nr. {COMPANY_REG},
              juridiskā adrese: {COMPANY_ADDRESS}.
            </p>
            <ContactBox />
          </Section>

          {/* 2. Kādus datus mēs vācam */}
          <Section number="2" title="Kādus personas datus mēs vācam">
            <p className="mb-4">
              Mēs vācam tikai tos datus, kas ir nepieciešami platformas darbībai (datu minimizācijas princips, VDAR 5. panta 1. punkta c) apakšpunkts).
            </p>
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Datu kategorija</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Konkrēti dati</th>
                  <th className="text-left py-2 font-semibold text-foreground">Lietotāju tips</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Identifikācijas dati", "Vārds, uzvārds, e-pasta adrese", "Visi"],
                  ["Kontaktinformācija", "Tālrunis, pilsēta, valsts", "Kandidāti"],
                  ["Profesionālie dati", "Prasmes, pieredze, izglītība, CV fails", "Kandidāti"],
                  ["Darba preferences", "Algas vēlmes, darba veids, attāluma preferences", "Kandidāti"],
                  ["Uzņēmuma dati", "Uzņēmuma nosaukums, nozare, apraksts", "Darba devēji"],
                  ["Maksājumu dati", "Stripe klienta ID, abonēšanas ID (kartes dati netiek glabāti)", "Darba devēji"],
                  ["Tehniskie dati", "IP adrese, pārlūka veids, sesijas dati", "Visi"],
                  ["Piekrišanas dati", "Piekrišanas datums, versija, atsaukšanas datums", "Visi"],
                ].map(([cat, data, type]) => (
                  <tr key={cat} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium text-foreground/80">{cat}</td>
                    <td className="py-2 pr-4">{data}</td>
                    <td className="py-2">{type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-muted-foreground">
              <strong className="text-foreground">CV faili:</strong> Augšupielādētie CV faili tiek droši glabāti šifrētā mākoņkrātuvē.
              Pēc AI parsēšanas strukturētie dati tiek saglabāti profilā, bet oriģinālais fails paliek pieejams tikai jums.
            </p>
          </Section>

          {/* 3. Apstrādes mērķi un tiesiskais pamats */}
          <Section number="3" title="Apstrādes mērķi un tiesiskais pamats">
            <p className="mb-4">
              Mēs apstrādājam jūsu personas datus šādiem mērķiem, pamatojoties uz norādīto tiesiski pamatoto iemeslu
              (VDAR 6. pants):
            </p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Apstrādes mērķis</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Tiesiskais pamats</th>
                  <th className="text-left py-2 font-semibold text-foreground">VDAR pants</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Konta izveide un autentifikācija", "Līguma izpilde", "6(1)(b)"],
                  ["AI atbilstību aprēķināšana", "Piekrišana", "6(1)(a)"],
                  ["Anonīma profila rādīšana darba devējiem", "Piekrišana", "6(1)(a)"],
                  ["Paziņojumu sūtīšana par atbilstībām", "Piekrišana + leģitīmās intereses", "6(1)(a)(f)"],
                  ["AI intervijas jautājumu ģenerēšana", "Piekrišana", "6(1)(a)"],
                  ["Stripe maksājumu apstrāde", "Līguma izpilde", "6(1)(b)"],
                  ["GDPR audita žurnāla uzturēšana", "Juridisks pienākums", "6(1)(c)"],
                  ["Mārketinga e-pasti", "Piekrišana", "6(1)(a)"],
                  ["Platformas drošība un krāpšanas novēršana", "Leģitīmās intereses", "6(1)(f)"],
                ].map(([purpose, basis, article]) => (
                  <tr key={purpose} className="border-b border-border/30">
                    <td className="py-2 pr-4 text-foreground/80">{purpose}</td>
                    <td className="py-2 pr-4">{basis}</td>
                    <td className="py-2 font-mono text-primary">{article}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* 4. Privātums pēc noklusējuma */}
          <Section number="4" title="Privātums pēc dizaina un noklusējuma (VDAR 25. pants)">
            <p className="mb-3">
              Market Network ir veidots pēc "Privacy by Design" principiem. Šie principi ir iestrādāti platformas
              arhitektūrā, nevis pievienoti vēlāk:
            </p>
            <div className="grid gap-3">
              {[
                {
                  title: "Pseudonimizācija",
                  desc: "Katram kandidātam tiek piešķirts stabils anonīms identifikators (piemēram, KND-A1B2C3). Darba devēji redz tikai šo ID, nevis jūsu vārdu vai kontaktinformāciju, līdz jūs sniedzat skaidru piekrišanu profila atklāšanai.",
                },
                {
                  title: "Datu minimizācija",
                  desc: "Mēs vācam tikai tos datus, kas ir nepieciešami konkrētajam apstrādes mērķim. Piemēram, darba devēji nekad neredz jūsu tālruņa numuru vai e-pasta adresi anonīmā skatījumā.",
                },
                {
                  title: "Šifrēšana",
                  desc: "Sensitīvie personas identifikācijas dati (vārds, tālrunis) tiek šifrēti datu bāzē, izmantojot AES-256-GCM algoritmu. Dati tiek atšifrēti tikai autorizētiem pieprasījumiem.",
                },
                {
                  title: "Noklusējuma anonimitāte",
                  desc: "Jauni kandidātu profili pēc noklusējuma ir anonīmi (isAnonymous = true). Darba devēji nevar redzēt personas datus bez kandidāta skaidras piekrišanas.",
                },
                {
                  title: "Piekrišanas granularitāte",
                  desc: "Katram apstrādes mērķim ir atsevišķa piekrišana. Jūs varat dot piekrišanu AI atbilstībām, bet atteikties no mārketinga e-pastiem — tas ir pilnīgi neatkarīgi.",
                },
                {
                  title: "Automātiska datu dzēšana",
                  desc: "Neaktīvie konti tiek atzīmēti pēc 24 mēnešiem. Datu dzēšanas pieprasījumi tiek izpildīti 30 dienu laikā. Visi procesi ir automatizēti un auditēti.",
                },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="font-semibold text-foreground mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 5. Datu kopīgošana */}
          <Section number="5" title="Ar ko mēs kopīgojam jūsu datus">
            <p className="mb-3">
              Mēs nekad nepārdodam jūsu personas datus trešajām pusēm. Dati tiek kopīgoti tikai šādos gadījumos:
            </p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Saņēmējs</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Mērķis</th>
                  <th className="text-left py-2 font-semibold text-foreground">Aizsardzība</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Darba devēji (platformā)", "Anonīmu profilu skatīšana (tikai ar piekrišanu)", "Pseudonimizācija, piekrišanas vārti"],
                  ["Stripe Inc.", "Maksājumu apstrāde", "DPA, SCCs, PCI DSS"],
                  ["Mākoņkrātuves pakalpojums", "CV failu glabāšana", "Šifrēšana, DPA"],
                  ["Valsts iestādes", "Tikai ar tiesas rīkojumu vai likumīgu pieprasījumu", "Minimāla datu izpaušana"],
                ].map(([rec, purpose, protection]) => (
                  <tr key={rec} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium text-foreground/80">{rec}</td>
                    <td className="py-2 pr-4">{purpose}</td>
                    <td className="py-2 text-green-400">{protection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* 6. Datu glabāšanas termiņi */}
          <Section number="6" title="Datu glabāšanas termiņi">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Datu veids</th>
                  <th className="text-left py-2 font-semibold text-foreground">Glabāšanas termiņš</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Aktīvs kandidāta profils", "Kamēr konts ir aktīvs + 30 dienas pēc dzēšanas pieprasījuma"],
                  ["Neaktīvs profils (bez pieteikšanās)", "24 mēneši, pēc tam automātiska paziņošana un dzēšana"],
                  ["CV fails mākoņkrātuvē", "Kamēr profils ir aktīvs; dzēsts kopā ar profilu"],
                  ["GDPR audita žurnāls", "5 gadi (juridiskais pienākums)"],
                  ["Maksājumu dati (Stripe ID)", "7 gadi (grāmatvedības likums)"],
                  ["Interviju sesijas", "12 mēneši pēc pabeigšanas"],
                  ["Atbilstību dati", "24 mēneši"],
                  ["Sīkdatnes (sesijas)", "Sesijas beigās"],
                  ["Sīkdatnes (analītikas)", "12 mēneši"],
                ].map(([type, period]) => (
                  <tr key={type} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium text-foreground/80">{type}</td>
                    <td className="py-2 text-muted-foreground">{period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* 7. Jūsu tiesības */}
          <Section number="7" title="Jūsu tiesības saskaņā ar VDAR">
            <p className="mb-4">
              Jums ir šādas tiesības attiecībā uz jūsu personas datiem. Lielākā daļa no šīm tiesībām ir pieejamas
              tieši platformā sadaļā <Link href="/gdpr" className="text-primary underline">GDPR Centrs</Link>.
            </p>
            <div className="grid gap-2">
              {[
                { right: "Piekļuves tiesības (15. pants)", desc: "Tiesības saņemt apstiprinājumu, vai mēs apstrādājam jūsu datus, un piekļūt tiem." },
                { right: "Labošanas tiesības (16. pants)", desc: "Tiesības labot neprecīzus vai nepilnīgus personas datus." },
                { right: "Dzēšanas tiesības (17. pants)", desc: "Tiesības pieprasīt datu dzēšanu ('tiesības tikt aizmirstam')." },
                { right: "Apstrādes ierobežošanas tiesības (18. pants)", desc: "Tiesības ierobežot datu apstrādi noteiktos apstākļos." },
                { right: "Datu pārnesamības tiesības (20. pants)", desc: "Tiesības saņemt savus datus strukturētā, mašīnlasāmā formātā." },
                { right: "Iebildumu tiesības (21. pants)", desc: "Tiesības iebilst pret datu apstrādi, kas balstīta uz leģitīmajām interesēm." },
                { right: "Piekrišanas atsaukšana (7(3). pants)", desc: "Tiesības jebkurā laikā atsaukt piekrišanu, neietekmējot iepriekšējās apstrādes likumību." },
                { right: "Sūdzības iesniegšana", desc: `Tiesības iesniegt sūdzību uzraudzības iestādē — ${DPA_AUTHORITY} (${DPA_URL}).` },
              ].map((item) => (
                <div key={item.right} className="flex gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">{item.right}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 8. Sīkdatnes */}
          <Section number="8" title="Sīkdatnes un izsekošanas tehnoloģijas">
            <p className="mb-3">
              Mēs izmantojam sīkdatnes, lai nodrošinātu platformas darbību un uzlabotu lietotāja pieredzi.
            </p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Sīkdatnes veids</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Mērķis</th>
                  <th className="text-left py-2 font-semibold text-foreground">Obligātas</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Sesijas sīkdatnes", "Autentifikācija un sesijas uzturēšana", "Jā"],
                  ["Funkcionālās sīkdatnes", "Lietotāja preferences (valoda, tēma)", "Nē"],
                  ["Analītikas sīkdatnes", "Platformas lietojuma statistika (anonimizēta)", "Nē"],
                ].map(([type, purpose, required]) => (
                  <tr key={type} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium text-foreground/80">{type}</td>
                    <td className="py-2 pr-4">{purpose}</td>
                    <td className={`py-2 ${required === "Jā" ? "text-amber-400" : "text-green-400"}`}>{required}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* 9. Datu drošība */}
          <Section number="9" title="Datu drošības pasākumi">
            <p>
              Mēs īstenojam atbilstošus tehniskos un organizatoriskos pasākumus, lai aizsargātu jūsu personas datus
              pret nesankcionētu piekļuvi, izmaiņām, izpaušanu vai iznīcināšanu (VDAR 32. pants):
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              {[
                "AES-256-GCM šifrēšana sensitīviem PII laukiem datu bāzē",
                "TLS 1.3 šifrēšana visai datu pārraidei",
                "JWT sesijas tokeni ar HttpOnly, Secure, SameSite=None atribūtiem",
                "Piekļuves kontrole ar lomu balstītu autorizāciju (RBAC)",
                "Regulāra drošības audita žurnālu pārskatīšana",
                "CV failu glabāšana izolētā mākoņkrātuvē ar parakstītiem URL",
                "Automatizēta datu dzēšana pēc glabāšanas termiņa beigām",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <span className="text-primary mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* 10. Starptautiskā datu pārsūtīšana */}
          <Section number="10" title="Starptautiskā datu pārsūtīšana">
            <p>
              Datu apstrāde primāri notiek ES/EEZ teritorijā. Gadījumos, kad dati tiek pārsūtīti ārpus EEZ
              (piemēram, Stripe Inc. ASV), mēs nodrošinām atbilstošas aizsardzības garantijas:
              Eiropas Komisijas standarta līguma klauzulas (SCCs) un/vai apstrādātāja sertifikācija saskaņā ar
              ES-ASV Datu privātuma regulējumu.
            </p>
          </Section>

          {/* 11. Izmaiņas */}
          <Section number="11" title="Izmaiņas privātuma politikā">
            <p>
              Mēs varam periodiski atjaunināt šo privātuma politiku. Par būtiskām izmaiņām mēs jūs informēsim
              ar e-pasta paziņojumu vai platformas paziņojumu vismaz 30 dienas pirms izmaiņu stāšanās spēkā.
              Turpinot izmantot platformu pēc izmaiņu stāšanās spēkā, jūs piekrītat atjauninātajai politikai.
              Politikas versijas vēsture ir pieejama GDPR Centrā.
            </p>
          </Section>

          {/* 12. Kontakti */}
          <Section number="12" title="Kontaktinformācija">
            <p className="mb-3">
              Ja jums ir jautājumi par šo privātuma politiku vai jūsu personas datu apstrādi, lūdzu, sazinieties ar mums:
            </p>
            <ContactBox />
            <p className="mt-3 text-muted-foreground">
              Jums ir arī tiesības iesniegt sūdzību Latvijas uzraudzības iestādē —{" "}
              <a href={DPA_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {DPA_AUTHORITY}
              </a>.
            </p>
          </Section>
        </div>
      </div>
    </NavLayout>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
            {number}
          </span>
          {title}
        </h2>
        <div className="text-sm leading-relaxed space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function ContactBox() {
  return (
    <div className="p-3 rounded-xl bg-accent/20 space-y-1.5 text-xs text-muted-foreground mt-3">
      <p className="font-semibold text-foreground">{COMPANY_NAME}</p>
      <p>{COMPANY_ADDRESS}</p>
      <p className="flex items-center gap-1.5">
        <Mail className="w-3 h-3 text-primary" />
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>
      </p>
    </div>
  );
}
