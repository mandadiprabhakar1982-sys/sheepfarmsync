'use client';

import { useFarm } from '@/context/FarmContext';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, ShieldCheck, Zap } from 'lucide-react';

export function MobileDashboard() {
  const { totalSheep, totalSales, totalExpenses } = useFarm();

  return (
    <div className="px-5 pt-6 space-y-8 h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Sync Pro</h2>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3" /> LIVE
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/5 border-white/10 p-6 flex flex-col justify-between h-32">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sheep</p>
          <p className="text-3xl font-black text-white">{totalSheep}</p>
        </Card>
        <Card className="bg-[#14d5c7] border-none p-6 flex flex-col justify-between h-32">
          <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">Revenue</p>
          <p className="text-2xl font-black text-black">₹{totalSales.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="bg-neutral-900 border-white/5 p-8 relative overflow-hidden">
        <Zap className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12" />
        <div className="relative z-10">
          <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Net Cash Flow</h3>
          <p className="text-4xl font-black text-white tracking-tighter">₹{(totalSales - totalExpenses).toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
            <ShieldCheck className="h-4 w-4" /> Integrity Verified
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">System Protocol</h4>
        {[
          { icon: TrendingUp, label: "Market Trends Stable", color: "text-emerald-400" },
          { icon: Activity, label: "Health Audit Complete", color: "text-[#14d5c7]" }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
            <item.icon className={`h-5 w-5 ${item.color}`} />
            <span className="text-sm font-bold text-white/80">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}