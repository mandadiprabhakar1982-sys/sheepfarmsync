'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import type { MedicineExpense } from '@/lib/types';


const formSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  date: z.date({ required_error: 'A date is required.' }),
  costOfMedicines: z.coerce.number().positive('Must be a positive number'),
  totalAmountSpent: z.coerce.number().positive('Must be a positive number'),
  outstandingDues: z.coerce.number().nonnegative('Cannot be negative'),
});

type MedicineFormData = z.infer<typeof formSchema>;

export default function MedicinePage() {
  const { toast } = useToast();
  const { medicineExpenses, addMedicineExpense, deleteMedicineExpense, updateMedicineExpense } = useFarm();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMedicineExpense, setEditingMedicineExpense] = useState<MedicineExpense | null>(null);

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopName: '',
      costOfMedicines: 0,
      totalAmountSpent: 0,
      outstandingDues: 0,
    },
  });
  
  const editForm = useForm<MedicineFormData>({
    resolver: zodResolver(formSchema),
  });

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  useEffect(() => {
    if (editingMedicineExpense) {
      editForm.reset({
        ...editingMedicineExpense,
        date: new Date(editingMedicineExpense.date),
      });
    }
  }, [editingMedicineExpense, editForm]);

  const onSubmit: SubmitHandler<MedicineFormData> = (data) => {
    const newExpense = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addMedicineExpense(newExpense);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Medicine expense has been recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<MedicineFormData> = (data) => {
    if (!editingMedicineExpense) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateMedicineExpense(editingMedicineExpense.id, updatedData);
    setIsEditDialogOpen(false);
    setEditingMedicineExpense(null);
    toast({
      title: 'Updated!',
      description: 'Medicine expense record has been updated successfully.',
    });
  };
  
  const handleDeleteExpense = (id: string) => {
    deleteMedicineExpense(id);
     toast({
      title: 'Deleted',
      description: 'Expense record has been deleted.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (expense: MedicineExpense) => {
    setEditingMedicineExpense(expense);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Medicine Costs"
        description="Track costs for animal health and medicine."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine Shop</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Farmacy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Purchase</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costOfMedicines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost of Medicines (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmountSpent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount Spent (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="outstandingDues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outstanding Dues (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Dues</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMedicineExpenses && sortedMedicineExpenses.length > 0 ? (
                    sortedMedicineExpenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.shopName}</TableCell>
                        <TableCell>₹{e.costOfMedicines.toFixed(2)}</TableCell>
                        <TableCell>₹{e.totalAmountSpent.toFixed(2)}</TableCell>
                        <TableCell className={e.outstandingDues > 0 ? 'text-destructive' : ''}>
                          ₹{e.outstandingDues.toFixed(2)}
                        </TableCell>
                         <TableCell className='text-right'>
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(e)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(e.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No expenses recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Medicine Expense</DialogTitle>
            <DialogDescription>
              Update the details of your medicine expense. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
               <FormField
                    control={editForm.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine Shop</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Purchase</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="costOfMedicines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost of Medicines (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="totalAmountSpent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount Spent (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="outstandingDues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outstanding Dues (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
