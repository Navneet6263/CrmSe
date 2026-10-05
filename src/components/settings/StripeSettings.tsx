import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function StripeSettings() {
  const { t } = useTranslation();
  const [stripeKey, setStripeKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkStripeKeyStatus();
  }, []);

  const checkStripeKeyStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-stripe-key");
      if (error) throw error;
      setHasKey(data?.hasKey || false);
    } catch (err) {
      console.error("Error checking Stripe key status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async () => {
    if (!stripeKey.trim()) {
      toast.error(t("settings.admin.stripe.keyRequired"));
      return;
    }

    if (!stripeKey.startsWith("rk_")) {
      toast.error(t("settings.admin.stripe.invalidKey"));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("save-stripe-key", {
        body: { stripeKey },
      });

      if (error) throw error;

      toast.success(t("settings.admin.stripe.saveSuccess"));
      setHasKey(true);
      setStripeKey("");
    } catch (err: any) {
      console.error("Error saving Stripe key:", err);
      toast.error(err.message || t("settings.admin.stripe.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("remove-stripe-key");

      if (error) throw error;

      toast.success(t("settings.admin.stripe.removeSuccess"));
      setHasKey(false);
    } catch (err: any) {
      console.error("Error removing Stripe key:", err);
      toast.error(err.message || t("settings.admin.stripe.removeError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t("settings.admin.stripe.title")}
        </CardTitle>
        <CardDescription>{t("settings.admin.stripe.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasKey ? (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {t("settings.admin.stripe.keyConfigured")}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              {t("settings.admin.stripe.noKeyConfigured")}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="stripe-key">{t("settings.admin.stripe.keyLabel")}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="stripe-key"
                type={showKey ? "text" : "password"}
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                placeholder={hasKey ? "rk_****••••••••••••" : "rk_live_..."}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings.admin.stripe.keyHint")}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSaveKey} disabled={saving || !stripeKey.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {hasKey ? t("settings.admin.stripe.updateKey") : t("settings.admin.stripe.saveKey")}
          </Button>
          {hasKey && (
            <Button variant="outline" onClick={handleRemoveKey} disabled={saving}>
              {t("settings.admin.stripe.removeKey")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
