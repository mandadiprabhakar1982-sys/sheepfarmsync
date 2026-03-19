'use client';

import { Card } from "@/components/ui/card";
import { TrendingUp, PieChart, CalendarDays, Activity } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

interface WebDashboardProps {
  kpis: { title: string; value: string }[];
  categoryTotals: Record<string, number>;
  totalCategoryAmount: number;
  chartData: any[];
}

export function WebDashboard({ kpis, categoryTotals, totalCategoryAmount, chartData }: WebDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Executive Dashboard</h2>
          <p className="subtitle">Master Transactional Intelligence Hub</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-border shadow-sm">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
              {format(new Date(), 'MMMM yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-2xl text-white shadow-lg">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-[11px] font-black uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((item, i) => (
          <Card key={i} className="border-none shadow-xl bg-white p-8 group hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3">{item.title}</h3>
            <p className="text-4xl font-black tracking-tighter text-primary">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* CHARTS & MATRIX */}
      <div className="grid grid-cols-12 gap-8">
        {/* SPEND MATRIX */}
        <div className="col-span-5">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-10 h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary uppercase tracking-tight">Spend Matrix</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Breakdown</p>
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([cat, amt]) => {
                const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
                return (
                  <div key={cat} className="group">
                    <div className="flex justify-between text-[11px] font-black mb-3 uppercase tracking-wide">
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">{cat}</span>
                      <span className="text-accent">₹{amt.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(15,165,160,0.3)]" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center opacity-20 uppercase text-[10px] font-black tracking-widest">
                  Awaiting Transaction Data
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* EXPENSE TREND */}
        <div className="col-span-7">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-10 h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary uppercase tracking-tight">Expense Trend</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chronological Flow</p>
              </div>
            </div>

            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={40}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }}
                    dy={15}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1.5rem' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--accent))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
