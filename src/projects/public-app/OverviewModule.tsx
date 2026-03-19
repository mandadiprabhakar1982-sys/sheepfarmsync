'use client';

import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Loader2,
  TrendingUp,
  PieChart,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const CategoryBreakdown = ({ expenses }: { expenses: any[] }) => {
  const totals = useMemo(() => {
    return expenses.reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + (curr.totalAmount || 0);
      return acc;
    }, {});
  }, [expenses]);

  const totalSum = useMemo(() => Object.values(totals).reduce((a: any, b: any) => a + b, 0), [totals]);

  return (
    <div className="p-8 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-emerald-50 text-[#0FA5A0]">
          <PieChart className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#1a252f] uppercase tracking-tight">Spend Matrix</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Category Breakdown</p>
        </div>
      </div>
      <div className="space-y-6">
        {Object.entries(totals).length > 0 ? Object.entries(totals).map(([cat, amt]: [string, any]) => {
          const percentage = totalSum > 0 ? (amt / totalSum) * 100 : 0;
          return (
            <div key={cat} className="group">
              <div className="flex justify-between text-xs font-black mb-2 uppercase tracking-wide">
                <span className="text-slate-600">{cat}</span>
                <span className="text-[#0FA5A0]">₹{amt.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100/50">
                <div className="bg-[#0FA5A0] h-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        }) : <div className="py-20 text-center opacity-20 uppercase text-[10px] font-black">Awaiting Transactions</div>}
      </div>
    </div>
  );
};

export function OverviewModule() {
  const { width, isHydrated } = useWindowDimensions();
  const { totalSheep, totalSales, totalDead, farmExpenses, isLoading } = useFarm();

  const currentMonthInterval = useMemo(() => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, []);

  const monthlyExpenses = useMemo(() => {
    if (!farmExpenses) return [];
    return farmExpenses.filter(e => {
      try {
        if (!e.date || e.category === 'Sale') return false;
        return isWithinInterval(parseISO(e.date), currentMonthInterval);
      } catch { return false; }
    });
  }, [farmExpenses, currentMonthInterval]);

  const monthlySpendTotal = useMemo(() => {
    return monthlyExpenses.reduce((acc, e) => acc + (e.totalAmount || 0), 0);
  }, [monthlyExpenses]);

  const chartData = useMemo(() => [
    { month: "Jan", value: 40 }, { month: "Feb", value: 55 }, { month: "Mar", value: 48 }, { month: "Apr", value: 70 }
  ], []);

  if (isLoading || !isHydrated) {
    return <div className="animate-pulse space-y-6"><div className="h-32 bg-slate-100 rounded-[2.5rem] w-full" /></div>;
  }

  return (
    <div className="animate-in fade-in duration-700">
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><h2 className="text-3xl font-black tracking-tight text-[#1E293B] uppercase">Farm Analytics</h2><p className="text-sm text-[#94A3B8] font-bold uppercase tracking-widest">Master Transactional Intelligence Hub</p></div>
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100"><CalendarDays className="h-5 w-5 text-[#0FA5A0]" /><span className="text-sm font-black text-slate-600 uppercase">{format(new Date(), 'MMMM yyyy')}</span></div>
        </div>
      </Card>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Live Sheep", value: totalSheep.toLocaleString() },
          { title: "Month Spend", value: `₹${monthlySpendTotal.toLocaleString()}` },
          { title: "Net Revenue", value: `₹${totalSales.toLocaleString()}` },
          { title: "Mortality", value: `${totalDead} Head` }
        ].map((card, idx) => (
          <Card key={idx} className="rounded-[2rem] border-none shadow-md bg-white p-8 group hover:-translate-y-1 transition-all"><h3 className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest">{card.title}</h3><p className="text-3xl font-black text-[#0FA5A0] tracking-tighter">{card.value}</p></Card>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5"><CategoryBreakdown expenses={monthlyExpenses} /></div>
        <div className="xl:col-span-7">
          <Card className="rounded-[2.5rem] border-none shadow-md bg-white p-10 h-full">
            <h3 className="text-lg font-black text-[#1E293B] uppercase mb-10 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-[#0FA5A0]" /> Revenue Trend</h3>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '1.5rem' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#0FA5A0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
