'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, ArrowUpCircle, ArrowDownCircle, Wallet, Receipt, CreditCard, Banknote, Home, Pencil, Save } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, updateMonthlyIncome, deleteMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, updateMonthlyExpense, deleteMonthlyExpense,
    totalMonthlyIncome, totalMonthlyExpense
  } = useFarm();

  // Form states
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<'loan' | 'card' | 'private' | 'household'>('household');

  // Edit States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl text-white", color)}>
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

  const filterEx = (cat: string) => monthlyExpenses?.filter(e => e.category === cat) || [];

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
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-[10px] text-muted-foreground italic">No entries found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Monthly Balance Sheet"
        description="Comprehensive audit of monthly income and categorized expenditures."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Monthly Inflow" value={totalMonthlyIncome} icon={ArrowUpCircle} color="bg-emerald-600" subtitle="Total Revenue Sources" />
        <SummaryCard title="Monthly Outflow" value={totalMonthlyExpense} icon={ArrowDownCircle} color="bg-rose-600" subtitle="Categorized Expenditures" />
        <SummaryCard title="Net Surplus" value={totalMonthlyIncome - totalMonthlyExpense} icon={Wallet} color="bg-indigo-600" subtitle="Current Monthly Balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Entry Form */}
        <div className="lg:col-span-12">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden mb-10">
            <CardHeader className="bg-neutral-900 text-white p-8">
              <CardTitle className="text-lg font-black uppercase tracking-widest">New Ledger Entry</CardTitle>
              <CardDescription className="text-white/40 text-[10px] font-bold">Add to income or specific expense streams</CardDescription>
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
                <Button onClick={handleAdd} className="h-12 rounded-xl font-black uppercase tracking-widest bg-neutral-900 text-white hover:bg-neutral-800">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Table Ledger View */}
        <div className="lg:col-span-6 space-y-8">
          <LedgerTable title="Source of Income" data={monthlyIncomes || []} icon={ArrowUpCircle} color="bg-emerald-600" />
          <LedgerTable title="EMI & Loan Payments" data={filterEx('loan')} icon={Home} color="bg-blue-600" />
          <LedgerTable title="Credit Card Settlements" data={filterEx('card')} icon={CreditCard} color="bg-orange-600" />
        </div>

        <div className="lg:col-span-6 space-y-8">
          <LedgerTable title="Household & Misc Expenses" data={filterEx('household')} icon={Receipt} color="bg-rose-600" />
          <LedgerTable title="Private Debt Payments" data={filterEx('private')} icon={Banknote} color="bg-slate-600" />
          
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-neutral-900 text-white p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet className="h-32 w-32 rotate-12" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-6">Financial Health Check</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-white/60 mb-1">Savings Rate</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black tracking-tighter">
                      {totalMonthlyIncome > 0 ? (((totalMonthlyIncome - totalMonthlyExpense) / totalMonthlyIncome) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-[10px] font-bold text-emerald-400 mb-2 uppercase">Surplus</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase opacity-40">Expense Breakdown</span>
                    <span className="text-[10px] font-black uppercase text-rose-400">Total: ₹{totalMonthlyExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex h-3 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="bg-blue-500" style={{ width: `${(filterEx('loan').reduce((s,i)=>s+i.amount,0)/totalMonthlyExpense)*100}%` }} />
                    <div className="bg-orange-500" style={{ width: `${(filterEx('card').reduce((s,i)=>s+i.amount,0)/totalMonthlyExpense)*100}%` }} />
                    <div className="bg-rose-500" style={{ width: `${(filterEx('household').reduce((s,i)=>s+i.amount,0)/totalMonthlyExpense)*100}%` }} />
                    <div className="bg-slate-500" style={{ width: `${(filterEx('private').reduce((s,i)=>s+i.amount,0)/totalMonthlyExpense)*100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left">
            <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Pencil className="h-6 w-6 text-emerald-400" />
              Update Entry
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Adjust financial audit record</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Amount (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Source / Description</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
            </div>

            {type === 'expense' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Category</Label>
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
