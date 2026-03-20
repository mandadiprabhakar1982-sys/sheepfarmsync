'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { WebLedgerTable } from '@/components/web/WebLedgerTable';
import { MobileLedgerCards } from '@/components/mobile/MobileLedgerCards';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  X, 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FarmCategory } from '@/lib/types';

const ledgerConfig = {
  Health: ["Medicine", "Vaccination", "Deworming", "Doctor Visit", "Supplement", "Mortality"],
  Feed: ["Concentrate", "Green Feed", "Dry Feed", "Silage", "Minerals"],
  Labour: ["Daily Wage", "Monthly Salary", "Transport Labour", "Cleaning"],
  Utility: ["Electricity", "Water", "Fuel", "Repair", "Equipment"],
  Purchase: ["Animal Purchase", "Other Asset"],
  Sale: ["Animal Sale", "Byproduct Sale"],
  Miscellaneous: ["General", "Tax", "Insurance"]
};

export function LedgerModule() {
  const { width, isHydrated } = useWindowDimensions();
  const { 
    totalSales, 
    totalExpenses, 
    addFarmExpense,
    isLoading,
    ledgerError
  } = useFarm();
  
  const isMobile = isHydrated ? width < 768 : false;
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: "Feed" as FarmCategory,
    subcategory: "Concentrate",
    description: "",
    quantity: "1",
    unitCost: "0",
    totalAmount: "0",
    paymentMode: "Cash" as const,
    remarks: ""
  });

  useEffect(() => {
    const qty = parseFloat(form.quantity) || 0;
    const unit = parseFloat(form.unitCost) || 0;
    setForm(prev => ({ ...prev, totalAmount: (qty * unit).toFixed(2) }));
  }, [form.quantity, form.unitCost]);

  // Hook count must be consistent. Ensure any error throw happens AFTER all hooks.
  if (ledgerError) {
    throw ledgerError;
  }

  if (isLoading || !isHydrated) {
    return (
      <div className="space-y-6 animate-pulse px-4 md:px-0">
        <div className="h-12 bg-slate-200 rounded-xl w-48" />
        <div className="h-14 bg-slate-200 rounded-2xl w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl w-full" />)}
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!form.description || parseFloat(form.totalAmount) <= 0) return;
    
    addFarmExpense({
      ...form,
      quantity: parseFloat(form.quantity),
      unitCost: parseFloat(form.unitCost),
      totalAmount: parseFloat(form.totalAmount),
    });

    setIsEntryDialogOpen(false);
    setForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      category: "Feed",
      subcategory: "Concentrate",
      description: "",
      quantity: "1",
      unitCost: "0",
      totalAmount: "0",
      paymentMode: "Cash",
      remarks: ""
    });
  };

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-4 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 md:text-slate-800 text-white uppercase tracking-tight leading-none">Farm Ledger</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Unified Transactional Audit</p>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm shrink-0">
            <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Sales</p>
              <p className="text-xl font-black tracking-tight text-[#1a252f]">₹{totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ArrowDownCircle className="h-5 w-5 text-rose-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Expenses</p>
              <p className="text-xl font-black tracking-tight">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEntryDialogOpen(true)}
            className="h-12 px-8 rounded-2xl bg-[#0FA5A0] hover:bg-[#134E4A] text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span className="font-black uppercase text-[10px] tracking-widest">Add Record</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8 px-4 md:px-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search transactions..." 
            className="h-14 pl-12 rounded-2xl bg-white border-none shadow-sm font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-14 md:w-64 rounded-2xl bg-white border-none shadow-sm font-bold text-slate-600">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {Object.keys(ledgerConfig).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <MobileLedgerCards searchTerm={searchTerm} filterCategory={filterCategory} />
        ) : (
          <WebLedgerTable searchTerm={searchTerm} filterCategory={filterCategory} />
        )}
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[90dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#0FA5A0]/20 rounded-2xl text-[#0FA5A0]"><Plus className="h-6 w-6" /></div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Add Farm Record</DialogTitle>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Unified Transaction Registry</p>
              </div>
            </div>
            <DialogClose className="text-white/40 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </DialogClose>
          </DialogHeader>
          
          <div className="p-8 overflow-y-auto no-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Entry Date</Label>
                <Input type="date" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</Label>
                <select 
                  className="w-full h-14 bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none border-none"
                  value={form.category}
                  onChange={(e) => {
                    const cat = e.target.value as FarmCategory;
                    setForm({ ...form, category: cat, subcategory: ledgerConfig[cat][0] });
                  }}
                >
                  {Object.keys(ledgerConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subcategory</Label>
                <select 
                  className="w-full h-14 bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none border-none"
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                >
                  {ledgerConfig[form.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Mode</Label>
                <select 
                  className="w-full h-14 bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none border-none"
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value as any })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / UPI</option>
                  <option value="Credit">Credit / Dues</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</Label>
                <Input placeholder="What was this transaction for?" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Quantity</Label>
                  <Input type="number" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Unit Cost (₹)</Label>
                  <Input type="number" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
                </div>
              </div>
              <div className="md:col-span-2 p-6 rounded-3xl bg-[#D7F2F1] flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#176E6C]">Calculated Total</span>
                <span className="text-3xl font-black text-[#0FA5A0]">₹{form.totalAmount}</span>
              </div>
            </div>
          </div>
          <div className="p-8 shrink-0 border-t">
            <Button 
              onClick={handleSave} 
              className="w-full h-16 bg-[#0FA5A0] hover:bg-[#134E4A] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
            >
              Commit Ledger Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}