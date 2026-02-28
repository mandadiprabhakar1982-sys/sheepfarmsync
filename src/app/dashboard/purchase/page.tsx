'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Calendar as CalendarIcon, Pencil, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type { LivestockPurchase } from '@/lib/types';


// Schema for the purchase form
const purchaseFormSchema = z.object({
  purchaseDate: z.date({ required_error: 'A purchase date is required.' }),
  villageName: z.string().min(1, 'Village name is required'),
  farmerName: z.string().min(1, 'Farmer name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  purchasePrice: z.coerce.number().positive('Must be a positive number'),
  transportCost: z.coerce.number().nonnegative('Cannot be negative').optional(),
  amountPaid: z.coerce.number().nonnegative('Cannot be negative'),
  dueAmount: z.coerce.number().nonnegative(),
  payingTimePeriod: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export default function PurchasePage() {
  const { toast } = useToast();
  const { purchases, addPurchase, deletePurchase, updatePurchase } = useFarm();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<LivestockPurchase | null>(null);

  const sortedPurchases = useMemo(() => {
    if (!purchases) return [];
    return [...purchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [purchases]);

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      villageName: '',
      farmerName: '',
      animalCount: 1,
      purchasePrice: 0,
      transportCost: 0,
      amountPaid: 0,
      dueAmount: 0,
      payingTimePeriod: '',
    },
  });

  const editForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
  });

  const watchedPurchaseFields = purchaseForm.watch(['purchasePrice', 'amountPaid']);

  useEffect(() => {
    const [purchasePrice, amountPaid] = watchedPurchaseFields;
    const due = (purchasePrice || 0) - (amountPaid || 0);
    purchaseForm.setValue('dueAmount', due >= 0 ? due : 0);
  }, [watchedPurchaseFields, purchaseForm]);

  const watchedEditPurchaseFields = editForm.watch(['purchasePrice', 'amountPaid']);

  useEffect(() => {
    if (!isEditDialogOpen) return;
    const [purchasePrice, amountPaid] = watchedEditPurchaseFields;
    const due = (purchasePrice || 0) - (amountPaid || 0);
    editForm.setValue('dueAmount', due >= 0 ? due : 0);
  }, [watchedEditPurchaseFields, editForm, isEditDialogOpen]);

  useEffect(() => {
    if (editingPurchase) {
      editForm.reset({
        ...editingPurchase,
        purchaseDate: new Date(editingPurchase.purchaseDate),
        transportCost: editingPurchase.transportCost || 0,
      });
    }
  }, [editingPurchase, editForm]);


  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    const newPurchase = {
      ...data,
      purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
    };
    addPurchase(newPurchase);
    purchaseForm.reset();
    toast({
      title: 'Success!',
      description: 'Sheep purchase has been recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    if (!editingPurchase) return;

    const updatedData = {
      ...data,
      purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
    };

    updatePurchase(editingPurchase.id, updatedData);
    
    setIsEditDialogOpen(false);
    setEditingPurchase(null);
    toast({
      title: 'Updated!',
      description: 'Purchase record has been updated successfully.',
    });
  };

  const handleDeletePurchase = (id: string) => {
    deletePurchase(id);
    toast({
      title: 'Deleted',
      description: 'Purchase record has been deleted.',
      variant: 'destructive'
    });
  };

  const handleEditClick = (purchase: LivestockPurchase) => {
    setEditingPurchase(purchase);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Purchase Sheep"
        description="Record and track new sheep acquisitions."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="border-primary/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                New Acquisition
              </CardTitle>
              <CardDescription>Enter details of the livestock purchase.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...purchaseForm}>
                <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-4">
                  <FormField
                    control={purchaseForm.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal h-11',
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
                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Green Valley" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farmer's Name</FormLabel>
                        <FormControl><Input placeholder="e.g., John Doe" className="h-11" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Sheep</FormLabel>
                      <FormControl><Input type="number" className="h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl><Input type="number" className="h-11" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paid (₹)</FormLabel>
                        <FormControl><Input type="number" className="h-11" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={purchaseForm.control} name="transportCost" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport (₹)</FormLabel>
                        <FormControl><Input type="number" className="h-11" step="0.01" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due (₹)</FormLabel>
                        <FormControl><Input type="number" className="h-11 bg-muted/50 font-bold text-destructive" {...field} readOnly /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Record Purchase
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/50 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-black tracking-tight">Purchase History</CardTitle>
              </div>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">Complete operational log of livestock entries</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-neutral-50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Village</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Farmer</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Sheep</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Price</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Transport</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Paid</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Due</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPurchases && sortedPurchases.length > 0 ? (
                      sortedPurchases.map((purchase) => (
                        <TableRow key={purchase.id} className="group hover:bg-neutral-50/50 transition-colors">
                          <TableCell className="font-medium text-xs text-muted-foreground">{purchase.purchaseDate}</TableCell>
                          <TableCell className="font-bold text-xs">{purchase.villageName}</TableCell>
                          <TableCell className="text-xs">{purchase.farmerName}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-lg px-2.5 py-1 text-[10px] font-black">
                              {purchase.animalCount}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-xs">₹{purchase.purchasePrice.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">₹{(purchase.transportCost || 0).toLocaleString()}</TableCell>
                          <TableCell className="font-bold text-xs text-green-600">₹{purchase.amountPaid.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "text-xs font-black",
                              purchase.dueAmount > 0 ? "text-destructive" : "text-neutral-300"
                            )}>
                              ₹{purchase.dueAmount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEditClick(purchase)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDeletePurchase(purchase.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-20">
                          <div className="flex flex-col items-center gap-3 opacity-40">
                             <ShoppingBag className="h-10 w-10 mb-2" />
                             <p className="text-sm font-bold">No purchases recorded yet.</p>
                             <p className="text-[10px] font-medium tracking-wide">Enter your first purchase using the form on the left</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Edit Purchase Record</DialogTitle>
            <DialogDescription>
              Update the details of your purchase acquisition.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal h-11',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={editForm.control} name="villageName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Village Name</FormLabel>
                  <FormControl><Input className="h-11" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="farmerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmer's Name</FormLabel>
                  <FormControl><Input className="h-11" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                 <FormField control={editForm.control} name="purchasePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl><Input type="number" className="h-11" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="amountPaid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid (₹)</FormLabel>
                    <FormControl><Input type="number" className="h-11" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full h-12 font-bold">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}