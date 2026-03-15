'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Receipt, 
  History, 
  Wallet, 
  ArrowDownCircle,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { Textarea } from '@/components/ui/textarea';
import type { FarmExpense } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';


const formSchema = z.object({
  expenseDate: z.date({ required_error: 'A date is required.' }),
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Must be a positive number'),
});

type ExpenseFormData = z.infer<typeof formSchema>;

export default function ExpensesPage() {
  const { toast } = useToast();
  const { farmExpenses, addFarmExpense, deleteFarmExpense, updateFarmExpense, totalFarmExpenses } = useFarm();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FarmExpense | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
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
    return [...farmExpenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  }, [farmExpenses]);

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


  return (
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-xl font-medium text-white/80">Misc. Procurement</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">OPERATIONAL OVERHEADS & CONSUMABLES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl">
        <div className="glass-card glass-sheen glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Overhead</p>
              <p className="text-5xl font-black tracking-tighter text-white">₹{totalFarmExpenses.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-[#FFC857]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">NET DISBURSEMENT</p>
        </div>

        <div className="glass-card glass-sheen glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Procurement Events</p>
              <p className="text-5xl font-black tracking-tighter text-white">{(farmExpenses || []).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-[#A78BFA]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">HISTORICAL ENTRIES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card glass-sheen rounded-[40px] overflow-hidden">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-white/5 border-none">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white/40">Temporal Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Payload Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white/40">Value Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFarmExpenses.length > 0 ? sortedFarmExpenses.map((e) => (
                    <TableRow key={e.id} className="hover:bg-white/5 transition-colors border-b border-white/5 group" onClick={() => handleEditClick(e)}>
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-white/40 uppercase tracking-widest">{e.expenseDate}</TableCell>
                      <TableCell>
                        <span className="text-[14px] font-black text-white truncate block max-w-[250px]">{e.description}</span>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <span className="text-[16px] font-black text-white">₹{e.amount.toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-all" onClick={(evt) => { evt.stopPropagation(); handleDeleteExpense(e.id, e._path); }}><Trash2 className="h-4 w-4" /></Button>
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

        <div className="lg:col-span-4">
          <div className="glass-card glass-sheen rounded-[40px] p-10 h-full border-t-2 border-white/10">
            <div className="flex items-center gap-3 mb-10 text-emerald-400">
              <Plus className="h-6 w-6" />
              <h3 className="text-lg font-black uppercase tracking-widest">Expense Entry</h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={form.control} name="expenseDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Expense Date</Label>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-white/10 bg-[#0a2e1a] shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus className="text-white" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <Label className="form-label-tactical">Payload Description</Label>
                      <FormControl>
                        <Textarea placeholder="e.g., Fence repair materials" className="min-h-[120px] form-input-tactical pt-4" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <Label className="form-label-tactical">Total Impact (₹)</Label>
                      <FormControl>
                        <Input type="number" step="0.01" className="h-16 rounded-2xl bg-white/5 border-2 border-emerald-500/20 text-emerald-400 font-black text-xl px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl">
                  Commit Expense
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-white/10 bg-[#0F1115] shadow-2xl">
          <DialogHeader className="bg-white/5 p-8 border-b border-white/5 text-left text-white">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" /> Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update historical expense parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="p-8 space-y-6">
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Description</Label><FormControl><Textarea className="form-input-tactical pt-4" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={editForm.control} name="amount" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Value (₹)</Label><FormControl><Input type="number" step="0.01" className="h-14 rounded-2xl bg-white/5 border-white/10 font-black text-lg px-6" {...field} /></FormControl></FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-14 flex-1 rounded-2xl border-white/10 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-12 right-12 opacity-40 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
