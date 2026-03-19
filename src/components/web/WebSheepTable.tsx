'use client';

import { useFarm } from '@/context/FarmContext';
import { Pencil, Trash2 } from 'lucide-react';

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
                    <span className="text-3xl font-black tracking-tight text-[#1a1a1a]">#{sheep.tagId}</span>
                    {sheep.gender && (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        sheep.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {sheep.gender}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-10 px-4">
                  <span className="text-lg font-medium text-gray-500 uppercase tracking-wide">
                    {sheep.breed || "Standard"}
                  </span>
                </td>
                <td className="py-10 px-4">
                  <span className="text-lg font-medium text-gray-400">
                    {sheep.age} Months
                  </span>
                </td>
                <td className="py-10 px-4 text-4xl font-black text-right tracking-tighter text-[#1a1a1a]">
                  {sheep.currentWeight}
                </td>
                <td className="py-10 px-4 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
                      title="Edit Genetic Record"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteTrackedSheep(sheep.id, sheep._path)} 
                      className="h-12 w-12 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
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
                <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">Awaiting Asset Data</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
