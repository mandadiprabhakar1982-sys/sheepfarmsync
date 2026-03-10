'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Syringe, 
  HeartPulse, 
  ShoppingCart, 
  ReceiptIndianRupee,
  Activity,
  History,
  ShieldCheck,
  TrendingUp,
  Store,
  FileText,
  Save,
  X
} from 'lucide-react';
import { format, addMonths, differenceInDays, addDays, endOfDay, startOfDay } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import type { HealthTask, MedicineExpense } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const frequencies = ['Once', 'Daily', 'Monthly', 'Every 2 Months', 'Every 6 Months', 'Annually'] as const;
const dewormerNames = ['Albendazole', 'Fenbendazole', 'Ivermectin'] as const;
const vaccineTypes = ['ET + TT', 'PPR', 'Sheep Pox', 'HS', 'FMD', 'Bluetongue'] as const;
const supplementTypes = ['B-Complex', 'Liver Tonic', 'Calcium', 'Multivitamin', 'Mineral Mixture'] as const;

const healthTaskNames = [
    'Deworming',
    'Vitamin & Liver Support',
    'Vaccination',
    'Other',
] as const;

const healthTaskFormSchema = z.object({
  taskName: z.enum(healthTaskNames, { required_error: 'Please select a task.' }),
  lastAdministered: z.date({ required_error: 'A date is required.' }),
  frequency: z.enum(frequencies),
  notes: z.string().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  
  dewormerName: z.enum(dewormerNames).optional(),
  dosePerKg: z.coerce.number().positive().optional(),
  
  vaccineType: z.enum(vaccineTypes).optional(),
  boosterRequired: z.boolean().optional(),
  batchNumber: z.string().optional(),

  supplementType: z.enum(supplementTypes).optional(),
  dosage: z.string().optional(),
  
  totalSheepTreated: z.coerce.number().int().positive().optional(),
});

const legacyExpenseSchema = z.object({
  date: z.date({ required_error: 'Date is required.' }),
  shopName: z.string().min(1, 'Shop name is required.'),
  description: z.string().optional(),
  costOfMedicines: z.coerce.number().nonnegative('Cost must be positive'),
  totalAmountSpent: z.coerce.number().nonnegative('Amount must be positive'),
  outstandingDues: z.coerce.number().nonnegative('Dues must be positive'),
});

type HealthTaskFormData = z.infer<typeof healthTaskFormSchema>;
type LegacyExpenseFormData = z.infer<typeof legacyExpenseSchema>;

export default function MedicinePage() {
  const { toast } = useToast();
  const { medicineExpenses, addMedicineExpense, deleteMedicineExpense, healthTasks, addHealthTask, deleteHealthTask, updateHealthTask } = useFarm();
  
  const [isTaskEditDialogOpen, setIsTaskEditDialogOpen] = useState(false);
  const [isLegacyDialogOpen, setIsLegacyDialogOpen] = useState(false);
  const [editingHealthTask, setEditingHealthTask] = useState<HealthTask | null>(null);

  const [isTaskDateOpen, setIsTaskDateOpen] = useState(false);
  const [isLegacyDateOpen, setIsLegacyDateOpen] = useState(false);
  const [isEditTaskDateOpen, setIsEditTaskDateOpen] = useState(false);

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { lastAdministered: new Date(), notes: '', frequency: 'Once', cost: 0 },
  });
  
  const legacyExpenseForm = useForm<LegacyExpenseFormData>({
    resolver: zodResolver(legacyExpenseSchema),
    defaultValues: { date: new Date(), shopName: '', description: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 },
  });

  const editHealthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
  });

  const watchedTaskName = healthTaskForm.watch('taskName');

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    return [...healthTasks].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [healthTasks]);

  useEffect(() => {
    if (editingHealthTask) {
      editHealthTaskForm.reset({
        ...editingHealthTask,
        lastAdministered: new Date(editingHealthTask.lastAdministered),
      } as any);
    }
  }, [editingHealthTask, editHealthTaskForm]);

  const calculateNextDue = (date: Date, type: string, freq: string, vaccine?: string) => {
    if (type === 'Deworming') return addDays(date, 60);
    
    if (type === 'Vaccination') {
       if (vaccine === 'ET + TT' || vaccine === 'HS' || vaccine === 'FMD') return addMonths(date, 6);
       return addMonths(date, 12); 
    }

    switch (freq) {
      case 'Daily': return addDays(date, 1);
      case 'Monthly': return addMonths(date, 1);
      case 'Every 2 Months': return addMonths(date, 2);
      case 'Every 6 Months': return addMonths(date, 6);
      case 'Annually': return addMonths(date, 12);
      default: return date;
    }
  };

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    const nextDueDate = calculateNextDue(data.lastAdministered, data.taskName, data.frequency, data.vaccineType);
    addHealthTask({
      ...data,
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    });
    healthTaskForm.reset({ lastAdministered: new Date(), notes: '', frequency: 'Once', cost: 0 });
    toast({ title: 'Success!', description: 'Health task synchronized.' });
  };

  const onLegacySubmit: SubmitHandler<LegacyExpenseFormData> = (data) => {
    addMedicineExpense({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    legacyExpenseForm.reset({ date: new Date(), shopName: '', description: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 });
    setIsLegacyDialogOpen(false);
    toast({ title: 'Success!', description: 'Pharmacy audit committed.' });
  };

  const onEditTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    if (!editingHealthTask) return;
    const nextDueDate = calculateNextDue(data.lastAdministered, data.taskName, data.frequency, data.vaccineType);
    updateHealthTask(editingHealthTask.id, {
      ...data,
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    }, editingHealthTask._path);
    setIsTaskEditDialogOpen(false);
    toast({ title: 'Updated!', description: 'Task record adjusted.' });
  };

  const getTaskStatus = (dueDate: string) => {
    const today = startOfDay(new Date());
    const date = startOfDay(new Date(dueDate));
    const diff = differenceInDays(date, today);
    if (diff < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (diff === 0) return { label: 'Due Today', variant: 'default' as const };
    if (diff <= 7) return { label: 'Soon', variant: 'secondary' as const };
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Medicine & Health"
          description="High-precision flock wellness and expense audit suite."
          className="mb-0"
        />
        <div className="flex items-center gap-4 px-6 py-3 bg-neutral-900 rounded-2xl text-white shadow-xl">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Security Protocol</p>
            <p className="text-xl font-black tracking-tight text-white">Active Audit</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-10 p-1.5 bg-neutral-100 rounded-2xl h-14 max-w-md mx-auto">
          <TabsTrigger value="health" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <Syringe className="h-3 w-3 mr-2" /> Health Track
          </TabsTrigger>
          <TabsTrigger value="cost" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <ReceiptIndianRupee className="h-3 w-3 mr-2" /> Cost Track
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Card className="border-none bg-neutral-50/50 sticky top-24 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardHeader className="bg-neutral-900 p-8 text-white">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-emerald-400" />
                    Health Entry
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document new flock treatment</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...healthTaskForm}>
                    <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
                      <FormField control={healthTaskForm.control} name="taskName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Action Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6"><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">{healthTaskNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )} />

                      <div className="space-y-4">
                        {watchedTaskName === 'Deworming' && (
                          <div className="grid grid-cols-1 gap-4 rounded-[1.5rem] bg-white p-6 shadow-sm border border-neutral-100 animate-in slide-in-from-top-2">
                            <FormField control={healthTaskForm.control} name="dewormerName" render={({ field }) => (
                              <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Dewormer Name</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent>{dewormerNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={healthTaskForm.control} name="dosePerKg" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Dose/kg (ml)</FormLabel><FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
                              <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Flock Count</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
                            </div>
                          </div>
                        )}

                        {watchedTaskName === 'Vaccination' && (
                          <div className="grid grid-cols-1 gap-4 rounded-[1.5rem] bg-white p-6 shadow-sm border border-neutral-100 animate-in slide-in-from-top-2">
                            <FormField control={healthTaskForm.control} name="vaccineType" render={({ field }) => (
                              <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Vaccine Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent>{vaccineTypes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                               <FormField control={healthTaskForm.control} name="batchNumber" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Batch #</FormLabel><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>)} />
                               <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Count</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
                            </div>
                          </div>
                        )}

                        {watchedTaskName === 'Vitamin & Liver Support' && (
                          <div className="grid grid-cols-1 gap-4 rounded-[1.5rem] bg-white p-6 shadow-sm border border-neutral-100 animate-in slide-in-from-top-2">
                            <FormField control={healthTaskForm.control} name="supplementType" render={({ field }) => (
                              <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Supplement</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent>{supplementTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={healthTaskForm.control} name="dosage" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Dosage (ml)</FormLabel><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>)} />
                              <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40">Count</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={healthTaskForm.control} name="lastAdministered" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Date Administered</FormLabel>
                            <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-left px-4">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Pick Date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                                <Calendar 
                                  mode="single" 
                                  selected={field.value} 
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setIsTaskDateOpen(false);
                                  }} 
                                  initialFocus 
                                  disabled={(date) => date > endOfDay(new Date())} 
                                />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Procurement Cost</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <FormField control={healthTaskForm.control} name="frequency" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Temporal Recall Interval</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6"><SelectValue /></SelectTrigger></FormControl><SelectContent>{frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></FormItem>
                      )} />

                      <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800">
                        <PlusCircle className="mr-3 h-6 w-6 text-emerald-400" />
                        Save & Schedule
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-primary p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-none mb-2">Health Schedule</CardTitle>
                      <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Temporal verification of treatment cycles</CardDescription>
                    </div>
                    <Activity className="h-8 w-8 text-emerald-200 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Treatment Metric</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Temporal Recall</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Audit Cost</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHealthTasks.map(task => {
                        const status = getTaskStatus(task.nextDueDate);
                        return (
                          <TableRow key={task.id} className="group hover:bg-neutral-50 transition-all cursor-zoom-in border-neutral-100 active:scale-[0.995]" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}>
                            <TableCell className="pl-8 py-6">
                              <div className="font-black text-base text-neutral-900 leading-tight">{task.taskName}</div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                                {task.dewormerName || task.vaccineType || task.supplementType || task.notes}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-black text-neutral-700 tracking-tight">{task.nextDueDate}</div>
                              {status && <Badge variant={status.variant} className="mt-1.5 text-[8px] font-black uppercase tracking-widest h-5 px-2 rounded-lg border-none shadow-sm">{status.label}</Badge>}
                            </TableCell>
                            <TableCell className="text-right text-sm font-black text-neutral-900 tracking-tighter">₹{(task.cost || 0).toLocaleString()}</TableCell>
                            <TableCell className="pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => deleteHealthTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!sortedHealthTasks.length && <TableRow><TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic opacity-40 font-black uppercase tracking-widest text-[10px]">NO TASKS DISCOVERED</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden group">
                <CardHeader className="p-8 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <ReceiptIndianRupee className="h-6 w-6 text-emerald-400" />
                    <CardTitle className="text-xl font-black tracking-tight">Pharmacy Audit</CardTitle>
                  </div>
                  <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document historical procurement</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Total Procurement</p>
                      <p className="text-3xl font-black tracking-tighter">₹{sortedMedicineExpenses.reduce((s, e) => s + e.totalAmountSpent, 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-lg">
                      <History className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-1">Total Outstanding</p>
                      <p className="text-3xl font-black tracking-tighter text-rose-400">₹{sortedMedicineExpenses.reduce((s, e) => s + (e.outstandingDues || 0), 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <Button onClick={() => setIsLegacyDialogOpen(true)} className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-none transition-all active:scale-95">
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    Record Audit
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-neutral-900 p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-none mb-2">Procurement Ledger</CardTitle>
                      <CardDescription className="text-white/40 text-[10px] font-black uppercase tracking-widest">Audit-grade historical records of pharmacy acquisitions</CardDescription>
                    </div>
                    <ReceiptIndianRupee className="h-8 w-8 text-emerald-400 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Fiscal Date</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Pharmacy / Origin</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Value Payload</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right pr-8">Dues</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.map(exp => (
                        <TableRow key={exp.id} className="group hover:bg-neutral-50 border-neutral-100 transition-all active:scale-[0.995]">
                          <TableCell className="pl-8 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{exp.date}</TableCell>
                          <TableCell className="py-6">
                            <div className="font-black text-base text-neutral-900 tracking-tight leading-none">{exp.shopName || 'N/A'}</div>
                            <div className="text-[10px] font-bold text-muted-foreground mt-1.5 truncate max-w-[200px] opacity-60 uppercase">{exp.description || 'Global Meds'}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-black text-emerald-600 tracking-tighter">₹{exp.totalAmountSpent.toLocaleString()}</div>
                            <div className="text-[9px] font-bold text-muted-foreground mt-1 opacity-40 uppercase">Base: ₹{exp.costOfMedicines?.toLocaleString() || '0'}</div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <span className={cn(
                              "text-xs font-black tracking-tight",
                              (exp.outstandingDues || 0) > 0 ? "text-rose-600" : "text-neutral-300"
                            )}>
                              ₹{(exp.outstandingDues || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="pr-4">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 hover:bg-rose-50" onClick={() => deleteMedicineExpense(exp.id, exp._path)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!sortedMedicineExpenses.length && <TableRow><TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic opacity-40 font-black uppercase tracking-widest text-[10px]">NO PROCUREMENTS LOGGED</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isTaskEditDialogOpen} onOpenChange={setIsTaskEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Pencil className="h-24 w-24 text-white rotate-12" /></div>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3 relative z-10">
              <Pencil className="h-6 w-6 text-emerald-400" />
              Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10">Update health treatment parameters and schedule</DialogDescription>
          </DialogHeader>
          <Form {...editHealthTaskForm}>
            <form onSubmit={editHealthTaskForm.handleSubmit(onEditTaskSubmit)} className="space-y-6 p-8">
              <FormField control={editHealthTaskForm.control} name="taskName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase opacity-40 ml-2">Action Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-black">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {healthTaskNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editHealthTaskForm.control} name="lastAdministered" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase opacity-40 ml-2">Date Done</FormLabel>
                    <Popover open={isEditTaskDateOpen} onOpenChange={setIsEditTaskDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="h-12 rounded-xl bg-neutral-50 border-none font-bold justify-start text-left px-4">
                            {field.value ? format(field.value, "MMM dd, yy") : "Pick Date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-none" align="start">
                        <Calendar 
                          mode="single" 
                          selected={field.value} 
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsEditTaskDateOpen(false);
                          }} 
                          initialFocus 
                          disabled={(date) => date > endOfDay(new Date())} 
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editHealthTaskForm.control} name="cost" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-40 ml-2">Total Cost (₹)</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsTaskEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">Commit Adjustment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isLegacyDialogOpen} onOpenChange={setIsLegacyDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-300">
          <DialogHeader className="bg-neutral-900 p-10 text-left text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><ShoppingCart className="h-32 w-32 text-white rotate-12" /></div>
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4 relative z-10">
              <ReceiptIndianRupee className="h-8 w-8 text-emerald-400" />
              Audit Transaction
            </DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">Document historical medicine procurement and dues</DialogDescription>
          </DialogHeader>
          
          <Form {...legacyExpenseForm}>
            <form onSubmit={legacyExpenseForm.handleSubmit(onLegacySubmit)} className="space-y-10 p-10 bg-white">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-10 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Identity & Temporal Tracking</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={legacyExpenseForm.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Purchase Date</FormLabel>
                      <Popover open={isLegacyDateOpen} onOpenChange={setIsLegacyDateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-black text-base px-6 text-left flex justify-between items-center group">
                              {field.value ? format(field.value, "PPP") : <span>Select Date</span>}
                              <CalendarIcon className="h-5 w-5 text-neutral-300 group-hover:text-primary transition-colors" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={(date) => {
                              field.onChange(date);
                              setIsLegacyDateOpen(false);
                            }} 
                            initialFocus 
                            disabled={(date) => date > endOfDay(new Date())} 
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={legacyExpenseForm.control} name="shopName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Pharmacy / Provider</FormLabel>
                      <div className="relative">
                        <Store className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <FormControl>
                          <Input className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-bold text-base px-14 focus-visible:ring-primary/20" placeholder="Store Identity" {...field} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )} />
                </div>

                <FormField control={legacyExpenseForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Audit Detail / Medicine Notes</FormLabel>
                    <div className="relative">
                      <FileText className="absolute left-5 top-5 h-4 w-4 text-neutral-300" />
                      <FormControl>
                        <Input className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-bold text-base px-14 focus-visible:ring-primary/20" placeholder="e.g. 5L Liver Tonic, 100pk Dewormer" {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )} />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 w-10 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Financial Payload Audit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={legacyExpenseForm.control} name="costOfMedicines" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase opacity-40 ml-2">Base Cost (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-black text-lg px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={legacyExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase opacity-40 ml-2">Amount Paid (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-14 rounded-2xl bg-emerald-50 border-none shadow-sm font-black text-xl text-emerald-700 px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={legacyExpenseForm.control} name="outstandingDues" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] font-black uppercase opacity-40 ml-2">Pending Dues (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-14 rounded-2xl bg-rose-50 border-none shadow-sm font-black text-xl text-rose-700 px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter className="pt-6 gap-4 border-t border-neutral-100">
                <Button variant="ghost" type="button" onClick={() => setIsLegacyDialogOpen(false)} className="h-14 px-8 rounded-2xl font-bold text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50">
                  <X className="mr-2 h-4 w-4" /> Cancel Audit
                </Button>
                <Button type="submit" className="h-14 px-12 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1 transition-all active:scale-95">
                  <Save className="mr-3 h-5 w-5 text-emerald-400" /> Commit Transaction
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
