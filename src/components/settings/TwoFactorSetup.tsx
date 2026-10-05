import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Shield, Copy, Check } from "lucide-react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TwoFactorSetup({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"generate" | "verify">("generate");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      // First, refresh the session to ensure we have a valid token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!sessionData.session) {
        toast.error("Please log in again to set up two-factor authentication");
        return;
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      if (data.totp) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("verify");
      }
    } catch (err: any) {
      console.error("Error enrolling MFA:", err);
      toast.error(err.message || "Failed to set up two-factor authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      toast.success("Two-factor authentication enabled successfully!");
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Error verifying MFA:", err);
      toast.error(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("generate");
    setQrCode("");
    setSecret("");
    setFactorId("");
    setVerifyCode("");
    onOpenChange(false);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("settings.security.twoFactor.setupTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "generate"
              ? t("settings.security.twoFactor.setupDescription")
              : t("settings.security.twoFactor.verifyDescription")}
          </DialogDescription>
        </DialogHeader>

        {step === "generate" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("settings.security.twoFactor.setupInstructions")}
            </p>
            <Button onClick={handleEnroll} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("settings.security.twoFactor.generateQR")}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {t("settings.security.twoFactor.manualEntry")}
              </Label>
              <div className="flex items-center gap-2">
                <Input value={secret} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={copySecret}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.security.twoFactor.enterCode")}</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verifyCode}
                  onChange={setVerifyCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button onClick={handleVerify} disabled={loading || verifyCode.length !== 6} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("settings.security.twoFactor.verify")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
