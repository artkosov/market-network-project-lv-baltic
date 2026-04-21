import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield, Trash2, Download, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function GdprCenter() {
  const { isAuthenticated } = useAuth();
  const { data: gdprLog } = trpc.candidate.getGdprLog.useQuery(undefined, { enabled: isAuthenticated });
  const requestDeletion = trpc.candidate.requestDataDeletion.useMutation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Vai tiešam vēlaties pieprasīt datu dzēšanu? Šī darbība ir neatgriezeniska.")) return;
    setDeleting(true);
    try {
      await requestDeletion.mutateAsync();
      toast.success("Datu dzēšanas pieprasījums nosūtīts. Jūsu dati tiks dzēsti 30 dienu laikā.");
    } catch { toast.error("Kļūda"); } finally { setDeleting(false); }
  };

  const actionLabels: Record<string, string> = {
    consent_given: "Piekrišana dota",
    consent_withdrawn: "Piekrišana atsaukta",
    data_deletion_requested: "Datu dzēšana pieprasīta",
    profile_viewed: "Profils apskatīts",
    profile_unlocked: "Profils atklāts",
  };

  return (
    <NavLayout userType="candidate">
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Shield className="w-8 h-8 text-primary" />GDPR Centrs</h1>
          <p className="text-muted-foreground">Pārvaldi savus datus un privātuma iestatījumus</p>
        </div>
        <div className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" />Jūsu tiesības</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: <Eye className="w-4 h-4" />, title: "Piekļuves tiesības", desc: "Jums ir tiesības apskatīt visus savus datus, ko mēs glabājam." },
                { icon: <Download className="w-4 h-4" />, title: "Datu pārnesamība", desc: "Varat pieprasīt savu datu eksportu mašīnlasāmā formātā." },
                { icon: <Trash2 className="w-4 h-4" />, title: "Tiesības tikt aizmirstam", desc: "Varat pieprasīt visu savu datu dzēšanu no mūsu sistēmas." },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/30">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{item.icon}</div>
                  <div><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="glass-card border-red-500/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><Trash2 className="w-5 h-5" />Datu dzēšana</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Pieprasot datu dzēšanu, visi jūsu personiskie dati tiks neatgriezeniski dzēsti 30 dienu laikā. Šī darbība nevar tikt atsaukta.</p>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-2" />{deleting ? "Apstrādā..." : "Pieprasīt datu dzēšanu"}
              </Button>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Audita žurnāls</CardTitle></CardHeader>
            <CardContent>
              {(gdprLog ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(gdprLog ?? []).map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/20 text-sm">
                      <span className="font-medium">{actionLabels[entry.action] ?? entry.action}</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString("lv-LV")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nav ierakstu vēl</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </NavLayout>
  );
}
