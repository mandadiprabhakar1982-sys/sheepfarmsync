'use client';

import { useFarm } from '@/context/FarmContext';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, CalendarDays, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export function WebDashboard() {
  const { totalSheep, totalSales, totalDead, totalExpenses } = useFarm();

  const chartData = [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 55 },
    { month: "Mar", value: 48 },
    { month: "Apr", value: 70 }
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase">Executive Overview</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Master Transactional Hub</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <CalendarDays className="h-5 w-5 text-[#0FA5A0]" />
          <span className="text-sm font-black text-slate-600 uppercase">{format(new Date(), 'MMMM yyyy')}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { title: "Live Sheep", value: totalSheep.toLocaleString(), color: "text-[#0FA5A0]" },
          { title: "Net Expenses", value: `₹${totalExpenses.toLocaleString()}`, color: "text-rose-500" },
          { title: "Total Revenue", value: `₹${totalSales.toLocaleString()}`, color: "text-emerald-600" },
          { title: "Mortality", value: `${totalDead} Head`, color: "text-slate-900" }
        ].map((card, idx) => (
          <Card key={idx} className="border-none shadow-xl bg-white p-8">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{card.title}</h3>
            <p className={`text-3xl font-black mt-2 tracking-tighter ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-7 border-none shadow-xl p-10 bg-white">
          <h3 className="text-lg font-black text-slate-800 uppercase mb-8 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#0FA5A0]" /> Revenue Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#0FA5A0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="col-span-5 border-none shadow-xl p-10 bg-[#0FA5A0] text-white">
          <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3 text-white">
            <PieChart className="h-5 w-5" /> Operational Matrix
          </h3>
          <div className="space-y-6">
            <p className="text-sm font-medium text-white/70 leading-relaxed">System monitoring active. All transactional nodes are synchronized with the production ledger.</p>
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase">Fodder Stability</span>
                <span className="text-xs font-black">82%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[82%]" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}