import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CalendarX, MoreHorizontal, Plus, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel, StatusPill } from "@/components/crm/ui";
import { branches, formatINR, timeSlots, type Booking, type BookingStatus, type Gender, type LeadSource } from "@/data/mockCrmData";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/crm/BrandIcon";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { useBookingCatalog } from "@/hooks/useBookingCatalog";
import { toast } from "sonner";

const filters: ("All" | BookingStatus)[] = ["All", "Confirmed", "Pending", "Completed", "Rescheduled", "Cancelled", "No show"];
const sources: LeadSource[] = ["Walk-in", "Phone", "Referral", "WhatsApp", "Instagram Ad", "Instagram Story", "Facebook Ad", "Organic"];
type Form = { customer: string; phone: string; gender: Gender; serviceIds: string[]; date: string; slot: string; branchId: string; source: LeadSource; discount: number; notes: string };
const emptyForm: Form = { customer: "", phone: "", gender: "Female", serviceIds: [], date: "Today", slot: "10:00 AM", branchId: "vastrapur", source: "Walk-in", discount: 0, notes: "" };

export default function Bookings() {
  const { bookings, addBooking, updateBooking } = useBookingCatalog();
  const { services } = useServiceCatalog();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  useEffect(() => { if (params.get("new") === "1") { setEditing(null); setForm(emptyForm); setOpen(true); setParams({}, { replace: true }); } }, [params, setParams]);
  const list = bookings.filter((booking) => (filter === "All" || booking.status === filter) && `${booking.customer} ${booking.phone} ${booking.service}`.toLowerCase().includes(query.toLowerCase()));
  const chosen = services.filter((service) => form.serviceIds.includes(service.id));
  const subtotal = chosen.reduce((sum, service) => sum + service.price, 0);
  const duration = chosen.reduce((sum, service) => sum + service.duration, 0);
  const finalAmount = Math.max(0, subtotal - form.discount);
  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (booking: Booking) => {
    setEditing(booking);
    setForm({ customer: booking.customer, phone: booking.phone, gender: booking.gender, serviceIds: services.filter((service) => booking.service.split(" + ").includes(service.name)).map((service) => service.id), date: booking.date, slot: booking.slot, branchId: booking.branchId, source: booking.source, discount: booking.discount, notes: booking.notes });
    setOpen(true);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customer.trim() || !form.phone.trim() || !chosen.length) return toast.error("Add a customer, phone number, and at least one service");
    const next: Omit<Booking, "id"> = { customer: form.customer.trim(), phone: form.phone.trim(), gender: form.gender, service: chosen.map((item) => item.name).join(" + "), amount: finalAmount, date: form.date, slot: form.slot, status: editing && (form.date !== editing.date || form.slot !== editing.slot) ? "Rescheduled" : editing?.status ?? "Confirmed", source: form.source, calendarSynced: editing?.calendarSynced ?? false, branchId: form.branchId, discount: form.discount, notes: form.notes.trim(), duration };
    if (editing) updateBooking({ ...next, id: editing.id }); else addBooking(next);
    toast.success(editing ? "Booking updated" : "Booking created"); setOpen(false);
  };
  const setStatus = (booking: Booking, status: BookingStatus) => { updateBooking({ ...booking, status }); toast.success(`Booking marked ${status.toLowerCase()}`); };
  const summary = [{ label: "Total", value: bookings.length }, { label: "Completed", value: bookings.filter((item) => item.status === "Completed").length }, { label: "Cancelled", value: bookings.filter((item) => item.status === "Cancelled").length }, { label: "No show", value: bookings.filter((item) => item.status === "No show").length }];

  return <div className="space-y-5">
    <PageHeader title="Bookings" sub="Appointments from every booking channel" right={<Button onClick={openNew}><Plus />New booking</Button>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{summary.map((item) => <Panel className="p-4" key={item.label}><div className="text-xs text-muted-foreground">{item.label}</div><div className="mt-1 text-2xl font-bold">{item.value}</div></Panel>)}</div>
    <Panel>
      <div className="mb-5 flex flex-wrap justify-between gap-3"><div className="flex flex-wrap gap-1">{filters.map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "ghost"} onClick={() => setFilter(item)} className="h-8 rounded-full px-3 text-xs">{item}</Button>)}</div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search customer or service" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["Customer", "Service", "Slot", "Branch", "Source", "Amount", "Calendar", "Status", ""].map((label) => <th key={label} className="pb-3 pr-4 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{list.map((booking) => <tr key={booking.id} className="hover:bg-muted/40"><td className="py-3 pr-4"><div className="font-medium">{booking.customer}</div><div className="text-xs text-muted-foreground">{booking.phone} · {booking.id}</div></td><td className="max-w-[220px] pr-4"><div className="truncate">{booking.service}</div><div className="text-xs text-muted-foreground">{booking.duration} min{booking.discount ? ` · ${formatINR(booking.discount)} off` : ""}</div></td><td className="whitespace-nowrap pr-4">{booking.date}, {booking.slot}</td><td className="pr-4">{branches.find((item) => item.id === booking.branchId)?.name}</td><td className="pr-4 text-xs"><span className="flex items-center gap-2">{booking.source.includes("Instagram") ? <BrandIcon brand="Instagram" /> : booking.source.includes("Facebook") ? <BrandIcon brand="Facebook" /> : booking.source === "WhatsApp" ? <BrandIcon brand="WhatsApp" /> : null}{booking.source}</span></td><td className="pr-4 font-semibold">{formatINR(booking.amount)}</td><td className="pr-4">{booking.calendarSynced ? <CalendarCheck className="h-4 w-4 text-success" /> : <CalendarX className="h-4 w-4 text-muted-foreground" />}</td><td className="pr-3"><StatusPill status={booking.status} /></td><td><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label={`Actions for ${booking.customer}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(booking)}>Edit booking</DropdownMenuItem><DropdownMenuItem onClick={() => setStatus(booking, "Rescheduled")}>Mark rescheduled</DropdownMenuItem><DropdownMenuItem onClick={() => setStatus(booking, "Completed")}>Mark completed</DropdownMenuItem><DropdownMenuItem onClick={() => setStatus(booking, "No show")}>Mark no show</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => setStatus(booking, "Cancelled")}>Cancel booking</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td></tr>)}</tbody></table></div>
    </Panel>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="crm max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editing ? "Edit booking" : "New booking"}</DialogTitle><DialogDescription>Create a walk-in, phone, referral, or online appointment.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Customer name</Label><Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div><div className="space-y-2"><Label>Phone number</Label><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div><div className="space-y-2"><Label>Customer category</Label><Select value={form.gender} onValueChange={(gender: Gender) => setForm({ ...form, gender, serviceIds: [] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Female">Women</SelectItem><SelectItem value="Male">Men</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Booking source</Label><Select value={form.source} onValueChange={(source: LeadSource) => setForm({ ...form, source })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sources.map((source) => <SelectItem value={source} key={source}>{source}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Branch</Label><Select value={form.branchId} onValueChange={(branchId) => setForm({ ...form, branchId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map((branch) => <SelectItem value={branch.id} key={branch.id}>{branch.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Date</Label><Input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} placeholder="Today or 06 Oct 2026" /></div><div className="space-y-2"><Label>Time</Label><Select value={form.slot} onValueChange={(slot) => setForm({ ...form, slot })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{timeSlots.map((slot) => <SelectItem value={slot} key={slot}>{slot}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Discount (₹)</Label><Input type="number" min="0" max={subtotal} value={form.discount} onChange={(event) => setForm({ ...form, discount: Number(event.target.value) })} /></div></div><div className="space-y-2"><Label>Services</Label><div className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-2">{services.filter((service) => service.gender === form.gender && service.active).map((service) => <label key={service.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-secondary"><Checkbox checked={form.serviceIds.includes(service.id)} onCheckedChange={(checked) => setForm({ ...form, serviceIds: checked ? [...form.serviceIds, service.id] : form.serviceIds.filter((id) => id !== service.id) })} /><span className="flex-1 text-sm">{service.name}</span><span className="text-xs font-semibold">{formatINR(service.price)}</span></label>)}</div></div><div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Preference, allergy, or internal note" /></div><div className="flex flex-wrap justify-between gap-3 rounded-xl bg-secondary p-4 text-sm"><span>{chosen.length} services · {duration} min</span><span>Subtotal {formatINR(subtotal)} − {formatINR(form.discount)} = <strong>{formatINR(finalAmount)}</strong></span></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Save changes" : "Create booking"}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}