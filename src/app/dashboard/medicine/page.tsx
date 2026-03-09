'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Syringe, HeartPulse, ShoppingCart, ReceiptIndianRupee } from 'lucide-react';
import { format, addMonths, differenceInDays, addDays } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import type { HealthTask, MedicineExpense } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { notes: '', frequency: 'Once', cost: 0 },
  });
  
  const legacyExpenseForm = useForm<LegacyExpenseFormData>({
    resolver: zodResolver(legacyExpenseSchema),
    defaultValues: { shopName: '', description: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 },
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
    healthTaskForm.reset();
    toast({ title: 'Success!', description: 'Task and expense recorded.' });
  };

  const onLegacySubmit: SubmitHandler<LegacyExpenseFormData> = (data) => {
    addMedicineExpense({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    legacyExpenseForm.reset();
    setIsLegacyDialogOpen(false);
    toast({ title: 'Success!', description: 'Legacy medicine expense recorded.' });
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
    toast({ title: 'Updated!', description: 'Task record updated.' });
  };

  const getTaskStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const date = new Date(dueDate);
    date.setHours(0,0,0,0);
    const diff = differenceInDays(date, today);
    if (diff < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (diff === 0) return { label: 'Due Today', variant: 'default' as const };
    if (diff <= 7) return { label: 'Soon', variant: 'secondary' as const };
    return null;
  };

  return (
    <div className="container mx-auto py-6 px-4 md:py-8">
      <PageHeader title="Medicine & Health" description="Integrated flock health and expense management." />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Card className="border-primary/20 bg-accent/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Health Entry
              </CardTitle>
              <CardDescription>Record vaccinations, deworming, or supplements.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...healthTaskForm}>
                <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-4">
                  <FormField control={healthTaskForm.control} name="taskName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Action Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl border-none shadow-2xl">{healthTaskNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />

                  {watchedTaskName === 'Deworming' && (
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border bg-white p-4 animate-in fade-in slide-in-from-top-1 shadow-sm">
                      <FormField control={healthTaskForm.control} name="dewormerName" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Dewormer Name</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl border-none shadow-2xl">{dewormerNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={healthTaskForm.control} name="dosePerKg" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Dose/kg (ml)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-xl" {...field} /></FormControl></FormItem>)} />
                        <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Flock Count</FormLabel><FormControl><Input type="number" className="rounded-xl" {...field} /></FormControl></FormItem>)} />
                      </div>
                    </div>
                  )}

                  {watchedTaskName === 'Vaccination' && (
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border bg-white p-4 animate-in fade-in slide-in-from-top-1 shadow-sm">
                      <FormField control={healthTaskForm.control} name="vaccineType" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Vaccine Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl border-none shadow-2xl">{vaccineTypes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></FormItem>
                      )} />
                      <FormField control={healthTaskForm.control} name="boosterRequired" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Booster Dose?</FormLabel><RadioGroup onValueChange={v => field.onChange(v === 'true')} className="flex gap-6 mt-1"><div className="flex items-center gap-2"><RadioGroupItem value="true" id="v-yes" /><label htmlFor="v-yes" className="text-sm font-bold">Yes</label></div><div className="flex items-center gap-2"><RadioGroupItem value="false" id="v-no" /><label htmlFor="v-no" className="text-sm font-bold">No</label></div></RadioGroup></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                         <FormField control={healthTaskForm.control} name="batchNumber" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Batch #</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl></FormItem>)} />
                         <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Flock Count</FormLabel><FormControl><Input type="number" className="rounded-xl" {...field} /></FormControl></FormItem>)} />
                      </div>
                    </div>
                  )}

                  {watchedTaskName === 'Vitamin & Liver Support' && (
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border bg-white p-4 animate-in fade-in slide-in-from-top-1 shadow-sm">
                      <FormField control={healthTaskForm.control} name="supplementType" render={({ field }) => (
                        <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Supplement</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl border-none shadow-2xl">{supplementTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={healthTaskForm.control} name="dosage" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Dosage (ml)</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl></FormItem>)} />
                        <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Flock Count</FormLabel><FormControl><Input type="number" className="rounded-xl" {...field} /></FormControl></FormItem>)} />
                      </div>
                    </div>
                  )}

                  {watchedTaskName === 'Other' && (
                     <div className="grid grid-cols-1 gap-4 rounded-2xl border bg-white p-4 animate-in fade-in slide-in-from-top-1 shadow-sm">
                        <FormField control={healthTaskForm.control} name="notes" render={({ field }) => (
                          <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Task Description</FormLabel><FormControl><Textarea placeholder="e.g. Hoof trimming, emergency care" className="rounded-xl min-h-[100px]" {...field} /></FormControl></FormItem>
                        )} />
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={healthTaskForm.control} name="lastAdministered" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Date Done</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-bold h-11 px-4 rounded-xl border-none bg-white shadow-sm">{field.value ? format(field.value, "MMM dd, yy") : "Pick date"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                    )} />
                    <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Cost (₹)</FormLabel><FormControl><Input type="number" placeholder="0" className="h-11 rounded-xl bg-white border-none shadow-sm font-black" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  {watchedTaskName !== 'Deworming' && (
                    <FormField control={healthTaskForm.control} name="frequency" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Auto-Repeat Frequency</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl border-none shadow-2xl">{frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></FormItem>
                    )} />
                  )}

                  <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 mt-2">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Save & Schedule
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary p-8 text-white">
              <CardTitle className="text-xl font-black tracking-tight leading-none mb-2">Health Schedule</CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Upcoming treatments and historical verification</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Task Details</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Next Due</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-right">Cost</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHealthTasks.map(task => {
                    const status = getTaskStatus(task.nextDueDate);
                    return (
                      <TableRow key={task.id} className="group hover:bg-neutral-50 transition-all border-neutral-100">
                        <TableCell className="pl-8 py-4">
                          <div className="font-black text-sm text-neutral-900">{task.taskName}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 line-clamp-1 opacity-60">
                            {task.dewormerName || task.vaccineType || task.supplementType || task.notes}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-black text-neutral-700">{task.nextDueDate}</div>
                          {status && <Badge variant={status.variant} className="mt-1 text-[8px] font-black uppercase tracking-widest h-4 px-1.5 rounded-md border-none">{status.label}</Badge>}
                        </TableCell>
                        <TableCell className="text-right text-sm font-black text-neutral-900">₹{(task.cost || 0).toLocaleString()}</TableCell>
                        <TableCell className="pr-8 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => deleteHealthTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sortedHealthTasks.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic opacity-40 font-black uppercase tracking-widest text-[10px]">NO TASKS SCHEDULED</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-neutral-900 p-8 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight leading-none mb-2">Legacy Medicine Ledger</CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-black uppercase tracking-widest">Historical record of pharmacy procurement</CardDescription>
                </div>
                <Button onClick={() => setIsLegacyDialogOpen(true)} variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest">
                  <ShoppingCart className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                  Record Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Date</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Pharmacy / Shop</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-right">Med Cost</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-right">Total Paid</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-right pr-8">Dues</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMedicineExpenses.map(exp => (
                    <TableRow key={exp.id} className="group hover:bg-neutral-50 border-neutral-100">
                      <TableCell className="pl-8 text-[10px] font-bold text-muted-foreground uppercase">{exp.date}</TableCell>
                      <TableCell>
                        <div className="font-black text-sm text-neutral-900 truncate max-w-[150px]">{exp.shopName || 'N/A'}</div>
                        <div className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate max-w-[150px] opacity-60 uppercase">{exp.description || 'No description'}</div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-neutral-600">₹{exp.costOfMedicines?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-right text-sm font-black text-emerald-600">₹{exp.totalAmountSpent.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-8">
                        <span className={cn(
                          "text-xs font-black",
                          (exp.outstandingDues || 0) > 0 ? "text-rose-600" : "text-neutral-300"
                        )}>
                          ₹{(exp.outstandingDues || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 hover:bg-rose-50" onClick={() => deleteMedicineExpense(exp.id, exp._path)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedMedicineExpenses.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground italic opacity-40 font-black uppercase tracking-widest text-[10px]">NO LEGACY COSTS DETECTED</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health Task Edit Dialog */}
      <Dialog open={isTaskEditDialogOpen} onOpenChange={setIsTaskEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-6 w-6 text-emerald-400" />
              Update Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Adjust treatment parameters and schedule</DialogDescription>
          </DialogHeader>
          <Form {...editHealthTaskForm}>
            <form onSubmit={editHealthTaskForm.handleSubmit(onEditTaskSubmit)} className="space-y-6 p-8">
              <FormField control={editHealthTaskForm.control} name="taskName" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Action Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 rounded-xl bg-neutral-50 border-none font-black"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl border-none shadow-2xl">{healthTaskNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editHealthTaskForm.control} name="lastAdministered" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="text-[10px] font-black uppercase opacity-40">Date Done</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="h-11 rounded-xl bg-neutral-50 border-none font-bold justify-start text-left px-4">{field.value ? format(field.value, "MMM dd, yy") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-none"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover></FormItem>)} />
                <FormField control={editHealthTaskForm.control} name="cost" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Total Cost (₹)</FormLabel><FormControl><Input type="number" className="h-11 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
              </div>
              
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsTaskEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">Update Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Legacy Expense Entry Dialog */}
      <Dialog open={isLegacyDialogOpen} onOpenChange={setIsLegacyDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white relative">
            <div className="absolute top-0 right-0 p-6 opacity-10"><ShoppingCart className="h-24 w-24 text-white rotate-12" /></div>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3 relative z-10">
              <ReceiptIndianRupee className="h-6 w-6 text-emerald-400" />
              Pharmacy Audit
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest relative z-10">Document historical medicine procurement</DialogDescription>
          </DialogHeader>
          <Form {...legacyExpenseForm}>
            <form onSubmit={legacyExpenseForm.handleSubmit(onLegacySubmit)} className="space-y-6 p-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={legacyExpenseForm.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel className="text-[10px] font-black uppercase opacity-40">Purchase Date</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="h-11 rounded-xl bg-neutral-50 border-none font-bold justify-start text-left px-4">{field.value ? format(field.value, "MMM dd, yy") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-none"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover></FormItem>
                )} />
                <FormField control={legacyExpenseForm.control} name="shopName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Pharmacy/Shop</FormLabel><FormControl><Input className="h-11 rounded-xl bg-neutral-50 border-none font-bold" placeholder="Store name" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <FormField control={legacyExpenseForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Medicine Details</FormLabel><FormControl><Input className="h-11 rounded-xl bg-neutral-50 border-none font-bold" placeholder="e.g. 5L Liver Tonic" {...field} /></FormControl></FormItem>
              )} />

              <div className="grid grid-cols-3 gap-4">
                <FormField control={legacyExpenseForm.control} name="costOfMedicines" render={({ field }) => (
                  <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-40">Base Cost</FormLabel><FormControl><Input type="number" className="h-11 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={legacyExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                  <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-40">Total Paid</FormLabel><FormControl><Input type="number" className="h-11 rounded-xl bg-emerald-50 border-none font-black text-emerald-700" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={legacyExpenseForm.control} name="outstandingDues" render={({ field }) => (
                  <FormItem><FormLabel className="text-[9px] font-black uppercase opacity-40">Pending Dues</FormLabel><FormControl><Input type="number" className="h-11 rounded-xl bg-rose-50 border-none font-black text-rose-700" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsLegacyDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">Commit Ledger</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
