import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Mail } from "lucide-react";
import { Link } from "wouter";

const LAST_UPDATED = "2025. gada 1. janvāris";
const POLICY_VERSION = "1.0";
const COMPANY_NAME = "Market Network SIA";
const COMPANY_REG = "40000000000";
const COMPANY_ADDRESS = "Brīvības iela 1, Rīga, LV-1001, Latvija";
const CONTACT_EMAIL = "info@market-network.lv";
const LEGAL_EMAIL = "legal@market-network.lv";
const GOVERNING_LAW = "Latvijas Republika";

export default function TermsOfService() {
  return (
    <NavLayout userType="candidate">
      <div className="container py-10 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lietošanas noteikumi</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                  Versija {POLICY_VERSION}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Stājas spēkā: {LAST_UPDATED}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground leading-relaxed">
            Lūdzu, uzmanīgi izlasiet šos lietošanas noteikumus pirms Market Network platformas izmantošanas.
            Reģistrējoties vai izmantojot platformu, jūs piekrītat šiem noteikumiem.
            Ja jūs nepiekrītat kādam no noteikumiem, lūdzu, neizmantojiet platformu.
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <Section number="1" title="Vispārīgie noteikumi">
            <p>
              Šie lietošanas noteikumi ("Noteikumi") regulē jūsu piekļuvi un izmantošanu Market Network platformai
              ("Platforma"), ko nodrošina <strong>{COMPANY_NAME}</strong>, reģistrācijas Nr. {COMPANY_REG},
              juridiskā adrese: {COMPANY_ADDRESS} ("Uzņēmums", "mēs").
            </p>
            <p>
              Platforma ir divpusējs darba tirgus starpnieks, kas izmanto mākslīgā intelekta tehnoloģijas, lai
              savienotu darba meklētājus ("Kandidāti") ar darba devējiem ("Darba devēji") Latvijas un Baltijas tirgū.
            </p>
          </Section>

          <Section number="2" title="Konta reģistrācija un lietotāju veidi">
            <p className="mb-3">
              Platforma piedāvā divus lietotāju veidus ar atšķirīgām tiesībām un pienākumiem:
            </p>
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Aspekts</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Kandidāts</th>
                  <th className="text-left py-2 font-semibold text-foreground">Darba devējs</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Izmaksas", "Bezmaksas", "Abonementa maksa (skatīt 5. sadaļu)"],
                  ["Profila redzamība", "Anonīma līdz piekrišanai", "Uzņēmuma profils redzams"],
                  ["Galvenā funkcija", "Darba meklēšana un atbilstību saņemšana", "Kandidātu meklēšana un vakances publicēšana"],
                  ["Datu apstrāde", "Kā datu subjekts", "Kā datu pārzinis un apstrādātājs"],
                ].map(([aspect, candidate, employer]) => (
                  <tr key={aspect} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium text-foreground/80">{aspect}</td>
                    <td className="py-2 pr-4">{candidate}</td>
                    <td className="py-2">{employer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Reģistrējoties, jūs apliecināt, ka esat vismaz 16 gadus vecs, sniedzat precīzu informāciju un
              uzturēsiet sava konta datus aktuālus. Katrai fiziskajai vai juridiskajai personai ir atļauts
              reģistrēt tikai vienu kontu katrā kategorijā.
            </p>
          </Section>

          <Section number="3" title="Kandidātu tiesības un pienākumi">
            <p className="font-semibold text-foreground mb-2">Tiesības:</p>
            <ul className="space-y-1 text-muted-foreground mb-4">
              {[
                "Bezmaksas piekļuve platformai un AI atbilstību meklēšanai",
                "Pilnīga kontrole pār profila redzamību — darba devēji redz tikai anonīmu profilu",
                "Tiesības atteikties no jebkuras atbilstības vai intervijas",
                "Tiesības atsaukt piekrišanu profila atklāšanai jebkurā laikā",
                "Tiesības saņemt paziņojumus par 90%+ atbilstībām",
                "Visas VDAR tiesības (skatīt Privātuma politiku)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <span className="text-primary mt-0.5">✓</span>{item}
                </li>
              ))}
            </ul>
            <p className="font-semibold text-foreground mb-2">Pienākumi:</p>
            <ul className="space-y-1 text-muted-foreground">
              {[
                "Sniegt precīzu un patiesu informāciju profilā un CV",
                "Nekavējoties atjaunināt profilu, ja mainās informācija",
                "Neizmantot platformu krāpnieciskiem vai nelikumīgiem mērķiem",
                "Neizmantot automatizētus rīkus vai botu skriptus bez rakstiskas atļaujas",
                "Ievērot citu lietotāju privātumu un neizpaust saņemto informāciju",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <span className="text-amber-400 mt-0.5">!</span>{item}
                </li>
              ))}
            </ul>
          </Section>

          <Section number="4" title="Darba devēju tiesības un pienākumi">
            <p className="mb-3">
              Darba devēji izmanto platformu kā B2B SaaS pakalpojumu, lai atrastu atbilstošus kandidātus.
            </p>
            <p className="font-semibold text-foreground mb-2">Tiesības:</p>
            <ul className="space-y-1 text-muted-foreground mb-4">
              {[
                "Publicēt vakances un izmantot AI vakances apraksta parsēšanu",
                "Apskatīt anonīmus kandidātu profilus (tikai ar kandidāta piekrišanu)",
                "Saņemt AI aprēķinātas atbilstības ar procentuālu rādītāju",
                "Piekļūt pilnam kandidāta profilam pēc AI intervijas pabeigšanas un kandidāta piekrišanas",
                "Izmantot Job Sentinel skrāpēšanas funkciju vakances publicēšanai",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <span className="text-primary mt-0.5">✓</span>{item}
                </li>
              ))}
            </ul>
            <p className="font-semibold text-foreground mb-2">Pienākumi:</p>
            <ul className="space-y-1 text-muted-foreground">
              {[
                "Publicēt tikai likumīgas un reālas vakances",
                "Ievērot Darba likumu un nediskriminācijas principus vakancēs",
                "Neizmantot kandidātu datus citiem mērķiem, kā norādīts DPA",
                "Nekontaktēties ar kandidātiem ārpus platformas bez viņu piekrišanas",
                "Paziņot mums par datu pārkāpumiem 72 stundu laikā (VDAR 33. pants)",
                "Savlaicīgi veikt abonēšanas maksājumus",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs">
                  <span className="text-amber-400 mt-0.5">!</span>{item}
                </li>
              ))}
            </ul>
          </Section>

          <Section number="5" title="Abonēšana un maksājumi">
            <p className="mb-3">
              Kandidātiem platforma ir bezmaksas. Darba devējiem tiek piedāvāti šādi abonēšanas plāni:
            </p>
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Plāns</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Cena/mēnesī</th>
                  <th className="text-left py-2 font-semibold text-foreground">Galvenās funkcijas</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Sākuma", "€49", "3 vakances, 10 kandidātu skatījumi, AI atbilstības"],
                  ["Profesionālais", "€149", "Neierobežotas vakances, 50 skatījumi, prioritāra atbalsts"],
                  ["Uzņēmuma", "€499", "Neierobežots viss, API piekļuve, pielāgots DPA"],
                ].map(([plan, price, features]) => (
                  <tr key={plan} className="border-b border-border/30">
                    <td className="py-2 pr-4 font-medium text-foreground/80">{plan}</td>
                    <td className="py-2 pr-4 text-primary font-semibold">{price}</td>
                    <td className="py-2">{features}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-2 text-muted-foreground text-xs">
              <p><strong className="text-foreground">Atcelšana:</strong> Abonementu var atcelt jebkurā laikā. Piekļuve saglabājas līdz apmaksātā perioda beigām. Atmaksa netiek veikta par jau apmaksātiem periodiem, izņemot gadījumus, kad mēs esam pārkāpuši šos noteikumus.</p>
              <p><strong className="text-foreground">Cenu izmaiņas:</strong> Par cenu izmaiņām mēs paziņosim vismaz 30 dienas iepriekš. Esošie abonenti saglabā pašreizējo cenu līdz nākamajam atjaunošanas periodam.</p>
              <p><strong className="text-foreground">Maksājumu apstrāde:</strong> Maksājumus apstrādā Stripe Inc. Mēs neglabājam kartes datus. Uz maksājumiem attiecas Stripe lietošanas noteikumi.</p>
            </div>
          </Section>

          <Section number="6" title="AI funkcijas un to ierobežojumi">
            <p className="mb-3">
              Platforma izmanto mākslīgā intelekta tehnoloģijas vairākās funkcijās. Ir svarīgi saprast šo
              funkciju raksturu un ierobežojumus:
            </p>
            <div className="space-y-3">
              {[
                {
                  title: "AI atbilstību aprēķins (0–100%)",
                  desc: "Atbilstības rādītājs ir algoritmisks novērtējums, kas balstīts uz prasmēm, pieredzi, algu un atrašanās vietu. Tas nav garantija par darba piedāvājumu vai pieņemšanu darbā. Darba devēji un kandidāti paši pieņem galīgos lēmumus.",
                },
                {
                  title: "AI CV parsēšana",
                  desc: "AI automātiski iegūst informāciju no CV failiem. Mēs iesakām pārskatīt un labot iegūtos datus, jo AI var pieļaut kļūdas, īpaši nestandarta CV formātos.",
                },
                {
                  title: "AI intervijas jautājumi",
                  desc: "AI ģenerē kontekstuālus kvalificēšanas jautājumus, pamatojoties uz vakances aprakstu. Šie jautājumi ir informatīvi un nav juridiski saistoši. Darba devējs var pievienot papildu jautājumus.",
                },
                {
                  title: "Job Sentinel skrāpēšana",
                  desc: "Skrāpēšanas funkcija vāc publiski pieejamu informāciju no darba sludinājumu vietnēm. Mēs negarantējam skrāpēto datu precizitāti vai aktualitāti. Izmantojot šo funkciju, jūs piekrītat, ka dati var būt novecojuši.",
                },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-xl bg-accent/20">
                  <p className="font-semibold text-foreground text-xs mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section number="7" title="Anonimitātes slānis un profila atklāšana">
            <p className="mb-3">
              Kandidātu anonimitāte ir platformas pamatprincipu daļa:
            </p>
            <ul className="space-y-2 text-muted-foreground text-xs">
              {[
                "Kandidāti darba devējiem vienmēr ir redzami kā anonīmi profili (prasmes, pieredze, algas vēlmes), kamēr kandidāts nav devis skaidru piekrišanu identitātes atklāšanai.",
                "Profila atklāšana notiek tikai pēc: (1) kandidāts ir pabeidzis AI interviju, un (2) kandidāts ir skaidri apstiprinājis profila atklāšanu konkrētajam darba devējam.",
                "Darba devēji nedrīkst mēģināt identificēt kandidātus, izmantojot anonīmajā profilā sniegto informāciju.",
                "Ja darba devējs pārkāpj anonimitātes noteikumus, mēs paturam tiesības nekavējoties apturēt viņa kontu.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">{i + 1}.</span>{item}
                </li>
              ))}
            </ul>
          </Section>

          <Section number="8" title="Intelektuālais īpašums">
            <p>
              Platforma, tās dizains, kods, algoritmi un saturs ir {COMPANY_NAME} intelektuālais īpašums,
              aizsargāts ar autortiesību un citu intelektuālā īpašuma tiesību normām.
              Jūs saņemat ierobežotu, neekskluzīvu, nenododamu licenci izmantot platformu saskaņā ar šiem
              noteikumiem. Jūs saglabājat visas tiesības uz savu CV, profila saturu un citiem jūsu iesniegtajiem
              materiāliem, taču piešķirat mums licenci apstrādāt šos datus platformas darbībai.
            </p>
          </Section>

          <Section number="9" title="Atbildības ierobežojumi">
            <p className="mb-3">
              Ciktāl to pieļauj piemērojamie tiesību akti:
            </p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              {[
                "Mēs negarantējam, ka platforma būs nepārtraukti pieejama vai bez kļūdām.",
                "Mēs neesam atbildīgi par darba attiecībām, kas veidojas starp kandidātiem un darba devējiem.",
                "Mēs neesam atbildīgi par AI aprēķinu precizitāti vai par lēmumiem, kas pieņemti, pamatojoties uz tiem.",
                "Mūsu kopējā atbildība nepārsniedz summu, ko jūs esat samaksājis par pakalpojumiem pēdējo 12 mēnešu laikā.",
                "Mēs neesam atbildīgi par netiešiem, nejaušiem vai izrietošiem zaudējumiem.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">!</span>{item}
                </li>
              ))}
            </ul>
          </Section>

          <Section number="10" title="Konta apturēšana un izbeigšana">
            <p className="mb-3">
              Mēs paturam tiesības apturēt vai izbeigt jūsu kontu šādos gadījumos:
            </p>
            <ul className="space-y-1 text-muted-foreground text-xs mb-3">
              {[
                "Šo noteikumu pārkāpums",
                "Viltus vai maldinošas informācijas sniegšana",
                "Krāpnieciskas darbības vai platformas ļaunprātīga izmantošana",
                "Darba devēja gadījumā — abonēšanas maksājumu kavēšana vairāk par 30 dienām",
                "Tiesas rīkojums vai regulatīva prasība",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">×</span>{item}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-xs">
              Jūs varat jebkurā laikā dzēst savu kontu, izmantojot{" "}
              <Link href="/gdpr" className="text-primary underline">GDPR Centru</Link>.
              Pēc konta dzēšanas dati tiek apstrādāti saskaņā ar Privātuma politikas 6. sadaļu.
            </p>
          </Section>

          <Section number="11" title="Strīdu izšķiršana un piemērojamie tiesību akti">
            <p>
              Šie noteikumi tiek regulēti un interpretēti saskaņā ar <strong>{GOVERNING_LAW}</strong> tiesību aktiem.
              Strīdi, kas rodas saistībā ar šiem noteikumiem, tiks izskatīti {GOVERNING_LAW}s tiesās.
              Pirms tiesas procesa uzsākšanas puses apņemas mēģināt atrisināt strīdu sarunu ceļā 30 dienu laikā.
              Patērētāju strīdus var iesniegt arī Patērētāju tiesību aizsardzības centrā (PTAC).
            </p>
          </Section>

          <Section number="12" title="Izmaiņas noteikumos">
            <p>
              Mēs varam laiku pa laikam atjaunināt šos noteikumus. Par būtiskām izmaiņām mēs paziņosim
              vismaz 30 dienas iepriekš, nosūtot e-pasta paziņojumu vai publicējot paziņojumu platformā.
              Turpinot izmantot platformu pēc izmaiņu stāšanās spēkā, jūs piekrītat atjauninātajiem noteikumiem.
            </p>
          </Section>

          <Section number="13" title="Kontaktinformācija">
            <p className="mb-3">
              Ja jums ir jautājumi par šiem noteikumiem, lūdzu, sazinieties ar mums:
            </p>
            <div className="p-3 rounded-xl bg-accent/20 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">{COMPANY_NAME}</p>
              <p>{COMPANY_ADDRESS}</p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-primary" />
                Vispārīgi jautājumi:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-primary" />
                Juridiski jautājumi:{" "}
                <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary underline">{LEGAL_EMAIL}</a>
              </p>
            </div>
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
