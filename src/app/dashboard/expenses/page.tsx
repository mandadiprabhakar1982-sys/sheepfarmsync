'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Plus,
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  Receipt,
  PlusCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';

const formSchema = z.object({
  expenseDate: z.date({ required_error: 'A date is required.' }),
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Must be a positive number'),
});

type ExpenseFormData = z.infer<typeof formSchema>;

export default function ExpensesPage() {
  const { toast } = useToast();
  const { farmExpenses, addFarmExpense, deleteFarmExpense, totalExpenses, isLoading } = useFarm();
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '', amount: 0, expenseDate: new Date() },
  });

  const sortedFarmExpenses = useMemo(() => {
    if (!farmExpenses) return [];
    const filtered = farmExpenses.filter(e => e.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [farmExpenses, searchTerm]);

  const groupedExpenses = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    sortedFarmExpenses.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [sortedFarmExpenses]);

  const onSubmit: SubmitHandler<ExpenseFormData> = async (data) => {
    const newExpense = { ...data, date: format(data.expenseDate, 'yyyy-MM-dd'), category: 'Miscellaneous', subcategory: 'General', totalAmount: data.amount, paymentMode: 'Cash' };
    addFarmExpense(newExpense as any);
    form.reset({ description: '', amount: 0, expenseDate: new Date() });
    setIsEntryDialogOpen(false);
    toast({ title: 'Success!', description: 'Kharchu record saved.' });
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl animate-pulse space-y-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-[#edf2f7] rounded-2xl w-full" />)}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER */}
      <div className="md:hidden shrink-0 bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight">Itara Kharchulu</h2>
        <p className="text-xl font-black">₹{totalExpenses.toLocaleString()}</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Other Expenses" description="FARM OVERHEADS & MISC KHARCHULU" className="mb-0 hidden md:block" />
        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => setIsEntryDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none"><PlusCircle className="h-5 w-5 text-accent" /> Log Kharchu</Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0"><ShieldCheck className="h-5 w-5 text-emerald-400" /><div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Kharchu</p><p className="text-xl font-black tracking-tight text-white">₹{totalExpenses.toLocaleString()}</p></div></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 md:px-0 space-y-6">
          <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input placeholder="Search Kharchu Description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" />{searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}</div>
          <div className="md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
            <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block"><div className="flex justify-between items-end"><div className="space-y-1"><div className="flex items-center gap-3"><Receipt className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Expense Ledger</CardTitle></div><CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Operational Misc. Kharchulu Audit</CardDescription></div><p className="text-4xl font-black tracking-tighter">₹{totalExpenses.toLocaleString()}</p></div></CardHeader>
            {/* MOBILE VIEW */}
            <div className="block md:hidden bg-slate-50 rounded-2xl p-4">{groupedExpenses.length > 0 ? groupedExpenses.map((group) => (<div key={group.date} className="mb-8"><div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg"><p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p></div><div className="space-y-4">{group.items.map((e) => (<div key={e.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all"><div className="flex-1 min-w-0"><h3 className="text-lg font-black text-slate-900 truncate leading-none mb-1">{e.description}</h3><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{e.category}</p></div><div className="text-right shrink-0"><p className="text-xl font-black text-slate-900">₹{e.totalAmount.toLocaleString()}</p><div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1"><CheckCircle2 className="h-2.5 w-2.5" /><span className="text-[9px] font-black uppercase tracking-widest">LOGGED</span></div></div></div>))}</div></div>)) : <div className="py-20 text-center opacity-40 font-black uppercase text-xs">No records found</div>}</div>
            {/* DESKTOP VIEW */}
            <div className="hidden md:block"><div className="p-8"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400"><th className="py-4 px-4">Kharchu Date</th><th className="py-4 px-4">Description</th><th className="py-4 px-4 text-right">Bill Value</th></tr></thead><tbody>{sortedFarmExpenses.map((e) => (<tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors"><td className="py-6 px-4 text-[11px] font-black text-slate-400">{e.date}</td><td className="py-6 px-4"><span className="text-[14px] font-black text-slate-900">{e.description}</span></td><td className="py-6 px-4 text-right"><div className="flex items-center justify-end gap-4"><span className="text-[16px] font-black text-slate-900">₹{e.totalAmount.toLocaleString()}</span><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-rose-600 hover:bg-rose-50" onClick={() => deleteFarmExpense(e.id, e._path)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}</tbody></table></div></div>
          </div>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button onClick={() => { form.reset({ description: '', amount: 0, expenseDate: new Date() }); setIsEntryDialogOpen(true); }} className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"><Plus className="h-7 w-7" /></button>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Plus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Kharchu Entry</DialogTitle>
            </div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={form.control} name="expenseDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Kharchu Date</Label>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                            {field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[90vw] sm:w-[450px] p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-visible"
                          align="start"
                          side="bottom"
                          sideOffset={8}
                        >
                          <HorizontalDatePicker 
                            selectedDate={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setIsDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><Label className="form-label-tactical">Kharchu Detail</Label><FormControl><Input placeholder="e.g. Electricity bill" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Bill Amount (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl">Record Kharchu</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
