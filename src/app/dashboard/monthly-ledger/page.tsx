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
  Filter,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, deleteMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, deleteMonthlyExpense,
    totalReceivables, totalPayables
  } = useFarm();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  const filteredIncomes = useMemo(() => (monthlyIncomes || []).filter(i => {
    const d = parseISO(i.date);
    return format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
  }), [monthlyIncomes, selectedMonth, selectedYear]);

  const filteredExpenses = useMemo(() => (monthlyExpenses || []).filter(e => {
    const d = parseISO(e.date);
    return format(d, 'MM') === selectedMonth && format(d, 'yyyy') === selectedYear;
  }), [monthlyExpenses, selectedMonth, selectedYear]);

  const handleAdd = () => {
    if (!source || !amount || !date) return;
    const val = parseFloat(amount);
    if (type === 'income') addMonthlyIncome({ date, source, amount: val });
    else addMonthlyExpense({ date, source, amount: val, category });
    setSource(''); setAmount('');
    toast({ title: "Recorded", description: "Audit record synchronized." });
  };

  return (
    <div className="container mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-start mb-10">
        <PageHeader
          title="Monthly Ledger"
          description="Precision Financial Synchronization"
        />
        <div className="flex gap-4">
          <div className="sync-card p-6 px-10 border border-white/40">
            <p className="subtitle !text-[9px]">Receivables</p>
            <p className="text-2xl font-black text-[#15803d]">₹{totalReceivables.toLocaleString()}</p>
          </div>
          <div className="sync-card p-6 px-10 border border-white/40">
            <p className="subtitle !text-[9px]">Payables</p>
            <p className="text-2xl font-black text-rose-600">₹{totalPayables.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <Card className="sync-card p-10 border-t-4 border-[#15803d]">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="subtitle !text-[10px] ml-2">Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="subtitle !text-[10px] ml-2">Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="h-14"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="income">Inflow</SelectItem><SelectItem value="expense">Outflow</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="subtitle !text-[10px] ml-2">Origin / Description</Label>
                <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Sales" />
              </div>
              <div className="space-y-2">
                <Label className="subtitle !text-[10px] ml-2">Value (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <Button onClick={handleAdd} className="primary-btn w-full !bg-[#15803d]">Commit Payload</Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="sync-card overflow-hidden">
            <CardHeader className="bg-slate-50 p-6 border-b border-slate-200">
              <CardTitle className="subtitle !text-[11px] !tracking-widest">Active Ledger Stream</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="sync-table-header">
                <TableRow>
                  <TableHead className="subtitle !text-[10px] py-6 pl-10">Date</TableHead>
                  <TableHead className="subtitle !text-[10px] py-6">Origin</TableHead>
                  <TableHead className="subtitle !text-[10px] py-6 text-right pr-10">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...filteredIncomes, ...filteredExpenses].map(item => (
                  <TableRow key={item.id} className="sync-table-row">
                    <TableCell className="pl-10 py-6 text-xs font-bold text-slate-500">{item.date}</TableCell>
                    <TableCell><span className="text-sm font-black text-slate-900">{item.source}</span></TableCell>
                    <TableCell className="text-right pr-10">
                      <span className={cn("text-sm font-black", (item as any).category ? "text-rose-600" : "text-emerald-700")}>
                        {(item as any).category ? '-' : '+'}₹{item.amount.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}