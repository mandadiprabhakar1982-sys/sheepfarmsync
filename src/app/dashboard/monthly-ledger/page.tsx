
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
  PlusCircle, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Home, 
  Pencil, 
  Save, 
  BarChart3, 
  CalendarDays, 
  TrendingUp, 
  TrendingDown,
  History,
  ShieldCheck,
  Filter,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, eachMonthOfInterval, subMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const chartConfig = {
  surplus: {
    label: "Net Surplus",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, updateMonthlyIncome, deleteMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, updateMonthlyExpense, deleteMonthlyExpense,
  } = useFarm();

  // Temporal Filtering State
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  // Form states
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  // Edit States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // LOGICAL FILTERING
  const filteredIncomes = useMemo(() => {
    return (monthlyIncomes || []).filter(item => {
      const d = parseISO(item.date);
      return format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
    });
  }, [monthlyIncomes, selectedMonth, selectedYear]);

  const filteredExpenses = useMemo(() => {
    return (monthlyExpenses || []).filter(item => {
      const d = parseISO(item.date);
      return format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
    });
  }, [monthlyExpenses, selectedMonth, selectedYear]);

  const currentTotalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const currentTotalExpense = filteredExpenses.reduce((s, i) => s + i.amount, 0);
  const currentNetSurplus = currentTotalIncome - currentTotalExpense;

  // LOGICAL ANALYTICS: 12 Month History
  const historyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date(),
    });

    return months.map(monthDate => {
      const mLabel = format(monthDate, 'MMM yy');
      const monthStr = format(monthDate, 'MM');
      const yearStr = format(monthDate, 'yyyy');

      const mIncomes = (monthlyIncomes || []).filter(i => {
        const d = parseISO(i.date);
        return format(d, 'MM') === monthStr && format(d, 'yyyy') === yearStr;
      });

      const mExpenses = (monthlyExpenses || []).filter(e => {
        const d = parseISO(e.date);
        return format(d, 'MM') === monthStr && format(d, 'yyyy') === yearStr;
      });

      const totalIn = mIncomes.reduce((s, i) => s + i.amount, 0);
      const totalOut = mExpenses.reduce((s, e) => s + e.amount, 0);
      const surplus = totalIn - totalOut;

      return {
        month: mLabel,
        monthValue: monthStr,
        yearValue: yearStr,
        income: totalIn,
        expense: totalOut,
        surplus: surplus,
        savingsRate: totalIn > 0 ? ((totalIn - totalOut) / totalIn) * 100 : 0
      };
    });
  }, [monthlyIncomes, monthlyExpenses]);

  const resetForms = () => {
    setSource('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleAdd = () => {
    if (!source || !amount || !date) return;
    const val = parseFloat(amount);

    if (type === 'income') {
      addMonthlyIncome({ date, source, amount: val });
      toast({ title: "Inflow Recorded", description: "Audit record synchronized." });
    } else {
      addMonthlyExpense({ date, source, amount: val, category });
      toast({ title: "Outflow Recorded", description: `${category.toUpperCase()} payload logged.` });
    }
    resetForms();
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setDate(item.date);
    setSource(item.source);
    setAmount(item.amount.toString());
    if (item.category) {
      setType('expense');
      setCategory(item.category);
    } else {
      setType('income');
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const val = parseFloat(amount);
    const path = editingItem._path;

    if (type === 'income') {
      updateMonthlyIncome(editingItem.id, { date, source, amount: val }, path);
    } else {
      updateMonthlyExpense(editingItem.id, { date, source, amount: val, category }, path);
    }

    toast({ title: "Record Adjusted", description: "Identity parameters synchronized." });
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForms();
  };

  const SummaryCard = ({ title, value, icon: Icon, color, trend }: { title: string, value: number, icon: any, color: string, trend?: string }) => (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group transition-all hover:-translate-y-1">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
            {trend && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{trend}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filterEx = (cat: string) => filteredExpenses.filter(e => e.category === cat);

  const LedgerTable = ({ title, data, icon: Icon, color }: { title: string, data: any[], icon: any, color: string }) => (
    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className={cn("text-white p-8", color)}>
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <CardTitle className="text-xl font-black tracking-tight leading-none">{title}</CardTitle>
            </div>
            <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Temporal Stream Audit</CardDescription>
          </div>
          <p className="text-3xl font-black tracking-tighter">₹{data.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Accounting Date</TableHead>
              <TableHead className="text-[9px] font-black uppercase">Origin / Description</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-right pr-8">Accounting Value</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id} 
                className="group hover:bg-neutral-50 cursor-zoom-in active:scale-[0.995] transition-all border-neutral-100"
                onClick={() => handleEditClick(item)}
              >
                <TableCell className="text-[10px] font-black text-muted-foreground/60 pl-8 uppercase tracking-widest">{item.date}</TableCell>
                <TableCell className="text-sm font-black tracking-tight">{item.source}</TableCell>
                <TableCell className="text-sm font-black text-right pr-8 tracking-tighter">₹{item.amount.toLocaleString()}</TableCell>
                <TableCell className="pr-8" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100" onClick={() => handleEditClick(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600" onClick={() => item.category ? deleteMonthlyExpense(item.id, item._path) : deleteMonthlyIncome(item.id, item._path)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic opacity-40 uppercase tracking-widest text-[10px] font-black">NO TEMPORAL DATA DETECTED</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Balance Sheet Audit"
          description="High-precision financial synchronization across rolling cycles."
          className="mb-0"
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-2xl shadow-inner border border-neutral-200">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm flex items-center gap-3">
              <Filter className="h-4 w-4 text-primary opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Period Audit</span>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-10 w-36 border-none bg-transparent font-black text-xs uppercase tracking-widest focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                  <SelectItem key={m} value={m} className="font-bold text-[10px] uppercase tracking-widest">
                    {format(new Date(2024, parseInt(m)-1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-10 w-28 border-none bg-transparent font-black text-xs uppercase tracking-widest focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                {['2023','2024','2025','2026'].map(y => (
                  <SelectItem key={y} value={y} className="font-bold text-[10px] uppercase tracking-widest">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className={cn("h-5 w-5", currentNetSurplus >= 0 ? "text-emerald-400" : "text-rose-400")} />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Status</p>
              <p className="text-xl font-black tracking-tight">
                {currentNetSurplus >= 0 ? '+' : '-'}₹{Math.abs(currentNetSurplus).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="mb-12 p-1.5 bg-neutral-100 rounded-2xl grid grid-cols-2 h-14 w-full max-w-md mx-auto">
          <TabsTrigger value="ledger" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Active Ledger</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Performance Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard title="Total Inflow" value={currentTotalIncome} icon={ArrowUpCircle} color="bg-emerald-600" trend="AUDIT" />
            <SummaryCard title="Total Outflow" value={currentTotalExpense} icon={ArrowDownCircle} color="bg-rose-600" trend="AUDIT" />
            <SummaryCard title="Accounting Surplus" value={currentNetSurplus} icon={Wallet} color="bg-indigo-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Card className="border-none bg-neutral-50/50 sticky top-24 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardHeader className="bg-neutral-900 p-8">
                  <CardTitle className="text-white text-xl font-black tracking-tight flex items-center gap-3">
                    <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                    Accounting Entry
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update temporal financial stream</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Date</Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Stream Type</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                          <SelectTrigger className="h-12 rounded-xl border-none bg-white shadow-sm font-black text-[10px] uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="income" className="font-bold uppercase text-[9px]">Income Inflow</SelectItem>
                            <SelectItem value="expense" className="font-bold uppercase text-[9px]">Expense Outflow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {type === 'expense' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Asset Category</Label>
                        <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                          <SelectTrigger className="h-12 rounded-xl border-none bg-white shadow-sm font-black text-[10px] uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="loan" className="font-bold uppercase text-[9px]">Bank Loans / EMI</SelectItem>
                            <SelectItem value="card" className="font-bold uppercase text-[9px]">Credit Cards</SelectItem>
                            <SelectItem value="private" className="font-bold uppercase text-[9px]">Private Debts</SelectItem>
                            <SelectItem value="household" className="font-bold uppercase text-[9px]">Household / Misc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Source / Description</Label>
                      <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Sheep Sale, Axis Bank" className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold text-base px-6" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Accounting Value (₹)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-14 rounded-2xl bg-white border-none shadow-sm font-black text-xl px-6" />
                    </div>
                  </div>

                  <Button onClick={handleAdd} className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800">
                    <PlusCircle className="mr-3 h-6 w-6 text-emerald-400" />
                    Commit Transaction
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-10">
              <LedgerTable title="Operational Inflow" data={filteredIncomes} icon={ArrowUpCircle} color="bg-emerald-600" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LedgerTable title="Institutional EMI" data={filterEx('loan')} icon={Home} color="bg-blue-600" />
                <LedgerTable title="Revolving Lines" data={filterEx('card')} icon={CreditCard} color="bg-orange-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LedgerTable title="Unsecured Debt" data={filterEx('private')} icon={Banknote} color="bg-slate-600" />
                <LedgerTable title="Household Audit" data={filterEx('household')} icon={Receipt} color="bg-rose-600" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <Card className="lg:col-span-8 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-neutral-50 p-10 border-b border-neutral-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    12-Month Performance Audit
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rolling net surplus performance velocity</CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Surplus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Deficit</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <ChartContainer config={chartConfig} className="h-[450px] w-full">
                  <BarChart data={historyData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      tickMargin={15} 
                      axisLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                    />
                    <YAxis 
                      tickFormatter={(v) => `₹${v/1000}k`} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900 }} 
                    />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="surplus" radius={[8, 8, 8, 8]} barSize={45}>
                      {historyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.surplus >= 0 ? "hsl(var(--primary))" : "#f43f5e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-10">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-neutral-900 text-white p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:rotate-45 duration-700">
                  <Activity className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-8 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    Identity Audit
                  </h3>
                  <div className="space-y-10">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Avg. Monthly Surplus</p>
                      <p className="text-4xl font-black tracking-tighter text-white">₹{(historyData.reduce((s, d) => s + d.surplus, 0) / 12).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Efficiency Rating</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black tracking-tighter text-emerald-400">
                          {(historyData.reduce((s, d) => s + d.savingsRate, 0) / 12).toFixed(1)}%
                        </p>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SAVE</p>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                      <History className="h-8 w-8 text-emerald-400 opacity-40" />
                      <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">Continuously monitoring historical payload for 12 rolling cycles.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-10">
                <div className="flex items-center gap-3 mb-8">
                  <CalendarDays className="h-6 w-6 text-primary opacity-40" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">Temporal Peak</h3>
                </div>
                {(() => {
                  const maxMonth = [...historyData].sort((a, b) => b.surplus - a.surplus)[0];
                  return (
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">Highest Yield Cycle</p>
                          <p className="text-3xl font-black tracking-tight">{maxMonth.month}</p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] h-6 px-3 rounded-lg">PEAK STATUS</Badge>
                      </div>
                      <div className="pt-6 border-t border-neutral-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Surplus Yield</span>
                        <span className="text-xl font-black text-primary">₹{maxMonth.surplus.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </div>

            <div className="lg:col-span-12">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="bg-neutral-900 text-white p-10">
                  <CardTitle className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-4">
                    <History className="h-6 w-6 text-emerald-400" />
                    Lifecycle Trend Ledger
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-bold">Historical accounting records for 12 rolling periods</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase pl-10 py-6">Fiscal Cycle</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Total Inflow</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Total Outflow</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-center">Efficiency</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right pr-10">Net Payload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...historyData].reverse().map((data, idx) => (
                        <TableRow 
                          key={idx} 
                          className="group hover:bg-neutral-50 transition-all cursor-pointer border-neutral-100 h-20"
                          onClick={() => {
                            setSelectedMonth(data.monthValue);
                            setSelectedYear(data.yearValue);
                            toast({ title: "Audit Target Changed", description: `Viewing temporal stream for ${data.month}.` });
                          }}
                        >
                          <TableCell className="pl-10">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-400">
                                {idx + 1}
                              </div>
                              <span className="text-sm font-black uppercase tracking-widest">{data.month}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-black text-emerald-600">₹{data.income.toLocaleString()}</TableCell>
                          <TableCell className="text-sm font-black text-rose-500">₹{data.expense.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-neutral-50 text-neutral-600 border-none font-black text-[9px] tracking-[0.2em] h-6 px-3">
                              {data.savingsRate.toFixed(1)}% SAVE
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <span className={cn("text-lg font-black tracking-tighter", data.surplus >= 0 ? "text-primary" : "text-rose-600")}>
                              {data.surplus >= 0 ? '+' : '-'}₹{Math.abs(data.surplus).toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Pencil className="h-20 w-20 text-white rotate-12" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-3 relative z-10">
              <Pencil className="h-6 w-6 text-emerald-400" />
              Adjust Audit Entry
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10">Modify existing fiscal record parameters</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Audit Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Accounting Value (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Description / Origin</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
            </div>

            {type === 'expense' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Fiscal Category</Label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                  <SelectTrigger className="h-12 rounded-xl border-none bg-neutral-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="loan" className="font-bold">Bank Loans / EMI</SelectItem>
                    <SelectItem value="card" className="font-bold">Credit Cards</SelectItem>
                    <SelectItem value="private" className="font-bold">Private Debts</SelectItem>
                    <SelectItem value="household" className="font-bold">Household / Misc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-neutral-50 gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
            <Button onClick={handleSaveEdit} className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">
              <Save className="mr-2 h-4 w-4 text-emerald-400" /> Commit Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
