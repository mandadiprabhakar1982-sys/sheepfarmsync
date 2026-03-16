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
  Save,
  ShieldCheck,
  PlusCircle,
  ChevronDown,
  HandCoins,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  // Entry Form Calc Logic
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

  // Grouping for Mobile View (MATCHING THE IMAGE)
  const groupedLaborCosts = useMemo(() => {
    const groups: { [key: string]: LaborCost[] } = {};
    sortedLaborCosts.forEach(cost => {
      if (!groups[cost.date]) groups[cost.date] = [];
      groups[cost.date].push(cost);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [sortedLaborCosts]);

  const totalPendingLiability = useMemo(() => {
    return (laborCosts || []).reduce((s, c) => s + (c.pendingAmount || 0), 0);
  }, [laborCosts]);

  const onSubmit: SubmitHandler<LaborFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addLaborCost(newCost);
    form.reset();
    setIsEntryDialogOpen(false);
    toast({ title: 'Success!', description: 'Employee cost has been recorded.' });
  };

  const onEditSubmit: SubmitHandler<LaborFormData> = (data) => {
    if (!editingCost) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateLaborCost(editingCost.id, updatedData, editingCost._path);
    setIsEditDialogOpen(false);
    setEditingCost(null);
    toast({ title: 'Synchronized!', description: 'Disbursement record updated.' });
  };

  const handleEditClick = (cost: LaborCost) => {
    setEditingCost(cost);
    editForm.reset({ ...cost, date: new Date(cost.date), amountPaid: cost.amountPaid || 0, pendingAmount: cost.pendingAmount || 0 });
    setIsEditDialogOpen(true);
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING LABOR DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER (AS PER IMAGE) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight">Staff Ledger</h2>
        <p className="text-xl font-black">₹{totalLaborCost.toLocaleString()}</p>
      </div>

      <div className="md:hidden h-16 shrink-0" /> {/* Spacer for fixed mobile header */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0">
        <PageHeader title="Labor Management" description="OPERATIONAL STAFF & DISBURSEMENTS" className="mb-0 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar md:w-auto w-full mt-4 md:mt-0">
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none">
                  <Users className="h-5 w-5 text-accent" />
                  Record Labor
                  <ChevronDown className="h-4 w-4 opacity-40 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-2xl p-2 border-none mt-2">
                <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Staff Audit Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Net Staff Spend</span><span className="text-xs font-black text-emerald-600">₹{totalLaborCost.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Pending Liability</span><span className="text-xs font-black text-rose-600">₹{totalPendingLiability.toLocaleString()}</span></div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <div className="p-1">
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setIsEntryDialogOpen(true), 100); }} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                    <HandCoins className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Log Disbursement</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Staff Spend</p>
                <p className="text-xl font-black tracking-tight text-white">₹{totalLaborCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        {/* SEARCH BAR (MATCHING THE IMAGE) */}
        <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Filter by Employee Name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-slate-300 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
          {/* DESKTOP HEADER */}
          <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3"><Users className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Staff Ledger</CardTitle></div>
                <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Operational Disbursement Audit</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">₹{totalLaborCost.toLocaleString()}</p>
            </div>
          </CardHeader>

          {/* MOBILE VIEW: GROUPED LIST (EXACT IMAGE MATCH) */}
          <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
            <ScrollArea className="h-full px-4 pt-4">
              {groupedLaborCosts.length > 0 ? groupedLaborCosts.map((group) => (
                <div key={group.date} className="mb-8">
                  <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((cost) => (
                      <div key={cost.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all" onClick={() => handleEditClick(cost)}>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-900 leading-none mb-1">{cost.employeeName}</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Wages • {cost.wages > 0 && `₹${cost.wages} • `} {cost.numberOfLaborers} Staff
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="text-xl font-black text-[#059669]">₹{cost.amountPaid?.toLocaleString() || '0'}</p>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">SETTLED</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered</div>}
              <div className="h-32" /> {/* Bottom safe area for Nav + FAB */}
            </ScrollArea>
          </div>

          {/* DESKTOP VIEW: TABLE */}
          <div className="hidden md:block flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Temporal Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Employee Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Disbursement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLaborCosts.map((cost) => (
                    <TableRow key={cost.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group cursor-pointer" onClick={() => handleEditClick(cost)}>
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{cost.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{cost.employeeName}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Wages: ₹{cost.wages} • {cost.numberOfLaborers} Staff</span></div>
                      </TableCell>
                      <TableCell className="text-center">
                        {cost.pendingAmount && cost.pendingAmount > 0 ? <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">₹{cost.pendingAmount.toLocaleString()} PENDING</Badge> : <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">SETTLED</Badge>}
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4"><div className="flex flex-col items-end"><span className="text-[16px] font-black text-slate-900">₹{cost.amountPaid?.toLocaleString() || '0'}</span><span className="text-[9px] font-black text-slate-400 uppercase">OF ₹{cost.totalLaborCosts.toLocaleString()}</span></div><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600" onClick={(e) => { e.stopPropagation(); handleEditClick(cost); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600" onClick={(e) => { e.stopPropagation(); deleteLaborCost(cost.id, cost._path); }}><Trash2 className="h-4 w-4" /></Button></div></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* MOBILE FAB (MATCHING THE IMAGE) */}
      <button 
        onClick={() => { form.reset(); setIsEntryDialogOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Labor Disbursement</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new staff expenditure to ledger</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Transaction Date</Label><Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left justify-between">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<CalendarIcon className="h-4 w-4 opacity-20" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-slate-200 bg-white shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="employeeName" render={({ field }) => (
                  <FormItem><Label className="form-label-tactical">Employee Name</Label><FormControl><Input placeholder="e.g. Samel" className="form-input-tactical" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="numberOfLaborers" render={({ field }) => (<FormItem><Label className="form-label-tactical">Staff Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="wages" render={({ field }) => (<FormItem><Label className="form-label-tactical">Wage / Head (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Disbursed (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-emerald-600" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="pendingAmount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Pending Balance (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 border-rose-100 text-rose-600 font-black" {...field} readOnly /></FormControl></FormItem>)} />
                </div>
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest shadow-xl">Log Disbursement</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Pencil className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Update Record</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Adjust historical disbursement parameters</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...editForm}><form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-8">
              <div className="space-y-6">
                <FormField control={editForm.control} name="employeeName" render={({ field }) => (
                  <FormItem><Label className="form-label-tactical">Employee Name</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={editForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <FormField control={editForm.control} name="pendingAmount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Pending (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 text-rose-600 font-bold" {...field} readOnly /></FormControl></FormItem>)} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest shadow-xl">Save Adjustments</Button>
                <Button type="button" variant="ghost" onClick={() => { deleteLaborCost(editingCost!.id, editingCost!._path); setIsEditDialogOpen(false); }} className="w-full h-12 text-rose-600 font-black uppercase text-[10px] tracking-widest">Purge Record</Button>
              </div>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
