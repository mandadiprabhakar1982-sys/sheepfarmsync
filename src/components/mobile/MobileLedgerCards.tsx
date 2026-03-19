'use client';

import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

interface MobileLedgerCardsProps {
  searchTerm: string;
  filterCategory: string;
}

export function MobileLedgerCards({ searchTerm, filterCategory }: MobileLedgerCardsProps) {
  const { farmExpenses, deleteFarmExpense } = useFarm();

  const filteredData = useMemo(() => {
    if (!farmExpenses) return [];
    return farmExpenses.filter(e => {
      const matchesSearch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (e.subcategory || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCategory === 'All' || e.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [farmExpenses, searchTerm, filterCategory]);

  const formatDisplayDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM dd, yyyy");
  };

  return (
    <div className="space-y-4 px-4 pb-32">
      {filteredData.length > 0 ? filteredData.map((e) => (
        <div key={e.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 active:scale-[0.98] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={cn("border-none font-black text-[8px] uppercase px-2 py-0.5", e.category === 'Sale' ? "bg-emerald-500 text-black" : "bg-white/10 text-white/60")}>
                  {e.category}
                </Badge>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{e.subcategory}</span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight">{e.description}</h3>
            </div>
            <div className="text-right">
              <p className={cn("text-xl font-black", e.category === 'Sale' ? 'text-emerald-400' : 'text-white')}>
                {e.category === 'Sale' ? '+' : ''}₹{e.totalAmount?.toLocaleString()}
              </p>
              <p className="text-[9px] font-bold text-white/20 uppercase">{e.paymentMode}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/20">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase">{formatDisplayDate(e.date)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                {e.quantity} units @ ₹{e.unitCost}
              </span>
              <button 
                onClick={() => deleteFarmExpense(e.id, e._path)} 
                className="h-9 w-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-90 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )) : (
        <div className="py-20 text-center opacity-20">
          <FileText className="h-12 w-12 mx-auto mb-4 text-white" />
          <p className="text-xs font-black uppercase tracking-widest text-white">No ledger entries discovered</p>
        </div>
      )}
    </div>
  );
}
