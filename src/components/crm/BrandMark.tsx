import { cn } from "@/lib/utils";

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} aria-label="CRMse">
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <span className="text-sm font-extrabold">C</span>
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </div>
      {!compact && <span className="font-display text-xl leading-none">CRM<span className="text-accent">se</span></span>}
    </div>
  );
}