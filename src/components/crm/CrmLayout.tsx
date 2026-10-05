import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Clock, Megaphone, MessageCircle, Scissors, LogOut, Hotel, UtensilsCrossed, Search, Bell, Plus, Crown, Download, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/crm/BrandMark";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/bookings", label: "Bookings", icon: CalendarDays, badge: "14" },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/slots", label: "Slots", icon: Clock },
  { to: "/app/ads", label: "Ad Analytics", icon: Megaphone },
  { to: "/app/whatsapp", label: "WhatsApp Flow", icon: MessageCircle, badge: "3" },
  { to: "/app/services", label: "Services", icon: Scissors },
  { to: "/app/export", label: "Export", icon: Download },
];

export default function CrmLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = user?.email ?? "Demo Salon";
  return (
    <div className="crm min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border p-4 sticky top-0 h-screen">
        <div className="px-2 mb-7"><BrandMark /><div className="ml-[46px] -mt-1 text-[10px] text-muted-foreground">Salon workspace</div></div>
        <div className="px-3 mb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Menu</div>
        <nav className="space-y-1 flex-1 overflow-y-auto min-h-0">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive ? "bg-brand text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              {({ isActive }) => (<>
                <n.icon className="w-4 h-4" /> {n.label}
                {n.badge && <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", isActive ? "bg-primary-foreground/25" : "bg-tint-peach text-c-peach")}>{n.badge}</span>}
              </>)}
            </NavLink>
          ))}
          <div className="pt-6 px-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Other businesses</div>
          {[{ l: "PG / Hotel", i: Hotel }, { l: "Restaurant", i: UtensilsCrossed }].map(({ l, i: I }) => (
            <div key={l} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground/60 cursor-not-allowed">
              <I className="w-4 h-4" /> {l}
              <span className="ml-auto text-[9px] font-bold uppercase bg-tint-lilac text-c-lilac px-2 py-0.5 rounded-full">Soon</span>
            </div>
          ))}
        </nav>
        <div className="shrink-0 mt-3 mb-2 flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2">
          <Crown className="w-4 h-4 text-c-peach" /><span className="text-xs font-semibold">Pro plan</span><span className="ml-auto text-[10px] text-muted-foreground">Active</span>
        </div>
        <Button variant="ghost" onClick={async () => { sessionStorage.removeItem("bookflow-demo"); await signOut(); navigate("/login"); }}
          className="justify-start px-3 text-muted-foreground"><LogOut />Log out</Button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search customers, bookings, services…" className="w-full h-10 rounded-xl bg-card border border-border pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div className="ml-auto flex items-center gap-2">
               <Button onClick={() => navigate("/app/bookings?new=1")} className="hidden sm:flex"><Plus />New booking</Button>
              <Button size="icon" variant="outline" className="relative" aria-label="Notifications"><Bell /><span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" /></Button>
              <div className="flex items-center gap-2 pl-2">
                <div className="w-10 h-10 rounded-xl bg-tint-lilac text-c-lilac grid place-items-center font-bold">{name[0].toUpperCase()}</div>
                <div className="hidden lg:block leading-tight"><div className="text-sm font-semibold max-w-[140px] truncate">{name}</div><div className="text-[11px] text-muted-foreground">Owner · Glow Studio</div></div>
              </div>
            </div>
          </div>
          <div className="md:hidden flex gap-1 overflow-x-auto px-3 pb-3">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn("px-3 py-1.5 rounded-full text-xs whitespace-nowrap", isActive ? "bg-brand text-primary-foreground" : "bg-card border border-border text-muted-foreground")}>{n.label}</NavLink>
            ))}
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-[1400px] mx-auto"><Outlet /></main>
      </div>
    </div>
  );
}
