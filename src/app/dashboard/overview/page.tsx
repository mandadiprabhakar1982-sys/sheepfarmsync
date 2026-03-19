
'use client';

import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

/**
 * @fileOverview High-Fidelity Overview Module.
 * Full-width enterprise analytics suite using the unified farm master ledger.
 */
export default function OverviewPage() {
  const { width, isHydrated } = useWindowDimensions();
  const router = useRouter();
  
  const { 
    totalSheep, totalSales, totalDead, farmExpenses,
    isLoading 
  } = useFarm();

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, []);

  const monthlyExpenseTotal = useMemo(() => {
    if (!farmExpenses) return 0;
    return farmExpenses
      .filter(e => {
        try {
          if (!e.date || e.category === 'Sale') return false;
          const entryDate = parseISO(e.date);
          return isWithinInterval(entryDate, currentMonth);
        } catch { return false; }
      })
      .reduce((acc, e) => acc + (e.totalAmount || 0), 0);
  }, [farmExpenses, currentMonth]);

  const mortalityRate = useMemo(() => {
    const totalHistorical = totalSheep + (totalSales / 10000) + totalDead; 
    if (totalHistorical === 0) return '0.0';
    return ((totalDead / totalHistorical) * 100).toFixed(1);
  }, [totalSheep, totalSales, totalDead]);

  const chartData = useMemo(() => {
    // Generate placeholder or dynamic data for the chart
    return [
      { month: "Jan", value: 40 },
      { month: "Feb", value: 55 },
      { month: "Mar", value: 48 },
      { month: "Apr", value: 70 }
    ];
  }, []);

  const alerts = [
    "Vaccination due for all lambs",
    "Low fodder stock alert",
    "Seasonal supplement cycle active"
  ];

  if (isLoading || !isHydrated) {
    return (
      <div className="container mx-auto py-8 max-w-7xl animate-pulse space-y-6">
        <div className="h-32 bg-[#edf2f7] rounded-[2rem] w-full" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#edf2f7] rounded-[1.5rem] w-full" />)}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="h-96 bg-[#edf2f7] rounded-[2rem] w-full" />
          <div className="h-96 bg-[#edf2f7] rounded-[2rem] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] font-sans antialiased overflow-hidden animate-in fade-in duration-700">
      {/* HEADER CARD */}
      <Card className="rounded-[2rem] border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white p-8 mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Farm Analytics</h2>
          <p className="text-sm text-[#94A3B8] font-medium uppercase tracking-widest">Master Transactional Intelligence Hub</p>
        </div>
      </Card>

      {/* METRICS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Live Sheep", value: totalSheep.toLocaleString() },
          { title: "Monthly Spend", value: `₹${monthlyExpenseTotal.toLocaleString()}` },
          { title: "Net Revenue", value: `₹${totalSales.toLocaleString()}` },
          { title: "Mortality", value: `${totalDead} Head` }
        ].map((card, idx) => (
          <Card key={idx} className="rounded-[1.5rem] border-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] bg-white p-8 min-h-[140px] flex flex-col justify-between group hover:-translate-y-1 transition-all">
            <h3 className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider">{card.title}</h3>
            <p className="text-3xl font-black text-[#0FA5A0] tracking-tighter">{card.value}</p>
          </Card>
        ))}
      </section>

      {/* ANALYTICS GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ALERTS CARD */}
        <Card className="rounded-[2rem] border-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] bg-white overflow-hidden h-full">
          <div className="p-8 pb-4">
            <h3 className="text-lg font-bold text-[#1E293B]">Health & Safety Protocol</h3>
          </div>
          <CardContent className="px-8 pb-8">
            <div className="space-y-0">
              {alerts.map((alert, i) => (
                <div key={i} className="py-5 border-b border-slate-100 last:border-none">
                  <p className="text-sm font-medium text-[#475569]">{alert}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MONTHLY GROWTH CARD */}
        <Card className="rounded-[2rem] border-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] bg-white p-8 h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#1E293B]">Revenue Trend</h3>
            <div className="px-3 py-1 rounded-full bg-[#E6F7F6] text-[#0FA5A0] text-[10px] font-black tracking-widest border border-[#0FA5A0]/10 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              STABLE
            </div>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0FA5A0" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}
