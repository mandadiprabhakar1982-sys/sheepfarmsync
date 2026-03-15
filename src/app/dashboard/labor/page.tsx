'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2, 
  Users, 
  Wallet, 
  TrendingUp,
  Search,
  Pencil,
  Save,
  ShieldCheck,
  PlusCircle,
  Banknote,
  Receipt
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { LaborCost } from '@/lib/types';

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  date: z.date({ required_error: 'A date is required.' }),
  wages: z.coerce.number().nonnegative('Wages per employee must be a non-negative number.'),
  numberOfLaborers: z.coerce.number().int().positive('Must be a positive number'),
  advancePayments: z.coerce.number().nonnegative('Cannot be negative').optional(),
  foodCosts: z.coerce.number().nonnegative('Cannot be negative').optional(),
  fuelCosts: z.coerce.number().nonnegative('Cannot be negative').optional(),
  totalLaborCosts: z.coerce.number().min(0, 'Total must be non-negative'),
  amountPaid: z.coerce.number().nonnegative('Cannot be negative').default(0),
  pendingAmount: z.coerce.number().default(0),
});

type LaborFormData = z.infer<typeof formSchema>;

export default function LaborPage() {
  const { toast } = useToast();
  const { laborCosts, addLaborCost, deleteLaborCost, updateLaborCost, totalLaborCost, isLoading } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  // Edit States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<LaborCost | null>(null);

  const form = useForm<LaborFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: '',
      wages: 0,
      numberOfLaborers: 1,
      advancePayments: 0,
      foodCosts: 0,
      fuelCosts: 0,
      totalLaborCosts: 0,
      amountPaid: 0,
      pendingAmount: 0,
    },
  });

  const editForm = useForm<LaborFormData>({
    resolver: zodResolver(formSchema),
  });

  // Entry Form Calc Logic
  const watchedFields = form.watch([
    'wages',
    'numberOfLaborers',
    'advancePayments',
    'foodCosts',
    'fuelCosts',
    'amountPaid'
  ]);

  useEffect(() => {
    const [wages, num, advance, food, fuel, paid] = watchedFields;
    const totalWages = (wages || 0) * (num || 1);
    const total = totalWages + (advance || 0) + (food || 0) + (fuel || 0);
    const pending = total - (paid || 0);
    form.setValue('totalLaborCosts', total);
    form.setValue('pendingAmount', pending);
  }, [watchedFields, form]);

  // Edit Form Calc Logic
  const watchedEditFields = editForm.watch([
    'wages',
    'numberOfLaborers',
    'advancePayments',
    'foodCosts',
    'fuelCosts',
    'amountPaid'
  ]);

  useEffect(() => {
    if (!editingCost) return;
    const [wages, num, advance, food, fuel, paid] = watchedEditFields;
    const totalWages = (wages || 0) * (num || 1);
    const total = totalWages + (advance || 0) + (food || 0) + (fuel || 0);
    const pending = total - (paid || 0);
    editForm.setValue('totalLaborCosts', total);
    editForm.setValue('pendingAmount', pending);
  }, [watchedEditFields, editForm, editingCost]);

  const sortedLaborCosts = useMemo(() => {
    if (!laborCosts) return [];
    const filtered = laborCosts.filter(c => c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [laborCosts, searchTerm]);

  const totalPendingLiability = useMemo(() => {
    return (laborCosts || []).reduce((s, c) => s + (c.pendingAmount || 0), 0);
  }, [laborCosts]);

  const onSubmit: SubmitHandler<LaborFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addLaborCost(newCost);
    form.reset();
    setIsEntryDialogOpen(false);
    toast({
      title: 'Success!',
      description: 'Employee cost has been recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<LaborFormData> = (data) => {
    if (!editingCost) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateLaborCost(editingCost.id, updatedData, editingCost._path);
    setIsEditDialogOpen(false);
    setEditingCost(null);
    toast({
      title: 'Synchronized!',
      description: 'Disbursement record has been updated.',
    });
  };

  const handleEditClick = (cost: LaborCost) => {
    setEditingCost(cost);
    editForm.reset({
      ...cost,
      date: new Date(cost.date),
      amountPaid: cost.amountPaid || 0,
      pendingAmount: cost.pendingAmount || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCost = (id: string, path?: string) => {
    deleteLaborCost(id, path);
    toast({ title: 'Deleted', description: 'Cost record removed.', variant: 'destructive' });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING LABOR DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Labor Management</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-1">OPERATIONAL STAFF & DISBURSEMENTS</p>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { form.reset(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Disbursement Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Labor Disbursement</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new staff expenditure to ledger</DialogDescription>
              </DialogHeader>
              
              <div className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical text-slate-400">Transaction Date</Label>
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

                      <FormField control={form.control} name="employeeName" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-slate-400">Employee Name</Label><FormControl><Input placeholder="e.g. Ram Singh" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="numberOfLaborers" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Staff Count</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="wages" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Wage / Head (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="advancePayments" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Advance</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="foodCosts" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Food</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="fuelCosts" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Fuel</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="amountPaid" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Amount Disbursed (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-black text-emerald-600" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="pendingAmount" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Pending Balance (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 border-rose-100 text-rose-600 font-black" {...field} readOnly /></FormControl></FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="totalLaborCosts" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical text-slate-400">Total Commitment (₹)</Label>
                          <FormControl><Input type="number" className="h-16 rounded-2xl bg-slate-900 border-none text-white font-black text-xl px-6" {...field} readOnly /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                      Log Disbursement
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Staff Spend</p>
              <p className="text-xl font-black tracking-tight text-white">₹{totalLaborCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Labor Cost</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">₹{totalLaborCost.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">NET DISBURSEMENT</p>
        </div>

        <div className="glass-card glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pending</p>
              <p className="text-5xl font-black tracking-tighter text-rose-600">₹{totalPendingLiability.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Banknote className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">OUTSTANDING LIABILITIES</p>
        </div>

        <div className="glass-card glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Advances Paid</p>
              <p className="text-5xl font-black tracking-tighter text-purple-600">₹{(laborCosts || []).reduce((s, c) => s + (c.advancePayments || 0), 0).toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">STAFF ADVANCE LOG</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Filter by Employee Name..." 
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
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Employee Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Disbursement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLaborCosts.length > 0 ? sortedLaborCosts.map((cost) => (
                  <TableRow key={cost.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group" onClick={() => handleEditClick(cost)}>
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{cost.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-slate-900">{cost.employeeName}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Wages: ₹{cost.wages} • {cost.numberOfLaborers} Staff</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {cost.pendingAmount && cost.pendingAmount > 0 ? (
                        <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">₹{cost.pendingAmount.toLocaleString()} PENDING</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">SETTLED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[16px] font-black text-slate-900">₹{cost.amountPaid?.toLocaleString() || '0'}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">OF ₹{cost.totalLaborCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={(evt) => { evt.stopPropagation(); handleEditClick(cost); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={(evt) => { evt.stopPropagation(); handleDeleteCost(cost.id, cost._path); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No disbursement records discovered</TableCell></TableRow>
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
            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Update historical disbursement parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="p-8 space-y-6">
              <FormField control={editForm.control} name="employeeName" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Employee Name</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="amountPaid" render={({ field }) => (
                  <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-bold" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editForm.control} name="pendingAmount" render={({ field }) => (
                  <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Pending (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 border-rose-100 font-black text-rose-600" {...field} readOnly /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="totalLaborCosts" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Total Impact (₹)</Label><FormControl><Input type="number" className="h-14 rounded-2xl bg-slate-900 border-none font-black text-lg px-6 text-white" {...field} readOnly /></FormControl></FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-14 flex-1 rounded-2xl border-slate-200 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">
                  <Save className="mr-2 h-4 w-4" /> Save Adjustments
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
