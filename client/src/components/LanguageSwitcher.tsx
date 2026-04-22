import { useTranslation } from "react-i18next";
import { languages } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function LanguageSwitcher({ variant = "default", className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors",
            variant === "compact" ? "px-2 h-8" : "px-3",
            className
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold tracking-wide">{currentLang.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              i18n.language === lang.code && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
            <span className="ml-auto text-xs text-muted-foreground font-mono">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
