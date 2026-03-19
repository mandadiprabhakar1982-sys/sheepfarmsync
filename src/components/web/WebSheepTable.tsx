'use client';

import { useFarm } from '@/context/FarmContext';
import { Pencil, Trash2, ShieldCheck } from 'lucide-react';

export function WebSheepTable() {
  const { trackedSheep, deleteTrackedSheep } = useFarm();

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-400 uppercase text-[10px] tracking-[0.3em] border-b border-gray-50">
            <th className="pb-8 px-4 font-black">Tag Identity</th>
            <th className="pb-8 px-4 font-black">Genetic Breed</th>
            <th className="pb-8 px-4 font-black">Maturity</th>
            <th className="pb-8 px-4 font-black text-right">Mass (KG)</th>
            <th className="pb-8 px-4 font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {trackedSheep?.length ? (
            trackedSheep.map((sheep) => (
              <tr key={sheep.id} className="group hover:bg-gray-50 transition-all duration-300">
                <td className="py-10 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black tracking-tighter text-[#1a1a1a]">#{sheep.tagId}</span>
                    {sheep.gender && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest ${
                        sheep.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {sheep.gender}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-10 px-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                      {sheep.breed || "Standard"}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" /> Verified Asset
                    </span>
                  </div>
                </td>
                <td className="py-10 px-4">
                  <span className="text-xl font-bold text-gray-400">
                    {sheep.age} <span className="text-xs uppercase font-black ml-1">Months</span>
                  </span>
                </td>
                <td className="py-10 px-4 text-5xl font-black text-right tracking-tighter text-[#1a1a1a]">
                  {sheep.currentWeight}
                </td>
                <td className="py-10 px-4 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      className="h-12 w-12 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 hover:shadow-lg flex items-center justify-center transition-all active:scale-90"
                      title="Edit Genetic Record"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm(`Permanently de-enroll sheep #${sheep.tagId}?`)) {
                          deleteTrackedSheep(sheep.id, sheep._path);
                        }
                      }}
                      className="h-12 w-12 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:border-rose-500 hover:shadow-lg flex items-center justify-center transition-all active:scale-90"
                      title="De-enroll Asset"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-32 text-center">
                <p className="text-gray-200 font-black uppercase tracking-[0.4em] text-xs">Awaiting Global Asset Sync...</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
