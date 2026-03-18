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
  Search,
  Pencil,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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

  const editForm = useForm<LaborFormData>({ resolver: zodResolver(formSchema) });

  const watchedFields = form.watch([
    'wages', 'numberOfLaborers', 'advancePayments', 'foodCosts', 'fuelCosts', 'amountPaid'
  ]);

  useEffect(() => {
    const [wages, num, advance, food, fuel, paid] = watchedFields;
    const totalWages = (wages || 0) * (num || 1);
    const total = totalWages + (advance || 0) + (food || 0) + (fuel || 0);
    const pending = total - (paid || 0);
    form.setValue('totalLaborCosts', total);
    form.setValue('pendingAmount', pending);
  }, [watchedFields, form]);

  const sortedLaborCosts = useMemo(() => {
    if (!laborCosts) return [];
    const filtered = laborCosts.filter(c => c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [laborCosts, searchTerm]);

  const onSubmit: SubmitHandler<LaborFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addLaborCost(newCost);
    form.reset();
    setIsEntryDialogOpen(false);
    toast({ title: 'Success!', description: 'Labour cost recorded.' });
  };

  const onEditSubmit: SubmitHandler<LaborFormData> = (data) => {
    if (!editingCost) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateLaborCost(editingCost.id, updatedData, editingCost._path);
    setIsEditDialogOpen(false);
    setEditingCost(null);
    toast({ title: 'Synchronized!', description: 'Staff payment updated.' });
  };

  const handleEditClick = (cost: LaborCost) => {
    setEditingCost(cost);
    editForm.reset({ ...cost, date: new Date(cost.date), amountPaid: cost.amountPaid || 0, pendingAmount: cost.pendingAmount || 0 });
    setIsEditDialogOpen(true);
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `Today - ${dateStr}`;
    if (isYesterday(d)) return `Yesterday - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative px-4 md:px-0">
      <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
        <CardHeader className="bg-[#0FA5A0] text-white p-2.5 px-5 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight leading-none uppercase text-white">Staff Ledger</CardTitle>
              </div>
              <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] ml-7">Labour Disbursement Audit</CardDescription>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input 
                placeholder="Search Staff Identity..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold focus-visible:ring-white/20" 
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsEntryDialogOpen(true)} 
                className="h-8 px-3 rounded-lg font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-1.5 shadow-xl border-none text-[10px]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Log Payment
              </Button>
              
              <div className="px-3 py-0.5 bg-black/20 rounded-lg text-white flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Staff Spend</p>
                  <p className="text-base font-black tracking-tighter leading-none mt-0.5">₹{totalLaborCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* MOBILE VIEW */}
          <div className="block md:hidden p-4 space-y-8">
            {sortedLaborCosts.length > 0 ? sortedLaborCosts.map((cost) => (
              <div key={cost.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all" onClick={() => handleEditClick(cost)}>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-[#2F4F4F] leading-none mb-1">{cost.employeeName}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {cost.numberOfLaborers} Staff • ₹{cost.wages} per Head
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-[#0FA5A0]">₹{cost.amountPaid?.toLocaleString() || '0'}</p>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#43A047] border border-[#d1fae5] mt-1">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Settled</span>
                  </div>
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered</div>}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Payment Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Staff Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Amount Disbursed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLaborCosts.map((cost) => (
                  <TableRow key={cost.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group cursor-pointer" onClick={() => handleEditClick(cost)}>
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{cost.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{cost.employeeName}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cost.numberOfLaborers} Staff • ₹{cost.wages} Head</span></div>
                    </TableCell>
                    <TableCell className="text-center">
                      {cost.pendingAmount && cost.pendingAmount > 0 ? <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">₹{cost.pendingAmount.toLocaleString()} Pending</Badge> : <Badge className="bg-[#ecfdf5] text-[#43A047] border-none font-black text-[10px] px-3 uppercase tracking-widest">Settled</Badge>}
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[16px] font-black text-[#2F4F4F]">₹{cost.amountPaid?.toLocaleString() || '0'}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">Of ₹{cost.totalLaborCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600" onClick={(e) => { e.stopPropagation(); deleteLaborCost(cost.id, cost._path); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white h-[80dvh] max-h-[80dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Staff Payment</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col"><Label className="form-label-tactical">Payment Date</Label><Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left justify-between">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<CalendarIcon className="h-4 w-4 opacity-20" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none bg-white shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus /></PopoverContent></Popover></FormItem>
                  )} />
                  <FormField control={form.control} name="employeeName" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Staff Name</Label><FormControl><Input placeholder="Employee Name" className="form-input-tactical" {...field} /></FormControl></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={form.control} name="numberOfLaborers" render={({ field }) => (<FormItem><Label className="form-label-tactical">Staff Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="wages" render={({ field }) => (<FormItem><Label className="form-label-tactical">Wage/Head (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={form.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-[#0FA5A0]" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="pendingAmount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Pending Balance (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 border-rose-100 text-rose-600 font-black" {...field} readOnly /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Record Payment</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
