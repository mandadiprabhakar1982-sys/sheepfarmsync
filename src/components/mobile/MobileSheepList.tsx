'use client';

import { useFarm } from '@/context/FarmContext';
import { Badge } from '@/components/ui/badge';
import { Scale, Calendar, ChevronRight } from 'lucide-react';

export function MobileSheepList() {
  const { trackedSheep } = useFarm();

  return (
    <div className="space-y-4 px-4 pb-32">
      {trackedSheep?.map((sheep) => (
        <div key={sheep.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 active:scale-95 transition-all">
          <div className="h-16 w-16 rounded-2xl bg-[#14d5c7]/10 flex items-center justify-center text-[#14d5c7]">
            <Scale className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <Badge className="bg-[#14d5c7] text-black border-none font-black text-[10px] px-2 py-0">#{sheep.tagId}</Badge>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
            </div>
            <h3 className="text-lg font-black text-white leading-tight truncate">{sheep.breed || 'Standard'}</h3>
            <div className="flex items-center gap-3 mt-2 text-white/40 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> {sheep.currentWeight}kg</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {sheep.age}m</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/20" />
        </div>
      ))}
    </div>
  );
}