import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, FileSpreadsheet, Search } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/crm/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { bookings, formatINR, type Booking } from "@/data/mockCrmData";
import { toast } from "sonner";

type Column = { key: keyof Booking; label: string; value: (row: Booking) => string };
const columns: Column[] = [
  { key: "id", label: "Booking ID", value: (r) => r.id },
  { key: "customer", label: "Customer", value: (r) => r.customer },
  { key: "phone", label: "Phone", value: (r) => r.phone },
  { key: "gender", label: "Gender", value: (r) => r.gender },
  { key: "service", label: "Service", value: (r) => r.service },
  { key: "amount", label: "Amount", value: (r) => String(r.amount) },
  { key: "date", label: "Date", value: (r) => r.date },
  { key: "slot", label: "Time", value: (r) => r.slot },
  { key: "status", label: "Status", value: (r) => r.status },
  { key: "source", label: "Lead source", value: (r) => r.source },
  { key: "calendarSynced", label: "Calendar synced", value: (r) => r.calendarSynced ? "Yes" : "No" },
];
const presets = {
  "Customer list": ["customer", "phone", "gender", "service"],
  Finance: ["id", "customer", "service", "amount", "status"],
  "Full report": columns.map((c) => c.key),
} satisfies Record<string, (keyof Booking)[]>;

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function ExportData() {
  const [selected, setSelected] = useState<(keyof Booking)[]>(["id", "customer", "phone", "service", "amount", "date", "slot", "status"]);
  const [query, setQuery] = useState("");
  const rows = useMemo(() => bookings.filter((b) => `${b.customer} ${b.service} ${b.id}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const active = selected.map((key) => columns.find((c) => c.key === key)).filter((c): c is Column => Boolean(c));

  const toggle = (key: keyof Booking) => setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const move = (index: number, direction: -1 | 1) => setSelected((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const download = () => {
    if (!active.length) return toast.error("Choose at least one column");
    const csv = [active.map((c) => escapeCsv(c.label)).join(","), ...rows.map((row) => active.map((c) => escapeCsv(c.value(row))).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `crmse-bookings-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url); toast.success("Booking report downloaded");
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Export data" sub="Choose exactly what appears in your booking report" right={<Button onClick={download}><Download />Download CSV</Button>} />
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className="p-4">
          <div className="mb-4"><h2 className="font-semibold">Report columns</h2><p className="text-xs text-muted-foreground">Select and arrange the CSV columns.</p></div>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(presets).map(([label, keys]) => <Button key={label} size="sm" variant="outline" onClick={() => setSelected([...keys])}>{label}</Button>)}
          </div>
          <div className="space-y-1.5">
            {columns.map((column) => {
              const index = selected.indexOf(column.key);
              return <div key={column.key} className="flex h-10 items-center gap-3 rounded-lg border border-border px-3">
                <Checkbox checked={index >= 0} onCheckedChange={() => toggle(column.key)} aria-label={`Include ${column.label}`} />
                <span className="min-w-0 flex-1 text-sm font-medium">{column.label}</span>
                {index >= 0 && <div className="flex gap-1"><Button size="icon-sm" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${column.label} up`}><ArrowUp /></Button><Button size="icon-sm" variant="ghost" onClick={() => move(index, 1)} disabled={index === selected.length - 1} aria-label={`Move ${column.label} down`}><ArrowDown /></Button></div>}
              </div>;
            })}
          </div>
        </Panel>
        <Panel className="min-w-0 p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex items-center gap-2"><FileSpreadsheet className="text-c-green" /><div><h2 className="font-semibold">Preview</h2><p className="text-xs text-muted-foreground">{rows.length} bookings · {active.length} columns</p></div></div>
            <div className="relative w-full sm:w-60"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter report" className="pl-9" /></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-secondary/60 text-left text-xs text-muted-foreground"><tr>{active.map((c) => <th key={c.key} className="px-4 py-3 font-medium whitespace-nowrap">{c.label}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.slice(0, 6).map((row) => <tr key={row.id} className="hover:bg-secondary/40">{active.map((c) => <td key={c.key} className="px-4 py-3 whitespace-nowrap">{c.key === "status" ? <StatusPill status={row.status} /> : c.key === "amount" ? formatINR(row.amount) : c.value(row)}</td>)}</tr>)}</tbody></table></div>
        </Panel>
      </div>
    </div>
  );
}