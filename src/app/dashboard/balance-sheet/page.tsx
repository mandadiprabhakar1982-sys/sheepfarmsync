'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Wallet, CreditCard, Home, Banknote, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type BalanceCategory = 'Income' | 'Loan/EMI' | 'Credit Card' | 'Personal' | 'Household';

interface BalanceEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: BalanceCategory;
}

export default function BalanceSheetPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<BalanceEntry[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BalanceCategory>('Income');

  const addEntry = () => {
    if (!description || !amount) return;
    const newEntry: BalanceEntry = {
      id: Math.random().toString(36).substring(7),
      date: format(date, 'yyyy-MM-dd'),
      description,
      amount: parseFloat(amount),
      category,
    };
    setEntries([newEntry, ...entries]);
    setDescription('');
    setAmount('');
    toast({ title: "Entry Recorded", description: `${category} entry added successfully.` });
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const filteredEntries = (cat: BalanceCategory) => entries.filter(e => e.category === cat);

  const totalIncome = useMemo(() => filteredEntries('Income').reduce((sum, e) => sum + e.amount, 0), [entries]);
  const totalExpenses = useMemo(() => entries.filter(e => e.category !== 'Income').reduce((sum, e) => sum + e.amount, 0), [entries]);

  const LedgerTable = ({ title, category, icon: Icon, color }: { title: string, category: BalanceCategory, icon: any, color: string }) => (
    <Card className="border-none shadow-xl overflow-hidden rounded-[2rem]">
      <CardHeader className={cn("pb-4", color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white text-lg font-black tracking-tight">{title}</CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Monthly Ledger</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total</p>
            <p className="text-xl font-black text-white">₹{filteredEntries(category).reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Source</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries(category).length > 0 ? (
              filteredEntries(category).map((e) => (
                <TableRow key={e.id} className="group hover:bg-neutral-50 transition-colors">
                  <TableCell className="text-xs font-medium text-muted-foreground">{e.date}</TableCell>
                  <TableCell className="text-xs font-bold">{e.description}</TableCell>
                  <TableCell className="text-xs font-black text-right">₹{e.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeEntry(e.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 opacity-20 italic text-[10px]">No entries recorded</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Balance Sheet"
        description="Comprehensive Monthly Income & Expense Audit."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-4">
          <Card className="border-primary/20 bg-accent/5 sticky top-24 rounded-[2rem] shadow-xl overflow-hidden">
            <CardHeader className="bg-primary p-8">
              <CardTitle className="text-white text-xl font-black tracking-tight">Record Transaction</CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Update your monthly ledger</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Category</Label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                  <SelectTrigger className="h-12 rounded-xl font-bold bg-white border-none shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income Stream</SelectItem>
                    <SelectItem value="Loan/EMI">Loan / EMI</SelectItem>
                    <SelectItem value="Credit Card">Bank Card Payment</SelectItem>
                    <SelectItem value="Personal">Personal / Investment</SelectItem>
                    <SelectItem value="Household">Household / Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left font-bold rounded-xl bg-white border-none shadow-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. SBI Credit Card" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Amount (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-lg" />
              </div>

              <Button onClick={addEntry} className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add to Ledger
              </Button>

              <div className="pt-6 border-t border-primary/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-primary/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Monthly Income</p>
                    <p className="text-xl font-black tracking-tight">₹{totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-primary/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-destructive mb-1">Monthly Exp.</p>
                    <p className="text-xl font-black tracking-tight">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
                <div className={cn(
                  "mt-4 p-4 rounded-2xl text-center shadow-inner",
                  totalIncome - totalExpenses >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-destructive/5 text-destructive"
                )}>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Net Balance</p>
                  <p className="text-2xl font-black tracking-tighter">₹{(totalIncome - totalExpenses).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Views */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LedgerTable title="Income Ledger" category="Income" icon={Wallet} color="bg-emerald-600" />
            <LedgerTable title="Debt & EMI" category="Loan/EMI" icon={Home} color="bg-amber-600" />
            <LedgerTable title="Credit Cards" category="Credit Card" icon={CreditCard} color="bg-indigo-600" />
            <LedgerTable title="Household" category="Household" icon={Banknote} color="bg-rose-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
