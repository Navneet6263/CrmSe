import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart } from "recharts";
import { motion } from "framer-motion";
import { CalendarCheck, IndianRupee, MousePointerClick, TrendingUp, ArrowUpRight, Flame, CalendarClock, CheckCircle2, Sparkles } from "lucide-react";
import { Panel, StatusPill, chartTooltip } from "@/components/crm/ui";
import { bookings, branches, formatINR, hourlyClicks, kpis, ownerInsights, weeklyRevenue, slotStatus, timeSlots } from "@/data/mockCrmData";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/crm/BrandIcon";

const spark = (k: number) => weeklyRevenue.map((d, i) => ({ v: d.bookings * (1 + ((i * k) % 3) * 0.15) }));

const cards = [
  { label: "Today's bookings", value: String(kpis.todayBookings), delta: kpis.todayBookingsDelta, icon: CalendarCheck, tint: "bg-tint-blue", c: "text-c-blue", stroke: "hsl(var(--c-blue))" },
  { label: "Monthly turnover", value: formatINR(kpis.monthTurnover), delta: kpis.monthTurnoverDelta, icon: IndianRupee, tint: "bg-tint-green", c: "text-c-green", stroke: "hsl(var(--c-green))" },
  { label: "Ad clicks (30d)", value: kpis.adClicks.toLocaleString("en-IN"), delta: kpis.adClicksDelta, icon: MousePointerClick, tint: "bg-tint-peach", c: "text-c-peach", stroke: "hsl(var(--c-peach))" },
  { label: "Click → booking", value: kpis.conversionRate + "%", delta: kpis.conversionDelta, icon: TrendingUp, tint: "bg-tint-lilac", c: "text-c-lilac", stroke: "hsl(var(--c-lilac))" },
];

const funnel = [
  { label: "Instagram ad clicks", value: 3842, brand: "Instagram" as const, c: "bg-tint-peach" },
  { label: "WhatsApp chats", value: 1290, brand: "WhatsApp" as const, c: "bg-tint-green" },
  { label: "Slot selected", value: 486, icon: CalendarClock, c: "bg-c-blue" },
  { label: "Confirmed", value: 300, icon: CheckCircle2, c: "bg-c-green" },
];

const activity = [
  { t: "2m", text: "Ananya Iyer booked Bridal Makeup", sub: "via Instagram Ad · ₹12,000", c: "bg-c-green" },
  { t: "9m", text: "New WhatsApp chat from +91 98xxx 21", sub: "Selected: Female → Gold Facial", c: "bg-c-lilac" },
  { t: "14m", text: "Spike in ad clicks", sub: "62 clicks in last 15 min — Diwali Glow Offer", c: "bg-c-peach" },
  { t: "31m", text: "Vikram Singh — payment pending", sub: "Charcoal Facial · 6:00 PM", c: "bg-c-blue" },
];

export default function Overview() {
  const peak = hourlyClicks.reduce((a, b) => (b.clicks > a.clicks ? b : a));
  const free = timeSlots.filter((t) => slotStatus[t] === "Available").length;
  const booked = timeSlots.filter((t) => slotStatus[t] === "Booked").length;
  const occupancy = Math.round((booked / timeSlots.length) * 100);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-brand text-primary-foreground px-6 py-4 shadow-glow">
        <div className="absolute inset-0 dot-grid opacity-60" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-c-green live-dot" /> WhatsApp bot live
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">Good evening, Glow Studio</h1>
            <p className="opacity-85 text-sm">{formatINR(19850)} earned today · {kpis.todayBookings} bookings · peak at {peak.hour}</p>
          </div>
          <div className="flex divide-x divide-primary-foreground/25 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10">
            {[{ l: "Free", v: free }, { l: "Booked", v: booked }, { l: "Occupancy", v: occupancy + "%" }].map((x) => (
              <div key={x.l} className="px-4 py-2 text-center">
                <div className="text-lg font-bold leading-tight">{x.v}</div><div className="text-[10px] opacity-80 uppercase tracking-wide">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Panel key={c.label} delay={i * 0.06} className="hover-lift p-0 overflow-hidden relative group">
            <div className={cn("absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-70 transition-transform duration-500 group-hover:scale-125", c.tint)} />
            <div className="relative p-5 pb-0">
              <div className="flex items-center justify-between">
                <div className={cn("w-11 h-11 rounded-2xl grid place-items-center ring-4 ring-card", c.tint)}><c.icon className={cn("w-5 h-5", c.c)} /></div>
                <span className="text-[11px] font-semibold flex items-center gap-0.5 text-c-green bg-card border border-border px-2 py-1 rounded-full shadow-sm"><ArrowUpRight className="w-3 h-3" />{c.delta}%</span>
              </div>
              <div className="mt-5 text-xs font-medium text-muted-foreground uppercase tracking-wide">{c.label}</div>
              <div className="mt-1 text-2xl md:text-[30px] font-extrabold tracking-tight leading-none">{c.value}</div>
              <div className="mt-2 text-[11px] text-muted-foreground"><span className="text-c-green font-semibold">+{c.delta}%</span> vs last week</div>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark(i + 1)} margin={{ top: 6, left: 0, right: 0, bottom: 0 }}>
                  <defs><linearGradient id={`sp${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.stroke} stopOpacity={0.4} /><stop offset="100%" stopColor={c.stroke} stopOpacity={0.02} /></linearGradient></defs>
                  <Area type="monotone" dataKey="v" stroke={c.stroke} strokeWidth={2.5} fill={`url(#sp${i})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        ))}
      </div>

      {/* Chart + funnel */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2" delay={0.2}>
          <div className="flex flex-wrap gap-2 justify-between mb-4">
            <div><h3 className="font-semibold text-lg">Instagram traffic by hour</h3><p className="text-xs text-muted-foreground">When customers tap "Book Now" — and how many convert</p></div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Clicks</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" />Bookings</span>
              <span className="flex items-center gap-1 bg-tint-peach text-c-peach font-semibold px-3 py-1 rounded-full"><Flame className="w-3 h-3" />Peak {peak.hour}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyClicks}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...chartTooltip} />
              <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#g1)" />
              <Area type="monotone" dataKey="bookings" stroke="hsl(var(--accent))" strokeWidth={3} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel delay={0.25}>
          <h3 className="font-semibold text-lg">Booking funnel</h3>
          <p className="text-xs text-muted-foreground mb-5">Insta click → confirmed (30 days)</p>
          <div className="space-y-4">
            {funnel.map((f, i) => {
              const pct = Math.round((f.value / funnel[0].value) * 100);
              return (
                <div key={f.label}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className={cn("w-8 h-8 rounded-xl grid place-items-center", f.c)}>{f.brand ? <BrandIcon brand={f.brand} /> : f.icon ? <f.icon className="w-4 h-4 text-primary-foreground" /> : null}</div>
                    <div className="flex-1 text-sm font-medium">{f.label}</div>
                    <div className="text-sm font-bold">{f.value.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }} className={cn("h-full rounded-full", f.c)} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-tint-green p-3 text-xs text-c-green font-medium flex items-center gap-2"><Sparkles className="w-4 h-4" />7.8% of clicks become paid bookings</div>
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2" delay={0.3}>
          <div className="flex justify-between mb-3"><h3 className="font-semibold text-lg">Upcoming appointments</h3><span className="text-xs text-muted-foreground">Today</span></div>
          <div className="space-y-2">
            {bookings.filter((b) => b.date === "Today").map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary transition-colors">
                <div className="text-center w-16 shrink-0"><div className="text-sm font-bold">{b.slot.split(" ")[0]}</div><div className="text-[10px] text-muted-foreground">{b.slot.split(" ")[1]}</div></div>
                <div className={cn("w-1 self-stretch rounded-full", ["bg-c-blue", "bg-c-green", "bg-c-peach", "bg-c-lilac"][i % 4])} />
                <div className={cn("w-10 h-10 rounded-xl grid place-items-center font-bold", ["bg-tint-blue text-c-blue", "bg-tint-green text-c-green", "bg-tint-peach text-c-peach", "bg-tint-lilac text-c-lilac"][i % 4])}>{b.customer[0]}</div>
                <div className="flex-1 min-w-0"><div className="font-semibold truncate">{b.customer}</div><div className="text-xs text-muted-foreground truncate">{b.service} · {b.gender} · {b.source}</div></div>
                <div className="font-bold hidden sm:block">{formatINR(b.amount)}</div>
                <StatusPill status={b.status} />
              </motion.div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel delay={0.35}>
            <h3 className="font-semibold text-lg mb-1">Today's occupancy</h3>
            <div className="relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} data={[{ v: occupancy, fill: "hsl(var(--primary))" }]}>
                  <RadialBar dataKey="v" cornerRadius={20} background={{ fill: "hsl(var(--secondary))" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center"><div className="text-center"><div className="text-3xl font-bold">{occupancy}%</div><div className="text-[11px] text-muted-foreground">{booked}/{timeSlots.length} slots</div></div></div>
            </div>
          </Panel>
          <Panel delay={0.4}>
            <h3 className="font-semibold text-lg mb-3">Live activity</h3>
            <div className="space-y-3">
              {activity.map((a) => (
                <div key={a.text} className="flex gap-3">
                  <span className={cn("w-2.5 h-2.5 mt-1.5 rounded-full shrink-0", a.c)} />
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium leading-snug">{a.text}</div><div className="text-[11px] text-muted-foreground">{a.sub}</div></div>
                  <span className="text-[11px] text-muted-foreground">{a.t}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel delay={0.45}>
        <div className="flex justify-between mb-4"><div><h3 className="font-semibold text-lg">Weekly turnover</h3><p className="text-xs text-muted-foreground">{formatINR(weeklyRevenue.reduce((s, d) => s + d.revenue, 0))} in the last 7 days</p></div></div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyRevenue} barSize={36}>
            <defs><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--c-lilac))" /></linearGradient></defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => "₹" + v / 1000 + "k"} />
            <Tooltip {...chartTooltip} formatter={(v: number) => formatINR(v)} cursor={{ fill: "hsl(var(--secondary))" }} />
            <Bar dataKey="revenue" fill="url(#bar)" radius={[10, 10, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel delay={0.5}>
          <div className="mb-4"><h3 className="font-semibold text-lg">Branch performance</h3><p className="text-xs text-muted-foreground">Appointments and turnover this month</p></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-3 font-medium">Branch</th><th className="pb-3 font-medium">Appointments</th><th className="pb-3 text-right font-medium">Revenue</th></tr></thead><tbody className="divide-y divide-border">{branches.map((branch) => <tr key={branch.id}><td className="py-3"><div className="font-semibold">{branch.name}</div><div className="text-xs text-muted-foreground">{branch.address}</div></td><td className="py-3">{branch.appointments}</td><td className="py-3 text-right font-bold">{formatINR(branch.revenue)}</td></tr>)}</tbody></table></div>
        </Panel>
        <Panel delay={0.55}>
          <h3 className="font-semibold text-lg">Customer & appointment mix</h3><p className="mb-4 text-xs text-muted-foreground">Compact owner view for this month</p>
          <div className="grid grid-cols-3 gap-2">{[{ l: "Completed", v: ownerInsights.completed }, { l: "Cancelled", v: ownerInsights.cancelled }, { l: "No-shows", v: ownerInsights.noShows }, { l: "Walk-ins", v: ownerInsights.walkIns }, { l: "New", v: ownerInsights.newCustomers }, { l: "Returning", v: ownerInsights.returningCustomers }].map((item) => <div key={item.l} className="rounded-xl bg-secondary p-3"><div className="text-xl font-bold">{item.v}</div><div className="text-[11px] text-muted-foreground">{item.l}</div></div>)}</div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-tint-peach p-3"><div><div className="text-[11px] text-c-peach">Top service</div><div className="text-sm font-semibold">{ownerInsights.topService}</div></div><Sparkles className="h-5 w-5 text-c-peach" /></div>
        </Panel>
      </div>
    </div>
  );
}
