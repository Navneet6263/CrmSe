import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StorageWarningProps {
  percentage: number;
  onUpgrade: () => void;
}

export function StorageWarning({ percentage, onUpgrade }: StorageWarningProps) {
  const { t } = useTranslation();

  if (percentage < 80) {
    return null;
  }

  const isCritical = percentage >= 95;

  return (
    <Alert 
      variant={isCritical ? "destructive" : "default"} 
      className={!isCritical ? "border-warning bg-warning/10" : ""}
    >
      <AlertTriangle className={`h-4 w-4 ${isCritical ? "" : "text-warning"}`} />
      <div className="flex-1">
        <AlertTitle className={isCritical ? "" : "text-warning"}>
          {isCritical 
            ? t("storage.warning.criticalTitle") 
            : t("storage.warning.title")}
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4 mt-1">
          <span>
            {isCritical 
              ? t("storage.warning.criticalDescription", { percentage: Math.round(percentage) })
              : t("storage.warning.description", { percentage: Math.round(percentage) })}
          </span>
          <Button size="sm" variant={isCritical ? "destructive" : "outline"} onClick={onUpgrade} className="shrink-0">
            {t("common.upgradePlan")}
          </Button>
        </AlertDescription>
      </div>
    </Alert>
  );
}
