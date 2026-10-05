import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/crm/ui";
import { branches, formatINR, slotStatus, timeSlots, type Gender, type Service } from "@/data/mockCrmData";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { BrandIcon } from "@/components/crm/BrandIcon";

type Msg = { from: "bot" | "user"; text: string };
type Step = "action" | "branch" | "gender" | "services" | "date" | "slot" | "done";
const dates = ["Today", "Tomorrow", "Sat, 10 Oct"];

export default function WhatsAppFlow() {
  const { services } = useServiceCatalog();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>("action");
  const [branchId, setBranchId] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [selected, setSelected] = useState<Service[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const reset = () => { setMsgs([{ from: "bot", text: "Hi! Welcome to Glow Studio. How can we help you today?" }]); setStep("action"); setBranchId(null); setGender(null); setSelected([]); setDate(null); };
  useEffect(() => { reset(); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs]);
  const push = (user: string, bot: string) => { setMsgs((current) => [...current, { from: "user", text: user }, { from: "bot", text: bot }]); };
  const action = (value: string) => {
    if (value === "Book appointment") { setStep("branch"); push(value, "Please select your preferred location."); return; }
    setStep("done"); push(value, value === "View appointment" ? "Your next appointment is Gold Facial, Today at 4:00 PM, Vastrapur." : `${value.replace(" appointment", "")} request received. Our team will confirm the change shortly.`);
  };
  const chooseBranch = (id: string) => { const branch = branches.find((item) => item.id === id); setBranchId(id); setStep("gender"); push(branch?.name ?? id, "Who is the appointment for?"); };
  const chooseGender = (value: Gender) => { setGender(value); setStep("services"); push(value, "Choose one or more services, then continue."); };
  const toggleService = (service: Service) => setSelected((current) => current.some((item) => item.id === service.id) ? current.filter((item) => item.id !== service.id) : [...current, service]);
  const continueServices = () => { if (!selected.length) return; setStep("date"); push(selected.map((item) => item.name).join(" + "), "Which date works for you?"); };
  const chooseDate = (value: string) => { setDate(value); setStep("slot"); push(value, "Here are the available times."); };
  const chooseSlot = (slot: string) => { const branch = branches.find((item) => item.id === branchId); const price = selected.reduce((sum, item) => sum + item.price, 0); const duration = selected.reduce((sum, item) => sum + item.duration, 0); setStep("done"); push(slot, `Booking confirmed!\n${branch?.name}\n${date} · ${slot}\n${selected.map((item) => item.name).join(" + ")}\n${duration} min · Total ${formatINR(price)}\nGoogle Calendar invite sent.`); };
  const available = timeSlots.filter((slot) => slotStatus[slot] === "Available");
  const price = selected.reduce((sum, item) => sum + item.price, 0);
  const duration = selected.reduce((sum, item) => sum + item.duration, 0);

  return <>
    <PageHeader title="WhatsApp booking flow" sub="Preview the complete customer conversation before connecting WhatsApp" right={<Button variant="outline" onClick={reset}><RotateCcw />Restart</Button>} />
    <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="mx-auto w-[320px] overflow-hidden rounded-[2.5rem] border-8 border-muted bg-card shadow-glow">
        <div className="flex items-center gap-3 bg-[hsl(var(--whatsapp))] px-4 py-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-card"><BrandIcon brand="WhatsApp" className="h-5 w-5" /></div><div className="text-primary-foreground"><div className="text-sm font-semibold">Glow Studio</div><div className="text-[10px] opacity-80">Business account</div></div></div>
        <div className="h-[420px] space-y-2 overflow-y-auto bg-background p-3">{msgs.map((message, index) => <motion.div key={`${message.text}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[84%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${message.from === "bot" ? "bg-muted" : "ml-auto bg-[hsl(var(--whatsapp))] text-primary-foreground"}`}>{message.text}</motion.div>)}<div ref={end} /></div>
        <div className="flex min-h-[76px] flex-wrap gap-2 border-t border-border p-3">
          {step === "action" && ["Book appointment", "View appointment", "Reschedule appointment", "Cancel appointment"].map((item) => <Chip key={item} onClick={() => action(item)}>{item}</Chip>)}
          {step === "branch" && branches.map((branch) => <Chip key={branch.id} onClick={() => chooseBranch(branch.id)}>{branch.name}</Chip>)}
          {step === "gender" && (["Male", "Female"] as Gender[]).map((item) => <Chip key={item} onClick={() => chooseGender(item)}>{item}</Chip>)}
          {step === "services" && <><div className="flex w-full flex-wrap gap-2">{services.filter((service) => service.gender === gender && service.active).map((service) => <Chip key={service.id} selected={selected.some((item) => item.id === service.id)} onClick={() => toggleService(service)}>{service.name}</Chip>)}</div><Button size="sm" className="mt-1 w-full" disabled={!selected.length} onClick={continueServices}>Continue · {formatINR(price)}</Button></>}
          {step === "date" && dates.map((item) => <Chip key={item} onClick={() => chooseDate(item)}>{item}</Chip>)}
          {step === "slot" && available.map((item) => <Chip key={item} onClick={() => chooseSlot(item)}>{item}</Chip>)}
          {step === "done" && <span className="m-auto text-xs text-muted-foreground">Flow complete</span>}
        </div>
      </div>
      <div className="space-y-3">{[
        { brand: "Instagram" as const, title: "Customer entry", detail: "Instagram, ad, referral, or direct WhatsApp", active: true },
        { title: "Location", detail: branches.find((item) => item.id === branchId)?.name ?? "Choose a salon branch", active: !!branchId },
        { title: "Services", detail: selected.length ? `${selected.length} selected · ${duration} min · ${formatINR(price)}` : "Multiple active services can be selected", active: !!selected.length },
        { title: "Date and time", detail: date ? `${date} · available slots only` : "Choose date, then an open slot", active: !!date },
        { brand: "Google Calendar" as const, title: "Confirmation", detail: "Booking summary and calendar invite", active: step === "done" },
      ].map((item, index) => <Panel key={item.title} className={`flex items-center gap-4 transition-all ${item.active ? "border-primary/50" : "opacity-60"}`}><div className={`grid h-10 w-10 place-items-center rounded-full font-bold ${item.active ? "bg-brand text-primary-foreground" : "bg-muted"}`}>{item.brand ? <BrandIcon brand={item.brand} className="h-5 w-5" /> : item.active && index === 3 ? <CalendarDays className="h-5 w-5" /> : item.active && index === 4 ? <CheckCircle2 className="h-5 w-5" /> : index + 1}</div><div><div className="font-semibold">{item.title}</div><div className="text-xs text-muted-foreground">{item.detail}</div></div></Panel>)}</div>
    </div>
  </>;
}

function Chip({ children, onClick, selected = false }: { children: React.ReactNode; onClick: () => void; selected?: boolean }) {
  return <Button type="button" size="sm" variant={selected ? "default" : "outline"} onClick={onClick} className="h-auto min-h-8 rounded-full px-3 py-1.5 text-xs">{children}</Button>;
}