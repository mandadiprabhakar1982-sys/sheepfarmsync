'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Calendar as CalendarIcon, Pencil } from 'lucide-react';
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
    <div className="container mx-auto py-8">
      <PageHeader
        title="Purchase Sheep"
        description="Record new sheep purchases."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Record New Purchase</CardTitle>
              <CardDescription>Fill out the form below.</CardDescription>
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
                  <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Green Valley" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer's Name</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Sheep</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={purchaseForm.control} name="transportCost" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transport Cost (₹)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="e.g., 500" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Amount (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={purchaseForm.control} name="payingTimePeriod" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paying Time Period</FormLabel>
                      <FormControl><Input placeholder="e.g., 30 days" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Purchase
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Sheep</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPurchases && sortedPurchases.length > 0 ? (
                    sortedPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{purchase.purchaseDate}</TableCell>
                        <TableCell>{purchase.villageName}</TableCell>
                        <TableCell>{purchase.farmerName}</TableCell>
                        <TableCell>{purchase.animalCount}</TableCell>
                        <TableCell>₹{purchase.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>₹{(purchase.transportCost || 0).toFixed(2)}</TableCell>
                        <TableCell>₹{purchase.amountPaid.toFixed(2)}</TableCell>
                        <TableCell className={purchase.dueAmount > 0 ? 'text-destructive' : ''}>₹{purchase.dueAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(purchase)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePurchase(purchase.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">No purchases recorded yet.</TableCell>
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
            <DialogTitle>Edit Purchase Record</DialogTitle>
            <DialogDescription>
              Update the details of your purchase. Click save when you're done.
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
                              'w-full pl-3 text-left font-normal',
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
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="farmerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmer's Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="animalCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Sheep</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="purchasePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (₹)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="amountPaid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid (₹)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="transportCost" render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport Cost (₹)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="dueAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Amount (₹)</FormLabel>
                  <FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="payingTimePeriod" render={({ field }) => (
                <FormItem>
                  <FormLabel>Paying Time Period</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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
