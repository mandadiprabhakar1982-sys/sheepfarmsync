
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
  CalendarDays
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, deleteMonthlyIncome, updateMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, deleteMonthlyExpense, updateMonthlyExpense,
    sales, purchases
  } = useFarm();

  const [activeTab, setActiveTab] = useState('income');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isZoomViewOpen, setIsZoomViewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  // GENERATE YEAR OPTIONS (Last 2, Current, Next 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i.toString());
    }
    return years;
  }, [currentYear]);

  // UNIFIED DATA ARCHITECTURE: Manual Ledger + Automated Trade Cash Flow
  const combinedData = useMemo(() => {
    const incomes = (monthlyIncomes || []).map(i => ({ 
      ...i, 
      type: 'income' as const, 
      displayCategory: 'MANUAL ENTRY' 
    }));
    
    const saleInflows = (sales || []).map(s => ({ 
      id: s.id,
      _path: s._path,
      date: s.saleDate,
      source: `Sale: ${s.buyerName}`,
      amount: s.amountReceived,
      type: 'income' as const,
      displayCategory: 'LIVESTOCK SALE',
      isAutomated: true
    }));

    const manualExpenses = (monthlyExpenses || []).map(e => ({ 
      ...e, 
      type: 'expense' as const, 
      displayCategory: (e.category || 'misc').toUpperCase() 
    }));

    const purchaseOutflows = (purchases || []).map(p => ({ 
      id: p.id,
      _path: p._path,
      date: p.purchaseDate,
      source: `Buy: ${p.farmerName}`,
      amount: p.amountPaid,
      type: 'expense' as const,
      displayCategory: 'LIVESTOCK BUY',
      isAutomated: true
    }));

    return [...incomes, ...saleInflows, ...manualExpenses, ...purchaseOutflows].filter(item => {
      if (!item.date) return false;
      try {
        const d = parseISO(item.date);
        if (!isValid(d)) return false;
        
        const monthMatch = format(d, 'MM') === selectedMonth;
        const yearMatch = selectedYear === 'ALL' || format(d, 'yyyy') === selectedYear;
        const searchMatch = (item.source || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        return monthMatch && yearMatch && searchMatch;
      } catch (e) {
        return false;
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyIncomes, monthlyExpenses, sales, purchases, selectedMonth, selectedYear, searchTerm]);

  const filteredIncomes = useMemo(() => combinedData.filter(i => i.type === 'income'), [combinedData]);
  const filteredInstitutional = useMemo(() => combinedData.filter(e => e.type === 'expense' && (e.displayCategory === 'LOAN' || e.displayCategory === 'CARD' || e.displayCategory === 'PRIVATE')), [combinedData]);
  const filteredHousehold = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.displayCategory === 'HOUSEHOLD'), [combinedData]);
  const filteredLivestock = useMemo(() => combinedData.filter(item => item.displayCategory.includes('LIVESTOCK')), [combinedData]);

  const totalInflow = useMemo(() => filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0), [filteredIncomes]);
  const totalOutflow = useMemo(() => combinedData.filter(i => i.type === 'expense').reduce((s, e) => s + Number(e.amount || 0), 0), [combinedData]);
  const netBalance = totalInflow - totalOutflow;

  const handleAdd = () => {
    if (!source || !amount || !date) return;
    const val = parseFloat(amount);
    if (type === 'income') addMonthlyIncome({ date, source, amount: val });
    else addMonthlyExpense({ date, source, amount: val, category });
    resetForm(); setIsEntryDialogOpen(false);
    toast({ title: 'Ledger Synchronized', description: 'Entry committed.' });
  };

  const handleEditClick = (item: any) => {
    if (item.isAutomated) {
      toast({ title: 'Automated Record', description: 'Linked to a trade event. Edit via Trade Ledger.' });
      return;
    }
    setEditingItem(item); setDate(item.date); setSource(item.source); setAmount(item.amount.toString()); setType(item.type); setCategory(item.category || 'household'); setIsEditModalOpen(true);
  };

  const handleZoomClick = (item: any) => { setViewingItem(item); setIsZoomViewOpen(true); };

  const handleUpdate = () => {
    if (!editingItem) return;
    const val = parseFloat(amount);
    const data = type === 'income' ? { date, source, amount: val } : { date, source, amount: val, category };
    if (type === 'income') updateMonthlyIncome(editingItem.id, data, editingItem._path);
    else updateMonthlyExpense(editingItem.id, data as any, editingItem._path);
    setIsEditModalOpen(false); setEditingItem(null); resetForm();
    toast({ title: 'Ledger Updated', description: 'Historical record adjusted.' });
  };

  const resetForm = () => { setDate(format(new Date(), 'yyyy-MM-dd')); setSource(''); setAmount(''); setType('income'); setCategory('household'); };

  const SummaryCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: number, icon: any, color: string, subtitle: string }) => (
    <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white group transition-all hover:-translate-y-1">
      <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
        <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl text-white shadow-lg", color)}><Icon className="h-5 w-5 md:h-7 md:w-7" /></div>
        <div className="min-w-0">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
          <p className="text-xl md:text-3xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
          <p className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );

  const LedgerTable = ({ data, emptyMsg, badgeLabel, badgeClass }: { data: any[], emptyMsg: string, badgeLabel?: string, badgeClass?: string }) => (
    <div className="w-full flex-1 flex flex-col min-h-0 h-full">
      {/* MOBILE VIEW */}
      <div className="block md:hidden flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {data.length > 0 ? data.map(item => (
            <div key={item.id} className="p-4 border-b border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors" onClick={() => handleZoomClick(item)}>
              <div className="flex flex-col items-center min-w-[60px] text-center">
                <span className="text-[10px] font-black text-slate-300 leading-none">{item.date.split('-')[0]}</span>
                <span className="text-[14px] font-black text-slate-400 leading-none mt-1">{item.date.split('-').slice(1).join('-')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-black text-slate-900 truncate block mb-1">{item.source}</span>
                <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5", badgeClass || "bg-slate-100 text-slate-600")}>{badgeLabel || item.displayCategory}</Badge>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("text-base font-black", item.type === 'income' ? "text-emerald-600" : "text-slate-900")}>₹{item.amount.toLocaleString()}</p>
              </div>
            </div>
          )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">{emptyMsg}</div>}
        </ScrollArea>
      </div>
      
      {/* DESKTOP VIEW */}
      <div className="hidden md:block w-full flex-1 overflow-hidden">
        <ScrollArea className="h-[500px] lg:h-[600px] w-full">
          <Table>
            <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
              <TableRow className="border-none">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-slate-400">Temporal Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-slate-400">Capital Origin</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-slate-400">Value Intensity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map(item => (
                <TableRow key={item.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-zoom-in" onClick={() => handleZoomClick(item)}>
                  <TableCell className="pl-10 py-8"><span className="text-sm font-black text-slate-300">{item.date}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[16px] font-black text-slate-900">{item.source}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn("border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5", badgeClass || "bg-slate-100 text-slate-600")}>{badgeLabel || item.displayCategory}</Badge>
                          {item.isAutomated && <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[7px] uppercase">AUTO-SYNC</Badge>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex items-center justify-end gap-4">
                      <span className={cn("text-xl font-black", item.type === 'income' ? "text-emerald-600" : "text-slate-900")}>
                        {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!item.isAutomated && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-100 text-blue-500" onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-32 opacity-20 font-black uppercase text-xs tracking-[0.2em]">No temporal data discovered for selection</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
        <PageHeader title="Monthly Balance Sheet" description="UNIFIED CASH FLOW & TRADE AUDIT" className="mb-0" />
        
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsEntryDialogOpen(true); }} className="h-10 md:h-12 px-4 md:px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 text-white gap-2 text-[10px] md:text-sm shadow-lg">
                <PlusCircle className="h-4 w-4" /> Ledger Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Ledger Entry</DialogTitle>
                </div>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 rounded-2xl bg-neutral-50 border-none font-bold" />
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Inflow (+)</SelectItem>
                      <SelectItem value="expense">Outflow (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Origin (e.g. Salary, Rent)" className="h-14 rounded-2xl bg-neutral-50 px-6 font-bold border-none" />
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-16 rounded-2xl bg-neutral-50 px-6 font-black text-2xl border-none" />
                <Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl">Commit Payload</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2 shrink-0">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[100px] md:w-[140px] border-none font-black bg-white rounded-xl shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 12}, (_, i) => (
                  <SelectItem key={i} value={format(new Date(2024, i, 1), 'MM')}>
                    {format(new Date(2024, i, 1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] md:w-[120px] border-none font-black bg-white rounded-xl shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Global Audit</SelectItem>
                {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 shrink-0">
        <SummaryCard title="Net Balance" value={netBalance} icon={ShieldCheck} color="bg-primary" subtitle="Actual Cash Remaining" />
        <SummaryCard title="Total Inflow" value={totalInflow} icon={ArrowUpCircle} color="bg-[#059669]" subtitle="Cash Received (All Sources)" />
        <SummaryCard title="Total Outflow" value={totalOutflow} icon={ArrowDownCircle} color="bg-[#e11d48]" subtitle="Cash Paid (All Spends)" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="lookup origin..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm" />
        </div>
        <Tabs value={activeTab} className="w-fit self-center md:self-auto" onValueChange={setActiveTab}>
          <TabsList className="bg-white rounded-xl flex items-center h-12 shadow-sm border border-slate-100 p-1 gap-1">
            <TabsTrigger value="income" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">Inflow</TabsTrigger>
            <TabsTrigger value="livestock" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Trade</TabsTrigger>
            <TabsTrigger value="institutional" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Debt</TabsTrigger>
            <TabsTrigger value="household" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all">House.</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white flex-1 min-h-0 flex flex-col">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeTab === 'income' && (
            <div className="flex flex-col h-full">
              <CardHeader className="bg-[#059669] text-white p-6 md:p-10 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><ArrowUpCircle className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Monthly Inflow</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Cash Receipts</CardDescription>
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">₹{totalInflow.toLocaleString()}</p>
                </div>
              </CardHeader>
              <LedgerTable data={filteredIncomes} emptyMsg="No inflow discovered for this selection" badgeLabel="CASH INBOUND" badgeClass="bg-[#ecfdf5] text-[#059669]" />
            </div>
          )}
          
          {activeTab === 'livestock' && (
            <div className="flex flex-col h-full">
              <CardHeader className="bg-blue-600 text-white p-6 md:p-10 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><ArrowRightLeft className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Trade Cash Flow</CardTitle></div>
                    <CardDescription className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Acquisition & Disposal Audit</CardDescription>
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">₹{filteredLivestock.reduce((s, e) => s + (e.type === 'income' ? e.amount : -e.amount), 0).toLocaleString()}</p>
                </div>
              </CardHeader>
              <LedgerTable data={filteredLivestock} emptyMsg="No trade events discovered for selection" badgeClass="bg-blue-50 text-blue-600" />
            </div>
          )}
          
          {activeTab === 'institutional' && (
            <div className="flex flex-col h-full">
              <CardHeader className="bg-primary text-white p-6 md:p-10 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><Landmark className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Debt Repayment</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Institutional Liability Audit</CardDescription>
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">₹{filteredInstitutional.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                </div>
              </CardHeader>
              <LedgerTable data={filteredInstitutional} emptyMsg="No debt payments logged for selection" badgeClass="bg-blue-50 text-primary" />
            </div>
          )}
          
          {activeTab === 'household' && (
            <div className="flex flex-col h-full">
              <CardHeader className="bg-[#e11d48] text-white p-6 md:p-10 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><ShoppingBag className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Household Audit</CardTitle></div>
                    <CardDescription className="text-rose-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Private & Maintenance Disbursements</CardDescription>
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">₹{filteredHousehold.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                </div>
              </CardHeader>
              <LedgerTable data={filteredHousehold} emptyMsg="No household spends discovered" badgeLabel="HOUSEHOLD" badgeClass="bg-rose-50 text-rose-600" />
            </div>
          )}
        </div>
      </Card>

      {/* DETAIL VIEW DIALOG */}
      <Dialog open={isZoomViewOpen} onOpenChange={setIsZoomViewOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-neutral-50">
          {viewingItem && (
            <div className="flex flex-col">
              <div className={cn("p-10 text-white", viewingItem.type === 'income' ? "bg-emerald-600" : "bg-slate-900")}>
                <div className="flex justify-between items-start mb-6">
                  <Badge className="bg-white/20 text-white border-none px-3 py-1 font-black text-[8px] uppercase tracking-widest">{viewingItem.displayCategory}</Badge>
                  <Clock className="h-5 w-5 opacity-40" />
                </div>
                <h3 className="text-3xl font-black tracking-tighter leading-tight mb-1">{viewingItem.source}</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{viewingItem.date}</p>
              </div>
              <div className="p-10 space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Value Intensity</p>
                  <p className={cn("text-5xl font-black tracking-tighter", viewingItem.type === 'income' ? "text-emerald-600" : "text-slate-900")}>₹{viewingItem.amount.toLocaleString()}</p>
                </div>
                {viewingItem.isAutomated && (
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
                    <Target className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-[10px] font-bold text-blue-900 leading-relaxed uppercase">This is an automated trade entry linked to the registry. Manual adjustments are disabled.</p>
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setIsZoomViewOpen(false)} className="h-14 flex-1 rounded-2xl font-black uppercase text-xs tracking-widest">Close Audit</Button>
                  {!viewingItem.isAutomated && (
                    <Button onClick={() => { setIsZoomViewOpen(false); handleEditClick(viewingItem); }} className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-xl">
                      <Pencil className="h-4 w-4" /> Edit Record
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                <Pencil className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Update Record</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-2">Origin</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} className="h-14 rounded-2xl bg-neutral-50 px-6 font-bold border-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-2">Value Intensity (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-16 rounded-2xl bg-neutral-50 px-6 font-black text-2xl border-none" />
            </div>
            <Button onClick={handleUpdate} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl tracking-widest">Save Adjustments</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
