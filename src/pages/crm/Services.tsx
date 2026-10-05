import { useState } from "react";
import { Clock3, IndianRupee, Pencil, Plus, RotateCcw, Scissors, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/crm/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatINR, type Gender, type Service } from "@/data/mockCrmData";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { toast } from "sonner";

const emptyForm: Omit<Service, "id"> = { name: "", gender: "Female", price: 0, duration: 30, active: true };

export default function Services() {
  const { services, addService, updateService, removeService, resetServices } = useServiceCatalog();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startAdd = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (service: Service) => { setEditingId(service.id); setForm({ name: service.name, gender: service.gender, price: service.price, duration: service.duration, active: service.active }); setOpen(true); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || form.price <= 0 || form.duration <= 0) return toast.error("Enter a valid name, price, and duration");
    if (editingId) updateService({ ...form, name: form.name.trim(), id: editingId });
    else addService({ ...form, name: form.name.trim() });
    toast.success(editingId ? "Service updated" : "Service added");
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Services" sub={`${services.length} services available in the WhatsApp booking menu`} right={<div className="flex gap-2"><Button variant="outline" size="icon" onClick={() => { resetServices(); toast.success("Starter services restored"); }} aria-label="Restore starter services"><RotateCcw /></Button><Button onClick={startAdd}><Plus />Add service</Button></div>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {(["Male", "Female"] as Gender[]).map((gender) => {
          const list = services.filter((service) => service.gender === gender);
          return <Panel key={gender} className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Scissors className="h-4 w-4" /></div><div><h2 className="font-semibold">{gender === "Male" ? "Men's services" : "Women's services"}</h2><p className="text-xs text-muted-foreground">{list.length} items</p></div></div>
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setForm({ ...emptyForm, gender }); setOpen(true); }}><Plus />Add</Button>
            </div>
            <div className="divide-y divide-border">
              {list.map((service) => <div key={service.id} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/50">
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{service.name}</div><div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{service.duration} min</span><span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />Customer price</span></div></div>
                <div className="text-right"><div className="text-sm font-bold">{formatINR(service.price)}</div><div className="text-[10px] text-muted-foreground">{service.active ? "Live" : "Hidden"}</div></div>
                <Switch checked={service.active} onCheckedChange={(active) => updateService({ ...service, active })} aria-label={`${service.active ? "Hide" : "Show"} ${service.name}`} />
                <Button variant="ghost" size="icon-sm" onClick={() => startEdit(service)} aria-label={`Edit ${service.name}`}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => { removeService(service.id); toast.success("Service removed"); }} aria-label={`Delete ${service.name}`}><Trash2 /></Button>
              </div>)}
              {!list.length && <div className="px-5 py-10 text-center text-sm text-muted-foreground">No services in this section.</div>}
            </div>
          </Panel>;
        })}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="crm sm:max-w-md">
          <DialogHeader className="text-left"><DialogTitle>{editingId ? "Edit service" : "Add service"}</DialogTitle><DialogDescription>Set the service shown to customers during booking.</DialogDescription></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="service-name">Service name</Label><Input id="service-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Haircut & styling" autoFocus /></div>
            <div className="space-y-2"><Label>Customer category</Label><Select value={form.gender} onValueChange={(gender: Gender) => setForm({ ...form, gender })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Men</SelectItem><SelectItem value="Female">Women</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="service-price">Price (₹)</Label><Input id="service-price" type="number" min="1" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div><div className="space-y-2"><Label htmlFor="service-duration">Duration (min)</Label><Input id="service-duration" type="number" min="5" step="5" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} /></div></div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3"><div><Label htmlFor="service-active">Available for booking</Label><p className="text-xs text-muted-foreground">Show this service in WhatsApp</p></div><Switch id="service-active" checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">{editingId ? "Save changes" : "Add service"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}