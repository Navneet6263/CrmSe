import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cloud, Home, FolderOpen, Share2, Clock, Trash2, Star, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradePlanDialog } from "@/components/settings/UpgradePlanDialog";
import { Progress } from "@/components/ui/progress";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAppSidebar } from "@/contexts/SidebarContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MobileNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { usage } = useStorageUsage();
  const { isAdmin } = useIsAdmin();
  const { mobileOpen, setMobileOpen } = useAppSidebar();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const mainNavItems = [
    { name: t("nav.home"), href: "/app", icon: Home },
    { name: t("nav.files"), href: "/app/files", icon: FolderOpen },
    { name: t("nav.recent"), href: "/app/recent", icon: Clock },
    { name: t("nav.starred"), href: "/app/starred", icon: Star },
    { name: t("nav.shared"), href: "/app/shared", icon: Share2 },
    { name: t("nav.trash"), href: "/app/trash", icon: Trash2 },
  ];

  const secondaryNavItems = [
    { name: t("nav.settings"), href: "/app/settings", icon: Settings },
    ...(isAdmin ? [{ name: t("nav.admin"), href: "/app/admin", icon: ShieldCheck }] : []),
  ];

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-14 px-4 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-7 h-7 text-foreground" />
            <SheetTitle className="text-lg font-semibold">Cloudly</SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/app" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-border mt-4">
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Storage */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("common.storage")}</span>
              <span className="text-xs text-muted-foreground">{Math.round(usage.percentage)}%</span>
            </div>
            <Progress value={usage.percentage} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              {usage.usedFormatted} of {usage.totalFormatted} {t("common.used")}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setUpgradeOpen(true)}
            >
              {t("dashboard.upgradeStorage")}
            </Button>
          </div>
        </div>

        <UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      </SheetContent>
    </Sheet>
  );
}