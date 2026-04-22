/**
 * CookieConsent.tsx
 *
 * GDPR-compliant cookie consent banner.
 * - Stores preferences in localStorage
 * - Granular opt-in/opt-out for functional and analytics cookies
 * - Required (session) cookies are always active
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, X, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "mn_cookie_consent_v1";

interface CookiePreferences {
  functional: boolean;
  analytics: boolean;
  acceptedAt: string;
  version: string;
}

function getStoredPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storePreferences(prefs: Omit<CookiePreferences, "acceptedAt" | "version">) {
  const full: CookiePreferences = {
    ...prefs,
    acceptedAt: new Date().toISOString(),
    version: "1.0",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const stored = getStoredPreferences();
    if (!stored) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    storePreferences({ functional: true, analytics: true });
    setVisible(false);
  };

  const handleAcceptSelected = () => {
    storePreferences({ functional, analytics });
    setVisible(false);
  };

  const handleRejectAll = () => {
    storePreferences({ functional: false, analytics: false });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto"
        >
          <div className="glass-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
            {/* Main banner */}
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">{t("cookie.title")}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("cookie.desc")}{" "}
                    <Link href="/privatuma-politika" className="text-primary underline" onClick={() => setVisible(false)}>
                      {t("cookie.privacyPolicy")}
                    </Link>.
                  </p>
                </div>
                <button
                  onClick={handleRejectAll}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  aria-label={t("cookie.reject")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Expandable settings */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 mb-4 pt-1">
                      {/* Required */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-medium">{t("cookie.necessary")}</p>
                          <p className="text-xs text-muted-foreground">{t("cookie.necessaryDesc", { defaultValue: "Sesijas autentifikācija. Nepieciešamas platformas darbībai." })}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{t("cookie.alwaysActive", { defaultValue: "Vienmēr aktīvas" })}</span>
                          <Switch checked disabled className="opacity-50" />
                        </div>
                      </div>

                      {/* Functional */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-medium">{t("cookie.functional", { defaultValue: "Funkcionālās sīkdatnes" })}</p>
                          <p className="text-xs text-muted-foreground">{t("cookie.functionalDesc", { defaultValue: "Valodas un tēmas preferences saglabāšana." })}</p>
                        </div>
                        <Switch
                          checked={functional}
                          onCheckedChange={setFunctional}
                          className="data-[state=checked]:bg-primary flex-shrink-0"
                        />
                      </div>

                      {/* Analytics */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-medium">{t("cookie.analytics")}</p>
                          <p className="text-xs text-muted-foreground">{t("cookie.analyticsDesc", { defaultValue: "Anonimizēta platformas lietojuma statistika platformas uzlabošanai." })}</p>
                        </div>
                        <Switch
                          checked={analytics}
                          onCheckedChange={setAnalytics}
                          className="data-[state=checked]:bg-primary flex-shrink-0"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  {t("cookie.accept")}
                </Button>
                {expanded ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAcceptSelected}
                    className="text-xs"
                  >
                    {t("cookie.save")}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRejectAll}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("cookie.reject")}
                </Button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? (
                    <>{t("cookie.hide", { defaultValue: "Slēpt" })} <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>{t("cookie.customize")} <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
