'use client';

import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebLedgerTableProps {
  searchTerm: string;
  filterCategory: string;
}

export function WebLedgerTable({ searchTerm, filterCategory }: WebLedgerTableProps) {
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

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden h-full flex flex-col">
      <div className="flex-1 overflow-x-auto no-scrollbar">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subcategory</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Cost</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Mode</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((e) => (
              <TableRow key={e.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
                <TableCell className="py-6 pl-10 text-sm font-bold text-slate-400">{e.date}</TableCell>
                <TableCell>
                  <Badge className={cn("border-none font-black text-[8px] uppercase px-2 py-0.5", e.category === 'Sale' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600")}>
                    {e.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-black text-slate-700">{e.subcategory}</TableCell>
                <TableCell className="font-bold text-slate-500 truncate max-w-[200px]">{e.description}</TableCell>
                <TableCell className="text-center font-bold text-slate-400">{e.quantity}</TableCell>
                <TableCell className="text-right font-bold text-slate-400">₹{e.unitCost?.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className={cn("text-base font-black", e.category === 'Sale' ? 'text-emerald-600' : 'text-slate-900')}>
                    {e.category === 'Sale' ? '+' : ''}₹{e.totalAmount?.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{e.paymentMode}</span>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <button 
                    onClick={() => deleteFarmExpense(e.id, e._path)} 
                    className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} className="py-32 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <FileText className="h-12 w-12" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No ledger records discovered</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
