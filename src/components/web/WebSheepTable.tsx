'use client';

import { useFarm } from '@/context/FarmContext';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';

export function WebSheepTable() {
  const { trackedSheep, deleteTrackedSheep } = useFarm();

  return (
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
        <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
          <th className="p-4 font-black">Tag Identity</th>
          <th className="p-4 font-black text-center">Gender</th>
          <th className="p-4 font-black">Genetic Breed</th>
          <th className="p-4 font-black text-center">Maturity</th>
          <th className="p-4 font-black text-right">Mass (KG)</th>
          <th className="p-4 font-black text-right">Verification</th>
          <th className="p-4 font-black text-right pr-6">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {trackedSheep?.length ? (
          trackedSheep.map((sheep) => (
            <tr key={sheep.id} className="hover:bg-emerald-50/30 transition-colors text-sm group">
              <td className="p-4 font-black text-slate-700 tracking-tight">
                <span className="bg-slate-100 px-2 py-1 rounded text-xs">#{sheep.tagId}</span>
              </td>
              <td className="p-4 text-center">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                  sheep.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {sheep.gender || 'F'}
                </span>
              </td>
              <td className="p-4 text-slate-500 font-medium">{sheep.breed || "Standard"}</td>
              <td className="p-4 text-center text-slate-400 font-bold">
                {sheep.age}<span className="text-[9px] uppercase ml-0.5">m</span>
              </td>
              <td className="p-4 text-right font-mono font-black text-[#005f4b] text-base">
                {sheep.currentWeight}
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                  <CheckCircle2 className="h-3 w-3" /> Healthy
                </div>
              </td>
              <td className="p-4 text-right pr-6">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:text-[#0FA5A0] hover:bg-white hover:shadow-sm flex items-center justify-center transition-all active:scale-90"
                    title="Edit Record"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm(`Permanently de-enroll sheep #${sheep.tagId}?`)) {
                        deleteTrackedSheep(sheep.id, sheep._path);
                      }
                    }}
                    className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm flex items-center justify-center transition-all active:scale-90"
                    title="Remove Asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="py-20 text-center">
              <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Global Asset Sync...</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
