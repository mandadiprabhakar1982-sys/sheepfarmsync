
'use client';

import { useState, useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  LayoutGrid,
  FileText,
  Heart,
  ArrowUp,
  Infinity,
  Smartphone,
  HeartPulse,
  Wallet,
  CreditCard,
  Loader2,
  TrendingUp,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

function MenuIcon({ type, active }: { type: string, active?: boolean }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: <LayoutGrid className="w-5 h-5" />,
    ledger: <FileText className="w-5 h-5" />,
    buying: <Heart className="w-5 h-5" />,
    feed: <ArrowUp className="w-5 h-5" />,
    labor: <Infinity className="w-5 h-5" />,
    calculator: <Smartphone className="w-5 h-5" />,
    health: <HeartPulse className="w-5 h-5" />,
    finance: <Wallet className="w-5 h-5" />,
    debt: <CreditCard className="w-5 h-5" />,
  };

  return <div className={cn("w-5 h-5", active ? "text-white" : "text-white/70")}>{icons[type] ?? icons.dashboard}</div>;
}

export default function OverviewPage() {
  const { width, isHydrated } = useWindowDimensions();
  const router = useRouter();
  
  const { 
    totalSheep, totalSales, totalDead, farmExpenses, healthTasks, sales,
    isLoading 
  } = useFarm();

  const isMobile = width < 1024;

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, []);

  const monthlyExpenseTotal = useMemo(() => {
    if (!farmExpenses) return 0;
    return farmExpenses
      .filter(e => isWithinInterval(parseISO(e.expenseDate), currentMonth))
      .reduce((acc, e) => acc + e.amount, 0);
  }, [farmExpenses, currentMonth]);

  const mortalityRate = useMemo(() => {
    const totalHistorical = totalSheep + (totalSales / 10000) + totalDead; // Estimate historical total
    if (totalHistorical === 0) return '0.0';
    return ((totalDead / totalHistorical) * 100).toFixed(1);
  }, [totalSheep, totalSales, totalDead]);

  const chartData = [
    { month: "Jan", value: 40 },
    { month: "Feb", value: 55 },
    { month: "Mar", value: 48 },
    { month: "Apr", value: 70 }
  ];

  const alerts = [
    "Vaccination due for 24 sheep",
    "Low fodder stock alert",
    "2 lambs under observation"
  ];

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", active: true, href: '/dashboard/overview' },
    { name: "Farm Ledger", icon: "ledger", href: '/dashboard/farm-ledger' },
    { name: "Sheep Buying", icon: "buying", href: '/dashboard/purchase' },
    { name: "Fodder & Feed", icon: "feed", href: '/dashboard/feed' },
    { name: "Labour & Staff", icon: "labor", href: '/dashboard/labor' },
    { name: "Calculator", icon: "calculator", href: '/dashboard/feed-calculator' },
    { name: "Health Alerts", icon: "health", href: '/dashboard/medicine' },
    { name: "Personal Finance", icon: "finance", href: '/dashboard/monthly-ledger' },
    { name: "Debit & Credit", icon: "debt", href: '/dashboard/balance-sheet' },
  ];

  if (isLoading || !isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#00664F]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] flex flex-col lg:flex-row font-sans antialiased overflow-hidden">
      {/* SIDEBAR - PRECISE IMAGE MATCH */}
      {!isMobile && (
        <aside className="w-[280px] bg-[#00664F] text-white p-8 min-h-screen flex flex-col shrink-0">
          <div className="mb-12">
            <h1 className="text-3xl font-black tracking-tight leading-none text-white">Mpr Farms</h1>
            <p className="text-[10px] font-black text-white/60 tracking-[0.3em] uppercase mt-1">ENTERPRISE HUB</p>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <div
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all",
                  item.active ? "bg-white/10 text-white font-bold" : "text-white/70 hover:bg-white/5"
                )}
              >
                <MenuIcon type={item.icon} active={item.active} />
                <span className="text-sm tracking-tight">{item.name}</span>
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto no-scrollbar bg-[#F8FAFC]">
        {/* HEADER CARD */}
        <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8 mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Dashboard</h2>
            <p className="text-sm text-[#94A3B8] font-medium">Premium enterprise farm monitoring</p>
          </div>
        </Card>

        {/* METRICS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Sheep", value: totalSheep.toLocaleString() },
            { title: "Monthly Expense", value: `₹${monthlyExpenseTotal.toLocaleString()}` },
            { title: "Revenue", value: `₹${totalSales.toLocaleString()}` },
            { title: "Mortality Rate", value: `${mortalityRate}%` }
          ].map((card, idx) => (
            <Card key={idx} className="rounded-[1.5rem] border-none shadow-md bg-white p-8 min-h-[140px] flex flex-col justify-between">
              <h3 className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider">{card.title}</h3>
              <p className="text-3xl font-black text-[#0FA5A0] tracking-tighter">{card.value}</p>
            </Card>
          ))}
        </section>

        {/* BOTTOM SECTION GRID */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* ALERTS CARD */}
          <Card className="rounded-[2rem] border-none shadow-md bg-white overflow-hidden h-full">
            <div className="p-8 pb-4">
              <h3 className="text-lg font-bold text-[#1E293B]">Alerts</h3>
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
          <Card className="rounded-[2rem] border-none shadow-md bg-white p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-[#1E293B]">Monthly Growth</h3>
              <div className="px-3 py-1 rounded-full bg-[#E6F7F6] text-[#0FA5A0] text-[10px] font-black tracking-widest border border-[#0FA5A0]/10">
                +12%
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
      </main>
    </div>
  );
}
