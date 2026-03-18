'use client';

import { useState, useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Activity,
  BarChart3,
  HeartPulse,
  IndianRupee,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  Circle,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

function MenuIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    ledger: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    sheep: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="10" r="4" />
        <circle cx="15" cy="10" r="4" />
        <circle cx="12" cy="14" r="4" />
      </svg>
    ),
    feed: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18" />
        <path d="M7 8c2 0 2-2 5-2s3 2 5 2" />
      </svg>
    ),
    labour: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <circle cx="15" cy="8" r="3" />
      </svg>
    ),
    calculator: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
      </svg>
    ),
    health: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-6-4-6-10a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-6 10-6 10z" />
      </svg>
    )
  };

  return <div className="w-5 h-5 text-white">{icons[type] ?? icons.ledger}</div>;
}

export default function OverviewPage() {
  const { width, isHydrated } = useWindowDimensions();
  const router = useRouter();
  const { toast } = useToast();
  
  const { 
    totalSheep, totalSales, totalDead, farmExpenses, healthTasks, sales,
    addFarmExpense, isLoading
  } = useFarm();

  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    expenseType: '',
    amount: '',
    paymentMode: 'Cash',
    notes: ''
  });

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
    const totalHistorical = totalSheep + totalSales + totalDead;
    if (totalHistorical === 0) return '0.0';
    return ((totalDead / totalHistorical) * 100).toFixed(1);
  }, [totalSheep, totalSales, totalDead]);

  const chartData = useMemo(() => {
    if (!sales) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: Record<string, number> = {};
    
    // Group last 4 months
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      data[mName] = 0;
      
      sales.forEach(s => {
        const sDate = parseISO(s.saleDate);
        if (sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear()) {
          data[mName] += s.salePrice;
        }
      });
    }

    return Object.entries(data).map(([month, value]) => ({ month, value: value / 1000 })); // in k
  }, [sales]);

  const alerts = useMemo(() => {
    if (!healthTasks) return [];
    return healthTasks
      .filter(t => t.healthType === 'Treatment' || t.healthType === 'Vaccination')
      .slice(0, 3)
      .map(t => `${t.healthType} for Sheep ${t.sheepId}`);
  }, [healthTasks]);

  const saveLedger = () => {
    if (!ledgerForm.expenseType || !ledgerForm.amount) return;
    addFarmExpense({
      expenseDate: ledgerForm.date,
      description: `${ledgerForm.expenseType}: ${ledgerForm.notes || 'No notes'}`,
      amount: parseFloat(ledgerForm.amount)
    });
    setLedgerForm({ date: format(new Date(), 'yyyy-MM-dd'), expenseType: '', amount: '', paymentMode: 'Cash', notes: '' });
    setIsEntryOpen(false);
    toast({ title: "Success", description: "Farm record synchronized." });
  };

  if (isLoading || !isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { title: "Total Sheep", value: totalSheep.toLocaleString() },
    { title: "Monthly Expense", value: `₹${monthlyExpenseTotal.toLocaleString()}` },
    { title: "Revenue", value: `₹${totalSales.toLocaleString()}` },
    { title: "Mortality Rate", value: `${mortalityRate}%` }
  ];

  const menu = [
    { name: "Farm Ledger", icon: "ledger", href: '/dashboard/farm-ledger' },
    { name: "Sheep Buying", icon: "sheep", href: '/dashboard/purchase' },
    { name: "Fodder & Feed", icon: "feed", href: '/dashboard/feed' },
    { name: "Labour & Staff", icon: "labour", href: '/dashboard/labor' },
    { name: "Calculator", icon: "calculator", href: '/dashboard/feed-calculator' },
    { name: "Health Alerts", icon: "health", href: '/dashboard/medicine' }
  ];

  return (
    <div className="min-h-full bg-slate-50 flex flex-col md:flex-row font-sans antialiased overflow-hidden">
      {/* DESKTOP SIDEBAR OVERLAY (HIDDEN ON MOBILE) */}
      <aside className="hidden lg:block w-72 bg-gradient-to-b from-[#0B8F8A] to-[#0d8f89] text-white p-6 min-h-screen shadow-2xl shrink-0">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight leading-none">Mpr Farms</h1>
          <p className="text-[10px] font-black text-emerald-100 tracking-[0.3em] uppercase mt-1">Enterprise Hub</p>
        </div>

        <nav className="space-y-3">
          {menu.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ x: 4 }}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 cursor-pointer transition text-sm font-bold tracking-tight"
            >
              <MenuIcon type={item.icon} />
              <span>{item.name}</span>
            </motion.div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-10 pb-32 md:pb-10 overflow-y-auto no-scrollbar">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
          <div className="lg:hidden bg-gradient-to-r from-[#0B8F8A] to-[#0d8f89] text-white rounded-[2rem] p-6 mb-2 shadow-xl">
            <h1 className="text-2xl font-black tracking-tight">Mpr Farms</h1>
            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">Enterprise Hub Protocol</p>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900">Farm Dashboard</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Premium enterprise farm monitoring</p>
          </div>
          <Button 
            onClick={() => setIsEntryOpen(true)} 
            className="h-14 rounded-2xl bg-[#0B8F8A] hover:bg-[#0d8f89] text-white font-black uppercase tracking-widest shadow-xl px-10 border-none"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Record
          </Button>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-[2rem] shadow-depth border-none min-h-[130px] group hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{card.title}</h3>
                  <p className="text-3xl font-black mt-3 tracking-tighter text-[#0B8F8A]">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          <Card className="rounded-[2.5rem] shadow-depth border-none bg-gradient-to-br from-white to-emerald-50/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Farm Ledger Preview</h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                  <span>Expense Node</span>
                  <span className="text-right">Audit Value</span>
                </div>
                {(farmExpenses || []).slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-none">
                    <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{item.description}</span>
                    <span className="text-sm font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                {(farmExpenses || []).length === 0 && <div className="py-10 text-center text-[10px] font-black uppercase text-slate-300">No records found</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] shadow-depth border-none">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <HeartPulse className="h-5 w-5 text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Health Alerts</h3>
              </div>
              <div className="space-y-4">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 group hover:bg-rose-50 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-sm font-bold text-slate-700">{alert}</span>
                  </div>
                ))}
                {alerts.length === 0 && <div className="py-10 text-center text-[10px] font-black uppercase text-slate-300">Flock Health Clear</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] shadow-depth border-none bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="h-32 w-32" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Revenue Scaling</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Monthly Growth Audit</p>
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">+12% Target</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="28%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ color: '#0F766E', fontWeight: 900, fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="url(#growthGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B8F8A" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* QUICK ENTRY DIALOG */}
      <Dialog open={isEntryOpen} onOpenChange={setIsEntryOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col overflow-hidden">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Plus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Audit Entry</DialogTitle>
            </div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <div className="dialog-body space-y-6">
            <div className="min-h-[500px] space-y-6">
              <div className="space-y-2">
                <Label className="form-label-tactical">Audit Date</Label>
                <Input
                  className="form-input-tactical"
                  type="date"
                  value={ledgerForm.date}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="form-label-tactical">Node Category</Label>
                <Select
                  value={ledgerForm.expenseType}
                  onValueChange={(v) => setLedgerForm({ ...ledgerForm, expenseType: v })}
                >
                  <SelectTrigger className="form-input-tactical">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Feed Purchase', 'Labour Payment', 'Medicine', 'Transport', 'Electricity', 'Miscellaneous'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="form-label-tactical">Ledger Amount (₹)</Label>
                <Input
                  className="form-input-tactical"
                  placeholder="0.00"
                  value={ledgerForm.amount}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="form-label-tactical">Technical Notes</Label>
                <Textarea
                  className="rounded-2xl bg-slate-50 border-none font-bold p-4 min-h-[100px]"
                  placeholder="Operational details..."
                  value={ledgerForm.notes}
                  onChange={(e) => setLedgerForm({ ...ledgerForm, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="p-6 shrink-0 border-t bg-slate-50">
            <Button onClick={saveLedger} className="w-full h-16 rounded-2xl bg-[#0B8F8A] hover:bg-[#0d8f89] text-white font-black uppercase tracking-widest shadow-xl border-none">
              Commit Audit Node
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
