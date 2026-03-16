'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trash2, 
  ArrowUpCircle,
  Plus,
  ArrowDownCircle,
  Search,
  History,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Landmark,
  Wallet,
  TrendingUp,
  PlusCircle,
  Pencil,
  Save,
  Maximize2,
  Clock,
  Target,
  ArrowRightLeft,
  CalendarDays,
  X,
  CheckCircle2
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, isToday, isYesterday } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, deleteMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, deleteMonthlyExpense,
    sales, purchases, totalCashInflow
  } = useFarm();

  const [activeTab, setActiveTab] = useState('income');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  const combinedData = useMemo(() => {
    const incomes = (monthlyIncomes || []).map(i => ({ ...i, type: 'income' as const, cat: 'Manual' }));
    const saleInflows = (sales || []).map(s => ({ id: s.id, date: s.saleDate, source: `Sale: ${s.buyerName}`, amount: s.amountReceived, type: 'income' as const, cat: 'Trade' }));
    const manualExpenses = (monthlyExpenses || []).map(e => ({ ...e, type: 'expense' as const, cat: 'Manual' }));
    const purchaseOutflows = (purchases || []).map(p => ({ id: p.id, date: p.purchaseDate, source: `Buy: ${p.farmerName}`, amount: p.amountPaid, type: 'expense' as const, cat: 'Trade' }));

    const all = [...incomes, ...saleInflows, ...manualExpenses, ...purchaseOutflows].filter(item => {
      if (!item.date) return false;
      const d = parseISO(item.date);
      if (!isValid(d)) return false;
      return format(d, 'MM') === selectedMonth && (selectedYear === 'ALL' || format(d, 'yyyy') === selectedYear) && (item.source || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyIncomes, monthlyExpenses, sales, purchases, selectedMonth, selectedYear, searchTerm]);

  // Grouping for Mobile
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    combinedData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [combinedData]);

  const handleAdd = () => {
    if (!source || !amount || !date) return;
    const val = parseFloat(amount);
    if (type === 'income') addMonthlyIncome({ date, source, amount: val });
    else addMonthlyExpense({ date, source, amount: val, category: 'household' });
    setSource(''); setAmount(''); setIsEntryDialogOpen(false);
    toast({ title: 'Ledger Synchronized', description: 'Entry committed.' });
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER (HIGH PROFILE) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight">Financial Ledger</h2>
        <p className="text-xl font-black">₹{totalCashInflow.toLocaleString()}</p>
      </div>

      <div className="md:hidden h-16 shrink-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Finance & Ledger" description="UNIFIED CASH FLOW AUDIT" className="mb-0 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar md:w-auto w-full">
          <div className="hidden md:flex items-center gap-4">
            <Button onClick={() => setIsEntryDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none">
              <PlusCircle className="h-5 w-5 text-accent" />
              Log Entry
            </Button>
            <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Inflow</p><p className="text-xl font-black tracking-tight text-white">₹{totalCashInflow.toLocaleString()}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Filter by Source..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" 
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
          <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3"><Wallet className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Monthly Balance</CardTitle></div>
                <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Cash Flow Audit</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">₹{totalCashInflow.toLocaleString()}</p>
            </div>
          </CardHeader>

          {/* MOBILE VIEW: GROUPED LIST */}
          <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
            <ScrollArea className="h-full px-4 pt-4">
              {groupedData.length > 0 ? groupedData.map((group) => (
                <div key={group.date} className="mb-8">
                  <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-900 leading-none mb-1">{item.source}</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {item.cat} • {item.type.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn("text-xl font-black", item.type === 'income' ? "text-[#059669]" : "text-slate-900")}>
                            {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">VERIFIED</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered</div>}
              <div className="h-32" />
            </ScrollArea>
          </div>

          {/* DESKTOP VIEW: TABLE */}
          <div className="hidden md:block flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Capital Origin</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value intensity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{item.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{item.source}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{item.cat} Entry</span></div>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <span className={cn("text-[18px] font-black", item.type === 'income' ? "text-emerald-600" : "text-slate-900")}>
                          {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { setIsEntryDialogOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Ledger Entry</DialogTitle></div>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 rounded-2xl bg-neutral-50 border-none font-bold" />
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="income">Inflow (+)</SelectItem><SelectItem value="expense">Outflow (-)</SelectItem></SelectContent>
              </Select>
            </div>
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source (e.g. Salary)" className="h-14 rounded-2xl bg-neutral-50 px-6 font-bold border-none" />
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-16 rounded-2xl bg-neutral-50 px-6 font-black text-2xl border-none" />
            <Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl tracking-widest">Commit Entry</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
