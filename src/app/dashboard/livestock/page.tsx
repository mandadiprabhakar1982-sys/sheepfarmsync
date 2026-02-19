'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { LivestockPurchase } from '@/lib/types';

const formSchema = z.object({
  villageName: z.string().min(1, 'Village name is required'),
  farmerName: z.string().min(1, 'Farmer name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  purchasePrice: z.coerce.number().positive('Must be a positive number'),
  amountPaid: z.coerce.number().nonnegative('Cannot be negative'),
});

type LivestockFormData = z.infer<typeof formSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<LivestockPurchase[]>([]);
  const form = useForm<LivestockFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      villageName: '',
      farmerName: '',
      animalCount: 0,
      purchasePrice: 0,
      amountPaid: 0,
    },
  });

  const onSubmit: SubmitHandler<LivestockFormData> = (data) => {
    setPurchases((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Livestock purchase has been recorded.',
    });
  };
  
  const deletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
     toast({
      title: 'Deleted',
      description: 'Purchase record has been deleted.',
      variant: 'destructive'
    });
  }

  return (
    <>
      <PageHeader
        title="Livestock Purchases"
        description="Log the purchase of new animals for your farm."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Purchase</CardTitle>
              <CardDescription>Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="villageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Green Valley" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="farmerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farmer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="animalCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animal Count</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    <TableHead>Count</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length > 0 ? (
                    purchases.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.villageName}</TableCell>
                        <TableCell>{p.farmerName}</TableCell>
                        <TableCell>{p.animalCount}</TableCell>
                        <TableCell>${p.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>${p.amountPaid.toFixed(2)}</TableCell>
                        <TableCell className={p.purchasePrice - p.amountPaid > 0 ? 'text-red-600' : ''}>
                          ${(p.purchasePrice - p.amountPaid).toFixed(2)}
                        </TableCell>
                        <TableCell className='text-right'>
                            <Button variant="ghost" size="icon" onClick={() => deletePurchase(p.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No purchases recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
