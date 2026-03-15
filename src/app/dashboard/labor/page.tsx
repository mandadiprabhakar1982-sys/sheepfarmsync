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
  ClipboardList, 
  Wallet, 
  TrendingUp,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  date: z.date({ required_error: 'A date is required.' }),
  wages: z.coerce.number().nonnegative('Wages per employee must be a non-negative number.'),
  numberOfLaborers: z.coerce.number().int().positive('Must be a positive number'),
  advancePayments: z.coerce.number().nonnegative('Cannot be negative').optional(),
  foodCosts: z.coerce.number().nonnegative('Cannot be negative').optional(),
  fuelCosts: z.coerce.number().nonnegative('Cannot be negative').optional(),
  totalLaborCosts: z.coerce.number().min(0, 'Total must be non-negative'),
});

type LaborFormData = z.infer<typeof formSchema>;

export default function LaborPage() {
  const { toast } = useToast();
  const { laborCosts, addLaborCost, deleteLaborCost, totalLaborCost } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
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
    },
  });

  const watchedFields = form.watch([
    'wages',
    'numberOfLaborers',
    'advancePayments',
    'foodCosts',
    'fuelCosts',
  ]);

  useEffect(() => {
    const [wages, num, advance, food, fuel] = watchedFields;
    const totalWages = (wages || 0) * (num || 1);
    const total = totalWages + (advance || 0) + (food || 0) + (fuel || 0);
    form.setValue('totalLaborCosts', total);
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
    toast({
      title: 'Success!',
      description: 'Employee cost has been recorded.',
    });
  };

  const handleDeleteCost = (id: string, path?: string) => {
    deleteLaborCost(id, path);
    toast({ title: 'Deleted', description: 'Cost record removed.', variant: 'destructive' });
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-xl font-medium text-white/80">Labor Management</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">OPERATIONAL STAFF & DISBURSEMENTS</p>
      </div>

      {/* TACTICAL STAT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card glass-sheen glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Labor Cost</p>
              <p className="text-5xl font-black tracking-tighter text-white">₹{totalLaborCost.toLocaleString()}</p>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Active Staff</p>
              <p className="text-5xl font-black tracking-tighter text-white">{(laborCosts || []).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#A78BFA]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">TOTAL EMPLOYEES LOGGED</p>
        </div>

        <div className="glass-card glass-sheen glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Advances Paid</p>
              <p className="text-5xl font-black tracking-tighter text-white">₹{(laborCosts || []).reduce((s, c) => s + (c.advancePayments || 0), 0).toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#ef4444]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">STAFF LIABILITIES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* MAIN LEDGER AREA */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input 
              placeholder="Filter by Employee Name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-16 pl-16 rounded-full bg-white/5 border-none text-white placeholder:text-white/20 font-bold shadow-2xl" 
            />
          </div>

          <div className="glass-card glass-sheen rounded-[40px] overflow-hidden">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-white/5 border-none">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white/40">Temporal Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Employee Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-white/40">Staff Count</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white/40">Disbursement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLaborCosts.length > 0 ? sortedLaborCosts.map((cost) => (
                    <TableRow key={cost.id} className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-white/40 uppercase tracking-widest">{cost.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-white">{cost.employeeName}</span>
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Wages: ₹{cost.wages}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-500/10 text-blue-400 border-none font-black text-[10px] px-3">{cost.numberOfLaborers} Staff</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <span className="text-[16px] font-black text-white">₹{cost.totalLaborCosts.toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteCost(cost.id, cost._path)}><Trash2 className="h-4 w-4" /></Button>
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

        {/* ENTRY PANEL */}
        <div className="lg:col-span-4">
          <div className="glass-card glass-sheen rounded-[40px] p-10 h-full border-t-2 border-white/10">
            <div className="flex items-center gap-3 mb-10 text-emerald-400">
              <Plus className="h-6 w-6" />
              <h3 className="text-lg font-black uppercase tracking-widest">Add Employee Cost</h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Transaction Date</Label>
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

                  <FormField control={form.control} name="employeeName" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Employee Name</Label><FormControl><Input placeholder="e.g. Ram Singh" className="form-input-tactical" {...field} /></FormControl></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="numberOfLaborers" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Staff Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="wages" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Wage / Head (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="advancePayments" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Advance</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="foodCosts" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Food</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="fuelCosts" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Fuel</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="totalLaborCosts" render={({ field }) => (
                    <FormItem>
                      <Label className="form-label-tactical">Total Ledger Impact (₹)</Label>
                      <FormControl><Input type="number" className="h-16 rounded-2xl bg-white/5 border-2 border-emerald-500/20 text-emerald-400 font-black text-xl px-6" {...field} readOnly /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl">
                  Log Disbursement
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* FOOTER ACCENT */}
      <div className="fixed bottom-12 right-12 opacity-40 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
