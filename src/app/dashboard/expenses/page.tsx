'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Receipt, History, Wallet, ArrowDownCircle } from 'lucide-react';
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
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-[#A68A56] rounded-full" />
            <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Misc. Procurement</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-1 pl-4">
            AUDIT-GRADE TRACKING OF OPERATIONAL OVERHEADS AND FARM CONSUMABLES.
          </p>
        </div>
        
        <div className="px-6 py-3 bg-[#E8DCC4] rounded-2xl flex flex-col items-center justify-center min-w-[160px] shadow-xl border border-white/40">
          <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest leading-none mb-1">Total Overhead</p>
          <p className="text-xl font-black tracking-tight text-neutral-900">₹{totalFarmExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* --- ENTRY FORM --- */}
        <div className="lg:col-span-4">
          <Card className="border-none bg-[#FDFBF0] rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-24 border-t-4 border-[#A68A56]">
            <CardHeader className="p-8 pb-4 bg-[#A68A56] text-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight uppercase">Expense Entry</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-[8px] font-bold uppercase tracking-widest">LOG A NEW OPERATIONAL COST</CardDescription>
                </div>
                <ArrowDownCircle className="h-6 w-6 opacity-40" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <FormField
                    control={form.control}
                    name="expenseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Expense Date</Label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={'outline'}
                                className={cn(
                                  'h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6 text-left text-xs',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none rounded-2xl shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Payload Description</Label>
                        <FormControl>
                          <Textarea placeholder="e.g., Fence repair materials" className="min-h-[100px] rounded-2xl bg-white border-none shadow-sm font-bold p-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Impact (₹)</Label>
                        <div className="relative">
                          <FormControl>
                            <Input type="number" step="0.01" className="h-14 rounded-2xl bg-white border-none shadow-sm font-black text-lg px-6 pr-12" {...field} />
                          </FormControl>
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-300">₹</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl bg-[#1a1a1a] hover:bg-black text-white border-none flex items-center justify-center gap-3">
                    <PlusCircle className="h-4 w-4 text-[#A68A56]" />
                    COMMIT EXPENSE
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* --- HISTORY LEDGER --- */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-[#708090]/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#708090]/10 to-[#2c3e50]/20 opacity-50 pointer-events-none" />
            <CardHeader className="p-8 pb-0 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Receipt className="h-5 w-5 text-[#2c3e50]" />
                    <CardTitle className="text-xl font-black tracking-tight text-[#2c3e50]">Historical Ledger</CardTitle>
                  </div>
                  <CardDescription className="text-[#2c3e50]/60 text-[9px] font-black uppercase tracking-widest">TEMPORAL AUDIT OF MISCELLANEOUS DISBURSEMENTS</CardDescription>
                </div>
                <History className="h-10 w-10 text-[#2c3e50]/10" />
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-8 relative z-10">
              <div className="bg-[#FDFBF0]/80 h-14 flex items-center px-10 border-b border-white/10">
                <div className="grid grid-cols-4 w-full items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60">Temporal Node</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60">Payload Identity</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right">Value Payload</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right pr-4">Actions</span>
                </div>
              </div>
              <ScrollArea className="max-h-[600px] w-full">
                {sortedFarmExpenses && sortedFarmExpenses.length > 0 ? (
                  <Table>
                    <TableBody>
                      {sortedFarmExpenses.map((e) => (
                        <TableRow key={e.id} className="group hover:bg-white/10 transition-all border-b border-white/5" onClick={() => handleEditClick(e)}>
                          <TableCell className="pl-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest w-1/4">{e.expenseDate}</TableCell>
                          <TableCell className="w-1/4">
                            <span className="text-sm font-black text-neutral-900 tracking-tight leading-tight block truncate max-w-[200px]">{e.description}</span>
                          </TableCell>
                          <TableCell className="text-right w-1/4">
                            <span className="text-base font-black text-neutral-900 tracking-tighter">₹{e.amount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right pr-10 w-1/4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-[#A68A56]/10 text-[#A68A56] hover:bg-[#A68A56]/20" onClick={(e) => { e.stopPropagation(); handleEditClick(e); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={(e) => { e.stopPropagation(); handleDeleteExpense(e.id, e._path); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-48 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <Receipt className="h-16 w-16 text-[#2c3e50]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#2c3e50]">NO DISBURSEMENT RECORDS DISCOVERED</h3>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Update historical expense parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8 bg-white">
              <FormField
                control={editForm.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button type="button" variant={'outline'} className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-left px-4 text-sm">
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Description</Label>
                    <FormControl>
                      <Textarea className="rounded-xl bg-neutral-50 border-none font-bold" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Value (₹)</Label>
                    <FormControl>
                      <Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4 text-base" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
