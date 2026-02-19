'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';

// Schema for the purchase form
const purchaseFormSchema = z.object({
  villageName: z.string().min(1, 'Village name is required'),
  farmerName: z.string().min(1, 'Farmer name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  purchasePrice: z.coerce.number().positive('Must be a positive number'),
  amountPaid: z.coerce.number().nonnegative('Cannot be negative'),
  dueAmount: z.coerce.number().nonnegative(),
  payingTimePeriod: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export default function PurchasePage() {
  const { toast } = useToast();
  const { purchases, addPurchase, deletePurchase } = useFarm();

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      villageName: '',
      farmerName: '',
      animalCount: 1,
      purchasePrice: 0,
      amountPaid: 0,
      dueAmount: 0,
      payingTimePeriod: '',
    },
  });

  const watchedPurchaseFields = purchaseForm.watch(['purchasePrice', 'amountPaid']);

  useEffect(() => {
    const [purchasePrice, amountPaid] = watchedPurchaseFields;
    const due = (purchasePrice || 0) - (amountPaid || 0);
    purchaseForm.setValue('dueAmount', due >= 0 ? due : 0);
  }, [watchedPurchaseFields, purchaseForm]);

  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    addPurchase(data);
    purchaseForm.reset();
    toast({
      title: 'Success!',
      description: 'Sheep purchase has been recorded.',
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
                      <FormControl><Input placeholder="e.g., 30 days" {...field} /></FormControl>
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
                    <TableHead>Village</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Sheep</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases && purchases.length > 0 ? (
                    purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{purchase.villageName}</TableCell>
                        <TableCell>{purchase.farmerName}</TableCell>
                        <TableCell>{purchase.animalCount}</TableCell>
                        <TableCell>₹{purchase.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>₹{purchase.amountPaid.toFixed(2)}</TableCell>
                        <TableCell className={purchase.dueAmount > 0 ? 'text-destructive' : ''}>₹{purchase.dueAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePurchase(purchase.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No purchases recorded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
