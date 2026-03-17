'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  Calendar as CalendarIcon,
  Loader2,
  Zap
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, isToday, isYesterday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { IconFarmCost } from '@/components/logo';

export default function FarmLedgerPage() {
  const { 
    purchases, feedCosts, laborCosts, medicineExpenses, 
    healthTasks, farmExpenses, totalExpenses, addPurchase, addFeedCost, addMedicineExpense, addLaborCost,
    isLoading 
  } = useFarm();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  
  // Quick Entry State
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [pCost, setPCost] = useState('');
  const [fCost, setFCost] = useState('');
  const [mCost, setMCost] = useState('');
  const [lCost, setLCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const combinedData = useMemo(() => {
    const purchaseOutflows = (purchases || []).map(p => ({ 
      id: p.id, date: p.purchaseDate, source: `Sheep Buying: ${p.farmerName}`, amount: p.amountPaid, cat: 'Buying', color: 'bg-blue-50 text-blue-600', mColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
    }));
    const feedOutflows = (feedCosts || []).map(f => ({ 
      id: f.id, date: f.date, source: `Fodder: ${f.feedType}`, amount: f.cost, cat: 'Feed', color: 'bg-orange-50 text-orange-600', mColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
    }));
    const laborOutflows = (laborCosts || []).map(l => ({ 
      id: l.id, date: l.date, source: `Staff: ${l.employeeName}`, amount: l.amountPaid || 0, cat: 'Labour', color: 'bg-emerald-50 text-[#43A047]', mColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
    }));
    const medicineOutflows = (medicineExpenses || []).map(m => ({ 
      id: m.id, date: m.date, source: `Pharma: ${m.shopName}`, amount: m.totalAmountSpent, cat: 'Pharma', color: 'bg-rose-50 text-rose-600', mColor: 'bg-orange-500/10 text-rose-400 border-rose-500/20' 
    }));
    const clinicalOutflows = (healthTasks || []).map(h => ({ 
      id: h.id, date: h.date, source: `Clinical: ${h.medicineName}`, amount: h.cost, cat: 'Health', color: 'bg-rose-50 text-rose-600', mColor: 'bg-orange-500/10 text-rose-400 border-rose-500/20' 
    }));
    const miscOutflows = (farmExpenses || []).map(e => ({ 
      id: e.id, date: e.expenseDate, source: `Overhead: ${e.description}`, amount: e.amount, cat: 'Expense', color: 'bg-slate-100 text-slate-600', mColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20' 
    }));

    const all = [
      ...purchaseOutflows, ...feedOutflows, ...laborOutflows, 
      ...medicineOutflows, ...clinicalOutflows, ...miscOutflows
    ].filter(item => {
      if (!item.date) return false;
      const matchesSearch = item.source.toLowerCase().includes(searchTerm.toLowerCase()) || item.cat.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, feedCosts, laborCosts, medicineExpenses, healthTasks, farmExpenses, searchTerm]);

  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    combinedData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [combinedData]);

  const handleQuickSync = async () => {
    setIsSaving(true);
    const dateStr = format(entryDate, 'yyyy-MM-dd');
    try {
      if (pCost && parseFloat(pCost) > 0) addPurchase({ purchaseDate: dateStr, villageName: 'Quick Entry', farmerName: 'Supplier', animalCount: 0, purchasePrice: parseFloat(pCost), amountPaid: parseFloat(pCost), dueAmount: 0 });
      if (fCost && parseFloat(fCost) > 0) addFeedCost({ date: dateStr, feedType: 'Other', cost: parseFloat(fCost), quantity: 0 });
      if (mCost && parseFloat(mCost) > 0) addMedicineExpense({ date: dateStr, shopName: 'Quick Pharma', costOfMedicines: parseFloat(mCost), totalAmountSpent: parseFloat(mCost), outstandingDues: 0 });
      if (lCost && parseFloat(lCost) > 0) addLaborCost({ employeeName: 'Quick Staff', date: dateStr, wages: parseFloat(lCost), numberOfLaborers: 1, totalLaborCosts: parseFloat(lCost), amountPaid: parseFloat(lCost), pendingAmount: 0 });
      toast({ title: "Ledger Synchronized", description: "Disbursements have been distributed." });
      setIsQuickEntryOpen(false);
      setPCost(''); setFCost(''); setMCost(''); setLCost('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync Failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `Today - ${dateStr}`;
    if (isYesterday(d)) return `Yesterday - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="mobile-neural-screen pb-[110px]">
      {/* MOBILE NEURAL VIEW */}
      <header className="mb-8 pt-4">
        <h1 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1]">Farm Ledger</h1>
        <p className="text-sm font-medium text-white/40">Verified operational outflow stream.</p>
      </header>

      <div className="mobile-glass-card p-8 border-l-4 border-l-primary mb-8">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Operational Outflow</p>
        <h2 className="text-4xl font-black text-white tracking-tighter">₹{totalExpenses.toLocaleString()}</h2>
        <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest mt-2">
          <ShieldCheck className="h-3 w-3" /> System Audit Clear
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
        <Input 
          placeholder="Search Ledger..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20 shadow-xl" 
        />
      </div>

      <div className="space-y-10">
        {groupedData.length > 0 ? groupedData.map((group) => (
          <div key={group.date} className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-white/30 px-2">{formatGroupDate(group.date)}</p>
            <div className="space-y-4">
              {group.items.map((item) => (
                <div key={item.id} className="mobile-glass-card p-5 flex items-center justify-between active:scale-[0.98] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5", item.mColor)}>
                        {item.cat}
                      </Badge>
                      <h3 className="text-lg font-black text-white truncate leading-none">{item.source}</h3>
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Disbursement</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-white">-₹{item.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs text-white">No records discovered</div>}
      </div>

      <button 
        onClick={() => setIsQuickEntryOpen(true)}
        className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-20"
      >
        <Zap className="h-8 w-8" />
      </button>

      {/* QUICK COST SYNC DIALOG */}
      <Dialog open={isQuickEntryOpen} onOpenChange={setIsQuickEntryOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Zap className="h-5 w-5" /></div>
              <DialogTitle className="text-xl font-black uppercase text-white">Quick Sync</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-40">Buying (₹)</Label><Input type="number" value={pCost} onChange={(e) => setPCost(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase opacity-40">Fodder (₹)</Label><Input type="number" value={fCost} onChange={(e) => setFCost(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" /></div>
            </div>
            <Button onClick={handleQuickSync} disabled={isSaving} className="w-full h-16 rounded-2xl bg-[#0FA5A0] text-white font-black uppercase tracking-widest shadow-xl">{isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : 'Commit Sync'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
