'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  Landmark,
  Home,
  User,
  LayoutGrid,
  PlusCircle,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
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

/**
 * @fileOverview Finance Ledger
 * Tactical tabs for Income, Bank EMI, Credit Card, Personal, and Household.
 */
export default function FinancialLedgerPage() {
  const { 
    sales, purchases, feedCosts, laborCosts, medicineExpenses, 
    healthTasks, farmExpenses, monthlyIncomes, monthlyExpenses,
    addMonthlyIncome, addMonthlyExpense, isLoading 
  } = useFarm();
  const { toast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('income');

  // Modal States
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Form States
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  const combinedData = useMemo(() => {
    // 1. Manual Incomes
    const manualInflows = (monthlyIncomes || []).map(i => ({
      id: i.id, date: i.date, source: i.source, amount: i.amount, type: 'income' as const, cat: 'Income'
    }));

    // 2. Trade Inflows (Sales)
    const saleInflows = (sales || []).map(s => ({ 
      id: s.id, date: s.saleDate, source: `Sheep Sale: ${s.buyerName}`, amount: s.amountReceived, type: 'income' as const, cat: 'Selling' 
    }));
    
    // 3. Trade Outflows (Purchases)
    const purchaseOutflows = (purchases || []).map(p => ({ 
      id: p.id, date: p.purchaseDate, source: `Sheep Buy: ${p.farmerName}`, amount: p.amountPaid, type: 'expense' as const, cat: 'Buying' 
    }));

    const fodderOutflows = (feedCosts || []).map(f => ({ id: f.id, date: f.date, source: `Fodder: ${f.feedType}`, amount: f.cost, type: 'expense' as const, cat: 'Fodder' }));
    const laborOutflows = (laborCosts || []).map(l => ({ id: l.id, date: l.date, source: `Staff: ${l.employeeName}`, amount: l.amountPaid || 0, type: 'expense' as const, cat: 'Labour' }));
    const medicineOutflows = (medicineExpenses || []).map(m => ({ id: m.id, date: m.date, source: `Medical: ${m.shopName}`, amount: m.totalAmountSpent, type: 'expense' as const, cat: 'Medical' }));
    const clinicalOutflows = (healthTasks || []).map(h => ({ id: h.id, date: h.date, source: `Treatment: ${h.medicineName}`, amount: h.cost, type: 'expense' as const, cat: 'Clinical' }));
    const miscOutflows = (farmExpenses || []).map(e => ({ id: e.id, date: e.expenseDate, source: `Expense: ${e.description}`, amount: e.amount, type: 'expense' as const, cat: 'Misc' }));

    // Private Expenses
    const privateOutflows = (monthlyExpenses || []).map(e => ({
      id: e.id,
      date: e.date,
      source: e.source,
      amount: e.amount,
      type: 'expense' as const,
      cat: e.category === 'loan' ? 'Bank EMI' : 
           e.category === 'card' ? 'Credit Card' : 
           e.category === 'private' ? 'Personal' : 'Household'
    }));

    const all = [
      ...manualInflows, ...saleInflows, ...purchaseOutflows, 
      ...fodderOutflows, ...laborOutflows, ...medicineOutflows, 
      ...clinicalOutflows, ...miscOutflows, ...privateOutflows
    ].filter(item => {
      if (!item.date) return false;
      const d = parseISO(item.date);
      if (!isValid(d)) return false;
      
      const matchesMonth = format(d, 'MM') === selectedMonth;
      const matchesYear = selectedYear === 'ALL' || format(d, 'yyyy') === selectedYear;
      const matchesSearch = (item.source || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'income') matchesTab = item.type === 'income';
      else if (activeTab === 'bank_emi') matchesTab = item.cat === 'Bank EMI';
      else if (activeTab === 'card') matchesTab = item.cat === 'Credit Card';
      else if (activeTab === 'personal') matchesTab = item.cat === 'Personal';
      else if (activeTab === 'household') matchesTab = item.cat === 'Household';

      return matchesMonth && matchesYear && matchesSearch && matchesTab;
    });

    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases, feedCosts, laborCosts, medicineExpenses, healthTasks, farmExpenses, monthlyIncomes, monthlyExpenses, selectedMonth, selectedYear, searchTerm, activeTab]);

  const netCashFlow = useMemo(() => {
    return combinedData.reduce((acc, item) => {
      return item.type === 'income' ? acc + item.amount : acc - item.amount;
    }, 0);
  }, [combinedData]);

  const handleAddIncome = () => {
    if (!source || !amount) return;
    addMonthlyIncome({ date: entryDate, source, amount: parseFloat(amount) });
    toast({ title: 'Income Recorded', description: 'Added to Finance Ledger.' });
    setIsIncomeDialogOpen(false); setSource(''); setAmount('');
  };

  const handleAddExpense = () => {
    if (!source || !amount) return;
    addMonthlyExpense({ date: entryDate, source, amount: parseFloat(amount), category });
    toast({ title: 'Expense Recorded', description: 'Disbursement logged.' });
    setIsExpenseDialogOpen(false); setSource(''); setAmount('');
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    combinedData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [combinedData]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight uppercase">Finance Ledger</h2>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase opacity-60 leading-none mb-1">Balance</p>
          <p className="text-xl font-black">₹{netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="md:hidden h-16 shrink-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Finance Ledger" description="UNIFIED PRIVATE & BUSINESS AUDIT" className="mb-0 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar md:w-auto w-full">
          <Button onClick={() => setIsIncomeDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none shrink-0">
            <ArrowUpCircle className="h-5 w-5 text-accent" />
            Add Income
          </Button>
          <Button onClick={() => setIsExpenseDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-xl border-none shrink-0">
            <ArrowDownCircle className="h-5 w-5 text-white" />
            Add Expense
          </Button>
          <div className="hidden md:flex px-6 py-3 bg-neutral-900 rounded-2xl text-white items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Balance</p>
              <p className="text-xl font-black tracking-tight text-white">₹{netCashFlow.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-white border-none font-bold shadow-sm" />
          </div>
          
          <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="h-12 md:h-14 w-[120px] rounded-2xl bg-white border-none font-bold shadow-sm"><SelectValue placeholder="Month" /></SelectTrigger><SelectContent>{Array.from({ length: 12 }, (_, i) => { const m = (i + 1).toString().padStart(2, '0'); return <SelectItem key={m} value={m}>{format(new Date(2024, i), 'MMMM')}</SelectItem> })}</SelectContent></Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}><SelectTrigger className="h-12 md:h-14 w-[120px] rounded-2xl bg-white border-none font-bold shadow-sm"><SelectValue placeholder="Year" /></SelectTrigger><SelectContent><SelectItem value="ALL">ALL TIME</SelectItem>{['2023', '2024', '2025'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-full h-14 md:h-16 bg-[#e7eddc] rounded-2xl p-1.5 flex justify-start md:justify-center overflow-x-auto no-scrollbar shadow-inner mb-8">
            <TabsTrigger value="income" className="tab-trigger-tactical"><ArrowUpCircle className="h-3.5 w-3.5 mr-2" /> INCOME</TabsTrigger>
            <TabsTrigger value="bank_emi" className="tab-trigger-tactical"><Landmark className="h-3.5 w-3.5 mr-2" /> BANK EMI</TabsTrigger>
            <TabsTrigger value="card" className="tab-trigger-tactical"><CreditCard className="h-3.5 w-3.5 mr-2" /> CARD</TabsTrigger>
            <TabsTrigger value="personal" className="tab-trigger-tactical"><User className="h-3.5 w-3.5 mr-2" /> PERSONAL</TabsTrigger>
            <TabsTrigger value="household" className="tab-trigger-tactical"><Home className="h-3.5 w-3.5 mr-2" /> HOUSEHOLD</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 min-h-0 flex flex-col m-0">
            <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><ArrowRightLeft className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">{activeTab.replace('_', ' ')} Audit</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Cash Movement Audit</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{netCashFlow.toLocaleString()}</p>
                </div>
              </CardHeader>

              {/* MOBILE VIEW */}
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
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5 tracking-widest", item.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600")}>{item.cat}</Badge>
                                <h3 className="text-lg font-black text-slate-900 truncate leading-none">{item.source}</h3>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.type === 'income' ? 'Cash Inflow' : 'Disbursement'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={cn("text-xl font-black", item.type === 'income' ? "text-[#059669]" : "text-slate-900")}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}</p>
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">VERIFIED</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered for this category</div>}
                  <div className="h-32" />
                </ScrollArea>
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Transaction Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Origin / Source</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Category</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{item.date}</TableCell>
                          <TableCell><div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{item.source}</span><span className="text-[9px] font-bold text-slate-400 uppercase">Ref: {item.id.slice(0,8)}</span></div></TableCell>
                          <TableCell className="text-center"><Badge className="bg-neutral-100 text-neutral-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">{item.cat}</Badge></TableCell>
                          <TableCell className="text-right pr-10"><span className={cn("text-[18px] font-black", item.type === 'income' ? "text-emerald-600" : "text-slate-900")}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MOBILE FAB */}
      <div className="md:hidden fixed bottom-24 right-6 flex flex-col gap-4 z-[120]">
        <button onClick={() => setIsExpenseDialogOpen(true)} className="h-12 w-12 rounded-full bg-rose-600 text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all"><Plus className="h-6 w-6" /></button>
        <button onClick={() => setIsIncomeDialogOpen(true)} className="h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all"><ArrowUpCircle className="h-7 w-7" /></button>
      </div>

      {/* INCOME DIALOG */}
      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><ArrowUpCircle className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Income Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document new cash inflow</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2"><Label className="form-label-tactical">Date</Label><Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="form-input-tactical" /></div>
            <div className="space-y-2"><Label className="form-label-tactical">Income Source</Label><Input placeholder="e.g. Salary, Rent" value={source} onChange={(e) => setSource(e.target.value)} className="form-input-tactical" /></div>
            <div className="space-y-2"><Label className="form-label-tactical">Amount (₹)</Label><Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input-tactical font-black text-xl text-emerald-600" /></div>
            <Button onClick={handleAddIncome} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl">Commit Income</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EXPENSE DIALOG */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400"><ArrowDownCircle className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Expense Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document new private disbursement</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2"><Label className="form-label-tactical">Date</Label><Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="form-input-tactical" /></div>
            <div className="space-y-2"><Label className="form-label-tactical">Expense Source</Label><Input placeholder="e.g. EB Bill, Grocery" value={source} onChange={(e) => setSource(e.target.value)} className="form-input-tactical" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="form-label-tactical">Amount (₹)</Label><Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input-tactical font-black" /></div>
              <div className="space-y-2"><Label className="form-label-tactical">Category</Label><Select value={category} onValueChange={(v: any) => setCategory(v)}><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loan">Bank EMI</SelectItem><SelectItem value="card">Credit Card</SelectItem><SelectItem value="private">Personal</SelectItem><SelectItem value="household">Household</SelectItem></SelectContent></Select></div>
            </div>
            <Button onClick={handleAddExpense} className="w-full h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase shadow-xl">Commit Expense</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
