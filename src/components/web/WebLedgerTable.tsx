'use client';

import { useFarm } from '@/context/FarmContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

export function WebLedgerTable() {
  const { farmExpenses, deleteFarmExpense } = useFarm();

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Mode</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farmExpenses?.map((e) => (
              <TableRow key={e.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
                <TableCell className="py-6 pl-10 text-sm font-bold text-slate-400">{e.date}</TableCell>
                <TableCell>
                  <Badge className={e.category === 'Sale' ? "bg-emerald-50 text-emerald-600 border-none" : "bg-slate-100 text-slate-600 border-none"}>
                    {e.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-700">{e.description}</TableCell>
                <TableCell className="text-right">
                  <span className={`text-base font-black ${e.category === 'Sale' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {e.category === 'Sale' ? '+' : ''}₹{e.totalAmount?.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">{e.paymentMode}</span>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <button onClick={() => deleteFarmExpense(e.id, e._path)} className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}