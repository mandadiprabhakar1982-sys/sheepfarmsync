'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Syringe, 
  Stethoscope,
  CheckCircle2,
  ClipboardList,
  ReceiptIndianRupee,
  ShoppingCart,
  Pencil,
  PlusCircle,
  TrendingDown
} from 'lucide-react';
import { format, addMonths, differenceInDays, endOfDay, startOfDay } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
    medicineExpenses, addMedicineExpense, updateMedicineExpense, 
    healthTasks, addHealthTask, updateHealthTask,
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
    healthTaskForm.reset({ date: new Date(), notes: '', administeredBy: '', medicineName: '', dose: 0 });
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
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="page-title leading-tight mb-2">Medicine & Health</h1>
          <p className="subtitle">Operational Health Command</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white/60 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center min-w-[140px] shadow-xl border border-white/40">
            <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest leading-none mb-1">Total Procurement</p>
            <p className="text-xl font-black tracking-tight text-neutral-900">₹{totalProcurement.toLocaleString()}</p>
          </div>
          <div className="px-6 py-3 bg-white/60 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center min-w-[140px] shadow-xl border border-white/40">
            <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest leading-none mb-1">Total Outstanding</p>
            <p className="text-xl font-black tracking-tight text-neutral-900">₹{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="mb-12 p-1 bg-[#e7eddc] rounded-2xl flex justify-center items-center h-16 w-fit mx-auto shadow-inner">
          <TabsTrigger value="health" className="tab-inactive tab-active h-14 px-10">
            <Syringe className="mr-2 h-4 w-4" /> Health Track
          </TabsTrigger>
          <TabsTrigger value="cost" className="tab-inactive tab-active h-14 px-10">
            <ClipboardList className="mr-2 h-4 w-4" /> Cost Track
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- TREATMENT ENTRY FORM --- */}
            <div className="lg:col-span-4">
              <Card className="form-card sticky top-24 border-t-4 border-emerald-800">
                <CardHeader className="p-0 mb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-[#1a4d38]" />
                        <CardTitle className="text-base font-black tracking-tight text-[#1a4d38] uppercase">Treatment Entry</CardTitle>
                      </div>
                      <CardDescription className="text-[#1a4d38]/40 text-[8px] font-bold uppercase tracking-widest">DOCUMENT HIGH-PRECISION TREATMENT</CardDescription>
                    </div>
                    <Stethoscope className="h-6 w-6 text-[#1a4d38] opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Form {...healthTaskForm}>
                    <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={healthTaskForm.control} name="date" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Date</Label>
                            <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button type="button" variant="outline" className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-left px-4 text-xs">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Select"}
                                    <CalendarIcon className="ml-auto h-3 w-3 opacity-20" />
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
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Sheep ID</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Animal Group</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{animalGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="healthType" render={({ field }) => (
                          <FormItem>
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Health Type</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={healthTaskForm.control} name="symptom" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Disease / Symptom</Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{symptoms.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <div className="space-y-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
                        <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (
                          <FormItem>
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Medicine Used</Label>
                            <FormControl><Input className="h-12 rounded-xl bg-white border-[#d9e4cf] font-bold text-xs" placeholder="e.g. Albendazole" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-3 gap-2">
                          <FormField control={healthTaskForm.control} name="dose" render={({ field }) => (
                            <FormItem><Label className="text-[9px] font-black uppercase opacity-40 ml-1">Dose</Label><FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-white border-[#d9e4cf] font-black text-xs" {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={healthTaskForm.control} name="unit" render={({ field }) => (
                            <FormItem><Label className="text-[9px] font-black uppercase opacity-40 ml-1">Unit</Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-[#d9e4cf] font-bold text-xs"><SelectValue /></SelectTrigger></FormControl><SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></FormItem>
                          )} />
                          <FormField control={healthTaskForm.control} name="route" render={({ field }) => (
                            <FormItem><Label className="text-[9px] font-black uppercase opacity-40 ml-1">Route</Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-[#d9e4cf] font-bold text-xs"><SelectValue /></SelectTrigger></FormControl><SelectContent>{routes.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></FormItem>
                          )} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={healthTaskForm.control} name="nextDueDate" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Next Due Date</Label>
                            <Popover open={isNextDateOpen} onOpenChange={setIsNextDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button type="button" variant="outline" className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-left px-4 text-xs">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Optional"}
                                    <CalendarIcon className="ml-auto h-3 w-3 opacity-20" />
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
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Vet / Given By</Label>
                            <FormControl><Input className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs" placeholder="Identity" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>

                      <Button type="submit" className="primary-btn w-full">
                        <CheckCircle2 className="h-5 w-5" />
                        COMMIT CLINICAL RECORD
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* --- CLINICAL HISTORY TABLE --- */}
            <div className="lg:col-span-8">
              <Card className="form-card p-0 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight text-neutral-900 leading-none mb-1">Clinical History</CardTitle>
                      <CardDescription className="text-neutral-400 text-[9px] font-black uppercase tracking-widest">TEMPORAL VERIFICATION OF PHYSIOLOGICAL TREATMENTS</CardDescription>
                    </div>
                    <Stethoscope className="h-10 w-10 text-neutral-100" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow className="border-b border-neutral-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10">Treatment Metric</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Sheep / Group</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Clinical Details</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10">Audit Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHealthTasks.length > 0 ? (
                        sortedHealthTasks.map(task => {
                          const status = getTaskStatus(task.nextDueDate);
                          return (
                            <TableRow key={task.id} className="group hover:bg-neutral-50 transition-all cursor-zoom-in border-b border-neutral-50" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}>
                              <TableCell className="pl-10 py-6">
                                <div className="font-black text-sm text-neutral-900 leading-tight uppercase tracking-tight">{task.healthType}</div>
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                                  {format(new Date(task.date), "MMM dd, yy")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-emerald-800">{task.sheepId}</span>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{task.animalGroup}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-neutral-800">{task.medicineName}</span>
                                  <span className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase">{task.dose}{task.unit} • {task.route}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-10">
                                <div className="text-[9px] font-black text-neutral-700 tracking-tight uppercase">Next: {format(new Date(task.nextDueDate), "MMM dd, yy")}</div>
                                {status && <Badge variant={status.variant} className="mt-1 text-[8px] font-black uppercase tracking-widest h-5 px-2 rounded-md border-none shadow-sm">{status.label}</Badge>}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-48 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <Stethoscope className="h-16 w-16" />
                              <h3 className="text-sm font-black uppercase tracking-[0.3em]">No records found</h3>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- PHARMACY AUDIT FORM --- */}
            <div className="lg:col-span-4">
              <Card className="form-card sticky top-24 border-t-4 border-neutral-900">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center gap-3 mb-1">
                    <ReceiptIndianRupee className="h-5 w-5 text-[#A68A56]" />
                    <CardTitle className="text-base font-black tracking-tight text-neutral-900 uppercase">Pharmacy Audit</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-400 text-[8px] font-bold uppercase tracking-widest">Document pharmacy procurement</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Form {...legacyExpenseForm}>
                    <form onSubmit={legacyExpenseForm.handleSubmit(onLegacySubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={legacyExpenseForm.control} name="date" render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Date</Label>
                            <Popover open={isLegacyDateOpen} onOpenChange={setIsLegacyDateOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button type="button" variant="outline" className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-left px-4 text-xs">
                                    {field.value ? format(field.value, "MMM dd, yy") : "Select Date"}
                                    <CalendarIcon className="ml-auto h-3 w-3 opacity-20" />
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
                            <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Pharmacy</Label>
                            <FormControl><Input className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs px-4" placeholder="Store Identity" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={legacyExpenseForm.control} name="description" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Details / Notes</Label>
                          <FormControl><Input className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-xs px-4" placeholder="e.g. Antibiotics Batch" {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-3 gap-3">
                        <FormField control={legacyExpenseForm.control} name="costOfMedicines" render={({ field }) => (
                          <FormItem><Label className="text-[8px] font-black uppercase opacity-40 ml-1">Cost (₹)</Label><FormControl><Input type="number" className="h-11 rounded-lg bg-white border-[#d9e4cf] font-black text-xs" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={legacyExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                          <FormItem><Label className="text-[8px] font-black uppercase opacity-40 ml-1">Paid (₹)</Label><FormControl><Input type="number" className="h-11 rounded-lg bg-emerald-50/50 border-emerald-100 font-black text-xs text-emerald-700" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={legacyExpenseForm.control} name="outstandingDues" render={({ field }) => (
                          <FormItem><Label className="text-[8px] font-black uppercase opacity-40 ml-1">Due (₹)</Label><FormControl><Input type="number" className="h-11 rounded-lg bg-rose-50/50 border-rose-100 font-black text-xs text-rose-700" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <Button type="submit" className="primary-btn w-full !bg-neutral-900 hover:!bg-black">
                        <ShoppingCart className="mr-3 h-4 w-4" />
                        COMMIT TRANSACTION
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* --- PROCUREMENT LEDGER TABLE --- */}
            <div className="lg:col-span-8">
              <Card className="form-card p-0 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight text-neutral-900 leading-none mb-1 uppercase">Procurement Ledger</CardTitle>
                      <CardDescription className="text-neutral-400 text-[9px] font-black uppercase tracking-widest">HISTORICAL RECORD OF ALL PHARMACY ACQUISITIONS</CardDescription>
                    </div>
                    <ReceiptIndianRupee className="h-10 w-10 text-neutral-100" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow className="border-b border-neutral-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10">Fiscal Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Pharmacy / Origin</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Value Payload</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.length > 0 ? (
                        sortedMedicineExpenses.map(exp => (
                          <TableRow key={exp.id} className="group hover:bg-neutral-50 transition-all border-b border-neutral-50" onClick={() => { setEditingLegacyExpense(exp); setIsLegacyEditDialogOpen(true); }}>
                            <TableCell className="pl-10 py-6 text-xs font-black text-neutral-800 uppercase tracking-widest">{format(new Date(exp.date), "MMM dd, yy")}</TableCell>
                            <TableCell>
                              <div className="font-black text-sm text-neutral-900 tracking-tight leading-none">{exp.shopName || 'N/A'}</div>
                              <div className="text-[9px] font-bold text-muted-foreground mt-1.5 truncate max-w-[180px] opacity-60 uppercase">{exp.description || 'Global Meds'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-black text-emerald-700 tracking-tighter">₹{exp.totalAmountSpent.toLocaleString()}</div>
                              <div className="text-[9px] font-bold text-muted-foreground mt-1 opacity-40 uppercase">Due: ₹{(exp.outstandingDues || 0).toLocaleString()}</div>
                            </TableCell>
                            <TableCell className="pr-10 text-right" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200" onClick={() => { setEditingLegacyExpense(exp); setIsLegacyEditDialogOpen(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-48 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <ReceiptIndianRupee className="h-16 w-16" />
                              <h3 className="text-sm font-black uppercase tracking-[0.3em]">No procurement logged</h3>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- EDIT DIALOGS --- */}
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
                    <Label className="text-xs font-black uppercase opacity-40 ml-2">Sheep ID</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={editHealthTaskForm.control} name="healthType" render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs font-black uppercase opacity-40 ml-2">Health Type</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
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
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
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
                    <Label className="text-xs font-black uppercase opacity-40 ml-2">Date</Label>
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
                    <Label className="text-xs font-black uppercase opacity-40 ml-2">Pharmacy</Label>
                    <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm px-4" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="ghost" type="button" onClick={() => setIsLegacyEditDialogOpen(false)} className="h-12 px-6 rounded-xl font-bold text-neutral-400">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">Save Audit Adjustment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}