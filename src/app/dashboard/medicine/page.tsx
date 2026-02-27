'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Syringe } from 'lucide-react';
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

const frequencies = ['Once', 'Daily', 'Monthly', 'Every 2 Months', 'Every 6 Months', 'Annually'] as const;
const dewormerNames = ['Albendazole', 'Fenbendazole', 'Ivermectin'] as const;
const vaccineTypes = ['ET + TT', 'PPR', 'Sheep Pox', 'HS', 'FMD', 'Bluetongue'] as const;
const supplementTypes = ['B-Complex', 'Liver Tonic', 'Calcium', 'Multivitamin', 'Mineral Mixture'] as const;

const healthTaskNames = [
    'Deworming',
    'Vitamin & Liver Support',
    'Vaccination',
] as const;

const expenseFormSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  description: z.string().optional(),
  date: z.date({ required_error: 'A date is required.' }),
  costOfMedicines: z.coerce.number().positive('Must be a positive number'),
  totalAmountSpent: z.coerce.number().positive('Must be a positive number'),
  outstandingDues: z.coerce.number().nonnegative('Cannot be negative'),
});

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
});

type MedicineFormData = z.infer<typeof expenseFormSchema>;
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
    defaultValues: { notes: '', frequency: 'Once' },
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
      editHealthTaskForm.reset({
        ...editingHealthTask,
        lastAdministered: new Date(editingHealthTask.lastAdministered),
      } as any);
    }
  }, [editingHealthTask, editHealthTaskForm]);

  const onExpenseSubmit: SubmitHandler<MedicineFormData> = (data) => {
    addMedicineExpense({ ...data, date: format(data.date, 'yyyy-MM-dd') });
    expenseForm.reset();
    toast({ title: 'Success!', description: 'Expense recorded.' });
  };

  const onEditExpenseSubmit: SubmitHandler<MedicineFormData> = (data) => {
    if (!editingMedicineExpense) return;
    updateMedicineExpense(editingMedicineExpense.id, { ...data, date: format(data.date, 'yyyy-MM-dd') });
    setIsExpenseEditDialogOpen(false);
    toast({ title: 'Updated!', description: 'Expense record updated.' });
  };

  const calculateNextDue = (date: Date, type: string, freq: string) => {
    if (type === 'Deworming') return addDays(date, 60);
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
    const nextDueDate = calculateNextDue(data.lastAdministered, data.taskName, data.frequency);
    addHealthTask({
      ...data,
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    });
    healthTaskForm.reset();
    toast({ title: 'Success!', description: 'Task scheduled.' });
  };

  const onEditTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    if (!editingHealthTask) return;
    const nextDueDate = calculateNextDue(data.lastAdministered, data.taskName, data.frequency);
    updateHealthTask(editingHealthTask.id, {
      ...data,
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    });
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
    <div className="container mx-auto py-8">
      <PageHeader title="Medicine & Health" description="Unified management for flock health and medical expenses." />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Health Management</CardTitle>
              <CardDescription>Schedule tasks or record expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="schedule">Schedule Task</TabsTrigger>
                  <TabsTrigger value="expense">Record Expense</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule" className="space-y-4 pt-4">
                  <Form {...healthTaskForm}>
                    <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-4">
                      <FormField control={healthTaskForm.control} name="taskName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>{healthTaskNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )} />

                      {watchedTaskName === 'Deworming' && (
                        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-accent/20 p-4">
                          <FormField control={healthTaskForm.control} name="dewormerName" render={({ field }) => (
                            <FormItem><FormLabel>Dewormer</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{dewormerNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={healthTaskForm.control} name="dosePerKg" render={({ field }) => (<FormItem><FormLabel>Dose/kg (ml)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>)} />
                            <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Total Treated</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                          </div>
                        </div>
                      )}

                      {watchedTaskName === 'Vaccination' && (
                        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-accent/20 p-4">
                          <FormField control={healthTaskForm.control} name="vaccineType" render={({ field }) => (
                            <FormItem><FormLabel>Vaccine</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{vaccineTypes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></FormItem>
                          )} />
                          <FormField control={healthTaskForm.control} name="boosterRequired" render={({ field }) => (
                            <FormItem><FormLabel>Booster?</FormLabel><RadioGroup onValueChange={v => field.onChange(v === 'true')} className="flex gap-4"><div className="flex items-center gap-2"><RadioGroupItem value="true" /> Yes</div><div className="flex items-center gap-2"><RadioGroupItem value="false" /> No</div></RadioGroup></FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                             <FormField control={healthTaskForm.control} name="batchNumber" render={({ field }) => (<FormItem><FormLabel>Batch #</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                             <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Count</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                          </div>
                        </div>
                      )}

                      {watchedTaskName === 'Vitamin & Liver Support' && (
                        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-accent/20 p-4">
                          <FormField control={healthTaskForm.control} name="supplementType" render={({ field }) => (
                            <FormItem><FormLabel>Supplement</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{supplementTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={healthTaskForm.control} name="dosage" render={({ field }) => (<FormItem><FormLabel>Dosage (ml)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField control={healthTaskForm.control} name="totalSheepTreated" render={({ field }) => (<FormItem><FormLabel>Count</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                          </div>
                        </div>
                      )}

                      <FormField control={healthTaskForm.control} name="lastAdministered" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date Given</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left">{field.value ? format(field.value, "PPP") : "Pick date"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                      )} />

                      {watchedTaskName !== 'Deworming' && (
                        <FormField control={healthTaskForm.control} name="frequency" render={({ field }) => (
                          <FormItem><FormLabel>Repeat Frequency</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></FormItem>
                        )} />
                      )}

                      <Button type="submit" className="w-full">Schedule Task</Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="expense" className="space-y-4 pt-4">
                  <Form {...expenseForm}>
                    <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                      <FormField control={expenseForm.control} name="shopName" render={({ field }) => (<FormItem><FormLabel>Shop Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                      <FormField control={expenseForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>What did you buy?</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={expenseForm.control} name="costOfMedicines" render={({ field }) => (<FormItem><FormLabel>Medicine Cost (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={expenseForm.control} name="totalAmountSpent" render={({ field }) => (<FormItem><FormLabel>Total Paid (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                      </div>
                      <FormField control={expenseForm.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Purchase Date</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                      )} />
                      <Button type="submit" className="w-full">Save Expense</Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader><CardTitle>Health Schedule</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Next Due</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sortedHealthTasks.map(task => {
                    const status = getTaskStatus(task.nextDueDate);
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="font-medium">{task.taskName}</div>
                          <div className="text-xs text-muted-foreground">{task.dewormerName || task.vaccineType || task.supplementType}</div>
                        </TableCell>
                        <TableCell>
                          <div>{task.nextDueDate}</div>
                          {status && <Badge variant={status.variant} className="mt-1">{status.label}</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteHealthTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Expense History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shop</TableHead><TableHead>Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sortedMedicineExpenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.date}</TableCell>
                      <TableCell>{exp.shopName}</TableCell>
                      <TableCell>₹{exp.totalAmountSpent}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => {setEditingMedicineExpense(exp); setIsExpenseEditDialogOpen(true)}}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMedicineExpense(exp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isTaskEditDialogOpen} onOpenChange={setIsTaskEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Health Task</DialogTitle></DialogHeader>
          <Form {...editHealthTaskForm}>
            <form onSubmit={editHealthTaskForm.handleSubmit(onEditTaskSubmit)} className="space-y-4">
              <FormField control={editHealthTaskForm.control} name="taskName" render={({ field }) => (
                <FormItem><FormLabel>Task Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{healthTaskNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>
              )} />
              {watchedEditTaskName === 'Deworming' && (
                <div className="grid gap-2 border p-2 rounded">
                  <FormField control={editHealthTaskForm.control} name="dewormerName" render={({ field }) => (<FormItem><FormLabel>Dewormer</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{dewormerNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                </div>
              )}
              <FormField control={editHealthTaskForm.control} name="lastAdministered" render={({ field }) => (<FormItem><FormLabel>Date Given</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full">{field.value ? format(field.value, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover></FormItem>)} />
              <Button type="submit" className="w-full">Update Task</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
