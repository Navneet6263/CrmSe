import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Cloud, Home, FolderOpen, Share2, Clock, Trash2, Star, Settings, ShieldCheck, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { UpgradePlanDialog } from "@/components/settings/UpgradePlanDialog";
import { useAppSidebar } from "@/contexts/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export function AppSidebar() {
  const {
    t
  } = useTranslation();
  const location = useLocation();
  const {
    usage
  } = useStorageUsage();
  const {
    isAdmin
  } = useIsAdmin();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const {
    collapsed,
    toggle
  } = useAppSidebar();
  const mainNavItems = [{
    name: t("nav.home"),
    href: "/app",
    icon: Home
  }, {
    name: t("nav.files"),
    href: "/app/files",
    icon: FolderOpen
  }, {
    name: t("nav.recent"),
    href: "/app/recent",
    icon: Clock
  }, {
    name: t("nav.starred"),
    href: "/app/starred",
    icon: Star
  }, {
    name: t("nav.shared"),
    href: "/app/shared",
    icon: Share2
  }, {
    name: t("nav.trash"),
    href: "/app/trash",
    icon: Trash2
  }];
  const secondaryNavItems = [{
    name: t("nav.settings"),
    href: "/app/settings",
    icon: Settings
  }, ...(isAdmin ? [{
    name: t("nav.admin"),
    href: "/app/admin",
    icon: ShieldCheck
  }] : [])];
  const NavItem = ({
    item,
    isActive
  }: {
    item: typeof mainNavItems[0];
    isActive: boolean;
  }) => {
    const content = <Link to={item.href} className={`sidebar-item relative ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}>
        {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-sidebar-accent rounded-lg" transition={{
        type: "spring",
        bounce: 0.2,
        duration: 0.6
      }} />}
        <item.icon className="w-5 h-5 relative z-10 flex-shrink-0" />
        {!collapsed && <span className="relative z-10">{item.name}</span>}
      </Link>;
    if (collapsed) {
      return <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.name}
          </TooltipContent>
        </Tooltip>;
    }
    return content;
  };
  return <aside className={`h-screen bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 hidden md:flex ${collapsed ? "w-16" : "w-64"}`}>
      {/* Logo & Collapse Toggle */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-3 border-b border-sidebar-border">
        <Link to="/app" className={`flex items-center gap-2 group ${collapsed ? "justify-center" : ""}`}>
          <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-foreground flex-shrink-0" />
          {!collapsed && <span className="text-lg sm:text-xl font-semibold text-foreground">Cloudly</span>}
        </Link>
        {!collapsed && <Button variant="ghost" size="icon-sm" onClick={toggle} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <PanelLeftClose className="w-4 h-4" />
          </Button>}
      </div>


      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {mainNavItems.map(item => {
        const isActive = location.pathname === item.href || item.href !== "/app" && location.pathname.startsWith(item.href);
        return <NavItem key={item.href} item={item} isActive={isActive} />;
      })}

        {!collapsed}

        {collapsed && <div className="pt-4" />}

        {secondaryNavItems.map(item => {
        const isActive = location.pathname === item.href;
        return <NavItem key={item.href} item={item} isActive={isActive} />;
      })}
      </nav>

      {/* Storage */}
      {!collapsed && <div className="p-4 border-t border-sidebar-border">
          <div className="p-4 rounded-xl bg-sidebar-accent/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-sidebar-foreground">{t("common.storage")}</span>
              <span className="text-xs text-muted-foreground">{Math.round(usage.percentage)}% {t("common.used")}</span>
            </div>
            <Progress value={usage.percentage} className="h-2 mb-3" />
            <p className="text-xs text-muted-foreground mb-3">
              {usage.usedFormatted} of {usage.totalFormatted} {t("common.used")}
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setUpgradeDialogOpen(true)}>
              {t("common.upgradePlan")}
            </Button>
          </div>
        </div>}

      {collapsed && <div className="p-2 border-t border-sidebar-border flex justify-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 rounded-lg bg-sidebar-accent/50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary origin-bottom" style={{
                clipPath: `polygon(0 ${100 - usage.percentage}%, 100% ${100 - usage.percentage}%, 100% 100%, 0 100%)`
              }} />
                  <span className="relative z-10 text-[9px] font-semibold text-sidebar-foreground">
                    {Math.round(usage.percentage)}%
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              {usage.usedFormatted} of {usage.totalFormatted} {t("common.used")}
            </TooltipContent>
          </Tooltip>
        </div>}

      <UpgradePlanDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
    </aside>;
}