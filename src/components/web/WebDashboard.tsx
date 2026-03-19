'use client';

import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  PieChart, 
  CalendarDays, 
  ChevronDown,
  Activity
} from 'lucide-react';
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
  kpis: { title: string; value: string; icon: any }[];
  categoryTotals: Record<string, number>;
  totalCategoryAmount: number;
  chartData: any[];
}

export function WebDashboard({ kpis, categoryTotals, totalCategoryAmount, chartData }: WebDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1400px] mx-auto p-6 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-[900] text-slate-800 tracking-tight uppercase">Farm Analytics</h2>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Live Farm Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{format(new Date(), 'MMMM yyyy')}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Live active</span>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="border border-slate-50 shadow-sm bg-white p-6 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.title}</h3>
              </div>
              <p className="text-4xl font-[900] text-emerald-700 tracking-tighter text-center">{item.value}</p>
            </Card>
          );
        })}
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* SPEND MATRIX */}
        <div className="col-span-5">
          <Card className="rounded-[2rem] border border-slate-50 shadow-sm bg-white p-8 h-full">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <PieChart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Spend Matrix</h3>
            </div>

            <div className="space-y-6">
              {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).slice(0, 5).map(([cat, amt]) => {
                const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-600 tracking-tight">{cat}</span>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-800">₹{amt.toLocaleString()}</span>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{percent.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center opacity-20 font-black uppercase text-[10px] tracking-[0.3em]">Awaiting Data</div>
              )}
            </div>
          </Card>
        </div>

        {/* EXPENSE TREND */}
        <div className="col-span-7">
          <Card className="rounded-[2rem] border border-slate-50 shadow-sm bg-white p-8 h-full">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Expense Trend</h3>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '1rem' }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill="url(#barGradient)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#047857" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
