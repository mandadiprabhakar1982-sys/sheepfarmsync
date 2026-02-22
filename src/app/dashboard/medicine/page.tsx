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


const expenseFormSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  date: z.date({ required_error: 'A date is required.' }),
  costOfMedicines: z.coerce.number().positive('Must be a positive number'),
  totalAmountSpent: z.coerce.number().positive('Must be a positive number'),
  outstandingDues: z.coerce.number().nonnegative('Cannot be negative'),
});

type MedicineFormData = z.infer<typeof expenseFormSchema>;

const frequencies = ['Once', 'Daily', 'Monthly', 'Every 6 Months', 'Annually'] as const;

const healthTaskFormSchema = z.object({
  taskName: z.string().min(1, 'Task name is required.'),
  lastAdministered: z.date({ required_error: 'A date is required.' }),
  frequency: z.enum(frequencies),
  notes: z.string().optional(),
});

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
    defaultValues: { shopName: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 },
  });
  
  const editExpenseForm = useForm<MedicineFormData>({
    resolver: zodResolver(expenseFormSchema),
  });

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { taskName: '', notes: '' },
  });

  const editHealthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
  });

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
      editHealthTaskForm.reset({ ...editingHealthTask, lastAdministered: new Date(editingHealthTask.lastAdministered) });
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
      case 'Every 6 Months': return addMonths(lastDate, 6);
      case 'Annually': return addMonths(lastDate, 12);
      case 'Once':
      default:
        return lastDate;
    }
  };

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    const nextDueDate = getNextDueDate(data.lastAdministered, data.frequency);
    const newTask = {
      ...data,
      lastAdministered: format(data.lastAdministered, 'yyyy-MM-dd'),
      nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
    };
    addHealthTask(newTask);
    healthTaskForm.reset();
    toast({ title: 'Success!', description: 'Health task has been scheduled.' });
  };
  
  const onEditHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    if (!editingHealthTask) return;
    const nextDueDate = getNextDueDate(data.lastAdministered, data.frequency);
    const updatedTask = {
      ...data,
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
    const date = new Date(dueDate);
    const daysDiff = differenceInDays(date, today);

    if (daysDiff < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (daysDiff <= 7) return { label: 'Due Soon', variant: 'secondary' as const };
    return null;
  };


  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Medicine & Health" description="Track medicine costs and manage your flock's health schedule." />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
         <div className="space-y-8">
            <Card>
            <CardHeader><CardTitle>Add New Expense</CardTitle><CardDescription>Fill out the form below.</CardDescription></CardHeader>
            <CardContent>
              <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                  <FormField control={expenseForm.control} name="shopName" render={({ field }) => ( <FormItem><FormLabel>Medicine Shop</FormLabel><FormControl><Input placeholder="e.g., Farmacy" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={expenseForm.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of Purchase</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                  <FormField control={expenseForm.control} name="costOfMedicines" render={({ field }) => ( <FormItem><FormLabel>Cost of Medicines (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={expenseForm.control} name="totalAmountSpent" render={({ field }) => ( <FormItem><FormLabel>Total Amount Spent (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={expenseForm.control} name="outstandingDues" render={({ field }) => ( <FormItem><FormLabel>Outstanding Dues (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Add Expense</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Expense History</CardTitle></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shop</TableHead><TableHead>Total</TableHead><TableHead>Dues</TableHead><TableHead className='text-right'>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sortedMedicineExpenses && sortedMedicineExpenses.length > 0 ? (
                    sortedMedicineExpenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{format(new Date(e.date), 'PPP')}</TableCell><TableCell>{e.shopName}</TableCell>
                        <TableCell>₹{e.totalAmountSpent.toFixed(2)}</TableCell>
                        <TableCell className={e.outstandingDues > 0 ? 'text-destructive' : ''}>₹{e.outstandingDues.toFixed(2)}</TableCell>
                         <TableCell className='text-right'><div className="flex items-center justify-end"><Button variant="ghost" size="icon" onClick={() => handleEditExpenseClick(e)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                      </TableRow>
                    ))
                  ) : ( <TableRow><TableCell colSpan={5} className="text-center">No expenses recorded yet.</TableCell></TableRow> )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
         </div>
         <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6" />Health Tracker</CardTitle><CardDescription>Schedule and track recurring health tasks for your flock.</CardDescription></CardHeader>
              <CardContent>
                <Form {...healthTaskForm}>
                  <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-4">
                     <FormField control={healthTaskForm.control} name="taskName" render={({ field }) => ( <FormItem><FormLabel>Task Name</FormLabel><FormControl><Input placeholder="e.g., Deworming, PPR Vaccine" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <div className="grid grid-cols-2 gap-4">
                       <FormField control={healthTaskForm.control} name="lastAdministered" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Last Administered</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                       <FormField control={healthTaskForm.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Frequency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl><SelectContent>{frequencies.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
                     </div>
                     <FormField control={healthTaskForm.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Dewormer name: Albendazole, Dosage: 5ml" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Schedule Task</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Scheduled Tasks</CardTitle></CardHeader>
              <CardContent>
                <Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Next Due Date</TableHead><TableHead>Notes</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {sortedHealthTasks && sortedHealthTasks.length > 0 ? (
                      sortedHealthTasks.map((task) => {
                        const status = getTaskStatus(task.nextDueDate);
                        return (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.taskName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{format(new Date(task.nextDueDate), 'PPP')}</span>
                                {status && <Badge variant={status.variant} className="w-fit mt-1">{status.label}</Badge>}
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
         </div>
      </div>

      <Dialog open={isExpenseEditDialogOpen} onOpenChange={setIsExpenseEditDialogOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Medicine Expense</DialogTitle><DialogDescription>Update the details of your medicine expense. Click save when you're done.</DialogDescription></DialogHeader>
          <Form {...editExpenseForm}><form onSubmit={editExpenseForm.handleSubmit(onEditExpenseSubmit)} className="space-y-4 py-4">
              <FormField control={editExpenseForm.control} name="shopName" render={({ field }) => (<FormItem><FormLabel>Medicine Shop</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
              <FormField control={editHealthTaskForm.control} name="taskName" render={({ field }) => ( <FormItem><FormLabel>Task Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editHealthTaskForm.control} name="lastAdministered" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Last Administered</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>{field.value ? (format(field.value, 'PPP')) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <FormField control={editHealthTaskForm.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Frequency</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{frequencies.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
              </div>
              <FormField control={editHealthTaskForm.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form></Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
