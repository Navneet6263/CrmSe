import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Smartphone,
  Shield,
  Palette,
  Globe,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { languages } from "@/i18n";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";
import { TwoFactorDisable } from "@/components/settings/TwoFactorDisable";
import { UpgradePlanDialog } from "@/components/settings/UpgradePlanDialog";
import { StorageWarning } from "@/components/storage/StorageWarning";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { usage, loading: storageLoading } = useStorageUsage();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Two-factor authentication state
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [twoFactorDisableDialogOpen, setTwoFactorDisableDialogOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);

  // Upgrade dialog state
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Check MFA status on mount
  useEffect(() => {
    const checkMfaStatus = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const hasVerifiedTotp = data.totp.some((factor) => factor.status === "verified");
        setMfaEnabled(hasVerifiedTotp);
      } catch (err) {
        console.error("Error checking MFA status:", err);
      } finally {
        setMfaLoading(false);
      }
    };
    checkMfaStatus();
  }, []);

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ full_name: fullName });
    setSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    await uploadAvatar(file);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        setChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error changing password:", err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    toast.success(`Language changed to ${languages.find((l) => l.code === langCode)?.nativeName}`);
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <Tabs defaultValue="profile" className="space-y-6">
        {/* Header - Fixed Secondary Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border -mx-6 px-6 py-3 -mt-6 h-14 flex items-center">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{t("settings.title")}</span>
              </div>
            </div>
            <TabsList className="grid grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t("settings.profile.tab")}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">{t("settings.security.tab")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">{t("settings.notifications.tab")}</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">{t("settings.billing.tab")}</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-6 space-y-6">

        {/* Storage Warning */}
        <StorageWarning percentage={usage.percentage} onUpgrade={() => setUpgradeDialogOpen(true)} />

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile.title")}</CardTitle>
              <CardDescription>{t("settings.profile.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                    {t("settings.profile.changePhoto")}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t("settings.profile.photoHint")}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.profile.fullName")}</Label>
                  <Input 
                    id="name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.profile.email")}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("common.save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.preferences.title")}</CardTitle>
              <CardDescription>{t("settings.preferences.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{t("settings.preferences.language")}</p>
                    <p className="text-sm text-muted-foreground">{currentLanguage.nativeName}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {currentLanguage.nativeName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center justify-between"
                      >
                        {lang.nativeName}
                        {i18n.language === lang.code && <Check className="w-4 h-4 ml-2" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{t("settings.preferences.theme")}</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === "dark" ? t("settings.preferences.darkMode") : t("settings.preferences.lightMode")}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security.password.title")}</CardTitle>
              <CardDescription>{t("settings.security.password.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t("settings.security.password.current")}</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("settings.security.password.new")}</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("settings.security.password.confirm")}</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={changingPassword}>
                  {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("settings.security.password.update")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security.twoFactor.title")}</CardTitle>
              <CardDescription>{t("settings.security.twoFactor.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{t("settings.security.twoFactor.authenticator")}</p>
                    <p className={`text-sm ${mfaEnabled ? "text-green-600" : "text-muted-foreground"}`}>
                      {mfaLoading ? t("common.loading") : mfaEnabled ? t("settings.security.twoFactor.enabled") : t("settings.security.twoFactor.notEnabled")}
                    </p>
                  </div>
                </div>
                {mfaEnabled ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setTwoFactorDisableDialogOpen(true)}
                    disabled={mfaLoading}
                  >
                    {t("settings.security.twoFactor.disable")}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setTwoFactorDialogOpen(true)}
                    disabled={mfaLoading}
                  >
                    {t("settings.security.twoFactor.enable")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <TwoFactorSetup 
            open={twoFactorDialogOpen} 
            onOpenChange={setTwoFactorDialogOpen}
            onSuccess={() => setMfaEnabled(true)}
          />

          <TwoFactorDisable
            open={twoFactorDisableDialogOpen}
            onOpenChange={setTwoFactorDisableDialogOpen}
            onSuccess={() => setMfaEnabled(false)}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security.sessions.title")}</CardTitle>
              <CardDescription>{t("settings.security.sessions.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("settings.security.sessions.currentDevice")}
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        {t("settings.security.sessions.thisDevice")}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} · {t("settings.security.sessions.activeNow")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications.email.title")}</CardTitle>
              <CardDescription>{t("settings.notifications.email.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { titleKey: "fileShares", descKey: "fileSharesDesc", defaultChecked: true },
                { titleKey: "comments", descKey: "commentsDesc", defaultChecked: true },
                { titleKey: "storageAlerts", descKey: "storageAlertsDesc", defaultChecked: false },
                { titleKey: "weeklyDigest", descKey: "weeklyDigestDesc", defaultChecked: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {t(`settings.notifications.email.${item.titleKey}`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`settings.notifications.email.${item.descKey}`)}
                    </p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.billing.currentPlan.title")}</CardTitle>
              <CardDescription>{t("settings.billing.currentPlan.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-semibold text-foreground text-lg">
                    {t("settings.billing.currentPlan.freePlan")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("settings.billing.currentPlan.freeFeatures")}
                  </p>
                </div>
                <Button onClick={() => setUpgradeDialogOpen(true)}>{t("settings.billing.currentPlan.upgrade")}</Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("settings.billing.currentPlan.storageUsed")}
                  </span>
                  <span className="font-medium text-foreground">
                    {storageLoading ? "..." : `${usage.usedFormatted} ${t("settings.billing.currentPlan.of")} ${usage.totalFormatted}`}
                  </span>
                </div>
                <Progress value={usage.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.billing.payment.title")}</CardTitle>
              <CardDescription>{t("settings.billing.payment.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {t("settings.billing.payment.noMethod")}
              </p>
              <Button variant="outline" className="mt-4" disabled>
                {t("settings.billing.payment.addMethod")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Dialog */}
        <UpgradePlanDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
        </div>
      </Tabs>
    </div>
  );
}
