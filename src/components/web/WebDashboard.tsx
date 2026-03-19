'use client';

import { Card } from "@/components/ui/card";
import { TrendingUp, PieChart, CalendarDays } from 'lucide-react';
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
    <div className="space-y-10 font-sans">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Master Transactional Intelligence</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
            {format(new Date(), 'MMMM yyyy')}
          </span>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((item, i) => (
          <Card key={i} className="border-none shadow-xl bg-white p-8 group hover:-translate-y-1 transition-all">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{item.title}</h3>
            <p className="text-3xl font-black tracking-tighter text-slate-800">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* CHARTS & MATRIX */}
      <div className="grid grid-cols-12 gap-8">
        {/* SPEND MATRIX */}
        <div className="col-span-5">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10 h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Spend Matrix</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Category Breakdown</p>
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([cat, amt]) => {
                const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-wide">
                      <span className="text-slate-600">{cat}</span>
                      <span className="text-emerald-600">₹{amt.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
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
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10 h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Expense Trend</h3>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }}
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '1.5rem' }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="#10b981" />
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
