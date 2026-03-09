
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
  Filter
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, parseISO, eachMonthOfInterval, subMonths, isSameMonth } from 'date-fns';
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
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

  // LOGICAL FILTERING: Only show data for selected month/year
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

  // LOGICAL ANALYTICS: Calculate 12 Month History
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
      toast({ title: "Income Recorded", description: "Inflow entry added successfully." });
    } else {
      addMonthlyExpense({ date, source, amount: val, category });
      toast({ title: "Expense Recorded", description: `${category.toUpperCase()} entry added successfully.` });
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

    toast({ title: "Ledger Updated", description: "The entry has been synchronized." });
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForms();
  };

  const SummaryCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: number, icon: any, color: string, subtitle: string }) => (
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white group transition-all hover:-translate-y-1">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl text-white shadow-lg", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-2xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
          <p className="text-[8px] font-bold text-muted-foreground/60 uppercase mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );

  const filterEx = (cat: string) => filteredExpenses.filter(e => e.category === cat);

  const LedgerTable = ({ title, data, icon: Icon, color }: { title: string, data: any[], icon: any, color: string }) => (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className={cn("text-white p-6", color)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-sm font-black uppercase tracking-wider">{title}</CardTitle>
          </div>
          <p className="font-black">₹{data.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[9px] font-black uppercase pl-6 py-3">Date</TableHead>
              <TableHead className="text-[9px] font-black uppercase">Source</TableHead>
              <TableHead className="text-[9px] font-black uppercase text-right pr-6">Amount</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id} 
                className="group hover:bg-neutral-50 cursor-zoom-in active:scale-[0.99]"
                onClick={() => handleEditClick(item)}
              >
                <TableCell className="text-[10px] font-bold text-muted-foreground pl-6">{item.date}</TableCell>
                <TableCell className="text-[11px] font-black">{item.source}</TableCell>
                <TableCell className="text-[11px] font-black text-right pr-6">₹{item.amount.toLocaleString()}</TableCell>
                <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg" 
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" 
                      onClick={() => item.category ? deleteMonthlyExpense(item.id, item._path) : deleteMonthlyIncome(item.id, item._path)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-[10px] text-muted-foreground italic">No entries for this period</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
        <PageHeader
          title="Monthly Balance Sheet"
          description="High-precision financial audit across current and historical cycles."
          className="mb-0"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-2xl shadow-inner border border-neutral-200">
            <div className="px-3 py-1 bg-white rounded-xl shadow-sm flex items-center gap-2">
              <Filter className="h-3 w-3 text-primary opacity-40" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Period Audit</span>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 w-32 border-none bg-transparent font-black text-[10px] uppercase tracking-widest focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                  <SelectItem key={m} value={m} className="font-bold text-[10px] uppercase tracking-widest">
                    {format(new Date(2024, parseInt(m)-1), 'MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-9 w-24 border-none bg-transparent font-black text-[10px] uppercase tracking-widest focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                {['2023','2024','2025','2026'].map(y => (
                  <SelectItem key={y} value={y} className="font-bold text-[10px] uppercase tracking-widest">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-neutral-900 rounded-2xl text-white shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Status</p>
              <p className={cn("text-xl font-black tracking-tight", currentNetSurplus >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {currentNetSurplus >= 0 ? '+' : '-'}₹{Math.abs(currentNetSurplus).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-8 p-1.5 bg-neutral-100 rounded-2xl grid grid-cols-2 h-14 w-full max-w-md mx-auto">
          <TabsTrigger value="current" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Active Ledger</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Performance History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard title="Monthly Inflow" value={currentTotalIncome} icon={ArrowUpCircle} color="bg-emerald-600" subtitle={`Total Revenue (${format(new Date(parseInt(selectedYear), parseInt(selectedMonth)-1), 'MMM yy')})`} />
            <SummaryCard title="Monthly Outflow" value={currentTotalExpense} icon={ArrowDownCircle} color="bg-rose-600" subtitle="Categorized Expenditures" />
            <SummaryCard title="Net Surplus" value={currentNetSurplus} icon={Wallet} color="bg-indigo-600" subtitle="Remaining Disposable Balance" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-neutral-900 text-white p-8">
                  <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                    <PlusCircle className="h-5 w-5 text-emerald-400" />
                    New Ledger Entry
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-bold">Add to income or specific expense streams for current period</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Date</Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Type</Label>
                      <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger className="h-12 rounded-xl border-none bg-neutral-50 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Source of Income</SelectItem>
                          <SelectItem value="expense">Source of Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {type === 'expense' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Category</Label>
                        <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                          <SelectTrigger className="h-12 rounded-xl border-none bg-neutral-50 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="loan">EMI / Bank Loans</SelectItem>
                            <SelectItem value="card">Credit Cards</SelectItem>
                            <SelectItem value="private">Private Debts</SelectItem>
                            <SelectItem value="household">Household / Misc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className={cn("space-y-2", type === 'income' ? 'md:col-span-2' : 'md:col-span-1')}>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Description / Source</Label>
                      <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Salary, Axis Bank, Milk" className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Amount (₹)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                    </div>
                    <Button onClick={handleAdd} className="h-12 rounded-xl font-black uppercase tracking-widest bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-primary/10">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-6 space-y-8">
              <LedgerTable title="Source of Income" data={filteredIncomes} icon={ArrowUpCircle} color="bg-emerald-600" />
              <LedgerTable title="EMI & Loan Payments" data={filterEx('loan')} icon={Home} color="bg-blue-600" />
              <LedgerTable title="Credit Card Settlements" data={filterEx('card')} icon={CreditCard} color="bg-orange-600" />
            </div>

            <div className="lg:col-span-6 space-y-8">
              <LedgerTable title="Household & Misc Expenses" data={filterEx('household')} icon={Receipt} color="bg-rose-600" />
              <LedgerTable title="Private Debt Payments" data={filterEx('private')} icon={Banknote} color="bg-slate-600" />
              
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-neutral-900 text-white p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:rotate-45 duration-700">
                  <Wallet className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Period Health Audit
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-white/60 mb-1">Active Savings Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black tracking-tighter">
                          {currentTotalIncome > 0 ? (((currentTotalIncome - currentTotalExpense) / currentTotalIncome) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Surplus</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.2em]">Expense Payload Distribution</span>
                        <span className="text-[10px] font-black uppercase text-rose-400">Total: ₹{currentTotalExpense.toLocaleString()}</span>
                      </div>
                      <div className="flex h-4 w-full rounded-full bg-white/5 overflow-hidden border border-white/5 shadow-inner">
                        {currentTotalExpense > 0 ? (
                          <>
                            <div className="bg-blue-500 transition-all" style={{ width: `${(filterEx('loan').reduce((s,i)=>s+i.amount,0)/currentTotalExpense)*100}%` }} />
                            <div className="bg-orange-500 transition-all" style={{ width: `${(filterEx('card').reduce((s,i)=>s+i.amount,0)/currentTotalExpense)*100}%` }} />
                            <div className="bg-rose-500 transition-all" style={{ width: `${(filterEx('household').reduce((s,i)=>s+i.amount,0)/currentTotalExpense)*100}%` }} />
                            <div className="bg-slate-500 transition-all" style={{ width: `${(filterEx('private').reduce((s,i)=>s+i.amount,0)/currentTotalExpense)*100}%` }} />
                          </>
                        ) : (
                          <div className="w-full bg-white/10" />
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500"/><span className="text-[8px] font-bold text-white/40 uppercase">Loans</span></div>
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-orange-500"/><span className="text-[8px] font-bold text-white/40 uppercase">Cards</span></div>
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-rose-500"/><span className="text-[8px] font-bold text-white/40 uppercase">Household</span></div>
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-500"/><span className="text-[8px] font-bold text-white/40 uppercase">Private</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-neutral-50 p-8 border-b border-neutral-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    12-Month Trend Audit
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Net surplus performance velocity</CardDescription>
                </div>
                <div className="flex items-center gap-4">
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
              <CardContent className="p-8">
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="surplus" radius={[8, 8, 8, 8]} barSize={40}>
                      {historyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.surplus >= 0 ? "hsl(var(--primary))" : "#f43f5e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-neutral-900 text-white p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Growth Analytics
                  </CardTitle>
                </CardHeader>
                <div className="space-y-8">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Avg. Monthly Surplus</p>
                    <p className="text-3xl font-black tracking-tighter">₹{(historyData.reduce((s, d) => s + d.surplus, 0) / 12).toLocaleString()}</p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Avg. Savings Rate</p>
                    <p className="text-3xl font-black tracking-tighter text-emerald-400">
                      {(historyData.reduce((s, d) => s + d.savingsRate, 0) / 12).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <History className="h-6 w-6 text-emerald-400 opacity-40" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">Full Lifecycle Audit</p>
                      <p className="text-[9px] font-medium text-white/40">Continuously monitoring historical payload for 12 rolling cycles.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays className="h-5 w-5 text-primary opacity-40" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Temporal Peak</h3>
                </div>
                {(() => {
                  const maxMonth = [...historyData].sort((a, b) => b.surplus - a.surplus)[0];
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">Highest Yield Month</p>
                          <p className="text-2xl font-black tracking-tight">{maxMonth.month}</p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">PEAK</Badge>
                      </div>
                      <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Yield</span>
                        <span className="text-sm font-black text-primary">₹{maxMonth.surplus.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </div>

            <div className="lg:col-span-12">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-neutral-900 text-white p-8">
                  <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                    <History className="h-5 w-5 text-emerald-400" />
                    Monthly Lifecycle Ledger
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-bold">Historical data aggregation for 12 months</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Accounting Period</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Total Inflow</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Total Outflow</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-center">Efficiency Rate</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right pr-8">Net Surplus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...historyData].reverse().map((data, idx) => (
                        <TableRow 
                          key={idx} 
                          className="group hover:bg-neutral-50 transition-all cursor-pointer border-neutral-100"
                          onClick={() => {
                            setSelectedMonth(data.monthValue);
                            setSelectedYear(data.yearValue);
                            toast({ title: "Audit Target Changed", description: `Viewing ledger for ${data.month}.` });
                          }}
                        >
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-xl bg-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-400">
                                {idx + 1}
                              </div>
                              <span className="text-sm font-black uppercase tracking-tight">{data.month}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-bold text-emerald-600">₹{data.income.toLocaleString()}</TableCell>
                          <TableCell className="text-sm font-bold text-rose-500">₹{data.expense.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-neutral-50 text-neutral-600 border-none font-black text-[9px] tracking-widest">
                              {data.savingsRate.toFixed(1)}% SAVE
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <span className={cn("text-sm font-black", data.surplus >= 0 ? "text-primary" : "text-rose-600")}>
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
              Update Audit Entry
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10">Adjust existing financial record</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Amount (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Source / Description</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
            </div>

            {type === 'expense' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Category</Label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                  <SelectTrigger className="h-12 rounded-xl border-none bg-neutral-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="loan" className="font-bold">EMI / Bank Loans</SelectItem>
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
              <Save className="mr-2 h-4 w-4 text-emerald-400" /> Save Audit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
