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
  Receipt, 
  TrendingUp,
  ArrowUpCircle,
  Plus
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        return format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyIncomes, monthlyExpenses, selectedMonth, selectedYear]);

  const filteredIncomes = useMemo(() => combinedData.filter(i => i.type === 'income'), [combinedData]);
  const filteredExpenses = useMemo(() => combinedData.filter(e => e.type === 'expense'), [combinedData]);

  // Total Inflow for the specific view shown in image
  const currentTotalInflow = useMemo(() => {
    return filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  }, [filteredIncomes]);

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

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-700 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <PageHeader
          title="Ledger Management"
          description="SYSTEM TRANSACTION CONSOLE"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- DATA DISPLAY (MATCHING IMAGE) --- */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="income" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-8 p-1 bg-white rounded-2xl flex justify-start items-center h-14 w-fit shadow-md border border-slate-100">
              <TabsTrigger value="income" className="rounded-xl font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Inflow Ledger</TabsTrigger>
              <TabsTrigger value="expense" className="rounded-xl font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Outflow Ledger</TabsTrigger>
            </TabsList>

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
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tighter">₹{currentTotalInflow.toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white border-b">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Origin</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncomes.length > 0 ? (
                        filteredIncomes.map(item => (
                          <TableRow key={item.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="pl-10 py-10">
                              <span className="text-sm font-black text-slate-300 tracking-tight">{item.date}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[16px] font-black text-slate-900 leading-none">{item.source}</span>
                                <div className="flex items-center">
                                  <Badge className="bg-[#ecfdf5] text-[#059669] border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md">
                                    Operational Inflow
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-10">
                              <div className="flex items-center justify-end gap-6">
                                <span className="text-xl font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                  onClick={() => deleteMonthlyIncome(item.id, item._path)}
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
                            No transactions logged for this cycle
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expense" className="m-0">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-rose-600 text-white p-10 py-12">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 rotate-180" />
                        <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Operational Outflow</CardTitle>
                      </div>
                      <CardDescription className="text-rose-100/60 text-xs font-black uppercase tracking-[0.2em]">Temporal Stream Audit</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tighter">₹{filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white border-b">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Entity</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length > 0 ? (
                        filteredExpenses.map(item => (
                          <TableRow key={item.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                            <TableCell className="pl-10 py-10">
                              <span className="text-sm font-black text-slate-300 tracking-tight">{item.date}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[16px] font-black text-slate-900 leading-none">{item.source}</span>
                                <div className="flex items-center">
                                  <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md">
                                    {item.category || 'General'}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-10">
                              <div className="flex items-center justify-end gap-6">
                                <span className="text-xl font-black text-rose-600">₹{item.amount.toLocaleString()}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                  onClick={() => deleteMonthlyExpense(item.id, item._path)}
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
                            No disbursement records discovered
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* --- ENTRY FORM --- */}
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
                    placeholder="e.g. Salary, Rent, Sale" 
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
                        <SelectItem value="household" className="font-bold">Home Spends</SelectItem>
                        <SelectItem value="loan" className="font-bold">Monthly EMI</SelectItem>
                        <SelectItem value="card" className="font-bold">Credit Card</SelectItem>
                        <SelectItem value="private" className="font-bold">Personal Debt</SelectItem>
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
