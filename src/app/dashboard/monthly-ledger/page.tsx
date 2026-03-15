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
  TrendingUp
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, deleteMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, deleteMonthlyExpense,
  } = useFarm();

  const [activeTab, setActiveTab] = useState('income');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  // Logic: Combine and Filter Data
  const combinedData = useMemo(() => {
    const incomes = (monthlyIncomes || []).map(i => ({ ...i, type: 'income' }));
    const expenses = (monthlyExpenses || []).map(e => ({ ...e, type: 'expense' }));
    
    return [...incomes, ...expenses]
      .filter(item => {
        const d = parseISO(item.date);
        const matchesDate = format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
        const matchesSearch = item.source.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDate && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyIncomes, monthlyExpenses, selectedMonth, selectedYear, searchTerm]);

  const filteredIncomes = useMemo(() => combinedData.filter(i => i.type === 'income'), [combinedData]);
  const filteredInstitutional = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'loan'), [combinedData]);
  const filteredCards = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'card'), [combinedData]);
  const filteredPrivate = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'private'), [combinedData]);
  const filteredHousehold = useMemo(() => combinedData.filter(e => e.type === 'expense' && e.category === 'household'), [combinedData]);

  const totalInflow = useMemo(() => filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0), [filteredIncomes]);
  const totalOutflow = useMemo(() => {
    const institutional = filteredInstitutional.reduce((s, e) => s + Number(e.amount || 0), 0);
    const cards = filteredCards.reduce((s, e) => s + Number(e.amount || 0), 0);
    const privateDebt = filteredPrivate.reduce((s, e) => s + Number(e.amount || 0), 0);
    const household = filteredHousehold.reduce((s, e) => s + Number(e.amount || 0), 0);
    return institutional + cards + privateDebt + household;
  }, [filteredInstitutional, filteredCards, filteredPrivate, filteredHousehold]);

  const netBalance = totalInflow - totalOutflow;

  const handleAdd = () => {
    if (!source || !amount || !date) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please fill all required fields.' });
      return;
    }
    const val = parseFloat(amount);
    if (type === 'income') {
      addMonthlyIncome({ date, source, amount: val });
      toast({ title: "Inflow Recorded", description: "Income record synchronized." });
    } else {
      addMonthlyExpense({ date, source, amount: val, category });
      toast({ title: "Outflow Recorded", description: "Expense record synchronized." });
    }
    setSource(''); setAmount('');
  };

  const SummaryCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: number, icon: any, color: string, subtitle: string }) => (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group transition-all hover:-translate-y-1">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );

  const LedgerTable = ({ data, emptyMsg, badgeLabel, badgeClass }: { data: any[], emptyMsg: string, badgeLabel?: string, badgeClass?: string }) => (
    <CardContent className="p-0 overflow-x-auto">
      <Table>
        <TableHeader className="bg-white border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Origin</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map(item => (
              <TableRow key={item.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <TableCell className="pl-10 py-10">
                  <span className="text-sm font-black text-slate-300 tracking-tight leading-none whitespace-nowrap block">
                    {item.date.split('-').slice(0, 2).join('-')}
                  </span>
                  <span className="text-sm font-black text-slate-300 tracking-tight leading-none whitespace-nowrap block mt-1">
                    {item.date.split('-')[2]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[16px] font-black text-slate-900 leading-tight">{item.source}</span>
                    <div className="flex items-center">
                      <Badge className={cn("border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md", badgeClass || "bg-slate-100 text-slate-600")}>
                        {badgeLabel || (item.category || 'Loan').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-10">
                  <div className="flex items-center justify-end gap-6">
                    <span className="text-xl font-black text-slate-900 tracking-tight">₹{item.amount.toLocaleString()}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => item.type === 'income' ? deleteMonthlyIncome(item.id, item._path) : deleteMonthlyExpense(item.id, item._path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest bg-slate-50/50">
                {emptyMsg}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <PageHeader
          title="Operational Inflow"
          description="TEMPORAL STREAM AUDIT"
          className="mb-0"
        />
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl">
           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] border-none font-bold bg-slate-50 rounded-xl">
                <SelectValue placeholder="Month" />
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
              <SelectTrigger className="w-[100px] border-none font-bold bg-slate-50 rounded-xl">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
           </Select>
        </div>
      </div>

      {/* TACTICAL DASHBOARD SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SummaryCard 
          title="Net Savings" 
          value={netBalance} 
          icon={ShieldCheck} 
          color="bg-primary" 
          subtitle="Remaining Liquidity"
        />
        <SummaryCard 
          title="Total Inflow" 
          value={totalInflow} 
          icon={ArrowUpCircle} 
          color="bg-[#059669]" 
          subtitle="Cumulative Inbound"
        />
        <SummaryCard 
          title="Total Outflow" 
          value={totalOutflow} 
          icon={ArrowDownCircle} 
          color="bg-[#e11d48]" 
          subtitle="All Liability Spends"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Easy lookup: search origin..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm"
              />
            </div>
            <Tabs defaultValue="income" className="w-auto" onValueChange={setActiveTab}>
              <TabsList className="p-1 bg-white rounded-xl flex items-center h-12 shadow-sm border border-slate-100 gap-1">
                <TabsTrigger value="income" className="rounded-lg font-black text-[8px] tracking-widest uppercase data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Inflow</TabsTrigger>
                <TabsTrigger value="institutional" className="rounded-lg font-black text-[8px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Inst.</TabsTrigger>
                <TabsTrigger value="cards" className="rounded-lg font-black text-[8px] tracking-widest uppercase data-[state=active]:bg-[#ea580c] data-[state=active]:text-white">Card</TabsTrigger>
                <TabsTrigger value="private" className="rounded-lg font-black text-[8px] tracking-widest uppercase data-[state=active]:bg-slate-700 data-[state=active]:text-white">Priv.</TabsTrigger>
                <TabsTrigger value="household" className="rounded-lg font-black text-[8px] tracking-widest uppercase data-[state=active]:bg-rose-600 data-[state=active]:text-white">House.</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-4">
            <Tabs value={activeTab}>
              <TabsContent value="income" className="m-0">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-[#059669] text-white p-10 py-12">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <ArrowUpCircle className="h-6 w-6" />
                          <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Operational Inflow</CardTitle>
                        </div>
                        <CardDescription className="text-emerald-100/60 text-xs font-black uppercase tracking-[0.2em]">Temporal Stream Audit</CardDescription>
                      </div>
                      <p className="text-4xl font-black tracking-tighter">₹{totalInflow.toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <LedgerTable data={filteredIncomes} emptyMsg="No inflow transactions logged" badgeLabel="OPERATIONAL INFLOW" badgeClass="bg-[#ecfdf5] text-[#059669]" />
                </Card>
              </TabsContent>

              <TabsContent value="institutional" className="m-0">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-primary text-white p-10 py-12">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Landmark className="h-6 w-6" />
                          <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Institutional EMI</CardTitle>
                        </div>
                        <CardDescription className="text-blue-100/60 text-xs font-black uppercase tracking-[0.2em]">Temporal Stream Audit</CardDescription>
                      </div>
                      <p className="text-4xl font-black tracking-tighter">₹{filteredInstitutional.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <LedgerTable data={filteredInstitutional} emptyMsg="No institutional records discovered" badgeClass="bg-blue-50 text-primary" />
                </Card>
              </TabsContent>

              <TabsContent value="cards" className="m-0">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-[#ea580c] text-white p-10 py-12">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6" />
                          <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Revolving Lines</CardTitle>
                        </div>
                        <CardDescription className="text-orange-100/60 text-xs font-black uppercase tracking-[0.2em]">Temporal Stream Audit</CardDescription>
                      </div>
                      <p className="text-4xl font-black tracking-tighter">₹{filteredCards.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <LedgerTable data={filteredCards} emptyMsg="No card transactions discovered" badgeLabel="CARD" badgeClass="bg-pink-50 text-pink-600" />
                </Card>
              </TabsContent>

              <TabsContent value="private" className="m-0">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-[#334155] text-white p-10 py-12">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-6 w-6" />
                          <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Unsecured Debt</CardTitle>
                        </div>
                        <CardDescription className="text-slate-100/60 text-xs font-black uppercase tracking-[0.2em]">Temporal Stream Audit</CardDescription>
                      </div>
                      <p className="text-4xl font-black tracking-tighter">₹{filteredPrivate.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <LedgerTable data={filteredPrivate} emptyMsg="No private debt entries discovered" badgeLabel="PRIVATE" badgeClass="bg-rose-50 text-rose-600" />
                </Card>
              </TabsContent>

              <TabsContent value="household" className="m-0">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-[#e11d48] text-white p-10 py-12">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-6 w-6" />
                          <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Household Audit</CardTitle>
                        </div>
                        <CardDescription className="text-rose-100/60 text-xs font-black uppercase tracking-[0.2em]">Temporal Stream Audit</CardDescription>
                      </div>
                      <p className="text-4xl font-black tracking-tighter">₹{filteredHousehold.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <LedgerTable data={filteredHousehold} emptyMsg="No household spends recorded" badgeLabel="HOUSEHOLD" badgeClass="bg-rose-50 text-rose-600" />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-4">
          <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-24">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black tracking-tight uppercase">Ledger Entry</CardTitle>
              </div>
              <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update your temporal financial stream</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Transaction Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 rounded-2xl bg-white/5 border-none text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Stream Type</Label>
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-none text-white font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-none">
                        <SelectItem value="income" className="font-bold">Inflow (+)</SelectItem>
                        <SelectItem value="expense" className="font-bold">Outflow (-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Origin / Entity</Label>
                  <Input 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)} 
                    placeholder="e.g. Salary, HDFC Bank, Personal" 
                    className="h-14 rounded-2xl bg-white/5 border-none text-white font-bold px-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Value Payload (₹)</Label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00"
                    className="h-16 rounded-2xl bg-white/5 border-none text-white font-black text-2xl px-6"
                  />
                </div>

                {type === 'expense' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Fiscal Category</Label>
                    <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-none text-white font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-none">
                        <SelectItem value="loan" className="font-bold">Institutional Loan</SelectItem>
                        <SelectItem value="card" className="font-bold">Credit Card</SelectItem>
                        <SelectItem value="private" className="font-bold">Unsecured Debt</SelectItem>
                        <SelectItem value="household" className="font-bold">Household Spends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">
                Commit Payload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
