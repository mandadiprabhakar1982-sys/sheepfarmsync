'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, ShieldCheck } from 'lucide-react';
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
import type { MedicineExpense, HealthTask } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const expenseFormSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  description: z.string().optional(),
  date: z.date({ required_error: 'A date is required.' }),
  costOfMedicines: z.coerce.number().positive('Must be a positive number'),
  totalAmountSpent: z.coerce.number().positive('Must be a positive number'),
  outstandingDues: z.coerce.number().nonnegative('Cannot be negative'),
});

type MedicineFormData = z.infer<typeof expenseFormSchema>;

const frequencies = ['Once', 'Daily', 'Monthly', 'Every 2 Months', 'Every 6 Months', 'Annually'] as const;
const dewormerNames = ['Albendazole', 'Fenbendazole', 'Ivermectin'] as const;
const vaccineTypes = ['ET + TT', 'PPR', 'Sheep Pox', 'HS', 'FMD', 'Bluetongue'] as const;
const supplementTypes = ['B-Complex', 'Liver Tonic', 'Calcium', 'Multivitamin', 'Mineral Mixture'] as const;

const healthTaskNames = [
    'Deworming',
    'Vitamin & Liver Support',
    'Vaccination',
] as const;

const healthTaskFormSchema = z.object({
  taskName: z.enum(healthTaskNames, { required_error: 'Please select a task.' }),
  lastAdministered: z.date({ required_error: 'A date is required.' }),
  frequency: z.enum(frequencies),
  notes: z.string().optional(),
  
  // Deworming specific fields
  dewormerName: z.enum(dewormerNames).optional(),
  dosePerKg: z.coerce.number().positive().optional(),
  
  // Vaccination specific fields
  vaccineType: z.enum(vaccineTypes).optional(),
  boosterRequired: z.boolean().optional(),
  batchNumber: z.string().optional(),

  // Vitamin & Supplement specific fields
  supplementType: z.enum(supplementTypes).optional(),
  dosage: z.string().optional(),
  
  // Common field
  totalSheepTreated: z.coerce.number().int().positive().optional(),
}).refine(data => {
    if (data.taskName === 'Deworming') {
        return !!data.dewormerName && data.dewormerName.length > 0;
    }
    return true;
}, {
    message: 'Dewormer name is required for deworming tasks.',
    path: ['dewormerName'],
}).refine(data => {
    if (data.taskName === 'Deworming') {
        return data.dosePerKg !== undefined && data.dosePerKg > 0;
    }
    return true;
}, {
    message: 'Dose per kg is required.',
    path: ['dosePerKg'],
}).refine(data => {
    if (data.taskName === 'Deworming') {
        return data.totalSheepTreated !== undefined && data.totalSheepTreated > 0;
    }
    return true;
}, {
    message: 'Total sheep treated is required.',
    path: ['totalSheepTreated'],
}).refine(data => {
    if (data.taskName === 'Vaccination') {
        return !!data.vaccineType;
    }
    return true;
}, {
    message: 'Vaccine type is required.',
    path: ['vaccineType'],
}).refine(data => {
    if (data.taskName === 'Vaccination') {
        return data.boosterRequired !== undefined;
    }
    return true;
}, {
    message: 'Please specify if a booster is required.',
    path: ['boosterRequired'],
}).refine(data => {
    if (data.taskName === 'Vaccination') {
        return !!data.batchNumber && data.batchNumber.length > 0;
    }
    return true;
}, {
    message: 'Batch number is required.',
    path: ['batchNumber'],
}).refine(data => {
    if (data.taskName === 'Vaccination') {
        return data.totalSheepTreated !== undefined && data.totalSheepTreated > 0;
    }
    return true;
}, {
    message: 'Treated count is required.',
    path: ['totalSheepTreated'],
}).refine(data => {
    if (data.taskName === 'Vitamin & Liver Support') return !!data.supplementType;
    return true;
}, { message: 'Supplement type is required.', path: ['supplementType'] })
.refine(data => {
    if (data.taskName === 'Vitamin & Liver Support') return !!data.dosage && data.dosage.length > 0;
    return true;
}, { message: 'Dosage is required.', path: ['dosage'] })
.refine(data => {
    if (data.taskName === 'Vitamin & Liver Support') return data.totalSheepTreated !== undefined && data.totalSheepTreated > 0;
    return true;
}, { message: 'Treated count is required.', path: ['totalSheepTreated'] });


type HealthTaskFormData = z.infer<typeof healthTaskFormSchema>;


export default function MedicinePage() {
  const { toast } = useToast();
  const { medicineExpenses, addMedicineExpense, deleteMedicineExpense, updateMedicineExpense, healthTasks, addHealthTask, deleteHealthTask, updateHealthTask } = useFarm();
  
  const [isExpenseEditDialogOpen, setIsExpenseEditDialogOpen] = useState(false);
  const [editingMedicineExpense, setEditingMedicineExpense] = useState<MedicineExpense | null>(null);

  const [isTaskEditDialogOpen, setIsTaskEditDialogOpen] = useState(false);
  const [editingHealthTask, setEditingHealthTask] = useState<HealthTask | null>(null);


  const expenseForm = useForm<MedicineFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { shopName: '', description: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 },
  });
  
  const editExpenseForm = useForm<MedicineFormData>({
    resolver: zodResolver(expenseFormSchema),
  });

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { notes: '' },
  });
  
  const editHealthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
  });

  const watchedTaskName = healthTaskForm.watch('taskName');
  const watchedEditTaskName = editHealthTaskForm.watch('taskName');

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    return [...healthTasks].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [healthTasks]);


  useEffect(() => {
    if (editingMedicineExpense) {
      editExpenseForm.reset({ ...editingMedicineExpense, date: new Date(editingMedicineExpense.date) });
    }
  }, [editingMedicineExpense, editExpenseForm]);

  useEffect(() => {
    if (editingHealthTask) {
      const taskData = {
        ...editingHealthTask,
        lastAdministered: new Date(editingHealthTask.lastAdministered),
        taskName: healthTaskNames.includes(editingHealthTask.taskName as any) ? editingHealthTask.taskName as typeof healthTaskNames[number] : undefined,
      };
      editHealthTaskForm.reset(taskData as any);
    }
  }, [editingHealthTask, editHealthTaskForm]);


  const onExpenseSubmit: SubmitHandler<MedicineFormData> = (data) => {
    const newExpense = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addMedicineExpense(newExpense);
    expenseForm.reset();
    toast({ title: 'Success!', description: 'Medicine expense has been recorded.' });
  };

  const onEditExpenseSubmit: SubmitHandler<MedicineFormData> = (data) => {
    if (!editingMedicineExpense) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateMedicineExpense(editingMedicineExpense.id, updatedData);
    setIsExpenseEditDialogOpen(false);
    setEditingMedicineExpense(null);
    toast({ title: 'Updated!', description: 'Medicine expense record has been updated successfully.' });
  };
  
  const handleDeleteExpense = (id: string) => {
    deleteMedicineExpense(id);
     toast({ title: 'Deleted', description: 'Expense record has been deleted.', variant: 'destructive' });
  }

  const handleEditExpenseClick = (expense: MedicineExpense) => {
    setEditingMedicineExpense(expense);
    setIsExpenseEditDialogOpen(true);
  };

  const getNextDueDate = (lastDate: Date, freq: HealthTask['frequency']) => {
    switch (freq) {
      case 'Daily': return addDays(lastDate, 1);
      case 'Monthly': return addMonths(lastDate, 1);
      case 'Every 2 Months': return addMonths(lastDate, 2);
      case 'Every 6 Months': return addMonths(lastDate, 6);
      case 'Annually': return addMonths(lastDate, 12);
      case 'Once':
      default:
        return lastDate;
    }
  };

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    const isDeworming = data.taskName === 'Deworming';
    const frequency = isDeworming ? 'Every 2 Months' : data.frequency;
    
    // Server-side calculation or client-side? Here we do it on client.
    const nextDueDate = isDeworming
      ? addDays(data.lastAdministered, 60)
      : getNextDueDate(data.lastAdministered, data.frequency);
      
    const newTask = {
      ...data,
      frequency, // Set frequency for deworming
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    };
    addHealthTask(newTask);
    healthTaskForm.reset();
    toast({ title: 'Success!', description: 'Health task has been scheduled.' });
  };
  
  const onEditHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    if (!editingHealthTask) return;
    const isDeworming = data.taskName === 'Deworming';
    const frequency = isDeworming ? 'Every 2 Months' : data.frequency;

    const nextDueDate = isDeworming
      ? addDays(data.lastAdministered, 60)
      : getNextDueDate(data.lastAdministered, data.frequency);

    const updatedTask = {
      ...data,
      frequency,
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    };
    updateHealthTask(editingHealthTask.id, updatedTask);
    setIsTaskEditDialogOpen(false);
    setEditingHealthTask(null);
    toast({ title: 'Updated!', description: 'Health task has been updated.' });
  };
  
  const handleDeleteHealthTask = (id: string) => {
    deleteHealthTask(id);
    toast({ title: 'Deleted', description: 'Health task has been deleted.', variant: 'destructive' });
  };

  const handleEditHealthTaskClick = (task: HealthTask) => {
    setEditingHealthTask(task);
    setIsTaskEditDialogOpen(true);
  };

  const getTaskStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const date = new Date(dueDate);
     date.setHours(0,0,0,0);
    const daysDiff = differenceInDays(date, today);

    if (daysDiff < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (daysDiff === 0) return { label: 'Due Today', variant: 'default' as const };
    if (daysDiff <= 7) return { label: 'Due Soon', variant: 'secondary' as const };
    return null;
  };


  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Medicine &amp; Health" description="Manage health tasks and medicine expenses in one place." />
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Health &amp; Medicine Management</CardTitle>
            <CardDescription>
              Schedule a new health task for your flock or record a medicine purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="schedule">Schedule Task</TabsTrigger>
                <TabsTrigger value="expense">Record Expense</TabsTrigger>
              </TabsList>
              <TabsContent value="schedule" className="mt-6">
                <Form {...healthTaskForm}>
                  <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-4">
                     <FormField control={healthTaskForm.control} name="taskName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Name</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a task" /></SelectTrigger></FormControl>
                              <SelectContent>{healthTaskNames.map((task) => (<SelectItem key={task} value={task}>{task}</SelectItem>))}</SelectContent>
                            </Select><FormMessage />
                          </FormItem>)} />
                      
                      {watchedTaskName === 'Deworming' && (
                        <>
                           <FormField control={healthTaskForm.control} name="dewormerName" render={({ field }) => (
                              <FormItem><FormLabel>Dewormer Name</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select a dewormer" /></SelectTrigger></FormControl>
                                  <SelectContent>{dewormerNames.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent>
                                </Select><FormMessage />
                              </FormItem>)} />
                           <div className="grid grid-cols-2 gap-4">
                            <FormField control={healthTaskForm.control} name="dosePerKg" render={({ field }) => (<FormItem><FormLabel>Dose per kg (ml)</FormLabel><FormControl><Input type="number" placeholder="e.g., 0.5" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Total Sheep Treated</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                        </>
                      )}

                       {watchedTaskName === 'Vaccination' && (
                        <>
                          <FormField control={healthTaskForm.control} name="vaccineType" render={({ field }) => (
                            <FormItem><FormLabel>Vaccine Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a vaccine" /></SelectTrigger></FormControl>
                                <SelectContent>{vaccineTypes.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent>
                              </Select><FormMessage />
                            </FormItem>)} />
                          
                           <FormField control={healthTaskForm.control} name="boosterRequired" render={({ field }) => (
                            <FormItem className="space-y-2"><FormLabel>Booster Required?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={String(field.value)} className="flex items-center gap-4">
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="true" /></FormControl>
                                    <FormLabel className="font-normal">Yes</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="false" /></FormControl>
                                    <FormLabel className="font-normal">No</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl><FormMessage />
                            </FormItem>)} />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={healthTaskForm.control} name="batchNumber" render={({ field }) => (<FormItem><FormLabel>Batch Number</FormLabel><FormControl><Input placeholder="e.g., V-123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Treated Count</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                        </>
                      )}

                      {watchedTaskName === 'Vitamin & Liver Support' && (
                        <>
                          <FormField control={healthTaskForm.control} name="supplementType" render={({ field }) => (
                              <FormItem><FormLabel>Supplement Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select a supplement" /></SelectTrigger></FormControl>
                                  <SelectContent>{supplementTypes.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent>
                                </Select><FormMessage />
                              </FormItem>)} />
                           <div className="grid grid-cols-2 gap-4">
                            <FormField control={healthTaskForm.control} name="dosage" render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 5ml" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Total Sheep Treated</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                        </>
                      )}

                      <FormField control={healthTaskForm.control} name="lastAdministered" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date Given</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                       
                       {watchedTaskName !== 'Deworming' && (
                         <FormField control={healthTaskForm.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Next Due Date</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl><SelectContent>{frequencies.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
                       )}

                     <FormField control={healthTaskForm.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Remarks (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., B-Complex, 2ml injection" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Schedule Task</Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="expense" className="mt-6">
                 <Form {...expenseForm}>
                  <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                    <FormField control={expenseForm.control} name="shopName" render={({ field }) => ( <FormItem><FormLabel>Medicine Shop</FormLabel><FormControl><Input placeholder="e.g., Farmacy" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField
                      control={expenseForm.control}
                      name="description"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                              <Textarea
                                  placeholder="e.g., Anti-parasitic medicine, wound spray"
                                  {...field}
                              />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                    />
                    <FormField control={expenseForm.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of Purchase</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                    <FormField control={expenseForm.control} name="costOfMedicines" render={({ field }) => ( <FormItem><FormLabel>Cost of Medicines (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={expenseForm.control} name="totalAmountSpent" render={({ field }) => ( <FormItem><FormLabel>Total Amount Spent (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={expenseForm.control} name="outstandingDues" render={({ field }) => ( <FormItem><FormLabel>Outstanding Dues (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Add Expense</Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Scheduled Tasks</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Next Due Date</TableHead><TableHead>Remarks</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {sortedHealthTasks && sortedHealthTasks.length > 0 ? (
                  sortedHealthTasks.map((task) => {
                    const status = getTaskStatus(task.nextDueDate);
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span>{task.taskName}</span>
                                 {task.taskName === 'Deworming' && (
                                    <div className="text-xs text-muted-foreground">
                                      {task.dewormerName && <p>{task.dewormerName}</p>}
                                      {task.dosePerKg && <p>Dose: {task.dosePerKg}ml/kg</p>}
                                      {task.totalSheepTreated && <p>Treated: {task.totalSheepTreated}</p>}
                                    </div>
                                )}
                                 {task.taskName === 'Vaccination' && (
                                    <div className="text-xs text-muted-foreground">
                                      {task.vaccineType && <p>{task.vaccineType}</p>}
                                      {task.batchNumber && <p>Batch: {task.batchNumber}</p>}
                                      {task.totalSheepTreated && <p>Treated: {task.totalSheepTreated}</p>}
                                    </div>
                                )}
                                {task.taskName === 'Vitamin & Liver Support' && (
                                  <div className="text-xs text-muted-foreground">
                                    {task.supplementType && <p>{task.supplementType}</p>}
                                    {task.dosage && <p>Dose: {task.dosage}</p>}
                                    {task.totalSheepTreated && <p>Treated: {task.totalSheepTreated}</p>}
                                  </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{format(new Date(task.nextDueDate), 'PPP')}</span>
                            {status && <Badge variant={status.variant} className="w-fit">{status.label}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{task.notes || 'N/A'}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center justify-end"><Button variant="ghost" size="icon" onClick={() => handleEditHealthTaskClick(task)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteHealthTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                      </TableRow>
                    )
                  })
                ) : (<TableRow><TableCell colSpan={4} className="text-center">No health tasks scheduled yet.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expense History</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shop</TableHead><TableHead>Description</TableHead><TableHead>Total</TableHead><TableHead>Dues</TableHead><TableHead className='text-right'>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {sortedMedicineExpenses && sortedMedicineExpenses.length > 0 ? (
                  sortedMedicineExpenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{format(new Date(e.date), 'PPP')}</TableCell>
                      <TableCell>{e.shopName}</TableCell>
                      <TableCell>{e.description || 'N/A'}</TableCell>
                      <TableCell>₹{e.totalAmountSpent.toFixed(2)}</TableCell>
                      <TableCell className={e.outstandingDues > 0 ? 'text-destructive' : ''}>₹{e.outstandingDues.toFixed(2)}</TableCell>
                       <TableCell className='text-right'><div className="flex items-center justify-end"><Button variant="ghost" size="icon" onClick={() => handleEditExpenseClick(e)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                    </TableRow>
                  ))
                ) : ( <TableRow><TableCell colSpan={6} className="text-center">No expenses recorded yet.</TableCell></TableRow> )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isExpenseEditDialogOpen} onOpenChange={setIsExpenseEditDialogOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Medicine Expense</DialogTitle><DialogDescription>Update the details of your medicine expense. Click save when you're done.</DialogDescription></DialogHeader>
          <Form {...editExpenseForm}><form onSubmit={editExpenseForm.handleSubmit(onEditExpenseSubmit)} className="space-y-4 py-4">
              <FormField control={editExpenseForm.control} name="shopName" render={({ field }) => (<FormItem><FormLabel>Medicine Shop</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField
                control={editExpenseForm.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="e.g., Anti-parasitic medicine, wound spray"
                        {...field}
                        value={field.value || ''}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
              <FormField control={editExpenseForm.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Purchase</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              <FormField control={editExpenseForm.control} name="costOfMedicines" render={({ field }) => (<FormItem><FormLabel>Cost of Medicines (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editExpenseForm.control} name="totalAmountSpent" render={({ field }) => (<FormItem><FormLabel>Total Amount Spent (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editExpenseForm.control} name="outstandingDues" render={({ field }) => (<FormItem><FormLabel>Outstanding Dues (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form></Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskEditDialogOpen} onOpenChange={setIsTaskEditDialogOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Health Task</DialogTitle><DialogDescription>Update the details of your scheduled task.</DialogDescription></DialogHeader>
          <Form {...editHealthTaskForm}><form onSubmit={editHealthTaskForm.handleSubmit(onEditHealthTaskSubmit)} className="space-y-4 py-4">
              <FormField control={editHealthTaskForm.control} name="taskName" render={({ field }) => (
                  <FormItem><FormLabel>Task Name</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a task" /></SelectTrigger></FormControl>
                        <SelectContent>{healthTaskNames.map((task) => (<SelectItem key={task} value={task}>{task}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                  </FormItem>)} />

              {watchedEditTaskName === 'Deworming' && (
                 <>
                    <FormField control={editHealthTaskForm.control} name="dewormerName" render={({ field }) => (
                      <FormItem><FormLabel>Dewormer Name</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a dewormer" /></SelectTrigger></FormControl>
                          <SelectContent>{dewormerNames.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={editHealthTaskForm.control} name="dosePerKg" render={({ field }) => (<FormItem><FormLabel>Dose per kg (ml)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={editHealthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Total Sheep Treated</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </>
              )}
              
               {watchedEditTaskName === 'Vaccination' && (
                <>
                  <FormField control={editHealthTaskForm.control} name="vaccineType" render={({ field }) => (
                    <FormItem><FormLabel>Vaccine Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a vaccine" /></SelectTrigger></FormControl>
                        <SelectContent>{vaccineTypes.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>)} />
                  
                   <FormField control={editHealthTaskForm.control} name="boosterRequired" render={({ field }) => (
                    <FormItem className="space-y-2"><FormLabel>Booster Required?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={String(field.value)} className="flex items-center gap-4">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="true" /></FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="false" /></FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl><FormMessage />
                    </FormItem>)} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={editHealthTaskForm.control} name="batchNumber" render={({ field }) => (<FormItem><FormLabel>Batch Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={editHealthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Treated Count</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </>
              )}
              
              {watchedEditTaskName === 'Vitamin & Liver Support' && (
                <>
                  <FormField control={editHealthTaskForm.control} name="supplementType" render={({ field }) => (
                      <FormItem><FormLabel>Supplement Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a supplement" /></SelectTrigger></FormControl>
                          <SelectContent>{supplementTypes.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={editHealthTaskForm.control} name="dosage" render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 5ml" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={editHealthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Total Sheep Treated</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </>
              )}


              <FormField control={editHealthTaskForm.control} name="lastAdministered" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date Given</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
              
              {watchedEditTaskName !== 'Deworming' && (
                <FormField control={editHealthTaskForm.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Next Due Date</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{frequencies.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
              )}

              <FormField control={editHealthTaskForm.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Remarks (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form></Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    