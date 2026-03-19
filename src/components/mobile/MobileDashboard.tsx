'use client';

import { Card } from "@/components/ui/card";
import { Activity, PieChart, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface MobileDashboardProps {
  kpis: { title: string; value: string }[];
  categoryTotals: Record<string, number>;
  totalCategoryAmount: number;
}

export function MobileDashboard({ kpis, categoryTotals, totalCategoryAmount }: MobileDashboardProps) {
  return (
    <div className="px-5 pt-6 space-y-8 h-full overflow-y-auto no-scrollbar pb-32 bg-background">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Analytics</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-black tracking-widest flex items-center gap-2 border border-accent/20">
          <Activity className="h-3 w-3" /> LIVE
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((item, i) => (
          <Card key={i} className="bg-white border-border/50 p-6 flex flex-col justify-between h-32 shadow-md rounded-2xl">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{item.title}</p>
            <p className="text-2xl font-black text-primary tracking-tighter">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* SPEND MATRIX */}
      <Card className="bg-white border-border/50 p-8 rounded-[2rem] shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent/10 text-accent">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-primary uppercase tracking-tight">Spend Matrix</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Breakdown</p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([cat, amt]) => {
            const percent = totalCategoryAmount > 0 ? (amt / totalCategoryAmount) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-wide text-muted-foreground">
                  <span>{cat}</span>
                  <span className="text-accent">₹{amt.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-1000" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="py-10 text-center opacity-20 uppercase text-[10px] font-black text-primary">
              Awaiting Records
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-accent text-[9px] font-black uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" /> Integrity Verified
        </div>
      </Card>
    </div>
  );
}
