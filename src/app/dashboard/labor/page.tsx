
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Users, ClipboardList, Wallet, ReceiptIndianRupee } from 'lucide-react';
import { format } from 'date-fns';

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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type { LaborCost } from '@/lib/types';
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
  const { laborCosts, addLaborCost, deleteLaborCost, updateLaborCost } = useFarm();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLaborCost, setEditingLaborCost] = useState<LaborCost | null>(null);
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

  const editForm = useForm<LaborFormData>({
    resolver: zodResolver(formSchema),
  });

  const sortedLaborCosts = useMemo(() => {
    if (!laborCosts) return [];
    return [...laborCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [laborCosts]);

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
  
  const watchedEditFields = editForm.watch([
    'wages',
    'numberOfLaborers',
    'advancePayments',
    'foodCosts',
    'fuelCosts',
  ]);

  useEffect(() => {
    if (!isEditDialogOpen) return;
    const [wages, num, advance, food, fuel] = watchedEditFields;
    const totalWages = (wages || 0) * (num || 1);
    const total = totalWages + (advance || 0) + (food || 0) + (fuel || 0);
    editForm.setValue('totalLaborCosts', total);
  }, [watchedEditFields, editForm, isEditDialogOpen]);

  useEffect(() => {
    if (editingLaborCost) {
      editForm.reset({
        ...editingLaborCost,
        date: new Date(editingLaborCost.date),
      });
    }
  }, [editingLaborCost, editForm]);


  const onSubmit: SubmitHandler<LaborFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addLaborCost(newCost);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Employee cost has been recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<LaborFormData> = (data) => {
    if (!editingLaborCost) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateLaborCost(editingLaborCost.id, updatedData, editingLaborCost._path);
    setIsEditDialogOpen(false);
    setEditingLaborCost(null);
    toast({
      title: 'Updated!',
      description: 'Employee cost record has been updated successfully.',
    });
  };
  
   const handleDeleteCost = (id: string, path?: string) => {
    deleteLaborCost(id, path);
     toast({
      title: 'Deleted',
      description: 'Cost record has been deleted.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (cost: LaborCost) => {
    setEditingLaborCost(cost);
    setIsEditDialogOpen(true);
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl">
      <div className="mb-12 relative">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-[#A68A56] rounded-full" />
          <h1 className="text-2xl font-black text-neutral-900">Employee Costs</h1>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-1 pl-4">
          DOCUMENT ALL EXPENSES RELATED TO FARM EMPLOYEES.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* --- LABOR ENTRY FORM --- */}
        <div className="lg:col-span-4">
          <Card className="border-none bg-[#FDFBF0] rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-24 border-t-4 border-[#A68A56]">
            <CardHeader className="p-8 pb-4 bg-[#A68A56] text-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight uppercase">Add New Employee Cost</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-[8px] font-bold uppercase tracking-widest">FILL OUT THE FORM BELOW.</CardDescription>
                </div>
                <Users className="h-6 w-6 opacity-40" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="employeeName"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Employee Name</Label>
                        <FormControl>
                          <Input placeholder="e.g., Ram Singh" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm px-4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Date</Label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button type="button" variant={'outline'} className={cn('h-12 rounded-xl bg-white border-none shadow-sm font-bold text-left px-4 text-xs', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none rounded-2xl shadow-2xl" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="numberOfLaborers" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Number of Employees</Label>
                        <FormControl><Input type="number" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-sm px-4" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wages"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Wages per Employee (₹)</Label>
                        <FormControl>
                          <Input type="number" step="0.01" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-sm px-4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="advancePayments" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Advance Payments (₹)</Label>
                        <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-sm px-4" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="foodCosts" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Food Costs (₹)</Label>
                        <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-sm px-4" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="fuelCosts" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Fuel Costs (₹)</Label>
                        <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-sm px-4" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="totalLaborCosts" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Employee Costs (₹)</Label>
                        <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-100 border-none shadow-inner font-black text-sm px-4" {...field} readOnly /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl bg-[#0a365c] hover:bg-[#051d36] text-white border-none flex items-center justify-center gap-3">
                    <PlusCircle className="h-4 w-4 text-emerald-400" />
                    ADD EMPLOYEE COST
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* --- LABOR HISTORY LEDGER --- */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-[#708090]/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#708090]/10 to-[#2c3e50]/20 opacity-50 pointer-events-none" />
            <CardHeader className="p-8 pb-0 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-5 w-5 text-[#2c3e50]" />
                    <CardTitle className="text-xl font-black tracking-tight text-[#2c3e50]">Employee Cost History</CardTitle>
                  </div>
                  <CardDescription className="text-[#2c3e50]/60 text-[9px] font-black uppercase tracking-widest">TEMPORAL AUDIT OF STAFF DISBURSEMENTS</CardDescription>
                </div>
                <Users className="h-10 w-10 text-[#2c3e50]/10" />
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-8 relative z-10">
              <div className="bg-[#FDFBF0]/80 h-14 flex items-center px-10 border-b border-white/10">
                <div className="grid grid-cols-7 w-full items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60">Date</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60">Employee</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-center">Count</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right">Advances</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right">Food/Fuel</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right">Total</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right pr-4">Action</span>
                </div>
              </div>
              <ScrollArea className="max-h-[700px] w-full">
                {sortedLaborCosts && sortedLaborCosts.length > 0 ? (
                  <Table>
                    <TableBody>
                      {sortedLaborCosts.map((c) => (
                        <TableRow key={c.id} className="group hover:bg-white/10 transition-all border-b border-white/5" onClick={() => handleEditClick(c)}>
                          <TableCell className="pl-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest w-[14.2%]">{c.date}</TableCell>
                          <TableCell className="w-[14.2%]">
                            <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">{c.employeeName}</span>
                          </TableCell>
                          <TableCell className="text-center w-[14.2%]">
                            <span className="text-sm font-black text-neutral-900">{c.numberOfLaborers}</span>
                          </TableCell>
                          <TableCell className="text-right w-[14.2%]">
                            <span className="text-sm font-black text-neutral-900">₹{c.advancePayments?.toLocaleString() || '0'}</span>
                          </TableCell>
                          <TableCell className="text-right w-[14.2%]">
                            <span className="text-sm font-black text-neutral-900">₹{((c.foodCosts || 0) + (c.fuelCosts || 0)).toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right w-[14.2%]">
                            <span className="text-sm font-black text-emerald-700">₹{c.totalLaborCosts.toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right pr-10 w-[14.2%]">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[#A68A56]/10 text-[#A68A56] hover:bg-[#A68A56]/20" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={(e) => { e.stopPropagation(); handleDeleteCost(c.id, c._path); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-48 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <Users className="h-16 w-16 text-[#2c3e50]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#2c3e50]">NO EMPLOYEE COST RECORDS DISCOVERED</h3>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Adjust Cost Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">
              UPDATE STAFF DISBURSEMENT PARAMETERS
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5 p-8 bg-white max-h-[70vh] overflow-y-auto no-scrollbar">
              <FormField
                control={editForm.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Employee Name</Label>
                    <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button type="button" variant={'outline'} className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-left px-4 text-sm">
                              {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Pick date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField control={editForm.control} name="numberOfLaborers" render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Laborer Count</Label>
                      <FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="wages"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Wages per Head (₹)</Label>
                      <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField control={editForm.control} name="advancePayments" render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Advances (₹)</Label>
                      <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="foodCosts" render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Food (₹)</Label>
                      <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField control={editForm.control} name="fuelCosts" render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Fuel (₹)</Label>
                      <FormControl><Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-sm" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={editForm.control} name="totalLaborCosts" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Ledger Impact (₹)</Label>
                    <FormControl><Input type="number" step="0.01" className="h-14 rounded-2xl bg-neutral-900 border-none shadow-xl font-black text-emerald-400 text-lg px-6" {...field} readOnly /></FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">
                  Commit Adjustments
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
