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
  ShieldCheck,
  TrendingUp,
  Store,
  FileText,
  Save,
  Stethoscope,
  TrendingDown
} from 'lucide-react';
import { format, addMonths, differenceInDays, endOfDay, startOfDay } from 'date-fns';
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
import { Label } from '@/components/ui/label';

const animalGroups = ['Lamb', 'Adult', 'Pregnant', 'Ram'] as const;
const healthTypes = ['Vaccination', 'Deworming', 'Supplement', 'Treatment'] as const;
const symptoms = ['Fever', 'Worms', 'Cough', 'Injury', 'None', 'Other'] as const;
const units = ['ml', 'mg', 'tablet'] as const;
const routes = ['Oral', 'Injection'] as const;

const healthTaskFormSchema = z.object({
  date: z.date({ required_error: 'Treatment date is required.' }),
  sheepId: z.string().min(1, 'Please select a sheep.'),
  animalGroup: z.enum(animalGroups),
  healthType: z.enum(healthTypes),
  symptom: z.enum(symptoms),
  medicineName: z.string().min(1, 'Medicine name is required.'),
  dose: z.coerce.number().positive('Dose must be positive.'),
  unit: z.enum(units),
  route: z.enum(routes),
  nextDueDate: z.date().optional(),
  administeredBy: z.string().min(1, 'Administered by is required.'),
  notes: z.string().optional(),
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
  const { 
    medicineExpenses, addMedicineExpense, updateMedicineExpense, deleteMedicineExpense, 
    healthTasks, addHealthTask, deleteHealthTask, updateHealthTask,
    trackedSheep 
  } = useFarm();
  
  const [isTaskEditDialogOpen, setIsTaskEditDialogOpen] = useState(false);
  const [isLegacyEditDialogOpen, setIsLegacyEditDialogOpen] = useState(false);
  const [editingHealthTask, setEditingHealthTask] = useState<HealthTask | null>(null);
  const [editingLegacyExpense, setEditingLegacyExpense] = useState<MedicineExpense | null>(null);

  const [isTaskDateOpen, setIsTaskDateOpen] = useState(false);
  const [isNextDateOpen, setIsNextDateOpen] = useState(false);
  const [isLegacyDateOpen, setIsLegacyDateOpen] = useState(false);
  const [isEditLegacyDateOpen, setIsEditLegacyDateOpen] = useState(false);

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { 
      date: new Date(), 
      notes: '', 
      animalGroup: 'Adult',
      healthType: 'Treatment',
      symptom: 'None',
      unit: 'ml',
      route: 'Oral',
      administeredBy: ''
    },
  });
  
  const legacyExpenseForm = useForm<LegacyExpenseFormData>({
    resolver: zodResolver(legacyExpenseSchema),
    defaultValues: { date: new Date(), shopName: '', description: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 },
  });

  const editHealthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
  });

  const editLegacyExpenseForm = useForm<LegacyExpenseFormData>({
    resolver: zodResolver(legacyExpenseSchema),
  });

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    return [...healthTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks]);

  const totalProcurement = useMemo(() => sortedMedicineExpenses.reduce((s, e) => s + e.totalAmountSpent, 0), [sortedMedicineExpenses]);
  const totalOutstanding = useMemo(() => sortedMedicineExpenses.reduce((s, e) => s + (e.outstandingDues || 0), 0), [sortedMedicineExpenses]);

  useEffect(() => {
    if (editingHealthTask) {
      editHealthTaskForm.reset({
        ...editingHealthTask,
        date: new Date(editingHealthTask.date),
        nextDueDate: editingHealthTask.nextDueDate ? new Date(editingHealthTask.nextDueDate) : undefined,
      } as any);
    }
  }, [editingHealthTask, editHealthTaskForm]);

  useEffect(() => {
    if (editingLegacyExpense) {
      editLegacyExpenseForm.reset({
        ...editingLegacyExpense,
        date: new Date(editingLegacyExpense.date),
      });
    }
  }, [editingLegacyExpense, editLegacyExpenseForm]);

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    addHealthTask({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd'),
    });
    healthTaskForm.reset({ date: new Date(), notes: '', administeredBy: '' });
    toast({ title: 'Success!', description: 'Clinical record synchronized.' });
  };

  const onLegacySubmit: SubmitHandler<LegacyExpenseFormData> = (data) => {
    const payload = {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    };
    addMedicineExpense(payload);
    legacyExpenseForm.reset({ date: new Date(), shopName: '', description: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 });
    toast({ title: 'Success!', description: 'Pharmacy audit committed.' });
  };

  const onEditLegacySubmit: SubmitHandler<LegacyExpenseFormData> = (data) => {
    if (!editingLegacyExpense) return;
    updateMedicineExpense(editingLegacyExpense.id, {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    }, editingLegacyExpense._path);
    setIsLegacyEditDialogOpen(false);
    toast({ title: 'Updated!', description: 'Pharmacy audit adjusted.' });
  };

  const onEditTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    if (!editingHealthTask) return;
    updateHealthTask(editingHealthTask.id, {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd'),
    }, editingHealthTask._path);
    setIsTaskEditDialogOpen(false);
    toast({ title: 'Updated!', description: 'Clinical record adjusted.' });
  };

  const getTaskStatus = (dueDate: string) => {
    const today = startOfDay(new Date());
    const date = startOfDay(new Date(dueDate));
    const diff = differenceInDays(date, today);
    if (diff < 0) return { label: 'Audit Due', variant: 'destructive' as const };
    if (diff === 0) return { label: 'Due Today', variant: 'default' as const };
    if (diff <= 7) return { label: 'Soon', variant: 'secondary' as const };
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Medicine & Health"
          description="High-precision flock wellness and clinical audit suite."
          className="mb-0"
        />
        <div className="flex flex-wrap gap-4 justify-end">
          <div className="px-5 py-2.5 bg-neutral-900 rounded-xl text-white flex items-center gap-4 shadow-xl">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none">Total Procurement</p>
              <p className="text-lg font-black tracking-tight">₹{totalProcurement.toLocaleString()}</p>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-neutral-900 rounded-xl text-white flex items-center gap-4 shadow-xl">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none">Total Outstanding</p>
              <p className="text-lg font-black tracking-tight">₹{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-10 p-1.5 bg-neutral-100 rounded-2xl h-14 max-w-md mx-auto">
          <TabsTrigger value="health" className="rounded-xl font-black text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <Syringe className="h-4 w-4 mr-2" /> Health Track
          </TabsTrigger>
          <TabsTrigger value="cost" className="rounded-xl font-black text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <ReceiptIndianRupee className="h-4 w-4 mr-2" /> Cost Track
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Card className="border-none bg-neutral-50/50 sticky top-24 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardHeader className="bg-neutral-900 p-8 text-white">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-emerald-400" />
                    Treatment Entry
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Document high-precision physiological action</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...healthTaskForm}>
                    <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={healthTaskForm.control} name="date" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Date</FormLabel>
                            <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button type="button" variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-left px-4 text-sm">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Pick Date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsTaskDateOpen(false); }} initialFocus disabled={(d) => d > endOfDay(new Date())} />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Sheep ID</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                              <SelectContent className="rounded-xl">
                                {trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}
                                {!trackedSheep?.length && <SelectItem value="Generic" disabled>No tracked sheep</SelectItem>}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={healthTaskForm.control} name="animalGroup" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Animal Group</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{animalGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="healthType" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Health Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={healthTaskForm.control} name="symptom" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Disease / Symptom</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6 text-sm"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{symptoms.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <div className="space-y-4 p-5 rounded-[1.25rem] bg-white border border-neutral-100 shadow-sm">
                        <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase opacity-40">Medicine Used</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm" placeholder="e.g. Albendazole" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex gap-2">
                            <FormField control={healthTaskForm.control} name="dose" render={({ field }) => (
                              <FormItem className="flex-1"><FormLabel className="text-xs font-black uppercase opacity-40">Dose</FormLabel><FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={healthTaskForm.control} name="unit" render={({ field }) => (
                              <FormItem className="w-20"><FormLabel className="text-xs font-black uppercase opacity-40">Unit</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm"><SelectValue /></SelectTrigger></FormControl><SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                          </div>
                          <FormField control={healthTaskForm.control} name="route" render={({ field }) => (
                            <FormItem><FormLabel className="text-xs font-black uppercase opacity-40">Route</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm"><SelectValue /></SelectTrigger></FormControl><SelectContent>{routes.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></FormItem>
                          )} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={healthTaskForm.control} name="nextDueDate" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Next Due Date</FormLabel>
                            <Popover open={isNextDateOpen} onOpenChange={setIsNextDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button type="button" variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-left px-4 text-sm">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Optional"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsNextDateOpen(false); }} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Vet / Given By</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm" placeholder="Identity" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>

                      <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 text-white">
                        <PlusCircle className="mr-3 h-6 w-6 text-emerald-400" />
                        Commit Clinical Record
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
                      <CardTitle className="text-xl font-black tracking-tight leading-none mb-2">Clinical History</CardTitle>
                      <CardDescription className="text-white/60 text-xs font-black uppercase tracking-widest">Temporal verification of physiological treatments</CardDescription>
                    </div>
                    <Stethoscope className="h-7 w-7 text-emerald-200 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-sm font-black uppercase pl-8 py-5">Treatment Metric</TableHead>
                        <TableHead className="text-sm font-black uppercase">Sheep / Group</TableHead>
                        <TableHead className="text-sm font-black uppercase">Clinical Details</TableHead>
                        <TableHead className="text-sm font-black uppercase text-right">Audit Status</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHealthTasks.map(task => {
                        const status = getTaskStatus(task.nextDueDate);
                        return (
                          <TableRow key={task.id} className="group hover:bg-neutral-50 transition-all cursor-zoom-in border-neutral-100 active:scale-[0.995]" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}>
                            <TableCell className="pl-8 py-6">
                              <div className="font-black text-sm text-neutral-900 leading-tight uppercase tracking-tight">{task.healthType}</div>
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                                {task.date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-primary">{task.sheepId}</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{task.animalGroup}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-black">{task.medicineName}</span>
                                <span className="text-xs font-bold text-muted-foreground opacity-60">{task.dose}{task.unit} • {task.route}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-xs font-black text-neutral-700 tracking-tight uppercase">Next: {task.nextDueDate}</div>
                              {status && <Badge variant={status.variant} className="mt-1 text-[10px] font-black uppercase tracking-widest h-5 px-2 rounded-md border-none shadow-sm">{status.label}</Badge>}
                            </TableCell>
                            <TableCell className="pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-neutral-100 hover:bg-neutral-200" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => deleteHealthTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!sortedHealthTasks.length && <TableRow><TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic opacity-40 font-black uppercase tracking-widest text-sm">NO CLINICAL RECORDS DISCOVERED</TableCell></TableRow>}
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
              <Card className="border-none bg-neutral-50/50 sticky top-24 rounded-[2.5rem] shadow-2xl overflow-hidden group">
                <CardHeader className="bg-neutral-900 p-8 text-white">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <ReceiptIndianRupee className="h-5 w-5 text-emerald-400" />
                    Pharmacy Audit
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Document high-precision pharmacy procurement</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <Form {...legacyExpenseForm}>
                    <form onSubmit={legacyExpenseForm.handleSubmit(onLegacySubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={legacyExpenseForm.control} name="date" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Date</FormLabel>
                            <Popover open={isLegacyDateOpen} onOpenChange={setIsLegacyDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button type="button" variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-left px-4 text-sm">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Select Date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsLegacyDateOpen(false); }} initialFocus disabled={(d) => d > endOfDay(new Date())} />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )} />
                        <FormField control={legacyExpenseForm.control} name="shopName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Pharmacy</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm px-4" placeholder="Store Identity" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={legacyExpenseForm.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Details / Notes</FormLabel>
                          <FormControl><Input className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm px-4" placeholder="e.g. Antibiotics Batch" {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-3 gap-3">
                        <FormField control={legacyExpenseForm.control} name="costOfMedicines" render={({ field }) => (
                          <FormItem><FormLabel className="text-[8px] font-black uppercase opacity-40">Cost (₹)</FormLabel><FormControl><Input type="number" className="h-11 rounded-lg bg-white border-none shadow-sm font-black text-xs" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={legacyExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                          <FormItem><FormLabel className="text-[8px] font-black uppercase opacity-40">Paid (₹)</FormLabel><FormControl><Input type="number" className="h-11 rounded-lg bg-emerald-50 border-none shadow-sm font-black text-xs text-emerald-700" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={legacyExpenseForm.control} name="outstandingDues" render={({ field }) => (
                          <FormItem><FormLabel className="text-[8px] font-black uppercase opacity-40">Due (₹)</FormLabel><FormControl><Input type="number" className="h-11 rounded-lg bg-rose-50 border-none shadow-sm font-black text-xs text-rose-700" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                        <ShoppingCart className="mr-3 h-5 w-5" />
                        Commit Transaction
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-neutral-900 p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none mb-2">Procurement Ledger</CardTitle>
                      <CardDescription className="text-white/40 text-xs font-black uppercase tracking-widest">Audit-grade historical records of pharmacy acquisitions</CardDescription>
                    </div>
                    <ReceiptIndianRupee className="h-7 w-7 text-emerald-400 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-sm font-black uppercase pl-8 py-5">Fiscal Date</TableHead>
                        <TableHead className="text-sm font-black uppercase">Pharmacy / Origin</TableHead>
                        <TableHead className="text-sm font-black uppercase text-right">Value Payload</TableHead>
                        <TableHead className="text-sm font-black uppercase text-right pr-8">Dues</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.map(exp => (
                        <TableRow key={exp.id} className="group hover:bg-neutral-50 border-neutral-100 transition-all active:scale-[0.995]" onClick={() => { setEditingLegacyExpense(exp); setIsLegacyEditDialogOpen(true); }}>
                          <TableCell className="pl-8 text-sm font-black text-muted-foreground/60 uppercase tracking-widest">{exp.date}</TableCell>
                          <TableCell className="py-6">
                            <div className="font-black text-sm text-neutral-900 tracking-tight leading-none">{exp.shopName || 'N/A'}</div>
                            <div className="text-xs font-bold text-muted-foreground mt-1.5 truncate max-w-[180px] opacity-60 uppercase">{exp.description || 'Global Meds'}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-black text-emerald-600 tracking-tighter">₹{exp.totalAmountSpent.toLocaleString()}</div>
                            <div className="text-xs font-bold text-muted-foreground mt-1 opacity-40 uppercase">Base: ₹{exp.costOfMedicines?.toLocaleString() || '0'}</div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <span className={cn(
                              "text-sm font-black tracking-tight",
                              (exp.outstandingDues || 0) > 0 ? "text-rose-600" : "text-neutral-300"
                            )}>
                              ₹{(exp.outstandingDues || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-neutral-100 hover:bg-neutral-200" onClick={() => { setEditingLegacyExpense(exp); setIsLegacyEditDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-600 hover:bg-rose-50" onClick={() => deleteMedicineExpense(exp.id, exp._path)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!sortedMedicineExpenses.length && <TableRow><TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic opacity-40 font-black uppercase tracking-widest text-sm">NO PROCUREMENTS LOGGED</TableCell></TableRow>}
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
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Update clinical treatment parameters</DialogDescription>
          </DialogHeader>
          <Form {...editHealthTaskForm}>
            <form onSubmit={editHealthTaskForm.handleSubmit(onEditTaskSubmit)} className="space-y-6 p-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editHealthTaskForm.control} name="sheepId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Sheep ID</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={editHealthTaskForm.control} name="healthType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Health Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editHealthTaskForm.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Date</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl><Button type="button" variant="outline" className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm">{field.value ? format(field.value, "MMM dd, yy") : "Pick Date"}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                  </FormItem>
                )} />
                <FormField control={editHealthTaskForm.control} name="administeredBy" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Vet / Given By</FormLabel><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm px-4" {...field} /></FormControl></FormItem>
                )} />
              </div>
              
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsTaskEditDialogOpen(false)} className="h-12 px-6 rounded-xl font-bold border-neutral-200 text-sm">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1 text-sm">Commit Adjustment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isLegacyEditDialogOpen} onOpenChange={setIsLegacyEditDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white relative">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
              <Pencil className="h-6 w-6 text-emerald-400" />
              Adjust Audit
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Modify historical medicine procurement record</DialogDescription>
          </DialogHeader>
          
          <Form {...editLegacyExpenseForm}>
            <form onSubmit={editLegacyExpenseForm.handleSubmit(onEditLegacySubmit)} className="space-y-10 p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={editLegacyExpenseForm.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Date</FormLabel>
                    <Popover open={isEditLegacyDateOpen} onOpenChange={setIsEditLegacyDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button type="button" variant="outline" className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-left px-4 text-sm flex justify-between items-center">
                            {field.value ? format(field.value, "MMM dd, yy") : "Select Date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsEditLegacyDateOpen(false); }} initialFocus disabled={(d) => d > endOfDay(new Date())} />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
                <FormField control={editLegacyExpenseForm.control} name="shopName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Pharmacy</FormLabel>
                    <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm px-4" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <FormField control={editLegacyExpenseForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase opacity-40 ml-2">Notes</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm px-4" {...field} /></FormControl>
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-4">
                <FormField control={editLegacyExpenseForm.control} name="costOfMedicines" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Cost (₹)</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm px-4" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editLegacyExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Paid (₹)</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-emerald-50 border-none font-black text-sm px-4 text-emerald-700" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editLegacyExpenseForm.control} name="outstandingDues" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-40">Due (₹)</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl bg-rose-50 border-none font-black text-sm px-4 text-rose-700" {...field} /></FormControl></FormItem>
                )} />
              </div>

              <DialogFooter className="pt-4 gap-4">
                <Button variant="ghost" type="button" onClick={() => setIsLegacyEditDialogOpen(false)} className="h-12 px-6 rounded-xl font-bold text-neutral-400">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">
                  <Save className="mr-2 h-4 w-4 text-emerald-400" /> Save Audit Adjustment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
