import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PageHeader, Panel, chartTooltip } from "@/components/crm/ui";
import { campaigns, formatINR, hourlyClicks, sourceSplit } from "@/data/mockCrmData";
import { BrandIcon } from "@/components/crm/BrandIcon";

const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--muted-foreground))"];

export default function Ads() {
  return (
    <>
      <PageHeader title="Ad analytics" sub="Clicks and bookings from Instagram & Facebook ads" />
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Panel className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Clicks vs bookings by time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourlyClicks}>
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...chartTooltip} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="bookings" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <h3 className="font-semibold mb-2">Lead source</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={sourceSplit} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4} stroke="none">
              {sourceSplit.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip {...chartTooltip} /></PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sourceSplit.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">{s.name.includes("Instagram") ? <BrandIcon brand="Instagram" /> : s.name.includes("Facebook") ? <BrandIcon brand="Facebook" /> : <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />}{s.name}<span className="ml-auto font-semibold">{s.value}%</span></div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel>
        <h3 className="font-semibold mb-4">Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left"><tr>{["Campaign", "Platform", "Clicks", "Bookings", "Spend", "Revenue", "ROI"].map((h) => <th key={h} className="pb-3 pr-4 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c) => (
                <tr key={c.name}>
                  <td className="py-3 pr-4 font-medium">{c.name}</td><td className="pr-4 text-muted-foreground"><span className="flex items-center gap-2">{c.platform.includes("Instagram") ? <BrandIcon brand="Instagram" /> : <BrandIcon brand="Facebook" />}{c.platform}</span></td>
                  <td className="pr-4">{c.clicks}</td><td className="pr-4">{c.bookings}</td>
                  <td className="pr-4">{formatINR(c.spend)}</td><td className="pr-4 font-semibold">{formatINR(c.revenue)}</td>
                  <td><span className="text-success font-bold">{Math.round(c.revenue / c.spend)}x</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
