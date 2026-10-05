import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface TwoFactorDisableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TwoFactorDisable({ open, onOpenChange, onSuccess }: TwoFactorDisableProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleDisable = async () => {
    if (!password) {
      toast.error(t("settings.security.twoFactor.passwordRequired"));
      return;
    }

    setLoading(true);
    try {
      // Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password,
      });

      if (signInError) {
        toast.error(t("settings.security.twoFactor.incorrectPassword"));
        setLoading(false);
        return;
      }

      // Get the verified TOTP factor
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      
      if (listError) throw listError;

      const verifiedFactor = factors.totp.find((factor) => factor.status === "verified");
      
      if (!verifiedFactor) {
        toast.error(t("settings.security.twoFactor.noFactorFound"));
        setLoading(false);
        return;
      }

      // Unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });

      if (unenrollError) throw unenrollError;

      toast.success(t("settings.security.twoFactor.disableSuccess"));
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Error disabling MFA:", err);
      toast.error(err.message || t("settings.security.twoFactor.disableError"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="w-5 h-5 text-destructive" />
            {t("settings.security.twoFactor.disableTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("settings.security.twoFactor.disableDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("settings.security.twoFactor.disableWarning")}
          </p>

          <div className="space-y-2">
            <Label htmlFor="disable-password">{t("settings.security.twoFactor.confirmPassword")}</Label>
            <Input
              id="disable-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("settings.security.twoFactor.enterPassword")}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisable} 
              disabled={loading || !password}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("settings.security.twoFactor.disable")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
