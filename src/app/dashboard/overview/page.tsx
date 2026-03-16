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
  Skull,
  LayoutGrid,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { SheepIcon } from '@/components/logo';
import Link from 'next/link';

/**
 * @fileOverview Pashu Summary Page
 */
export default function OverviewPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();
  
  const { 
    totalSheep,
    totalDead,
    totalExpenses, 
    totalReceivables, 
    totalPayables, 
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
    totalCashInflow,
    isLoading 
  } = useFarm();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // --- MOBILE COMPONENTS ---
  const MobileFinancialRow = ({ title, value, icon: Icon, color, href }: { title: string, value: string, icon: any, color: string, href?: string }) => {
    const content = (
      <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-100 mb-2 active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm", color)}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-tight text-slate-900">{value}</span>
          {href && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
        </div>
      </div>
    );

    if (href) {
      return <Link href={href} className="block">{content}</Link>;
    }
    return content;
  };

  const MobileBreakdownCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-slate-100 aspect-square justify-center">
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-md", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}:</p>
      <p className="text-sm font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );

  const MobileView = (
    <div className="max-w-lg mx-auto space-y-8 py-4 animate-in fade-in duration-700">
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 px-1">Paisa Summary</h2>
        <div className="space-y-1">
          <MobileFinancialRow title="Monthly Cash Inflow" value={`₹${totalCashInflow.toLocaleString()}`} icon={ArrowUpCircle} color="bg-emerald-600" />
          <MobileFinancialRow title="Receivables (Raavalasina)" value={`₹${totalReceivables.toLocaleString()}`} icon={TrendingUp} color="bg-blue-500" />
          <MobileFinancialRow title="Payables (Ivvalasina)" value={`₹${totalPayables.toLocaleString()}`} icon={TrendingDown} color="bg-[#f59e0b]" />
          <MobileFinancialRow title="Total Farm Spend" value={`₹${totalExpenses.toLocaleString()}`} icon={ReceiptIndianRupee} color="bg-slate-800" href="/dashboard/farm-ledger" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 px-1">Farm Cost Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          <MobileBreakdownCard title="Fodder Usage" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} color="bg-[#f59e0b]" />
          <MobileBreakdownCard title="Labour Cost" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} color="bg-blue-500" />
          <MobileBreakdownCard title="Medical" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Heart} color="bg-emerald-500" />
          <MobileBreakdownCard title="Other Kharchulu" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Wallet} color="bg-amber-600" />
        </div>
      </section>

      <Button onClick={() => router.push('/dashboard/expenses')} className="w-full h-14 rounded-xl bg-[#f59e0b] hover:bg-amber-600 text-white font-black uppercase tracking-[0.1em] shadow-lg text-xs gap-2 border-none">
        <Plus className="h-4 w-4" /> RECORD KHARCHU
      </Button>
    </div>
  );

  // --- WEB COMPONENTS ---
  const WebView = (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* INVENTORY & FLOCK STATUS */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6">Pashu Inventory Status</h2>
        <div className="flex gap-6">
          <Card className="flex-1 border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex items-center gap-8">
            <div className="h-24 w-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
              <SheepIcon className="h-12 w-12" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Live Pashu Count</p>
              <p className="text-6xl font-black tracking-tighter text-slate-900">{totalSheep}</p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Active Flock</p>
            </div>
          </Card>
          
          <Card className="w-[300px] border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Skull className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Deaths</p>
              <p className="text-4xl font-black tracking-tighter text-rose-600">{totalDead}</p>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Loss Record</p>
            </div>
          </Card>
        </div>
      </section>

      {/* FINANCIAL SUMMARY */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6">Paisa Summary</h2>
        <div className="space-y-4">
          {[
            { label: 'Monthly Cash Inflow', val: totalCashInflow, icon: ArrowUpCircle, color: 'bg-emerald-600' },
            { label: 'Receivables (Raavalasina)', val: totalReceivables, icon: TrendingUp, color: 'bg-blue-50' },
            { label: 'Payables (Ivvalasina)', val: totalPayables, icon: TrendingDown, color: 'bg-[#fef3c7]' },
            { label: 'Total Farm Expenditure', val: totalExpenses, icon: ReceiptIndianRupee, color: 'bg-slate-900', href: '/dashboard/farm-ledger' },
          ].map((row, i) => (
            <Link key={i} href={row.href || '#'} className={cn(
              "bg-white rounded-2xl h-16 px-8 flex items-center justify-between shadow-sm border border-slate-100 transition-all hover:bg-slate-50",
              !row.href && "pointer-events-none"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm", row.color)}>
                  <row.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-600">{row.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{row.val.toLocaleString()}</span>
                {row.href && <ChevronRight className="h-4 w-4 text-slate-300" />}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* OPERATIONAL BREAKDOWN */}
      <section>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-slate-100" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Farm Cost Breakdown</h2>
          <div className="h-[1px] flex-1 bg-slate-100" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Fodder Usage', val: totalFeedCost, icon: Wheat, color: 'bg-[#f59e0b]' },
            { label: 'Labour Cost', val: totalLaborCost, icon: Users, color: 'bg-blue-500' },
            { label: 'Medical', val: totalMedicineCost, icon: Heart, color: 'bg-emerald-500' },
            { label: 'Other Kharchulu', val: totalFarmExpenses, icon: Wallet, color: 'bg-amber-600' },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-xl rounded-[2rem] bg-white p-8 group hover:-translate-y-1 transition-all text-center flex flex-col items-center">
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg", stat.color)}>
                <stat.icon className="h-7 w-7" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}:</p>
              <p className="text-2xl font-black tracking-tighter text-slate-900">₹{stat.val.toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  return isMobile ? MobileView : WebView;
}
