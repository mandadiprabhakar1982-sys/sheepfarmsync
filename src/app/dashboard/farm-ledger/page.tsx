'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trash2, 
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';

const ledgerCategories = {
  operational: ["Feed Purchase", "Labour Payment", "Medicine", "Transport", "Veterinary Service"],
  utility: ["Electricity", "Water Supply", "Equipment Repair", "Miscellaneous"]
};

export default function FarmLedgerPage() {
  const { 
    farmExpenses, addFarmExpense, deleteFarmExpense, totalExpenses,
    isLoading 
  } = useFarm();
  const { toast } = useToast();

  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    expenseType: "",
    amount: "",
    paymentMode: "",
    notes: ""
  });

  const sortedExpenses = useMemo(() => {
    if (!farmExpenses) return [];
    return [...farmExpenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  }, [farmExpenses]);

  const saveLedger = () => {
    if (!ledgerForm.expenseType || !ledgerForm.amount) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please enter type and amount.' });
      return;
    }
    
    addFarmExpense({
      expenseDate: ledgerForm.date,
      description: ledgerForm.expenseType,
      amount: parseFloat(ledgerForm.amount),
      paymentMode: ledgerForm.paymentMode,
      notes: ledgerForm.notes,
      expenseType: ledgerForm.expenseType
    } as any);

    toast({ title: "Ledger Updated", description: "Record has been synchronized." });
    setLedgerForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      expenseType: "",
      amount: "",
      paymentMode: "",
      notes: ""
    });
    setShowLedgerForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-in fade-in duration-700">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Farm Ledger</h1>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Operational disbursement audit</p>
      </header>

      <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="mb-10 flex items-center justify-between">
            <button 
              onClick={() => setShowLedgerForm(true)} 
              className="bg-[#0F766E] hover:bg-[#134E4A] text-white rounded-2xl px-10 py-5 text-sm font-black tracking-[0.18em] uppercase shadow-xl transition-all active:scale-95 flex items-center gap-4"
            >
              <span className="text-2xl leading-none">+</span>
              Add Record
            </button>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Total Ledger Value</p>
              <p className="text-3xl font-black text-[#0FA5A0] tracking-tighter">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>

          {showLedgerForm && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Add Farm Record</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Operational disbursement registry</p>
                  </div>
                  <button onClick={() => setShowLedgerForm(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Entry Date</label>
                      <input 
                        type="date" 
                        className="w-full h-14 border-none bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 focus:ring-2 focus:ring-[#0FA5A0]/20 outline-none" 
                        value={ledgerForm.date} 
                        onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Expense Type</label>
                      <select 
                        className="w-full h-14 border-none bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 focus:ring-2 focus:ring-[#0FA5A0]/20 outline-none appearance-none" 
                        value={ledgerForm.expenseType} 
                        onChange={(e) => setLedgerForm({ ...ledgerForm, expenseType: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        <optgroup label="Operational">
                          {ledgerCategories.operational.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Utility">
                          {ledgerCategories.utility.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Amount (₹)</label>
                      <input 
                        placeholder="0.00" 
                        className="w-full h-14 border-none bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 focus:ring-2 focus:ring-[#0FA5A0]/20 outline-none" 
                        value={ledgerForm.amount} 
                        onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Mode</label>
                      <select 
                        className="w-full h-14 border-none bg-slate-50 rounded-2xl px-5 font-bold text-slate-700 focus:ring-2 focus:ring-[#0FA5A0]/20 outline-none appearance-none" 
                        value={ledgerForm.paymentMode} 
                        onChange={(e) => setLedgerForm({ ...ledgerForm, paymentMode: e.target.value })}
                      >
                        <option value="">Select Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                        <option value="UPI">UPI / Digital</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Notes / Description</label>
                      <textarea 
                        placeholder="Transaction details..." 
                        className="w-full h-32 border-none bg-slate-50 rounded-3xl p-6 font-bold text-slate-700 focus:ring-2 focus:ring-[#0FA5A0]/20 outline-none resize-none" 
                        value={ledgerForm.notes} 
                        onChange={(e) => setLedgerForm({ ...ledgerForm, notes: e.target.value })} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={saveLedger} 
                    className="w-full h-16 bg-[#0FA5A0] hover:bg-[#134E4A] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
                  >
                    Save Ledger Entry
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
              <span>Date</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Mode</span>
              <span>Notes</span>
              <span className="text-right">Action</span>
            </div>
            
            {sortedExpenses.length > 0 ? sortedExpenses.map((row) => (
              <div key={row.id} className="grid grid-cols-6 gap-4 border border-slate-100 rounded-3xl p-6 text-sm items-center hover:bg-slate-50 transition-colors group">
                <span className="font-bold text-slate-400 text-xs">{row.expenseDate}</span>
                <span className="font-black text-slate-800">{row.expenseType || row.description}</span>
                <span className="font-black text-[#0FA5A0]">₹{row.amount.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-500">{row.paymentMode || 'N/A'}</span>
                <span className="text-xs font-medium text-slate-400 truncate">{row.notes || row.description}</span>
                <div className="flex justify-end">
                  <button 
                    onClick={() => deleteFarmExpense(row.id, row._path)} 
                    className="h-10 w-10 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No ledger records discovered</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
