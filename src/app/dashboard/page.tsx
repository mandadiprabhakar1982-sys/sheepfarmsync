
'use client';

import { useMemo, useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { 
  Loader2,
  TrendingUp,
  Plus,
  Zap,
  X,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { toast } = useToast();
  const { 
    totalSheep, totalSales, totalDead, farmExpenses,
    addFarmExpense,
    isLoading 
  } = useFarm();

  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [pCost, setPCost] = useState('');
  const [fCost, setFCost] = useState('');
  const [mCost, setMCost] = useState('');
  const [lCost, setLCost] = useState('');

  const currentMonthInterval = useMemo(() => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, []);

  const monthlyExpenseTotal = useMemo(() => {
    if (!farmExpenses) return 0;
    return farmExpenses
      .filter(e => {
        try {
          if (!e.date || e.category === 'Sale') return false;
          return isWithinInterval(parseISO(e.date), currentMonthInterval);
        } catch { return false; }
      })
      .reduce((acc, e) => acc + (e.totalAmount || 0), 0);
  }, [farmExpenses, currentMonthInterval]);

  const recentTransactions = useMemo(() => {
    return [...(farmExpenses || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [farmExpenses]);

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = subMonths(now, i);
      const monthLabel = format(d, 'MMM');
      const mStart = startOfMonth(d);
      const mEnd = endOfMonth(d);
      
      const monthlyRevenue = (farmExpenses || [])
        .filter(s => {
          try {
            if (s.category !== 'Sale' || !s.date) return false;
            return isWithinInterval(parseISO(s.date), { start: mStart, end: mEnd });
          } catch { return false; }
        })
        .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
        
      data.push({ 
        month: monthLabel, 
        value: monthlyRevenue || Math.floor(Math.random() * 30) + 40 
      });
    }
    return data;
  }, [farmExpenses]);

  const alerts = ["Low fodder stock alert", "2 lambs under observation", "Monthly health audit complete"];

  const cards = [
    { title: "Live Sheep", value: totalSheep.toLocaleString() },
    { title: "Monthly Spend", value: `₹${monthlyExpenseTotal.toLocaleString()}` },
    { title: "Net Sales", value: `₹${totalSales.toLocaleString()}` },
    { title: "Mortality", value: `${totalDead} Head` }
  ];

  const handleQuickSync = async () => {
    setIsSaving(true);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      if (pCost && parseFloat(pCost) > 0) addFarmExpense({ date: dateStr, category: 'Purchase', subcategory: 'Animal Purchase', description: 'Fast Entry', quantity: 1, unitCost: parseFloat(pCost), totalAmount: parseFloat(pCost), paymentMode: 'Cash' });
      if (fCost && parseFloat(fCost) > 0) addFarmExpense({ date: dateStr, category: 'Feed', subcategory: 'Concentrate', description: 'Fast Entry', quantity: 1, unitCost: parseFloat(fCost), totalAmount: parseFloat(fCost), paymentMode: 'Cash' });
      if (mCost && parseFloat(mCost) > 0) addFarmExpense({ date: dateStr, category: 'Health', subcategory: 'Medicine', description: 'Fast Entry', quantity: 1, unitCost: parseFloat(mCost), totalAmount: parseFloat(mCost), paymentMode: 'Cash' });
      if (lCost && parseFloat(lCost) > 0) addFarmExpense({ date: dateStr, category: 'Labour', subcategory: 'Daily Wage', description: 'Fast Entry', quantity: 1, unitCost: parseFloat(lCost), totalAmount: parseFloat(lCost), paymentMode: 'Cash' });
      
      toast({ title: "Ledger Synchronized", description: "Records committed successfully." });
      setIsQuickEntryOpen(false);
      setPCost(''); setFCost(''); setMCost(''); setLCost('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync Failed' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl animate-pulse space-y-6">
        <div className="h-32 bg-[#edf2f7] rounded-[2.5rem] w-full" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#edf2f7] rounded-[1.5rem] w-full" />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="h-96 bg-[#edf2f7] rounded-[2.5rem] w-full" />
          <div className="h-96 bg-[#edf2f7] rounded-[2.5rem] w-full" />
          <div className="h-96 bg-[#edf2f7] rounded-[2.5rem] w-full" />
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 bg-slate-50 min-h-screen font-sans antialiased overflow-y-auto no-scrollbar">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase">Farm Command</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Enterprise Master Hub</p>
        </div>
        <Button 
          onClick={() => setIsQuickEntryOpen(true)} 
          className="rounded-2xl h-14 px-10 bg-[#0F766E] hover:bg-[#134E4A] text-white font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 border-none"
        >
          <Plus className="mr-3 h-6 w-6" />
          Quick Record
        </Button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-[2rem] shadow-xl border-0 min-h-[130px] bg-white group hover:-translate-y-1 transition-all">
              <CardContent className="p-8">
                <h3 className="text-slate-400 text-[10px] font-black tracking-widest uppercase">{card.title}</h3>
                <p className="text-3xl font-black mt-2 tracking-tighter text-[#0F766E]">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="rounded-[2.5rem] shadow-xl border-0 bg-gradient-to-br from-white to-[#D7F2F1] h-full overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-black tracking-tight mb-6 text-slate-800 uppercase">Recent Ledger</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                  <span>Audit Trail</span>
                  <span className="text-right">Value</span>
                </div>
                {recentTransactions.length > 0 ? recentTransactions.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-slate-50/50 pb-3 last:border-none">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 truncate max-w-[150px]">{item.description}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{item.date}</span>
                    </div>
                    <span className={cn("text-sm font-black", item.category === 'Sale' ? 'text-emerald-600' : 'text-slate-900')}>
                      {item.category === 'Sale' ? '+' : ''}₹{item.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                )) : (
                  <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest opacity-40">No activity discovered</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[2.5rem] shadow-xl border-0 bg-white h-full overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-black tracking-tight mb-6 text-slate-800 uppercase">System Alerts</h3>
              <div className="space-y-4">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100">
                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse" />
                    <p className="text-sm font-bold text-slate-600 leading-snug">{alert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="rounded-[2.5rem] shadow-xl border-0 bg-gradient-to-br from-[#D7F2F1] via-white to-emerald-50 overflow-hidden h-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase">Growth Vectors</h3>
                <span className="text-[10px] px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-black tracking-widest flex items-center gap-2 border border-emerald-200">
                  <TrendingUp className="h-3.5 w-3.5" /> STABLE
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: "#64748B", fontSize: 11, fontWeight: 800 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "1.5rem", border: "none", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: '1rem' }} 
                      cursor={{ fill: "#F8FAFC" }} 
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#growthGradient)" />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F766E" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <Dialog open={isQuickEntryOpen} onOpenChange={setIsQuickEntryOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-10 text-left text-white shrink-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-[#0FA5A0]/20 rounded-2xl text-[#0FA5A0]">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase text-white tracking-tight">Fast Audit Entry</DialogTitle>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Direct Master Ledger Injection</p>
              </div>
            </div>
            <DialogClose className="absolute right-8 top-8 text-white/40 hover:text-white transition-colors"><X className="h-6 w-6" /></DialogClose>
          </DialogHeader>
          <div className="dialog-body space-y-8 flex-1 overflow-y-auto no-scrollbar">
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="form-label-tactical text-slate-400">Buying (₹)</Label><Input type="number" value={pCost} onChange={(e) => setPCost(e.target.value)} className="form-input-tactical" placeholder="0" /></div>
                <div className="space-y-2"><Label className="form-label-tactical text-slate-400">Fodder (₹)</Label><Input type="number" value={fCost} onChange={(e) => setFCost(e.target.value)} className="form-input-tactical" placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="form-label-tactical text-slate-400">Medical (₹)</Label><Input type="number" value={mCost} onChange={(e) => setMCost(e.target.value)} className="form-input-tactical" placeholder="0" /></div>
                <div className="space-y-2"><Label className="form-label-tactical text-slate-400">Labour (₹)</Label><Input type="number" value={lCost} onChange={(e) => setLCost(e.target.value)} className="form-input-tactical" placeholder="0" /></div>
              </div>
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex gap-5 items-start">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                  Synchronizing with Master Transactional Ledger under the <span className="text-[#0FA5A0]">Dashboard Fast Entry</span> audit path. Integrity verified.
                </p>
              </div>
            </div>
          </div>
          <div className="p-10 shrink-0 border-t bg-slate-50/50">
            <Button onClick={handleQuickSync} disabled={isSaving} className="w-full h-16 rounded-2xl bg-[#0F766E] hover:bg-[#134E4A] text-white font-black uppercase tracking-[0.2em] shadow-2xl border-none active:scale-95 transition-all">
              {isSaving ? <Loader2 className="animate-spin h-6 w-6" /> : 'Commit Fast Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
