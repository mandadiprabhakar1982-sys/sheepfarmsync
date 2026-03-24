'use client';

import { useFarm } from '@/context/FarmContext';
import { Badge } from '@/components/ui/badge';
import { Scale, Calendar, ChevronRight, Activity, ImageIcon } from 'lucide-react';
import Image from 'next/image';

export function MobileSheepList() {
  const { trackedSheep } = useFarm();

  return (
    <div className="space-y-6 pb-32">
      {trackedSheep?.length ? trackedSheep.map((sheep) => (
        <div key={sheep.id} className="bg-white border-b border-gray-100 pb-6 flex items-center gap-5 active:scale-[0.98] transition-all">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
            {sheep.imageUrl ? (
              <Image src={sheep.imageUrl} alt={sheep.tagId} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] px-3 py-0.5 uppercase tracking-widest">#{sheep.tagId}</Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <Activity className="h-3 w-3" /> Healthy
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-none truncate uppercase tracking-tight">{sheep.breed || 'Standard'}</h3>
            <div className="flex items-center gap-4 mt-3 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Scale className="h-3.5 w-3.5 opacity-40" /> {sheep.currentWeight} KG</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 opacity-40" /> {sheep.age} MOS</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
            <ChevronRight className="h-6 w-6 text-slate-300" />
          </div>
        </div>
      )) : (
        <div className="py-20 text-center opacity-20 font-black uppercase text-[10px] tracking-[0.3em]">No Assets Logged</div>
      )}
    </div>
  );
}
