'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Landmark,
  Home,
  User,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, isToday, isYesterday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function PersonalFinancePage() {
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

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  const combinedData = useMemo(() => {
    const manualInflows = (monthlyIncomes || []).map(i => ({ id: i.id, date: i.date, source: i.source, amount: i.amount, type: 'income' as const, cat: 'Manual' }));
    const saleInflows = (sales || []).map(s => ({ id: s.id, date: s.saleDate, source: `Sheep Selling: ${s.buyerName}`, amount: s.amountReceived, type: 'income' as const, cat: 'Selling' }));
    
    const pOut = (purchases || []).map(p => ({ id: p.id, date: p.purchaseDate, source: `Sheep Buying: ${p.farmerName}`, amount: p.amountPaid, type: 'expense' as const, cat: 'Buying' }));
    const fOut = (feedCosts || []).map(f => ({ id: f.id, date: f.date, source: `Fodder: ${f.feedType}`, amount: f.cost, type: 'expense' as const, cat: 'Fodder' }));
    const lOut = (laborCosts || []).map(l => ({ id: l.id, date: l.date, source: `Labour: ${l.employeeName}`, amount: l.amountPaid || 0, type: 'expense' as const, cat: 'Labour' }));
    const mOut = (medicineExpenses || []).map(m => ({ id: m.id, date: m.date, source: `Pharma: ${m.shopName}`, amount: m.totalAmountSpent, type: 'expense' as const, cat: 'Medical' }));
    const cOut = (healthTasks || []).map(h => ({ id: h.id, date: h.date, source: `Clinical: ${h.medicineName}`, amount: h.cost, type: 'expense' as const, cat: 'Clinical' }));
    const eOut = (farmExpenses || []).map(e => ({ id: e.id, date: e.expenseDate, source: `Overhead: ${e.description}`, amount: e.amount, type: 'expense' as const, cat: 'Farm' }));

    const privateOutflows = (monthlyExpenses || []).map(e => ({
      id: e.id,
      date: e.date,
      source: e.source,
      amount: e.amount,
      type: 'expense' as const,
      cat: e.category === 'loan' ? 'Bank EMI' : 
           e.category === 'card' ? 'Credit Card' : 
           e.category === 'private' ? 'Personal Spend' : 'Household'
    }));

    const all = [
      ...manualInflows, ...saleInflows, ...pOut, ...fOut, ...lOut, ...mOut, ...cOut, ...eOut, ...privateOutflows
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
      else if (activeTab === 'personal') matchesTab = item.cat === 'Personal Spend';
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
    toast({ title: 'Income Recorded', description: 'Synchronized with Personal Finance.' });
    setIsIncomeDialogOpen(false); setSource(''); setAmount('');
  };

  const handleAddExpense = () => {
    if (!source || !amount) return;
    addMonthlyExpense({ date: entryDate, source, amount: parseFloat(amount), category });
    toast({ title: 'Expense Logged', description: 'Personal disbursement audit updated.' });
    setIsExpenseDialogOpen(false); setSource(''); setAmount('');
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `Today - ${dateStr}`;
    if (isYesterday(d)) return `Yesterday - ${dateStr}`;
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
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative px-4 md:px-0">
      <div className="space-y-6 flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 items-center shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input placeholder="Search finance records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-white border-none font-bold shadow-sm" />
          </div>
          
          <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="h-12 md:h-14 w-[120px] rounded-2xl bg-white border-none font-bold shadow-sm"><SelectValue placeholder="Month" /></SelectTrigger><SelectContent>{Array.from({ length: 12 }, (_, i) => { const m = (i + 1).toString().padStart(2, '0'); return <SelectItem key={m} value={m}>{format(new Date(2024, i), 'MMMM')}</SelectItem> })}</SelectContent></Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}><SelectTrigger className="h-12 md:h-14 w-[120px] rounded-2xl bg-white border-none font-bold shadow-sm"><SelectValue placeholder="Year" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Time</SelectItem>{['2023', '2024', '2025'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-full h-14 md:h-16 bg-[#D7F2F1] rounded-2xl p-1.5 flex justify-start md:justify-center overflow-x-auto no-scrollbar shadow-inner mb-8">
            <TabsTrigger value="income" className="tab-trigger-tactical"><ArrowUpCircle className="h-3.5 w-3.5 mr-2" /> Income</TabsTrigger>
            <TabsTrigger value="bank_emi" className="tab-trigger-tactical"><Landmark className="h-3.5 w-3.5 mr-2" /> Bank EMI</TabsTrigger>
            <TabsTrigger value="card" className="tab-trigger-tactical"><CreditCard className="h-3.5 w-3.5 mr-2" /> Card</TabsTrigger>
            <TabsTrigger value="personal" className="tab-trigger-tactical"><User className="h-3.5 w-3.5 mr-2" /> Personal</TabsTrigger>
            <TabsTrigger value="household" className="tab-trigger-tactical"><Home className="h-3.5 w-3.5 mr-2" /> Household</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 min-h-0 flex flex-col m-0">
            <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
              <CardHeader className="bg-[#0FA5A0] text-white p-4 px-6 shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white/20 rounded-lg">
                        <ArrowRightLeft className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none uppercase text-white">{activeTab.replace('_', ' ')} Audit</CardTitle>
                    </div>
                    <CardDescription className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] ml-9">Verified Personal Financial Cash Flow</CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={() => setIsIncomeDialogOpen(true)} className="h-9 px-4 rounded-xl font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-2 shadow-xl border-none">
                      <ArrowUpCircle className="h-4 w-4" />
                      Income
                    </Button>
                    <Button onClick={() => setIsExpenseDialogOpen(true)} className="h-9 px-4 rounded-xl font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-xl border-none">
                      <ArrowDownCircle className="h-4 w-4" />
                      Expense
                    </Button>
                    <div className="px-4 py-1 bg-black/20 rounded-xl text-white flex items-center gap-3 border border-white/10">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none">Net Period</p>
                        <p className="text-lg font-black tracking-tighter leading-none mt-0.5">₹{netCashFlow.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto pb-32">
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
                                <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5 tracking-widest", item.type === 'income' ? "bg-emerald-50 text-[#43A047]" : "bg-slate-100 text-slate-600")}>{item.cat}</Badge>
                                <h3 className="text-lg font-black text-[#2F4F4F] truncate leading-none">{item.source}</h3>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.type === 'income' ? 'Cash Receipt' : 'Disbursement'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={cn("text-xl font-black", item.type === 'income' ? "text-[#43A047]" : "text-[#2F4F4F]")}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}</p>
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
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Transaction Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Origin / Description</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Ledger Category</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{item.date}</TableCell>
                          <TableCell><div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{item.source}</span><span className="text-[9px] font-bold text-slate-400 uppercase">Ref: {item.id.slice(0,8)}</span></div></TableCell>
                          <TableCell className="text-center"><Badge className="bg-slate-50 text-slate-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">{item.cat}</Badge></TableCell>
                          <TableCell className="text-right pr-10"><span className={cn("text-[18px] font-black", item.type === 'income' ? "text-[#43A047]" : "text-[#2F4F4F]")}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white h-[70dvh] max-h-[70dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><ArrowUpCircle className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Income Entry</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <div className="dialog-body space-y-6">
            <div className="space-y-2"><Label className="form-label-tactical">Transaction Date</Label><Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="form-input-tactical" /></div>
            <div className="space-y-2 mt-4"><Label className="form-label-tactical">Income Source</Label><Input placeholder="e.g. Salary, Rent, Bonus" value={source} onChange={(e) => setSource(e.target.value)} className="form-input-tactical" /></div>
            <div className="space-y-2 mt-4"><Label className="form-label-tactical">Amount (₹)</Label><Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input-tactical font-black text-xl text-[#43A047]" /></div>
          </div>
          <div className="p-6 shrink-0 border-t"><Button onClick={handleAddIncome} className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase shadow-xl">Commit Income</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white h-[75dvh] max-h-[75dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400"><ArrowDownCircle className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Expense Entry</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <div className="dialog-body space-y-6">
            <div className="space-y-2"><Label className="form-label-tactical">Transaction Date</Label><Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="form-input-tactical" /></div>
            <div className="space-y-2 mt-4"><Label className="form-label-tactical">Expense Detail</Label><Input placeholder="e.g. EB Bill, Groceries, EMI" value={source} onChange={(e) => setSource(e.target.value)} className="form-input-tactical" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2"><Label className="form-label-tactical">Amount (₹)</Label><Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input-tactical font-black" /></div>
              <div className="space-y-2"><Label className="form-label-tactical">Ledger Category</Label><Select value={category} onValueChange={(v: any) => setCategory(v)}><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loan">Bank EMI</SelectItem><SelectItem value="card">Credit Card</SelectItem><SelectItem value="private">Personal Spend</SelectItem><SelectItem value="household">Household</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <div className="p-6 shrink-0 border-t"><Button onClick={handleAddExpense} className="w-full h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase shadow-xl">Commit Expense</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
