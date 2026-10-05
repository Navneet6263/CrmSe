import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const plans = [
  {
    name: "Free",
    description: "Perfect for personal use and getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    storage: "5 GB",
    features: [
      { name: "5 GB storage", included: true },
      { name: "File sharing", included: true },
      { name: "Basic support", included: true },
      { name: "Mobile & desktop apps", included: true },
      { name: "Version history (7 days)", included: true },
      { name: "Team folders", included: false },
      { name: "Advanced security", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals who need more space and features",
    monthlyPrice: 12,
    yearlyPrice: 120,
    storage: "2 TB",
    features: [
      { name: "2 TB storage", included: true },
      { name: "File sharing", included: true },
      { name: "Priority support", included: true },
      { name: "Mobile & desktop apps", included: true },
      { name: "Version history (180 days)", included: true },
      { name: "Team folders (up to 3)", included: true },
      { name: "Advanced security", included: true },
      { name: "Custom branding", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    description: "For teams that need advanced collaboration",
    monthlyPrice: 20,
    yearlyPrice: 200,
    storage: "Unlimited",
    features: [
      { name: "Unlimited storage", included: true },
      { name: "Advanced sharing controls", included: true },
      { name: "Dedicated support", included: true },
      { name: "Mobile & desktop apps", included: true },
      { name: "Version history (unlimited)", included: true },
      { name: "Unlimited team folders", included: true },
      { name: "Advanced security + SSO", included: true },
      { name: "Custom branding", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "Storage", free: "5 GB", pro: "2 TB", business: "Unlimited" },
  { name: "File upload size", free: "100 MB", pro: "2 GB", business: "No limit" },
  { name: "Version history", free: "7 days", pro: "180 days", business: "Unlimited" },
  { name: "Team members", free: "—", pro: "Up to 5", business: "Unlimited" },
  { name: "Shared folders", free: "—", pro: "3 folders", business: "Unlimited" },
  { name: "Admin controls", free: "—", pro: "Basic", business: "Advanced" },
  { name: "SSO / SAML", free: "—", pro: "—", business: "✓" },
  { name: "Audit log", free: "—", pro: "30 days", business: "1 year" },
  { name: "Support", free: "Email", pro: "Priority", business: "Dedicated" },
  { name: "API access", free: "—", pro: "Limited", business: "Full" },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
          </div>
          <span className={`ml-3 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium transition-opacity ${isYearly ? "opacity-100" : "opacity-0"}`}>
            Save 17%
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-elevated border-2 border-primary"
                  : "bg-card border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-background text-primary text-sm font-medium shadow-md">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? "" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? "" : "text-foreground"}`}>
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className={plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}>
                      /{isYearly ? "year" : "month"}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {plan.storage} storage
                </p>
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.popular
                    ? "bg-background text-foreground hover:bg-background/90"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 ${plan.popular ? "text-primary-foreground" : "text-success"}`} />
                    ) : (
                      <Minus className={`w-5 h-5 ${plan.popular ? "text-primary-foreground/40" : "text-muted-foreground/40"}`} />
                    )}
                    <span className={`text-sm ${
                      feature.included 
                        ? plan.popular ? "" : "text-foreground" 
                        : plan.popular ? "text-primary-foreground/50" : "text-muted-foreground"
                    }`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Compare all features
          </h2>

          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-4 bg-muted px-6 py-4 text-sm font-semibold">
              <div className="text-foreground">Feature</div>
              <div className="text-center text-muted-foreground">Free</div>
              <div className="text-center text-primary">Pro</div>
              <div className="text-center text-muted-foreground">Business</div>
            </div>
            {comparisonFeatures.map((feature, index) => (
              <div
                key={feature.name}
                className={`grid grid-cols-4 px-6 py-4 text-sm ${
                  index % 2 === 0 ? "bg-card" : "bg-muted/30"
                }`}
              >
                <div className="text-foreground font-medium">{feature.name}</div>
                <div className="text-center text-muted-foreground">{feature.free}</div>
                <div className="text-center text-foreground">{feature.pro}</div>
                <div className="text-center text-foreground">{feature.business}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Have questions? We're here to help.
          </p>
          <Button variant="outline" asChild>
            <Link to="/help#contact">Contact Support</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
