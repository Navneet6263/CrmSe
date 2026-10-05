import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For personal use",
    features: ["5 GB storage", "Basic support", "File sharing", "Mobile access"],
    popular: false,
    icon: null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 12,
    yearlyPrice: 120,
    description: "For professionals",
    features: ["2 TB storage", "Priority support", "Advanced sharing", "Version history (180 days)", "Team folders (up to 3)"],
    popular: true,
    icon: Zap,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 20,
    yearlyPrice: 200,
    description: "For teams",
    features: ["Unlimited storage", "Dedicated support", "Unlimited team folders", "Admin controls + SSO", "API access", "Custom branding"],
    popular: false,
    icon: Crown,
  },
];

const comparisonFeatures = [
  { name: "Storage", free: "5 GB", pro: "2 TB", business: "Unlimited" },
  { name: "File upload size", free: "100 MB", pro: "2 GB", business: "No limit" },
  { name: "Version history", free: "7 days", pro: "180 days", business: "Unlimited" },
  { name: "Team members", free: "—", pro: "Up to 5", business: "Unlimited" },
  { name: "Shared folders", free: "—", pro: "3 folders", business: "Unlimited" },
  { name: "Admin controls", free: "—", pro: "Basic", business: "Advanced" },
  { name: "SSO / SAML", free: "—", pro: "—", business: true },
  { name: "Audit log", free: "—", pro: "30 days", business: "1 year" },
  { name: "Support", free: "Email", pro: "Priority", business: "Dedicated" },
  { name: "API access", free: "—", pro: "Limited", business: "Full" },
];

export function UpgradePlanDialog({ open, onOpenChange, currentPlan = "free" }: UpgradePlanDialogProps) {
  const { t } = useTranslation();
  const [isYearly, setIsYearly] = useState(true);

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) return;
    const plan = plans.find(p => p.id === planId);
    toast.info(t("settings.billing.upgrade.comingSoon", { plan: plan?.name }));
    onOpenChange(false);
  };

  const isCurrentPlan = (planId: string) => planId === currentPlan;

  const formatPrice = (plan: typeof plans[0]) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return price === 0 ? "$0" : `$${price.toFixed(2)}`;
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "string") {
      return <span className="text-sm font-medium text-foreground">{value}</span>;
    }
    return value ? (
      <Check className="w-4 h-4 text-primary mx-auto" />
    ) : (
      <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {t("settings.billing.upgrade.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("settings.billing.upgrade.description")}
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Label 
              htmlFor="billing-toggle" 
              className={cn(
                "text-sm cursor-pointer transition-colors",
                !isYearly ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {t("settings.billing.upgrade.monthly")}
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <Label 
              htmlFor="billing-toggle" 
              className={cn(
                "text-sm cursor-pointer transition-colors",
                isYearly ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {t("settings.billing.upgrade.yearly")}
            </Label>
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-primary/10 text-primary border-0 text-xs font-medium transition-opacity whitespace-nowrap",
                isYearly ? "opacity-100" : "opacity-0"
              )}
            >
              {t("settings.billing.upgrade.savePercent")}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Plan Cards */}
        <div className="px-6 py-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = isCurrentPlan(plan.id);
              const PlanIcon = plan.icon;
              
              return (
                <div 
                  key={plan.id} 
                  className={cn(
                    "relative rounded-xl border p-5 transition-all duration-200 flex flex-col",
                    plan.popular 
                      ? "border-primary bg-primary/[0.02] shadow-sm" 
                      : isCurrent 
                        ? "border-muted bg-muted/30" 
                        : "border-border hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  {/* Badge */}
                  {(plan.popular || isCurrent) && (
                    <div className="absolute -top-2.5 left-4">
                      <Badge 
                        variant={plan.popular ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5",
                          plan.popular && "bg-primary text-primary-foreground"
                        )}
                      >
                        {plan.popular ? t("settings.billing.upgrade.popular") : t("settings.billing.upgrade.currentPlan")}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Plan Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {PlanIcon && <PlanIcon className="w-4 h-4 text-primary" />}
                      <span className="font-semibold text-foreground">{plan.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight text-foreground">
                        {formatPrice(plan)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{isYearly ? t("settings.billing.upgrade.year") : t("settings.billing.upgrade.month")}
                      </span>
                    </div>
                    {isYearly && plan.monthlyPrice > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        ${(plan.yearlyPrice / 12).toFixed(2)}/{t("settings.billing.upgrade.month")}
                      </p>
                    )}
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <Button 
                    className="w-full h-9 text-sm mt-auto"
                    variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrent 
                      ? t("settings.billing.upgrade.current") 
                      : plan.id === "free" 
                        ? t("settings.billing.upgrade.downgrade")
                        : t("settings.billing.upgrade.select")
                    }
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Comparison Table */}
        <div className="px-6 py-6">
          <h3 className="text-sm font-semibold text-center mb-4">
            {t("settings.billing.upgrade.compareFeatures")}
          </h3>
          
          {/* Mobile/Tablet: Card layout */}
          <div className="lg:hidden space-y-4">
            {comparisonFeatures.map((feature) => (
              <div key={feature.name} className="rounded-lg border p-3">
                <p className="font-medium text-foreground text-sm mb-2">{feature.name}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground mb-1">Free</span>
                    {renderFeatureValue(feature.free)}
                  </div>
                  <div className="flex flex-col bg-primary/5 rounded p-1">
                    <span className="text-[10px] text-muted-foreground mb-1">Pro</span>
                    {renderFeatureValue(feature.pro)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground mb-1">Business</span>
                    {renderFeatureValue(feature.business)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop: Table layout */}
          <div className="hidden lg:block rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 w-[40%]">
                    {t("settings.billing.upgrade.feature")}
                  </th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-3">Free</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-3 bg-primary/5">Pro</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-3">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-foreground">{feature.name}</td>
                    <td className="px-3 py-2.5 text-center">{renderFeatureValue(feature.free)}</td>
                    <td className="px-3 py-2.5 text-center bg-primary/[0.02]">{renderFeatureValue(feature.pro)}</td>
                    <td className="px-3 py-2.5 text-center">{renderFeatureValue(feature.business)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-center text-xs text-muted-foreground">
            {t("settings.billing.upgrade.cancelAnytime")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
