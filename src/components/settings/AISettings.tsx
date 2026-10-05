import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Eye, EyeOff, Loader2, Trash2, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Affordable)" },
  { value: "gpt-4o", label: "GPT-4o (Most Capable)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fastest)" },
];

export function AISettings() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkAISettings();
  }, []);

  const checkAISettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-settings", {
        method: "GET",
      });
      if (error) throw error;
      setHasKey(data?.hasKey || false);
      setModel(data?.model || "gpt-4o-mini");
    } catch (err) {
      console.error("Error checking AI settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!apiKey.trim() && !hasKey) {
      toast.error(t("settings.admin.ai.keyRequired", "API key is required"));
      return;
    }

    if (apiKey && !apiKey.startsWith("sk-")) {
      toast.error(t("settings.admin.ai.invalidKey", "Invalid API key format. Key should start with 'sk-'"));
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-settings", {
        method: "POST",
        body: { apiKey: apiKey || undefined, model },
      });

      if (error) throw error;

      toast.success(t("settings.admin.ai.saveSuccess", "AI settings saved successfully"));
      setHasKey(true);
      setApiKey("");
    } catch (err: any) {
      console.error("Error saving AI settings:", err);
      toast.error(err.message || t("settings.admin.ai.saveError", "Failed to save AI settings"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("ai-settings", {
        method: "DELETE",
      });

      if (error) throw error;

      toast.success(t("settings.admin.ai.removeSuccess", "AI settings cleared"));
      setHasKey(false);
    } catch (err: any) {
      console.error("Error removing AI settings:", err);
      toast.error(err.message || t("settings.admin.ai.removeError", "Failed to clear AI settings"));
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
          <Bot className="w-5 h-5" />
          {t("settings.admin.ai.title", "AI Assistant Settings")}
        </CardTitle>
        <CardDescription>
          {t("settings.admin.ai.description", "Configure the OpenAI API key and model for the AI assistant feature.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasKey ? (
          <Alert className="bg-green-500/10 border-green-500/30">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {t("settings.admin.ai.keyConfigured", "OpenAI API key is configured and active.")}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("settings.admin.ai.keyNotConfigured", "No API key configured. Users cannot use the AI assistant.")}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">{t("settings.admin.ai.model", "AI Model")}</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settings.admin.ai.modelHint", "Choose the AI model to use for the assistant.")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">
              {hasKey 
                ? t("settings.admin.ai.updateKey", "Update API Key (leave empty to keep current)") 
                : t("settings.admin.ai.apiKey", "OpenAI API Key")}
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "••••••••••••••••••••" : "sk-..."}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("settings.admin.ai.keyHint", "Get your API key from")} {" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("common.save", "Save")}
          </Button>
          {hasKey && (
            <Button variant="destructive" onClick={handleRemoveKey} disabled={saving}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t("settings.admin.ai.removeKey", "Remove Key")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
