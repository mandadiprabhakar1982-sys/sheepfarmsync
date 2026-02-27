
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Globe } from 'lucide-react';
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
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import type { AnimalSale } from '@/lib/types';

const formSchema = z.object({
  saleDate: z.date({ required_error: 'A date is required.' }),
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerVillage: z.string().min(1, 'Village name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  animalWeightKg: z.coerce.number().positive('Must be a positive number'),
  salePrice: z.coerce.number().positive('Must be a positive number'),
  outstandingDuesFromBuyer: z.coerce.number().nonnegative('Cannot be negative'),
  amountReceived: z.coerce.number().nonnegative('Cannot be negative'),
  isPublic: z.boolean().default(false),
});

type SalesFormData = z.infer<typeof formSchema>;

export default function SalesPage() {
  const { toast } = useToast();
  const { sales, addSale, deleteSale, updateSale, postToMarketplace } = useFarm();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<AnimalSale | null>(null);

  const form = useForm<SalesFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyerName: '',
      buyerVillage: '',
      animalCount: 1,
      animalWeightKg: 0,
      salePrice: 0,
      outstandingDuesFromBuyer: 0,
      amountReceived: 0,
      isPublic: false,
    },
  });

  const editForm = useForm<SalesFormData>({
    resolver: zodResolver(formSchema),
  });
  
  const watchedSalesFields = form.watch(['salePrice', 'amountReceived']);

  useEffect(() => {
    const [salePrice, amountReceived] = watchedSalesFields;
    const due = (salePrice || 0) - (amountReceived || 0);
    form.setValue('outstandingDuesFromBuyer', due >= 0 ? due : 0);
  }, [watchedSalesFields, form]);

  useEffect(() => {
    if (editingSale) {
      editForm.reset({
        ...editingSale,
        saleDate: new Date(editingSale.saleDate),
        isPublic: editingSale.isPublic || false,
      });
    }
  }, [editingSale, editForm]);

  const onSubmit: SubmitHandler<SalesFormData> = (data) => {
    const newTransaction = { ...data, saleDate: format(data.saleDate, 'yyyy-MM-dd') };
    addSale(newTransaction);
    
    // If public, also post to community marketplace
    if (data.isPublic) {
      postToMarketplace({
        saleDate: format(data.saleDate, 'yyyy-MM-dd'),
        village: data.buyerVillage,
        animalCount: data.animalCount,
        totalWeight: data.animalWeightKg,
        askingPrice: data.salePrice,
        notes: `Sheep sold to ${data.buyerName} from ${data.buyerVillage}`,
      });
    }

    form.reset();
    toast({
      title: 'Success!',
      description: data.isPublic ? 'Recorded and shared with Marketplace!' : 'Sales transaction recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<SalesFormData> = (data) => {
    if (!editingSale) return;
    const updatedData = { ...data, saleDate: format(data.saleDate, 'yyyy-MM-dd') };
    updateSale(editingSale.id, updatedData);
    setIsEditDialogOpen(false);
    setEditingSale(null);
    toast({
      title: 'Updated!',
      description: 'Sales record updated.',
    });
  };

  const sortedSales = useMemo(() => {
    if (!sales) return [];
    return [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales]);

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Sheep Sales"
        description="Log your sales and optionally share them with the community."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Record New Sale</CardTitle>
              <CardDescription>Enter transaction details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="saleDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Sale</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="buyerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buyer's Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Bob Smith" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="buyerVillage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village</FormLabel>
                        <FormControl><Input placeholder="e.g., River Town" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="animalCount" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Count</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="animalWeightKg" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="salePrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="amountReceived" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paid (₹)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-accent/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-primary" />
                            Post to Marketplace
                          </FormLabel>
                          <FormDescription className="text-[10px]">
                            Share this sale anonymously with the community board.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Record Sale
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSales.length > 0 ? (
                    sortedSales.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">{t.saleDate}</TableCell>
                        <TableCell>
                          <div className="font-medium">{t.buyerName}</div>
                          <div className="text-[10px] text-muted-foreground">{t.buyerVillage}</div>
                        </TableCell>
                        <TableCell>{t.animalCount}</TableCell>
                        <TableCell>₹{t.salePrice.toLocaleString()}</TableCell>
                        <TableCell>
                           {t.outstandingDuesFromBuyer > 0 ? (
                             <span className="text-[10px] font-bold text-destructive">₹{t.outstandingDuesFromBuyer.toLocaleString()} DUE</span>
                           ) : (
                             <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Full Paid</span>
                           )}
                           {t.isPublic && <Globe className="h-3 w-3 mt-1 text-primary inline-block ml-1" title="Shared with marketplace" />}
                        </TableCell>
                         <TableCell className='text-right'>
                            <div className="flex items-center justify-end">
                              <Button variant="ghost" size="icon" onClick={() => {setEditingSale(t); setIsEditDialogOpen(true)}}>
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteSale(t.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No sales recorded yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Sales Record</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField control={editForm.control} name="saleDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full text-left font-normal">{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                </FormItem>
              )} />
              <FormField control={editForm.control} name="buyerName" render={({ field }) => (<FormItem><FormLabel>Buyer</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="salePrice" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={editForm.control} name="amountReceived" render={({ field }) => (<FormItem><FormLabel>Paid (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter><Button type="submit" className="w-full">Update Record</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
