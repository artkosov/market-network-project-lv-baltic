import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Shield, Trash2, Download, Eye, Clock, CheckCircle2,
  XCircle, AlertTriangle, Lock, FileText, Users, Mail,
  Brain, Info
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";

const ACTION_LABELS: Record<string, string> = {
  consent_given: "Piekrišana dota",
  consent_withdrawn: "Piekrišana atsaukta",
  data_export_requested: "Datu eksports pieprasīts",
  data_deletion_requested: "Datu dzēšana pieprasīta",
  data_deleted: "Dati dzēsti",
  profile_unlocked: "Profils atklāts darba devējam",
  profile_viewed: "Profils apskatīts",
  data_accessed: "Dati piekļūti",
};

const ACTION_COLORS: Record<string, string> = {
  consent_given: "text-green-400",
  consent_withdrawn: "text-amber-400",
  data_deletion_requested: "text-red-400",
  data_deleted: "text-red-500",
  profile_unlocked: "text-primary",
  profile_viewed: "text-blue-400",
  data_export_requested: "text-purple-400",
  data_accessed: "text-muted-foreground",
};

export default function GdprCenter() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: consentStatus, isLoading: consentLoading } = trpc.gdpr.getConsentStatus.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: auditLog } = trpc.gdpr.getAuditLog.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { refetch: fetchExport, isFetching: exportLoading } =
    trpc.gdpr.exportMyData.useQuery(undefined, { enabled: false });

  const updateCandidateConsent = trpc.gdpr.updateCandidateConsent.useMutation({
    onSuccess: () => {
      utils.gdpr.getConsentStatus.invalidate();
      utils.gdpr.getAuditLog.invalidate();
    },
  });
  const updateEmployerConsent = trpc.gdpr.updateEmployerConsent.useMutation({
    onSuccess: () => {
      utils.gdpr.getConsentStatus.invalidate();
      utils.gdpr.getAuditLog.invalidate();
    },
  });
  const requestDeletion = trpc.gdpr.requestDataDeletion.useMutation({
    onSuccess: () => {
      utils.gdpr.getConsentStatus.invalidate();
      toast.success("Datu dzēšanas pieprasījums nosūtīts. Jūsu dati tiks dzēsti 30 dienu laikā.");
    },
  });

  const [deletionConfirm, setDeletionConfirm] = useState(false);

  const handleCandidateToggle = async (field: "platform" | "matching" | "employerView" | "marketing", value: boolean) => {
    try {
      await updateCandidateConsent.mutateAsync({ [field]: value });
      toast.success(value ? "Piekrišana dota" : "Piekrišana atsaukta");
    } catch {
      toast.error("Kļūda atjaunojot piekrišanu");
    }
  };

  const handleEmployerToggle = async (field: "platform" | "dpaAccepted" | "marketing", value: boolean) => {
    try {
      await updateEmployerConsent.mutateAsync({ [field]: value });
      toast.success(value ? "Piekrišana dota" : "Piekrišana atsaukta");
    } catch {
      toast.error("Kļūda atjaunojot piekrišanu");
    }
  };

  const handleExport = async () => {
    const result = await fetchExport();
    if (result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `market-network-mani-dati-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Datu eksports lejupielādēts");
    }
  };

  const handleDeletion = async () => {
    if (!deletionConfirm) {
      setDeletionConfirm(true);
      return;
    }
    try {
      await requestDeletion.mutateAsync();
    } catch {
      toast.error("Kļūda nosūtot pieprasījumu");
    } finally {
      setDeletionConfirm(false);
    }
  };

  const isCandidate = consentStatus?.userType === "candidate";
  const isEmployer = consentStatus?.userType === "employer";

  return (
    <NavLayout userType={isCandidate ? "candidate" : "employer"}>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GDPR Privātuma centrs</h1>
              <p className="text-muted-foreground text-sm">Pārvaldi savus datus un piekrišanas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Saskaņā ar ES Vispārīgo datu aizsardzības regulu (VDAR/GDPR), jums ir tiesības kontrolēt savus personas datus.
              Politikas versija: <strong className="text-foreground">v{consentStatus?.consentVersion ?? "1.0"}</strong>.
              Skatīt:{" "}
              <Link href="/privatuma-politika" className="text-primary underline">Privātuma politiku</Link>
              {" "}un{" "}
              <Link href="/lietosanas-noteikumi" className="text-primary underline">Lietošanas noteikumus</Link>.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {isCandidate && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-primary" />
                  Piekrišanas pārvaldība — Kandidāts
                </CardTitle>
                <CardDescription>
                  Katra piekrišana ir neatkarīga. Jūs varat to atsaukt jebkurā laikā.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <ConsentRow
                  icon={<Shield className="w-4 h-4" />}
                  title="Platformas izmantošana"
                  description="Nepieciešams, lai izmantotu Market Network. Bez šīs piekrišanas konts tiek deaktivizēts."
                  value={consentStatus?.platform ?? false}
                  required
                  onChange={(v) => handleCandidateToggle("platform", v)}
                  loading={updateCandidateConsent.isPending}
                  grantedAt={consentStatus?.platformAt}
                />
                <Separator className="my-0 opacity-30" />
                <ConsentRow
                  icon={<Brain className="w-4 h-4" />}
                  title="AI atbilstību meklēšana"
                  description="Ļauj mūsu AI analizēt jūsu profilu un saskaņot ar vakancēm. Bez šīs piekrišanas atbilstības netiek aprēķinātas."
                  value={consentStatus?.matching ?? false}
                  onChange={(v) => handleCandidateToggle("matching", v)}
                  loading={updateCandidateConsent.isPending}
                  grantedAt={consentStatus?.matchingAt}
                />
                <Separator className="my-0 opacity-30" />
                <ConsentRow
                  icon={<Users className="w-4 h-4" />}
                  title="Anonīms profils darba devējiem"
                  description="Ļauj darba devējiem redzēt jūsu anonīmo profilu (prasmes, pieredze, algas vēlmes). Jūsu identitāte paliek slēpta līdz jūs to atklājat."
                  value={consentStatus?.employerView ?? false}
                  onChange={(v) => handleCandidateToggle("employerView", v)}
                  loading={updateCandidateConsent.isPending}
                  disabled={!(consentStatus?.matching ?? false)}
                  disabledReason="Nepieciešama AI atbilstību meklēšanas piekrišana"
                  grantedAt={consentStatus?.employerViewAt}
                />
                <Separator className="my-0 opacity-30" />
                <ConsentRow
                  icon={<Mail className="w-4 h-4" />}
                  title="Mārketinga paziņojumi"
                  description="Saņemt e-pastus par jaunām funkcijām, darba tirgus ieskatiem un platformas jaunumiem. Nav obligāts."
                  value={consentStatus?.marketing ?? false}
                  onChange={(v) => handleCandidateToggle("marketing", v)}
                  loading={updateCandidateConsent.isPending}
                  grantedAt={consentStatus?.marketingAt}
                />
              </CardContent>
            </Card>
          )}

          {isEmployer && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-primary" />
                  Piekrišanas pārvaldība — Darba devējs
                </CardTitle>
                <CardDescription>
                  Darba devēja piekrišanas un datu apstrādes līgums (DPA).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <ConsentRow
                  icon={<Shield className="w-4 h-4" />}
                  title="Platformas lietošanas noteikumi"
                  description="Piekrišana Market Network lietošanas noteikumiem un privātuma politikai."
                  value={consentStatus?.platform ?? false}
                  required
                  onChange={(v) => handleEmployerToggle("platform", v)}
                  loading={updateEmployerConsent.isPending}
                  grantedAt={consentStatus?.platformAt}
                />
                <Separator className="my-0 opacity-30" />
                <ConsentRow
                  icon={<FileText className="w-4 h-4" />}
                  title="Datu apstrādes līgums (DPA)"
                  description="Saskaņā ar VDAR 28. pantu, kā datu apstrādātājs mēs apstrādājam kandidātu datus jūsu vārdā. DPA piekrišana ir obligāta AI atbilstību funkcijām."
                  value={(consentStatus as any)?.dpaAccepted ?? false}
                  required
                  onChange={(v) => handleEmployerToggle("dpaAccepted", v)}
                  loading={updateEmployerConsent.isPending}
                  grantedAt={(consentStatus as any)?.dpaAcceptedAt}
                />
                <Separator className="my-0 opacity-30" />
                <ConsentRow
                  icon={<Mail className="w-4 h-4" />}
                  title="Mārketinga paziņojumi"
                  description="Saņemt e-pastus par jaunām funkcijām, darba tirgus ieskatiem un platformas jaunumiem."
                  value={consentStatus?.marketing ?? false}
                  onChange={(v) => handleEmployerToggle("marketing", v)}
                  loading={updateEmployerConsent.isPending}
                  grantedAt={consentStatus?.marketingAt}
                />
              </CardContent>
            </Card>
          )}

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4 text-primary" />
                Jūsu VDAR tiesības
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RightRow
                icon={<Eye className="w-4 h-4" />}
                article="VDAR 15. pants"
                title="Piekļuves tiesības"
                desc="Jums ir tiesības apskatīt visus savus datus, ko mēs glabājam."
              />
              <RightRow
                icon={<Download className="w-4 h-4" />}
                article="VDAR 20. pants"
                title="Datu pārnesamība"
                desc="Varat lejupielādēt visus savus datus mašīnlasāmā JSON formātā."
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 gap-1.5 hover:border-primary/40"
                    onClick={handleExport}
                    disabled={exportLoading}
                  >
                    <Download className="w-3 h-3" />
                    {exportLoading ? "Gatavo..." : "Eksportēt"}
                  </Button>
                }
              />
              <RightRow
                icon={<FileText className="w-4 h-4" />}
                article="VDAR 16. pants"
                title="Labošanas tiesības"
                desc="Varat labot neprecīzus datus savā profilā jebkurā laikā."
                action={
                  <Button size="sm" variant="outline" asChild className="flex-shrink-0 gap-1.5">
                    <Link href={isCandidate ? "/kandidats/profils" : "/darbadevetajs/profils"}>
                      Labot profilu
                    </Link>
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {isCandidate && consentStatus?.pseudonymousId && (
            <Card className="glass-card border-primary/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Jūsu anonīmais identifikators</p>
                  <p className="text-xs text-muted-foreground">
                    Darba devēji redz jūs kā:{" "}
                    <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {consentStatus.pseudonymousId}
                    </code>
                  </p>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0 border-primary/20 text-primary">
                  Pseudonimizēts
                </Badge>
              </CardContent>
            </Card>
          )}

          {!(consentStatus?.deletionRequested) ? (
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-red-400">
                  <Trash2 className="w-4 h-4" />
                  Datu dzēšana (VDAR 17. pants)
                </CardTitle>
                <CardDescription>
                  Pieprasot datu dzēšanu, visi jūsu personas dati tiks neatgriezeniski dzēsti 30 dienu laikā.
                  Visas aktīvās atbilstības un intervijas tiks pārtrauktas nekavējoties.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deletionConfirm ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">
                        <strong>Vai tiešām vēlaties dzēst visus savus datus?</strong> Šī darbība ir neatgriezeniska.
                        Jūsu profils, atbilstības un interviju vēsture tiks neatgriezeniski dzēsta.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDeletion}
                        disabled={requestDeletion.isPending}
                      >
                        {requestDeletion.isPending ? "Apstrādā..." : "Jā, dzēst manus datus"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeletionConfirm(false)}>
                        Atcelt
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 gap-2"
                    onClick={handleDeletion}
                  >
                    <Trash2 className="w-4 h-4" />
                    Pieprasīt datu dzēšanu
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-amber-400">Datu dzēšana ieplānota</p>
                  <p className="text-xs text-muted-foreground">
                    Jūsu pieprasījums saņemts. Dati tiks dzēsti 30 dienu laikā.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-primary" />
                Apstrādes darbību žurnāls (VDAR 30. pants)
              </CardTitle>
              <CardDescription>
                Pilns ieraksts par visām darbībām ar jūsu datiem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(auditLog ?? []).length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {[...(auditLog ?? [])].reverse().map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/20 text-sm gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${(ACTION_COLORS[entry.action] ?? "text-muted-foreground").replace("text-", "bg-")}`} />
                        <span className={`font-medium truncate ${ACTION_COLORS[entry.action] ?? "text-foreground"}`}>
                          {ACTION_LABELS[entry.action] ?? entry.action}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(entry.createdAt).toLocaleString("lv-LV")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nav žurnāla ierakstu vēl</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </NavLayout>
  );
}

function ConsentRow({
  icon, title, description, value, required, onChange, loading, disabled, disabledReason, grantedAt
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  required?: boolean;
  onChange: (v: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  grantedAt?: Date | null;
}) {
  return (
    <div className={`flex items-start gap-4 py-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{title}</p>
          {required && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary/20 text-primary">Obligāts</Badge>
          )}
          {value && grantedAt && (
            <span className="text-xs text-muted-foreground">
              · {new Date(grantedAt).toLocaleDateString("lv-LV")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        {disabled && disabledReason && (
          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />{disabledReason}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        {value ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <Switch
          checked={value}
          onCheckedChange={onChange}
          disabled={loading || disabled}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
}

function RightRow({
  icon, article, title, desc, action
}: {
  icon: React.ReactNode;
  article: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-sm">{title}</p>
          <Badge variant="outline" className="text-xs px-1.5 py-0 border-border text-muted-foreground">{article}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
