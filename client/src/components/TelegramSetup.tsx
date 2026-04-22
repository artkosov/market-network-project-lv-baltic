import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, CheckCircle2, ExternalLink, Info, Copy } from "lucide-react";

interface TelegramSetupProps {
  currentChatId?: string | null;
  onSave?: (chatId: string) => void;
}

export default function TelegramSetup({ currentChatId, onSave }: TelegramSetupProps) {
  const [chatId, setChatId] = useState(currentChatId ?? "");
  const [saving, setSaving] = useState(false);
  const BOT_USERNAME = "MarketNetworkLVBot";
  const BOT_LINK = `https://t.me/${BOT_USERNAME}`;

  const handleSave = async () => {
    if (!chatId.trim()) {
      toast.error("Lūdzu ievadiet Telegram Chat ID");
      return;
    }
    setSaving(true);
    try {
      if (onSave) await onSave(chatId.trim());
      toast.success("Telegram paziņojumi konfigurēti!");
    } catch {
      toast.error("Kļūda saglabājot Telegram konfigurāciju");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("/start");
    toast.success("Komanda nokopēta!");
  };

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-4 h-4 text-primary" />
          Telegram paziņojumi
          {currentChatId && (
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs ml-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />Aktīvs
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Saņem tūlītējus paziņojumus par jaunām atbilstībām Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Setup steps */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-sm font-medium">Atver Market Network botu</p>
              <p className="text-xs text-muted-foreground mb-2">Noklikšķini uz pogas zemāk, lai atvērtu botu Telegram</p>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <a href={BOT_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3 h-3 mr-1.5" />
                  Atvērt @{BOT_USERNAME}
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-sm font-medium">Nosūti komandu botam</p>
              <p className="text-xs text-muted-foreground mb-2">Telegram botam nosūti šo komandu:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">/start</code>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopy}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Ievadi savu Chat ID</p>
              <p className="text-xs text-muted-foreground mb-2">Bots atbildēs ar tavu Chat ID numuru</p>
              <div className="flex gap-2">
                <Input
                  className="bg-input/50 text-sm"
                  placeholder="Piemēram: 123456789"
                  value={chatId}
                  onChange={e => setChatId(e.target.value)}
                />
                <Button
                  onClick={handleSave}
                  disabled={saving || !chatId.trim()}
                  size="sm"
                  className="bg-primary text-primary-foreground flex-shrink-0"
                >
                  {saving ? "Saglabā..." : "Saglabāt"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {currentChatId && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">Telegram paziņojumi aktīvi</p>
              <p className="text-xs text-muted-foreground">Chat ID: {currentChatId}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Paziņojumi tiks nosūtīti, kad AI atradīs 90%+ atbilstību vai kad darba devējs pieprasa profila atklāšanu.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
