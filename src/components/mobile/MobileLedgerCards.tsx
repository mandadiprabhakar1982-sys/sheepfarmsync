'use client';

import { useFarm } from '@/context/FarmContext';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock } from 'lucide-react';

export function MobileLedgerCards() {
  const { farmExpenses, deleteFarmExpense } = useFarm();

  return (
    <div className="space-y-4 px-4 pb-32">
      {farmExpenses?.map((e) => (
        <div key={e.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={e.category === 'Sale' ? "bg-emerald-500 text-black border-none" : "bg-white/10 text-white/60 border-none"}>{e.category}</Badge>
                <span className="text-[10px] font-bold text-white/20 uppercase">{e.subcategory}</span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight">{e.description}</h3>
            </div>
            <div className="text-right">
              <p className={`text-xl font-black ${e.category === 'Sale' ? 'text-emerald-400' : 'text-white'}`}>
                {e.category === 'Sale' ? '+' : ''}₹{e.totalAmount?.toLocaleString()}
              </p>
              <p className="text-[9px] font-bold text-white/20 uppercase">{e.paymentMode}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/20">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase">{e.date}</span>
            </div>
            <button onClick={() => deleteFarmExpense(e.id, e._path)} className="h-9 w-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-90 transition-all"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}