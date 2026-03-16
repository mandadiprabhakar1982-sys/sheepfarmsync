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
  Target
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
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

  const combinedData = useMemo(() => {
    const incomes = (monthlyIncomes || []).map(i => ({ ...i, type: 'income' }));
    const expenses = (monthlyExpenses || []).map(e => ({ ...e, type: 'expense' }));
    return [...incomes, ...expenses].filter(item => {
      const d = parseISO(item.date);
      const matchesDate = format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
      const matchesSearch = item.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyIncomes, monthlyExpenses, selectedMonth, selectedYear, searchTerm]);

  const filteredIncomes = useMemo(() => combinedData.filter(i => i.type === 'income'), [combinedData]);
  const filteredInstitutional = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'loan'), [combinedData]);
  const filteredCards = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'card'), [combinedData]);
  const filteredPrivate = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'private'), [combinedData]);
  const filteredHousehold = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'household'), [combinedData]);

  const totalInflow = useMemo(() => filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0), [filteredIncomes]);
  const totalOutflow = useMemo(() => combinedData.filter(i => i.type === 'expense').reduce((s, e) => s + Number(e.amount || 0), 0), [combinedData]);
  const netBalance = totalInflow - totalOutflow;

  const handleAdd = () => {
    if (!source || !amount || !date) return;
    const val = parseFloat(amount);
    if (type === 'income') addMonthlyIncome({ date, source, amount: val });
    else addMonthlyExpense({ date, source, amount: val, category });
    resetForm(); setIsEntryDialogOpen(false);
  };

  const handleEditClick = (item: any) => {
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
    <div className="flex-1 overflow-hidden flex flex-col">
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
                <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5", badgeClass || "bg-slate-100 text-slate-600")}>{badgeLabel || (item.category || 'Loan').toUpperCase()}</Badge>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("text-base font-black", item.type === 'income' ? "text-emerald-600" : "text-slate-900")}>₹{item.amount.toLocaleString()}</p>
              </div>
            </div>
          )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">{emptyMsg}</div>}
        </ScrollArea>
      </div>
      <div className="hidden md:block flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur"><TableRow className="border-none"><TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Origin</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.map(item => (
                <TableRow key={item.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-zoom-in" onClick={() => handleZoomClick(item)}>
                  <TableCell className="pl-10 py-10"><span className="text-sm font-black text-slate-300">{item.date}</span></TableCell>
                  <TableCell><div className="flex flex-col"><span className="text-[16px] font-black text-slate-900">{item.source}</span><Badge className={cn("w-fit mt-1 border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5", badgeClass || "bg-slate-100 text-slate-600")}>{badgeLabel || (item.category || 'Loan').toUpperCase()}</Badge></div></TableCell>
                  <TableCell className="text-right pr-10"><div className="flex items-center justify-end gap-2"><span className="text-xl font-black text-slate-900 mr-4">₹{item.amount.toLocaleString()}</span><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}><Pencil className="h-4 w-4" /></Button></div></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
        <PageHeader title="Monthly Balance Sheet" description="TEMPORAL STREAM AUDIT" className="mb-0" />
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild><Button onClick={() => { resetForm(); setIsEntryDialogOpen(true); }} className="h-10 md:h-12 px-4 md:px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 text-white gap-2 text-[10px] md:text-sm"><PlusCircle className="h-4 w-4" /> Ledger Entry</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white"><div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-primary/20 text-primary"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Ledger Entry</DialogTitle></div></DialogHeader>
              <div className="p-8 space-y-6"><div className="grid grid-cols-2 gap-4"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 rounded-2xl bg-neutral-50" /><Select value={type} onValueChange={(v: any) => setType(v)}><SelectTrigger className="h-14 rounded-2xl bg-neutral-50 font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Inflow (+)</SelectItem><SelectItem value="expense">Outflow (-)</SelectItem></SelectContent></Select></div><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Origin" className="h-14 rounded-2xl bg-neutral-50 px-6 font-bold" /><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-16 rounded-2xl bg-neutral-50 px-6 font-black text-2xl" /><Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase">Commit Payload</Button></div>
            </DialogContent>
          </Dialog>
          <div className="flex gap-2 shrink-0"><Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="w-[100px] md:w-[140px] border-none font-bold bg-white rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{Array.from({length: 12}, (_, i) => (<SelectItem key={i} value={format(new Date(2024, i, 1), 'MM')}>{format(new Date(2024, i, 1), 'MMMM')}</SelectItem>))}</SelectContent></Select></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 shrink-0">
        <SummaryCard title="Net Savings" value={netBalance} icon={ShieldCheck} color="bg-primary" subtitle="Remaining Liquidity" />
        <SummaryCard title="Total Inflow" value={totalInflow} icon={ArrowUpCircle} color="bg-[#059669]" subtitle="Cumulative Inbound" />
        <SummaryCard title="Total Outflow" value={totalOutflow} icon={ArrowDownCircle} color="bg-[#e11d48]" subtitle="All Liability Spends" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="lookup origin..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm" />
        </div>
        <Tabs defaultValue="income" className="w-fit self-center md:self-auto" onValueChange={setActiveTab}>
          <TabsList className="bg-white rounded-xl flex items-center h-12 shadow-sm border border-slate-100 p-1 gap-1">
            <TabsTrigger value="income" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Inflow</TabsTrigger>
            <TabsTrigger value="institutional" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-primary data-[state=active]:text-white">Inst.</TabsTrigger>
            <TabsTrigger value="cards" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-[#ea580c] data-[state=active]:text-white">Card</TabsTrigger>
            <TabsTrigger value="household" className="rounded-lg font-black text-[8px] tracking-widest uppercase px-4 data-[state=active]:bg-rose-600 data-[state=active]:text-white">House.</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white flex-1 min-h-0 flex flex-col">
        <Tabs value={activeTab} className="flex-1 flex flex-col min-h-0">
          <TabsContent value="income" className="m-0 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-[#059669] text-white p-6 md:p-10 shrink-0"><div className="flex justify-between items-center"><div className="space-y-1"><div className="flex items-center gap-3"><ArrowUpCircle className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Monthly Inflow</CardTitle></div></div><p className="text-3xl md:text-4xl font-black tracking-tighter">₹{totalInflow.toLocaleString()}</p></div></CardHeader>
            <LedgerTable data={filteredIncomes} emptyMsg="No inflow logged" badgeLabel="OPERATIONAL INFLOW" badgeClass="bg-[#ecfdf5] text-[#059669]" />
          </TabsContent>
          <TabsContent value="institutional" className="m-0 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-primary text-white p-6 md:p-10 shrink-0"><div className="flex justify-between items-center"><div className="space-y-1"><div className="flex items-center gap-3"><Landmark className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Institutional EMI</CardTitle></div></div><p className="text-3xl md:text-4xl font-black tracking-tighter">₹{filteredInstitutional.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p></div></CardHeader>
            <LedgerTable data={filteredInstitutional} emptyMsg="No institutional records" badgeClass="bg-blue-50 text-primary" />
          </TabsContent>
          <TabsContent value="cards" className="m-0 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-[#ea580c] text-white p-6 md:p-10 shrink-0"><div className="flex justify-between items-center"><div className="space-y-1"><div className="flex items-center gap-3"><CreditCard className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Revolving Lines</CardTitle></div></div><p className="text-3xl md:text-4xl font-black tracking-tighter">₹{filteredCards.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p></div></CardHeader>
            <LedgerTable data={filteredCards} emptyMsg="No card records" badgeLabel="CARD" badgeClass="bg-pink-50 text-pink-600" />
          </TabsContent>
          <TabsContent value="household" className="m-0 flex-1 flex flex-col min-h-0">
            <CardHeader className="bg-[#e11d48] text-white p-6 md:p-10 shrink-0"><div className="flex justify-between items-center"><div className="space-y-1"><div className="flex items-center gap-3"><ShoppingBag className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Household Audit</CardTitle></div></div><p className="text-3xl md:text-4xl font-black tracking-tighter">₹{filteredHousehold.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p></div></CardHeader>
            <LedgerTable data={filteredHousehold} emptyMsg="No household spends" badgeLabel="HOUSEHOLD" badgeClass="bg-rose-50 text-rose-600" />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
