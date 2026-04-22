import NavLayout from "@/components/NavLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MessageSquare, CheckCircle, Send, Eye, Sparkles } from "lucide-react";

export default function Interview() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const params = useParams<{ matchId: string }>();
  const [, navigate] = useLocation();
  const matchId = parseInt(params.matchId ?? "0");

  const startInterview = trpc.interview.startInterview.useMutation();
  const submitAnswers = trpc.interview.submitAnswers.useMutation();
  const unlockProfile = trpc.interview.unlockProfile.useMutation();

  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [phase, setPhase] = useState<"loading" | "interview" | "result" | "unlock">("loading");
  const [result, setResult] = useState<{ approved: boolean; evaluation: string } | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (isAuthenticated && matchId) {
      startInterview.mutateAsync({ matchId }).then(res => {
        setInterviewId(res.interviewId);
        setQuestions(res.questions as string[]);
        setAnswers(new Array(res.questions.length).fill(""));
        setPhase("interview");
      }).catch(() => {
        toast.error(t("interview.startError", { defaultValue: "Neizdevas sākt interviju" }));
        navigate("/kandidats");
      });
    }
  }, [isAuthenticated, matchId]);

  const handleSubmit = async () => {
    const qa = questions.map((q, i) => ({ question: q, answer: answers[i] ?? "" }));
    if (qa.some(a => !a.answer.trim())) {
      toast.error(t("interview.answerAll", { defaultValue: "Lūdzu atbildi uz visiem jautājumiem" }));
      return;
    }
    try {
      const res = await submitAnswers.mutateAsync({ interviewId: interviewId!, answers: qa });
      setResult({ approved: res.approved, evaluation: res.evaluation });
      setPhase(res.approved ? "unlock" : "result");
    } catch {
      toast.error(t("interview.submitError", { defaultValue: "Kļūda iesniedzot atbildes" }));
    }
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await unlockProfile.mutateAsync({ matchId });
      toast.success(t("interview.profileUnlocked", { defaultValue: "Profils atklāts darba devējam!" }));
      navigate("/kandidats/atbilstibas");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUnlocking(false);
    }
  };

  if (phase === "loading") return (
    <NavLayout userType="candidate">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">{t("interview.preparingQuestions", { defaultValue: "AI gatavo jautājumus..." })}</p>
        </div>
      </div>
    </NavLayout>
  );

  return (
    <NavLayout userType="candidate">
      <div className="container py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("interview.title")}</h1>
          <p className="text-muted-foreground">{t("interview.desc")}</p>
        </div>

        {phase === "interview" && (
          <div className="space-y-6">
            {questions.map((q, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="font-medium leading-relaxed">{q}</p>
                  </div>
                  <Textarea
                    className="bg-input/50 resize-none"
                    rows={3}
                    placeholder={t("interview.placeholder")}
                    value={answers[i] ?? ""}
                    onChange={e => {
                      const a = [...answers];
                      a[i] = e.target.value;
                      setAnswers(a);
                    }}
                  />
                </CardContent>
              </Card>
            ))}
            <Button
              onClick={handleSubmit}
              disabled={submitAnswers.isPending}
              className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitAnswers.isPending
                ? t("interview.evaluating", { defaultValue: "AI vērtē..." })
                : t("interview.submit")}
            </Button>
          </div>
        )}

        {(phase === "result" || phase === "unlock") && result && (
          <Card className={`glass-card border-2 ${result.approved ? "border-green-500/30" : "border-red-500/30"}`}>
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.approved ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                {result.approved
                  ? t("interview.successTitle", { defaultValue: "Intervija veiksmīga!" })
                  : t("interview.completedTitle", { defaultValue: "Intervija pabeigta" })}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">{result.evaluation}</p>
              {phase === "unlock" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {t("interview.unlockQuestion", { defaultValue: "Vai vēlaties atklāt savu pilno profilu darba devējam?" })}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleUnlock} disabled={unlocking} className="bg-primary text-primary-foreground">
                      <Eye className="w-4 h-4 mr-2" />
                      {unlocking
                        ? t("interview.unlocking", { defaultValue: "Atklāj..." })
                        : t("interview.yesUnlock", { defaultValue: "Jā, atklāt profilu" })}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/kandidats/atbilstibas")}>
                      {t("interview.notYet", { defaultValue: "Vēl ne" })}
                    </Button>
                  </div>
                </div>
              )}
              {phase === "result" && (
                <Button onClick={() => navigate("/kandidats/atbilstibas")} variant="outline">
                  {t("interview.backToMatches", { defaultValue: "Atpakaļ uz atbilstībām" })}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </NavLayout>
  );
}
