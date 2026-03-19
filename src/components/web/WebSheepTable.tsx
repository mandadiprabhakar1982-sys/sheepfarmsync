'use client';

import { useFarm } from '@/context/FarmContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Scale } from 'lucide-react';

export function WebSheepTable() {
  const { trackedSheep, deleteTrackedSheep } = useFarm();

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Tag ID</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Breed</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Age</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Weight</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackedSheep?.map((sheep) => (
              <TableRow key={sheep.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
                <TableCell className="py-6 pl-10">
                  <Badge className="bg-[#D7F2F1] text-[#0FA5A0] border-none font-black text-xs px-3">#{sheep.tagId}</Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-700">{sheep.breed || 'Standard'}</TableCell>
                <TableCell className="text-sm font-medium text-slate-400">{sheep.age} Months</TableCell>
                <TableCell className="text-right">
                  <span className="font-black text-slate-900">{sheep.currentWeight} KG</span>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-[#0FA5A0] hover:text-white flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteTrackedSheep(sheep.id, sheep._path)} className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}