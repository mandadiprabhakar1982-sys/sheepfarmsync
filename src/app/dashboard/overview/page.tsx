'use client';

import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  TrendingUp, 
  TrendingDown, 
  ReceiptIndianRupee, 
  Wheat, 
  Users, 
  Heart, 
  Wallet, 
  Plus,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Activity,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * @fileOverview Responsive Overview Page
 * Laptop: Deep Analytics View
 * Mobile: Quick Status & Big Buttons
 */
export default function OverviewPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();
  
  const { 
    totalExpenses, 
    totalReceivables, 
    totalPayables, 
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
    isLoading 
  } = useFarm();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // --- MOBILE COMPONENTS (Tactical Feeds & Big Buttons) ---
  const FinancialRow = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 mb-4 active:scale-[0.98] transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{title}</span>
      </div>
      <span className="text-2xl font-black tracking-tighter text-slate-900">{value}</span>
    </div>
  );

  const BreakdownCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: any }) => (
    <div className="bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 aspect-square justify-center active:scale-[0.98] transition-all">
      <div className="h-16 w-16 rounded-[1.5rem] bg-[#f59e0b] flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}:</p>
      <p className="text-xl font-black tracking-tighter text-slate-900">{value}</p>
    </div>
  );

  const MobileOverview = (
    <div className="max-w-lg mx-auto space-y-10 py-4 animate-in fade-in duration-700">
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Financial Summary</h2>
        <div className="space-y-1">
          <FinancialRow title="Receivables" value={`₹${totalReceivables.toLocaleString()}`} icon={TrendingUp} color="bg-blue-500" />
          <FinancialRow title="Payables" value={`₹${totalPayables.toLocaleString()}`} icon={TrendingDown} color="bg-[#f59e0b]" />
          <FinancialRow title="Total Cost" value={`₹${totalExpenses.toLocaleString()}`} icon={ReceiptIndianRupee} color="bg-slate-800" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Operational Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          <BreakdownCard title="Feed" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} />
          <BreakdownCard title="Labor" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} />
          <BreakdownCard title="Medical" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Heart} />
          <BreakdownCard title="Misc" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Wallet} />
        </div>
      </section>

      <Button onClick={() => router.push('/dashboard/expenses')} className="w-full h-16 rounded-2xl bg-[#f59e0b] hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] shadow-xl text-sm gap-3">
        <Plus className="h-6 w-6" /> RECORD EXPENSE
      </Button>
    </div>
  );

  // --- WEB COMPONENTS (Deep Analytics & Grids) ---
  const WebOverview = (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">Analytics Overview</h1>
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">System Intelligence Hub</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-xl font-black uppercase text-xs tracking-widest gap-2">
            <Activity className="h-4 w-4" /> Live Sync
          </Button>
          <Button onClick={() => router.push('/dashboard/analysis')} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest gap-2">
            <BarChart3 className="h-4 w-4 text-accent" /> Run AI Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-blue-600 text-white overflow-hidden p-8">
          <TrendingUp className="h-10 w-10 mb-6 text-blue-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">Total Receivables</p>
          <p className="text-5xl font-black tracking-tighter">₹{totalReceivables.toLocaleString()}</p>
        </Card>
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-amber-500 text-white overflow-hidden p-8">
          <TrendingDown className="h-10 w-10 mb-6 text-amber-100" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">Total Payables</p>
          <p className="text-5xl font-black tracking-tighter">₹{totalPayables.toLocaleString()}</p>
        </Card>
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden p-8">
          <ShieldCheck className="h-10 w-10 mb-6 text-emerald-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">Total Capital Impact</p>
          <p className="text-5xl font-black tracking-tighter">₹{totalExpenses.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Feed Procurement', val: totalFeedCost, icon: Wheat, color: 'text-emerald-600' },
          { label: 'Labor Disbursement', val: totalLaborCost, icon: Users, color: 'text-blue-600' },
          { label: 'Clinical Costs', val: totalMedicineCost, icon: Heart, color: 'text-red-600' },
          { label: 'General Overhead', val: totalFarmExpenses, icon: Wallet, color: 'text-purple-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2rem] bg-white p-8 group hover:-translate-y-1 transition-all">
            <div className={cn("h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-6", stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter text-slate-900">₹{stat.val.toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  return isMobile ? MobileOverview : WebOverview;
}
