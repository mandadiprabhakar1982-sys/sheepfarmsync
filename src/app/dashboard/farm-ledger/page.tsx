'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trash2, 
  Plus,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  FileText,
  Clock,
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { FarmCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const ledgerConfig = {
  Health: ["Medicine", "Vaccination", "Deworming", "Doctor Visit", "Supplement", "Mortality"],
  Feed: ["Green Feed", "Dry Feed", "Silage", "Concentrate", "Minerals"],
  Labour: ["Daily Wage", "Monthly Salary", "Transport Labour", "Cleaning"],
  Utility: ["Electricity", "Water", "Fuel", "Repair", "Equipment"],
  Purchase: ["Animal Purchase", "Other Asset"],
  Sale: ["Animal Sale", "Byproduct Sale"],
  Miscellaneous: ["General", "Tax", "Insurance"]
};

function FarmLedgerContent() {
  const { 
    farmExpenses, addFarmExpense, deleteFarmExpense, 
    totalExpenses, totalSales, isLoading, ledgerError
  } = useFarm();
  const { toast } = useToast();

  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [ledgerForm, setLedgerForm] = useState({
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
    const qty = parseFloat(ledgerForm.quantity) || 0;
    const unit = parseFloat(ledgerForm.unitCost) || 0;
    setLedgerForm(prev => ({ ...prev, totalAmount: (qty * unit).toFixed(2) }));
  }, [ledgerForm.quantity, ledgerForm.unitCost]);

  const filteredExpenses = useMemo(() => {
    if (!farmExpenses) return [];
    return farmExpenses.filter(e => {
      const matchesSearch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (e.subcategory || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCategory === 'All' || e.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [farmExpenses, searchTerm, filterCategory]);

  // EARLY ERROR THROW MUST BE AFTER ALL HOOKS
  if (ledgerError) {
    throw ledgerError;
  }

  const saveLedger = () => {
    const total = parseFloat(ledgerForm.totalAmount);
    if (!ledgerForm.description || isNaN(total)) {
      toast({ variant: 'destructive', title: 'Invalid Entry', description: 'Please enter a description and valid amounts.' });
      return;
    }
    
    addFarmExpense({
      ...ledgerForm,
      quantity: parseFloat(ledgerForm.quantity),
      unitCost: parseFloat(ledgerForm.unitCost),
      totalAmount: total,
    } as any);

    toast({ title: "Ledger Synchronized", description: "Record committed to master registry." });
    setShowLedgerForm(false);
    setLedgerForm({
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

  const handleDelete = (id: string, path?: string) => {
    if (confirm("Permanently remove this ledger entry?")) {
      deleteFarmExpense(id, path);
      toast({ title: "Entry Removed", description: "Audit trail adjusted." });
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl animate-pulse space-y-6">
        <div className="h-12 bg-slate-200 rounded-xl w-48" />
        <div className="h-14 bg-slate-200 rounded-2xl w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-in fade-in duration-700 max-w-7xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-4 md:px-0">
        <div>
          <h1 className="text-3xl font-black text-[#1a252f] tracking-tight leading-none mb-2">Farm Ledger</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Unified Transactional Audit</p>
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
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 mb-8 px-4 md:px-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search transactions..." 
            className="h-14 pl-12 rounded-2xl bg-white border-slate-100 shadow-sm font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <select 
            className="h-14 px-6 rounded-2xl bg-white border-slate-100 shadow-sm font-bold text-slate-600 outline-none flex-1 lg:flex-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {Object.keys(ledgerConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button 
            onClick={() => setShowLedgerForm(true)} 
            className="bg-[#0F766E] hover:bg-[#134E4A] text-white rounded-2xl px-6 lg:px-10 h-14 text-xs font-black tracking-[0.1em] uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Record</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="block md:hidden space-y-4 px-4 pb-32">
        {filteredExpenses.length > 0 ? filteredExpenses.map((e) => (
          <Card key={e.id} className="border-none shadow-md rounded-[1.5rem] bg-white overflow-hidden active:scale-[0.98] transition-all">
            <CardContent className="p-0">
              <div className={cn("h-1.5 w-full", e.category === 'Sale' ? "bg-emerald-500" : "bg-slate-200")} />
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("border-none font-black text-[8px] uppercase px-2 py-0.5", e.category === 'Sale' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600")}>
                        {e.category}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.subcategory}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{e.description}</h3>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xl font-black tracking-tight", e.category === 'Sale' ? "text-emerald-600" : "text-neutral-900")}>
                      {e.category === 'Sale' ? '+' : ''}₹{e.totalAmount?.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{e.paymentMode}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{formatDisplayDate(e.date)}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(e.id, e._path)} 
                    className="h-9 w-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center opacity-40">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">No ledger entries</p>
          </div>
        )}
      </div>

      <div className="hidden md:block bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Subcategory</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Cost</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Mode</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? filteredExpenses.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6 text-sm font-bold text-slate-400">{e.date}</td>
                  <td className="p-6">
                    <Badge className={e.category === 'Sale' ? "bg-emerald-50 text-emerald-600 border-none" : "bg-slate-100 text-slate-600 border-none"}>
                      {e.category}
                    </Badge>
                  </td>
                  <td className="p-6 text-sm font-black text-slate-700">{e.subcategory}</td>
                  <td className="p-6 text-sm font-medium text-slate-500 truncate max-w-[200px]">{e.description}</td>
                  <td className="p-6 text-sm font-bold text-slate-400 text-center">{e.quantity}</td>
                  <td className="p-6 text-sm font-bold text-slate-400 text-right">₹{e.unitCost?.toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <span className={`text-base font-black ${e.category === 'Sale' ? 'text-emerald-600' : 'text-[#1a252f]'}`}>
                      {e.category === 'Sale' ? '+' : ''}₹{e.totalAmount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{e.paymentMode}</span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleDelete(e.id, e._path)} 
                      className="h-10 w-10 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all mx-auto md:ml-auto group-hover:scale-110 active:scale-90"
                      title="Remove Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <FileText className="h-12 w-12" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No ledger records discovered</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLedgerForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-neutral-900 p-8 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#0FA5A0]/20 rounded-2xl text-[#0FA5A0]"><Plus className="h-6 w-6" /></div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight">Add Farm Record</h4>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Unified Transaction Registry</p>
                </div>
              </div>
              <button onClick={() => setShowLedgerForm(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Entry Date</label>
                  <Input type="date" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={ledgerForm.date} onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full h-14 bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none border-none"
                    value={ledgerForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as FarmCategory;
                      setLedgerForm({ ...ledgerForm, category: cat, subcategory: ledgerConfig[cat][0] });
                    }}
                  >
                    {Object.keys(ledgerConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subcategory</label>
                  <select 
                    className="w-full h-14 bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none border-none"
                    value={ledgerForm.subcategory}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, subcategory: e.target.value })}
                  >
                    {ledgerConfig[ledgerForm.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Mode</label>
                  <select 
                    className="w-full h-14 bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 outline-none appearance-none border-none"
                    value={ledgerForm.paymentMode}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, paymentMode: e.target.value as any })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / UPI</option>
                    <option value="Credit">Credit / Dues</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                  <Input placeholder="What was this transaction for?" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={ledgerForm.description} onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Quantity</label>
                    <Input type="number" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={ledgerForm.quantity} onChange={(e) => setLedgerForm({ ...ledgerForm, quantity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Unit Cost (₹)</label>
                    <Input type="number" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={ledgerForm.unitCost} onChange={(e) => setLedgerForm({ ...ledgerForm, unitCost: e.target.value })} />
                  </div>
                </div>
                <div className="md:col-span-2 p-6 rounded-3xl bg-[#D7F2F1] flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#176E6C]">Calculated Total</span>
                  <span className="text-3xl font-black text-[#0FA5A0]">₹{ledgerForm.totalAmount}</span>
                </div>
              </div>
              <button 
                onClick={saveLedger} 
                className="w-full h-16 bg-[#0FA5A0] hover:bg-[#134E4A] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                Commit Ledger Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FarmLedgerPage() {
  return (
    <ErrorBoundary>
      <FarmLedgerContent />
    </ErrorBoundary>
  );
}
