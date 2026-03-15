'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Receipt, 
  Wallet, 
  Plus,
  PlusCircle,
  ShieldCheck,
  Save,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Textarea } from '@/components/ui/textarea';
import type { FarmExpense } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const { farmExpenses, addFarmExpense, deleteFarmExpense, updateFarmExpense, totalFarmExpenses, isLoading } = useFarm();
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FarmExpense | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });

  const editForm = useForm<ExpenseFormData>({
    resolver: zodResolver(formSchema),
  });

  const sortedFarmExpenses = useMemo(() => {
    if (!farmExpenses) return [];
    const filtered = farmExpenses.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  }, [farmExpenses, searchTerm]);

  useEffect(() => {
    if (editingExpense) {
      editForm.reset({
        ...editingExpense,
        expenseDate: new Date(editingExpense.expenseDate),
      });
    }
  }, [editingExpense, editForm]);


  const onSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    const newExpense = { ...data, expenseDate: format(data.expenseDate, 'yyyy-MM-dd') };
    addFarmExpense(newExpense);
    form.reset();
    setIsEntryDialogOpen(false);
    toast({
      title: 'Success!',
      description: 'Farm expense recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    if (!editingExpense) return;
    const updatedData = { ...data, expenseDate: format(data.expenseDate, 'yyyy-MM-dd') };
    updateFarmExpense(editingExpense.id, updatedData, editingExpense._path);
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    toast({
      title: 'Updated!',
      description: 'Expense record synchronized.',
    });
  };
  
  const handleDeleteExpense = (id: string, path?: string) => {
    deleteFarmExpense(id, path);
     toast({
      title: 'Deleted',
      description: 'Expense record removed.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (expense: FarmExpense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING EXPENSE DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Misc. Procurement"
          description="OPERATIONAL OVERHEADS & CONSUMABLES"
          className="mb-0"
        />
        
        <div className="flex items-center gap-4">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { form.reset(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Commit Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Expense Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document new operational overhead into master ledger</DialogDescription>
              </DialogHeader>
              
              <div className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <FormField control={form.control} name="expenseDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical text-slate-400">Expense Date</Label>
                          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                                {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-slate-200 bg-white shadow-2xl">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus className="text-slate-900" />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical text-slate-400">Payload Description</Label>
                          <FormControl>
                            <Textarea placeholder="e.g., Fence repair materials" className="min-h-[120px] form-input-tactical bg-slate-50 border-slate-200 pt-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical text-slate-400">Total Impact (₹)</Label>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-16 rounded-2xl bg-slate-900 border-none text-white font-black text-xl px-6" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                      Record Disbursement
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Overhead</p>
              <p className="text-xl font-black tracking-tight text-white">₹{totalFarmExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-card glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Overhead</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">₹{totalFarmExpenses.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">NET DISBURSEMENT</p>
        </div>

        <div className="glass-card glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Procurement Events</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">{(farmExpenses || []).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HISTORICAL ENTRIES</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Filter by Description..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-16 pl-16 rounded-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 font-bold shadow-sm" 
          />
        </div>

        <div className="glass-card rounded-[40px] overflow-hidden border-slate-100 bg-white">
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Temporal Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Payload Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFarmExpenses.length > 0 ? sortedFarmExpenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group" onClick={() => handleEditClick(e)}>
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{e.expenseDate}</TableCell>
                    <TableCell>
                      <span className="text-[14px] font-black text-slate-900 truncate block max-w-[400px]">{e.description}</span>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-[16px] font-black text-slate-900">₹{e.amount.toLocaleString()}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600" onClick={(evt) => { evt.stopPropagation(); handleEditClick(e); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600" onClick={(evt) => { evt.stopPropagation(); handleDeleteExpense(e.id, e._path); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="text-center py-32 opacity-20 font-black uppercase text-xs">No disbursement records discovered</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-slate-200 bg-white shadow-2xl">
          <DialogHeader className="bg-slate-50 p-8 border-b border-slate-100 text-left">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3 text-slate-900">
              <Pencil className="h-5 w-5 text-emerald-600" /> Adjust Record
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Update historical expense parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="p-8 space-y-6">
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Description</Label><FormControl><Textarea className="form-input-tactical bg-slate-50 border-slate-200 pt-4" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={editForm.control} name="amount" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Value (₹)</Label><FormControl><Input type="number" step="0.01" className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-lg px-6" {...field} /></FormControl></FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-14 flex-1 rounded-2xl border-slate-200 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
