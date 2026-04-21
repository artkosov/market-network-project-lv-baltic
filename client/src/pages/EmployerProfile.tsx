import NavLayout from "@/components/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export default function EmployerProfile() {
  const { isAuthenticated } = useAuth();
  const { data: profile, refetch } = trpc.employer.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const upsert = trpc.employer.upsertProfile.useMutation();
  const [form, setForm] = useState({ companyName: "", companySize: "1-10" as string, industry: "", website: "", description: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ companyName: profile.companyName ?? "", companySize: profile.companySize ?? "1-10", industry: profile.industry ?? "", website: profile.website ?? "", description: profile.description ?? "", city: profile.city ?? "" });
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try { await upsert.mutateAsync(form as any); toast.success("Profils saglabāts!"); refetch(); }
    catch { toast.error("Kļūda"); } finally { setSaving(false); }
  };

  return (
    <NavLayout userType="employer">
      <div className="container py-8 max-w-2xl">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Uzņēmuma profils</h1><p className="text-muted-foreground">Aizpildi informāciju par savu uzņēmumu</p></div>
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Uzņēmuma informācija</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Uzņēmuma nosaukums *</Label><Input className="mt-1 bg-input/50" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="SIA Mans Uzņēmums" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nozare</Label><Input className="mt-1 bg-input/50" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="IT, Loģistika..." /></div>
              <div><Label>Uzņēmuma lielums</Label>
                <Select value={form.companySize} onValueChange={v => setForm(f => ({ ...f, companySize: v }))}>
                  <SelectTrigger className="mt-1 bg-input/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1-10","11-50","51-200","201-500","500+"].map(s => <SelectItem key={s} value={s}>{s} darbinieki</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Mājaslapa</Label><Input className="mt-1 bg-input/50" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://uznemums.lv" /></div>
            <div><Label>Pilsēta</Label><Input className="mt-1 bg-input/50" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Rīga" /></div>
            <div><Label>Apraksts</Label><Textarea className="mt-1 bg-input/50 resize-none" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Pastāsti par savu uzņēmumu..." /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground">{saving ? "Saglabā..." : "Saglabāt"}</Button>
          </CardContent>
        </Card>
      </div>
    </NavLayout>
  );
}
