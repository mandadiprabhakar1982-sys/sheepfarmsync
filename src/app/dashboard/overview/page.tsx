'use client';

import { useFarm } from '@/context/FarmContext';
import { 
  TrendingUp, 
  TrendingDown, 
  ReceiptIndianRupee, 
  Wheat, 
  Users, 
  Heart, 
  Wallet, 
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OverviewPage() {
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
      <div className="flex h-[calc(100vh-180px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Linking Command Hub</p>
        </div>
      </div>
    );
  }

  const FinancialRow = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 mb-4 group active:scale-[0.98] transition-all">
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
    <div className="bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 aspect-square justify-center group active:scale-[0.98] transition-all">
      <div className="h-16 w-16 rounded-[1.5rem] bg-[#f59e0b] flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}:</p>
      <p className="text-xl font-black tracking-tighter text-slate-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-full py-4 animate-in fade-in duration-700">
      <div className="max-w-lg mx-auto space-y-10">
        
        {/* FINANCIAL SUMMARY */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Financial Summary</h2>
          <div className="space-y-1">
            <FinancialRow 
              title="Receivables Pending" 
              value={`₹${totalReceivables.toLocaleString()}`} 
              icon={TrendingUp} 
              color="bg-blue-500" 
            />
            <FinancialRow 
              title="Payables Due" 
              value={`₹${totalPayables.toLocaleString()}`} 
              icon={TrendingDown} 
              color="bg-[#f59e0b]" 
            />
            <FinancialRow 
              title="Total Cost Summary" 
              value={`₹${totalExpenses.toLocaleString()}`} 
              icon={ReceiptIndianRupee} 
              color="bg-slate-800" 
            />
          </div>
        </section>

        {/* OPERATIONAL BREAKDOWN */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Operational Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <BreakdownCard title="Feed Usage" value={`₹${totalFeedCost.toLocaleString()}`} icon={Wheat} />
            <BreakdownCard title="Labor Cost" value={`₹${totalLaborCost.toLocaleString()}`} icon={Users} />
            <BreakdownCard title="Medical" value={`₹${totalMedicineCost.toLocaleString()}`} icon={Heart} />
            <BreakdownCard title="Misc. Expenses" value={`₹${totalFarmExpenses.toLocaleString()}`} icon={Wallet} />
          </div>
        </section>

        {/* QUICK ACTION BUTTON */}
        <div className="pt-4 pb-10">
          <Button 
            onClick={() => router.push('/dashboard/expenses')}
            className="w-full h-16 rounded-2xl bg-[#f59e0b] hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 text-sm gap-3 border-none"
          >
            <Plus className="h-6 w-6" />
            Record Expense
          </Button>
        </div>

      </div>
    </div>
  );
}
