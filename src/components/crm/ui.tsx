import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/data/mockCrmData";

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl">{title}</h1>
        {sub && <p className="text-muted-foreground mt-1 text-sm">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={cn("glass rounded-xl p-5", className)}>{children}</motion.div>
  );
}

const statusStyles: Record<BookingStatus, string> = {
  Confirmed: "bg-success/15 text-success",
  Pending: "bg-warning/15 text-warning",
  Completed: "bg-primary/15 text-primary",
  Cancelled: "bg-destructive/15 text-destructive",
  Rescheduled: "bg-c-lilac/15 text-c-lilac",
  "No show": "bg-muted text-muted-foreground",
};
export function StatusPill({ status }: { status: BookingStatus }) {
  return <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusStyles[status])}>{status}</span>;
}

export const chartTooltip = {
  contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" },
  labelStyle: { color: "hsl(var(--muted-foreground))" },
};
