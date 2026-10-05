import { useMemo, useState } from "react";
import { CalendarDays, Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatusPill } from "@/components/crm/ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { customerProfiles, formatINR } from "@/data/mockCrmData";
import { useBookingCatalog } from "@/hooks/useBookingCatalog";

export default function Customers() {
  const { bookings } = useBookingCatalog();
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const customers = useMemo(() => {
    const grouped = new Map<string, typeof bookings>();
    bookings.forEach((booking) => grouped.set(booking.phone, [...(grouped.get(booking.phone) ?? []), booking]));
    return [...grouped.entries()].map(([key, history]) => {
      const profile = customerProfiles.find((item) => item.phone === key);
      const completed = history.filter((item) => item.status === "Completed");
      return { phone: key, name: history[0].customer, source: history[0].source, history, visits: completed.length + (profile?.previousVisits ?? 0), spend: completed.reduce((sum, item) => sum + item.amount, 0) + (profile?.previousSpend ?? 0), notes: profile?.notes ?? "No notes yet", email: profile?.email ?? "Not provided" };
    });
  }, [bookings]);
  const filtered = customers.filter((item) => `${item.name} ${item.phone}`.toLowerCase().includes(query.toLowerCase()));
  const selected = customers.find((item) => item.phone === phone);
  return <>
    <PageHeader title="Customers" sub={`${customers.length} customer profiles matched by phone number`} />
    <Panel className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4"><div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or phone" className="pl-9" /></div><span className="hidden text-xs text-muted-foreground sm:block">Returning customers are never duplicated</span></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-secondary/50 text-left text-xs text-muted-foreground"><tr>{["Customer", "Source", "Visits", "Total spend", "Next appointment", "Notes", ""].map((label) => <th className="px-4 py-3 font-medium" key={label}>{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((customer) => { const next = customer.history.find((item) => item.date === "Today" && item.status !== "Completed" && item.status !== "Cancelled"); return <tr key={customer.phone} className="hover:bg-secondary/40"><td className="px-4 py-3"><div className="font-semibold">{customer.name}</div><div className="text-xs text-muted-foreground">{customer.phone}</div></td><td className="px-4 py-3">{customer.source}</td><td className="px-4 py-3 font-semibold">{customer.visits}</td><td className="px-4 py-3 font-semibold">{formatINR(customer.spend)}</td><td className="px-4 py-3">{next ? `${next.slot} · ${next.service}` : "—"}</td><td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{customer.notes}</td><td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => setPhone(customer.phone)}>View</Button></td></tr>; })}</tbody></table></div>
    </Panel>
    <Sheet open={!!selected} onOpenChange={(open) => !open && setPhone(null)}><SheetContent className="crm w-full overflow-y-auto sm:max-w-lg"><SheetHeader><div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-tint-lilac text-c-lilac"><UserRound /></div><SheetTitle>{selected?.name}</SheetTitle><SheetDescription>{selected?.phone} · {selected?.email}</SheetDescription></SheetHeader>{selected && <div className="mt-6 space-y-5"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-secondary p-4"><div className="text-xs text-muted-foreground">Total visits</div><div className="mt-1 text-2xl font-bold">{selected.visits}</div></div><div className="rounded-xl bg-secondary p-4"><div className="text-xs text-muted-foreground">Total spend</div><div className="mt-1 text-2xl font-bold">{formatINR(selected.spend)}</div></div></div><div><h3 className="mb-2 text-sm font-semibold">Customer notes</h3><div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">{selected.notes}</div></div><div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4" />Appointment history</h3><div className="space-y-2">{selected.history.map((item) => <div key={item.id} className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-2"><div className="font-semibold">{item.service}</div><StatusPill status={item.status} /></div><div className="mt-1 text-xs text-muted-foreground">{item.date} · {item.slot} · {formatINR(item.amount)}</div></div>)}</div></div></div>}</SheetContent></Sheet>
  </>;
}