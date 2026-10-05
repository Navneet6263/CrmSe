import { useState } from "react";
import { PageHeader, Panel } from "@/components/crm/ui";
import { slotStatus as initial, timeSlots } from "@/data/mockCrmData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock3, Lock, Unlock } from "lucide-react";

type S = "Available" | "Booked" | "Blocked";
const style: Record<S, string> = {
  Available: "border-success/40 bg-success/10 text-success",
  Booked: "border-primary/40 bg-primary/15 text-primary",
  Blocked: "border-border bg-muted text-muted-foreground line-through",
};

export default function Slots() {
  const [slots, setSlots] = useState<Record<string, S>>(initial);
  const toggle = (t: string) => setSlots((s) => s[t] === "Booked" ? s : { ...s, [t]: s[t] === "Blocked" ? "Available" : "Blocked" });
  const count = (k: S) => Object.values(slots).filter((v) => v === k).length;
  return (
    <>
      <PageHeader title="Slot manager" sub="The WhatsApp bot offers these slots to customers. Click to block or open." />
      <div className="grid grid-cols-3 gap-3 mb-5">
        {(["Available", "Booked", "Blocked"] as S[]).map((k) => (
          <Panel key={k} className="flex items-center gap-3 p-4"><div className={cn("grid h-9 w-9 place-items-center rounded-lg", k === "Available" ? "bg-success/10 text-success" : k === "Booked" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{k === "Available" ? <CheckCircle2 /> : k === "Booked" ? <Clock3 /> : <Lock />}</div><div><div className="text-xl font-bold leading-none">{count(k)}</div><div className="mt-1 text-xs text-muted-foreground">{k}</div></div></Panel>
        ))}
      </div>
      <Panel>
        <h3 className="font-semibold mb-4">Today</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {timeSlots.map((t) => (
            <Button key={t} variant="outline" onClick={() => toggle(t)} className={cn("h-auto min-h-20 justify-between p-4 text-left", style[slots[t]])}>
              <span><span className="block text-base font-bold">{t}</span><span className="block text-xs font-normal">{slots[t]}</span></span>
              {slots[t] !== "Booked" && (slots[t] === "Blocked" ? <Lock /> : <Unlock />)}
            </Button>
          ))}
        </div>
      </Panel>
    </>
  );
}
