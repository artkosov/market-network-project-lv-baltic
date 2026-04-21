import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { Bell, BriefcaseIcon, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface NavLayoutProps {
  children: React.ReactNode;
  userType?: "candidate" | "employer";
}

export default function NavLayout({ children, userType }: NavLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const { data: notifications } = trpc.candidate.getNotifications.useQuery(undefined, {
    enabled: isAuthenticated && userType === "candidate",
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const candidateNav = [
    { href: "/kandidats", label: "Pārskats" },
    { href: "/kandidats/atbilstibas", label: "Atbilstības" },
    { href: "/kandidats/profils", label: "Profils" },
    { href: "/kandidats/gdpr", label: "GDPR" },
  ];

  const employerNav = [
    { href: "/darbadevetajs", label: "Pārskats" },
    { href: "/darbadevetajs/vakances", label: "Vakances" },
    { href: "/darbadevetajs/profils", label: "Profils" },
    { href: "/cenas", label: "Abonements" },
  ];

  const navItems = userType === "candidate" ? candidateNav : userType === "employer" ? employerNav : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BriefcaseIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-gold-gradient">Market</span>
              <span className="text-foreground"> Network</span>
            </span>
          </Link>

          {/* Nav Links */}
          {navItems.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      location === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                {userType === "candidate" && (
                  <Link href="/kandidats/atbilstibas">
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                        {user?.name ?? "Lietotājs"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={userType === "candidate" ? "/kandidats/profils" : "/darbadevetajs/profils"}>
                        <User className="w-4 h-4 mr-2" />
                        Profils
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/cenas">
                        <Settings className="w-4 h-4 mr-2" />
                        Abonements
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Iziet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={getLoginUrl()}>Pieslēgties</a>
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <a href={getLoginUrl()}>Sākt bezmaksas</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
