
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Syringe, BadgeIndianRupee } from 'lucide-react';
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
    'Other',
] as const;

const healthTaskFormSchema = z.object({
  taskName: z.enum(healthTaskNames, { required_error: 'Please select a task.' }),
  lastAdministered: z.date({ required_error: 'A date is required.' }),
  frequency: z.enum(frequencies),
  notes: z.string().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  
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

type HealthTaskFormData = z.infer<typeof healthTaskFormSchema>;

export default function MedicinePage() {
  const { toast } = useToast();
  const { medicineExpenses, deleteMedicineExpense, healthTasks, addHealthTask, deleteHealthTask, updateHealthTask } = useFarm();
  
  const [isTaskEditDialogOpen, setIsTaskEditDialogOpen] = useState(false);
  const [editingHealthTask, setEditingHealthTask] = useState<HealthTask | null>(null);

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { notes: '', frequency: 'Once', cost: 0 },
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
    if (editingHealthTask) {
      editHealthTaskForm.reset({
        ...editingHealthTask,
        lastAdministered: new Date(editingHealthTask.lastAdministered),
      } as any);
    }
  }, [editingHealthTask, editHealthTaskForm]);

  const calculateNextDue = (date: Date, type: string, freq: string, vaccine?: string) => {
    if (type === 'Deworming') return addDays(date, 60);
    
    // Auto-calculate vaccination schedules if frequency is not explicitly changed
    if (type === 'Vaccination') {
       if (vaccine === 'ET + TT' || vaccine === 'HS' || vaccine === 'FMD') return addMonths(date, 6);
       return addMonths(date, 12); // Default for PPR, Sheep Pox, etc.
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

  const onEditTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    if (!editingHealthTask) return;
    const nextDueDate = calculateNextDue(data.lastAdministered, data.taskName, data.frequency, data.vaccineType);
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
              <CardTitle>Health Tracker & Expenses</CardTitle>
              <CardDescription>Schedule tasks and record associated costs in one go.</CardDescription>
            </CardHeader>
            <CardContent>
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

                  {watchedTaskName === 'Other' && (
                     <div className="grid grid-cols-1 gap-4 rounded-lg border bg-accent/20 p-4">
                        <FormField control={healthTaskForm.control} name="notes" render={({ field }) => (
                          <FormItem><FormLabel>Describe Task</FormLabel><FormControl><Textarea placeholder="e.g. Hoof trimming, special medicine" {...field} /></FormControl></FormItem>
                        )} />
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={healthTaskForm.control} name="lastAdministered" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Date Given</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left px-3">{field.value ? format(field.value, "MM/dd/yy") : "Pick date"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                    )} />
                    <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (
                      <FormItem><FormLabel>Cost (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  {watchedTaskName !== 'Deworming' && (
                    <FormField control={healthTaskForm.control} name="frequency" render={({ field }) => (
                      <FormItem><FormLabel>Repeat Frequency</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></FormItem>
                    )} />
                  )}

                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Save Task & Expense
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader><CardTitle>Health Schedule & History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHealthTasks.map(task => {
                    const status = getTaskStatus(task.nextDueDate);
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="font-medium">{task.taskName}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.dewormerName || task.vaccineType || task.supplementType || task.notes?.substring(0, 20)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{task.nextDueDate}</div>
                          {status && <Badge variant={status.variant} className="mt-1">{status.label}</Badge>}
                        </TableCell>
                        <TableCell>₹{(task.cost || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {setEditingHealthTask(task); setIsTaskEditDialogOpen(true)}}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteHealthTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sortedHealthTasks.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No tasks recorded yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Legacy Expenses</CardTitle><CardDescription>Expenses recorded before the unified health tracker.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shop/Description</TableHead><TableHead>Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sortedMedicineExpenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{exp.shopName}</div>
                        <div className="text-xs text-muted-foreground">{exp.description}</div>
                      </TableCell>
                      <TableCell>₹{exp.totalAmountSpent.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteMedicineExpense(exp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   {sortedMedicineExpenses.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground italic">No legacy expenses.</TableCell></TableRow>
                  )}
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editHealthTaskForm.control} name="lastAdministered" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date Given</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full text-left font-normal">{field.value ? format(field.value, "MM/dd/yy") : "Pick date"}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover></FormItem>)} />
                <FormField control={editHealthTaskForm.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Cost (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
              </div>
              
              <Button type="submit" className="w-full">Update Task</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
