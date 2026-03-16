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
  Zap,
  Plus,
  ArrowRightLeft,
  Calendar as CalendarIcon,
  Loader2
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

/**
 * @fileOverview Pure Operational Farm Ledger (Standard Indian English)
 * Audits only farm-related disbursements: Buying, Feed, Labour, Medicine, Expenses.
 */
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
    // Aggregating all operational outflows
    const purchaseOutflows = (purchases || []).map(p => ({ 
      id: p.id, date: p.purchaseDate, source: `Sheep Buying: ${p.farmerName}`, amount: p.amountPaid, cat: 'Buying', color: 'bg-blue-50 text-blue-600' 
    }));
    const feedOutflows = (feedCosts || []).map(f => ({ 
      id: f.id, date: f.date, source: `Fodder: ${f.feedType}`, amount: f.cost, cat: 'Feed', color: 'bg-orange-50 text-orange-600' 
    }));
    const laborOutflows = (laborCosts || []).map(l => ({ 
      id: l.id, date: l.date, source: `Staff: ${l.employeeName}`, amount: l.amountPaid || 0, cat: 'Labour', color: 'bg-emerald-50 text-[#43A047]' 
    }));
    const medicineOutflows = (medicineExpenses || []).map(m => ({ 
      id: m.id, date: m.date, source: `Pharma: ${m.shopName}`, amount: m.totalAmountSpent, cat: 'Pharma', color: 'bg-rose-50 text-rose-600' 
    }));
    const clinicalOutflows = (healthTasks || []).map(h => ({ 
      id: h.id, date: h.date, source: `Clinical: ${h.medicineName}`, amount: h.cost, cat: 'Health', color: 'bg-rose-50 text-rose-600' 
    }));
    const miscOutflows = (farmExpenses || []).map(e => ({ 
      id: e.id, date: e.expenseDate, source: `Overhead: ${e.description}`, amount: e.amount, cat: 'Expense', color: 'bg-slate-100 text-slate-600' 
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

  // Grouping for Mobile
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
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 shrink-0">
        <PageHeader title="Farm Ledger" description="Operational Cost Audit" className="mb-0" />

        <div className="flex items-center gap-4">
          <Button onClick={() => setIsQuickEntryOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-[#0FA5A0] hover:bg-[#176E6C] text-white gap-2 shadow-xl border-none">
            <Zap className="h-5 w-5 text-white" />
            Sync Daily Costs
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Operational</p>
              <p className="text-xl font-black tracking-tight text-white">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col">
        <div className="relative shrink-0 w-full max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Search Ledger Records..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-white border-none text-[#2F4F4F] font-bold shadow-sm" 
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
        </div>

        <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
          <CardHeader className="bg-[#0FA5A0] text-white p-10 shrink-0">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3"><ArrowRightLeft className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase text-white">Operational Audit</CardTitle></div>
                <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Farm Outflow Stream</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 overflow-hidden">
            {/* MOBILE VIEW */}
            <div className="block md:hidden p-4 space-y-8">
              {groupedData.length > 0 ? groupedData.map((group) => (
                <div key={group.date} className="space-y-4">
                  <div className="px-2 py-2 mb-3 bg-[#D7F2F1] rounded-lg">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#176E6C]">{formatGroupDate(group.date)}</p>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5 tracking-widest", item.color)}>
                              {item.cat}
                            </Badge>
                            <h3 className="text-lg font-black text-[#2F4F4F] truncate leading-none">{item.source}</h3>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operational Outflow</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-[#2F4F4F]">-₹{item.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#43A047] border border-[#d1fae5] mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered</div>}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white">Transaction Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white">Disbursement Source</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-white">Cost Center</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white">Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{item.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{item.source}</span><span className="text-[9px] font-bold text-slate-400 uppercase">Ref: {item.id.slice(0,8)}</span></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("border-none font-black text-[10px] px-3 uppercase tracking-widest", item.color)}>{item.cat}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <span className="text-[18px] font-black text-[#2F4F4F]">-₹{item.amount.toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* QUICK COST SYNC DIALOG */}
      <Dialog open={isQuickEntryOpen} onOpenChange={setIsQuickEntryOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
              <IconFarmCost className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]">
                <Zap className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Quick Ledger Sync</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest relative z-10">
              Synchronize multiple cost centers
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="form-label-tactical ml-2">Transaction Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-neutral-50 border-none font-bold">
                      {format(entryDate, "MMMM do, yyyy")}
                      <CalendarIcon className="h-4 w-4 opacity-20" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none bg-white shadow-2xl">
                    <Calendar mode="single" selected={entryDate} onSelect={(d) => d && setEntryDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Buying Cost (₹)</Label>
                  <Input type="number" value={pCost} onChange={(e) => setPCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Fodder Cost (₹)</Label>
                  <Input type="number" value={fCost} onChange={(e) => setFCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Medicine Cost (₹)</Label>
                  <Input type="number" value={mCost} onChange={(e) => setMCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg text-rose-600" />
                </div>
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Labour Cost (₹)</Label>
                  <Input type="number" value={lCost} onChange={(e) => setLCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg text-[#43A047]" />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleQuickSync} 
              disabled={isSaving || (!pCost && !fCost && !mCost && !lCost)}
              className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <ShieldCheck className="mr-2 h-5 w-5 text-white" />
                  Commit Sync
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}