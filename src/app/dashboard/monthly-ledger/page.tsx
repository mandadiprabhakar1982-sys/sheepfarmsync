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
  History,
  TrendingUp,
  TrendingDown,
  Landmark,
  CreditCard,
  Home as HomeIcon,
  User as UserIcon,
  BadgeIndianRupee
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MonthlyLedgerPage() {
  const { toast } = useToast();
  const { 
    monthlyIncomes, addMonthlyIncome, deleteMonthlyIncome,
    monthlyExpenses, addMonthlyExpense, deleteMonthlyExpense,
  } = useFarm();

  const [activeTab, setActiveTab] = useState('all');
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

  // Category Summaries
  const categoryTotals = useMemo(() => {
    const totals = { loan: 0, card: 0, household: 0, private: 0, totalIncome: 0, totalExpense: 0 };
    combinedData.forEach(item => {
      if (item.type === 'income') {
        totals.totalIncome += Number(item.amount || 0);
      } else {
        totals.totalExpense += Number(item.amount || 0);
        if (item.category === 'loan') totals.loan += Number(item.amount || 0);
        if (item.category === 'card') totals.card += Number(item.amount || 0);
        if (item.category === 'household') totals.household += Number(item.amount || 0);
        if (item.category === 'private') totals.private += Number(item.amount || 0);
      }
    });
    return totals;
  }, [combinedData]);

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

  const SummaryMiniCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <div className="bg-white/90 p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4 flex-1">
      <div className={cn("p-2 rounded-xl text-white", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60 leading-none mb-1">{title}</p>
        <p className="text-sm font-black text-slate-900 leading-none">₹{value.toLocaleString()}</p>
      </div>
    </div>
  );

  const TableHeaderRow = () => (
    <TableHeader className="bg-[#e2e8f0]">
      <TableRow>
        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 pl-10">Temporal Node</TableHead>
        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6">Origin / Entity</TableHead>
        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 text-right pr-10">Value Payload</TableHead>
      </TableRow>
    </TableHeader>
  );

  const TransactionRow = ({ item }: { item: any }) => (
    <TableRow className="bg-white hover:bg-neutral-50 transition-colors group">
      <TableCell className="pl-10 py-6 text-xs font-bold text-slate-500 uppercase">{item.date}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-900">{item.source}</span>
          {item.type === 'expense' && (
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-0.5">
              {item.category === 'loan' ? 'Monthly EMI' : 
               item.category === 'card' ? 'Credit Card' : 
               item.category === 'household' ? 'Home Spends' : 'Personal Debt'}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right pr-10">
        <div className="flex items-center justify-end gap-4">
          <span className={cn("text-sm font-black", item.type === 'income' ? "text-[#15803d]" : "text-rose-600")}>
            {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
          </span>
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
  );

  return (
    <div className="container mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <PageHeader
          title="Operational Inflow"
          description="TEMPORAL STREAM AUDIT"
          className="mb-0"
        />
        <div className="flex gap-4">
          <div className="bg-white/90 p-5 px-8 rounded-[24px] shadow-xl border-l-4 border-[#15803d]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Operational Inflow</p>
            <p className="text-2xl font-black text-[#15803d]">₹{categoryTotals.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white/90 p-5 px-8 rounded-[24px] shadow-xl border-l-4 border-rose-600">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Outflow</p>
            <p className="text-2xl font-black text-rose-600">₹{categoryTotals.totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        <SummaryMiniCard title="Monthly EMI" value={categoryTotals.loan} icon={Landmark} color="bg-blue-600" />
        <SummaryMiniCard title="Credit Card" value={categoryTotals.card} icon={CreditCard} color="bg-indigo-600" />
        <SummaryMiniCard title="Home Spends" value={categoryTotals.household} icon={HomeIcon} color="bg-amber-600" />
        <SummaryMiniCard title="Personal" value={categoryTotals.private} icon={UserIcon} color="bg-rose-600" />
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-10">
          <TabsList className="p-1 bg-[#e7eddc] rounded-2xl flex justify-start items-center h-16 w-fit shadow-inner">
            <TabsTrigger value="all" className="tab-inactive data-[state=active]:tab-active h-14 px-8 font-black text-[10px] tracking-widest uppercase">Overview Stream</TabsTrigger>
            <TabsTrigger value="income" className="tab-inactive data-[state=active]:tab-active h-14 px-8 font-black text-[10px] tracking-widest uppercase">Inflow Ledger</TabsTrigger>
            <TabsTrigger value="expense" className="tab-inactive data-[state=active]:tab-active h-14 px-8 font-black text-[10px] tracking-widest uppercase">Outflow Ledger</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- ENTRY FORM --- */}
          <div className="lg:col-span-4">
            <Card className="form-card p-10 border-t-4 border-[#15803d]">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-[#15803d]" />
                    <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-900">Transaction Entry</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Date</Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Type</Label>
                      <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger className="h-14"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-none">
                          <SelectItem value="income" className="font-bold">Inflow (+)</SelectItem>
                          <SelectItem value="expense" className="font-bold">Outflow (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Origin / Description</Label>
                  <Input 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)} 
                    placeholder="e.g. Bulk Sale, ICICI EMI, Rent" 
                    className="font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Value Amount (₹)</Label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00"
                    className="font-black text-lg"
                  />
                </div>

                {type === 'expense' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Category Filter</Label>
                    <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                      <SelectTrigger className="h-14"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-none">
                        <SelectItem value="household" className="font-bold">Home Spends</SelectItem>
                        <SelectItem value="loan" className="font-bold">Monthly EMI</SelectItem>
                        <SelectItem value="card" className="font-bold">Credit Card</SelectItem>
                        <SelectItem value="private" className="font-bold">Personal Debt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={handleAdd} className="primary-btn w-full !bg-[#15803d] flex items-center justify-center gap-3 hover:!bg-[#166534]">
                  <PlusCircle className="h-5 w-5" />
                  Commit Ledger Payload
                </Button>
              </div>
            </Card>
          </div>

          {/* --- DATA DISPLAY --- */}
          <div className="lg:col-span-8 space-y-10">
            <TabsContent value="all" className="m-0">
              <Card className="form-card p-0 overflow-hidden">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeaderRow />
                    <TableBody>
                      {combinedData.length > 0 ? (
                        combinedData.map(item => <TransactionRow key={item.id} item={item} />)
                      ) : (
                        <TableRow><TableCell colSpan={3} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest">No transactions logged for this cycle</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="income" className="m-0">
              <Card className="form-card p-0 overflow-hidden">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeaderRow />
                    <TableBody>
                      {filteredIncomes.length > 0 ? (
                        filteredIncomes.map(item => <TransactionRow key={item.id} item={item} />)
                      ) : (
                        <TableRow><TableCell colSpan={3} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest">No income streams discovered</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="expense" className="m-0">
              <Card className="form-card p-0 overflow-hidden">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeaderRow />
                    <TableBody>
                      {filteredExpenses.length > 0 ? (
                        filteredExpenses.map(item => <TransactionRow key={item.id} item={item} />)
                      ) : (
                        <TableRow><TableCell colSpan={3} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest">No disbursement records discovered</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
