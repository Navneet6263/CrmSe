import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Users,
  HardDrive,
  FileText,
  TrendingUp,
  Shield,
  UserPlus,
  Loader2,
  Bell,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { StripeSettings } from "@/components/settings/StripeSettings";
import { AISettings } from "@/components/settings/AISettings";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  totalStorageBytes: number;
  roleDistribution: {
    admin: number;
    moderator: number;
    user: number;
  };
  recentSignups: number;
  activeUsers: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error(t("admin.accessDenied"));
      navigate("/app");
    }
  }, [isAdmin, adminLoading, navigate, t]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-stats");
      if (error) throw error;
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching admin stats:", err);
      toast.error(t("admin.statsError"));
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const roleChartData = stats
    ? [
        { name: t("admin.roles.admin"), value: stats.roleDistribution.admin, color: "hsl(var(--destructive))" },
        { name: t("admin.roles.moderator"), value: stats.roleDistribution.moderator, color: "hsl(var(--primary))" },
        { name: t("admin.roles.user"), value: stats.roleDistribution.user, color: "hsl(var(--muted-foreground))" },
      ]
    : [];

  return (
    <div className="pt-6">
      <Tabs defaultValue="overview" className="space-y-6">
        {/* Header - Fixed Secondary Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-3 -mt-6 min-h-14 flex items-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{t("admin.title")}</span>
              </div>
            </div>
            <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">{t("admin.tabs.overview")}</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{t("admin.tabs.users")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">{t("admin.tabs.notifications", "Notifications")}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{t("admin.tabs.settings")}</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="mt-6 space-y-6">

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.stats.totalUsers")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.recentSignups || 0} {t("admin.stats.thisWeek")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.stats.activeUsers")}</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">{t("admin.stats.withFiles")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.stats.totalFiles")}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalFiles || 0}</div>
                <p className="text-xs text-muted-foreground">{t("admin.stats.acrossAllUsers")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.stats.storageUsed")}</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(stats?.totalStorageBytes || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("admin.stats.totalStorage")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t("admin.charts.roleDistribution")}
                </CardTitle>
                <CardDescription>{t("admin.charts.roleDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.charts.quickStats")}</CardTitle>
                <CardDescription>{t("admin.charts.quickStatsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("admin.roles.admin")}</span>
                  <span className="font-semibold">{stats?.roleDistribution.admin || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("admin.roles.moderator")}</span>
                  <span className="font-semibold">{stats?.roleDistribution.moderator || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("admin.roles.user")}</span>
                  <span className="font-semibold">{stats?.roleDistribution.user || 0}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("admin.stats.avgStoragePerUser")}</span>
                    <span className="font-semibold">
                      {stats && stats.totalUsers > 0
                        ? formatBytes(stats.totalStorageBytes / stats.totalUsers)
                        : "0 B"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <AdminNotifications />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <StripeSettings />
          <AISettings />
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
