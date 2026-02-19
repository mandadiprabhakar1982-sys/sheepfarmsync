'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
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

const formSchema = z.object({
  saleDate: z.date({ required_error: 'A date is required.' }),
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerVillage: z.string().min(1, 'Village name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  animalWeightKg: z.coerce.number().positive('Must be a positive number'),
  salePrice: z.coerce.number().positive('Must be a positive number'),
  outstandingDuesFromBuyer: z.coerce.number().nonnegative('Cannot be negative'),
  amountReceived: z.coerce.number().nonnegative('Cannot be negative'),
});

type SalesFormData = z.infer<typeof formSchema>;

export default function SalesPage() {
  const { toast } = useToast();
  const { sales, addSale, deleteSale } = useFarm();
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
    },
  });
  
  const watchedSalesFields = form.watch(['salePrice', 'amountReceived']);

  useEffect(() => {
    const [salePrice, amountReceived] = watchedSalesFields;
    const due = (salePrice || 0) - (amountReceived || 0);
    form.setValue('outstandingDuesFromBuyer', due >= 0 ? due : 0);
  }, [watchedSalesFields, form]);


  const onSubmit: SubmitHandler<SalesFormData> = (data) => {
    const newTransaction = { ...data, saleDate: format(data.saleDate, 'yyyy-MM-dd') };
    addSale(newTransaction);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Sales transaction has been recorded.',
    });
  };
  
  const handleDeleteTransaction = (id: string) => {
    deleteSale(id);
     toast({
      title: 'Deleted',
      description: 'Transaction record has been deleted.',
      variant: 'destructive'
    });
  }


  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Sheep Sales"
        description="Log all your sheep sales transactions here."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Record New Sale</CardTitle>
              <CardDescription>Fill out the form below.</CardDescription>
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
                  <FormField control={form.control} name="animalCount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Sheep</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="animalWeightKg" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weight (kg)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="salePrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="amountReceived" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Received (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="outstandingDuesFromBuyer" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outstanding Dues (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} readOnly className="bg-muted" /></FormControl>
                        <FormMessage />
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
                    <TableHead>Price</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Dues</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales && sales.length > 0 ? (
                    sales.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.saleDate}</TableCell>
                        <TableCell>{t.buyerName}</TableCell>
                        <TableCell>{t.animalCount}</TableCell>
                        <TableCell>₹{t.salePrice.toFixed(2)}</TableCell>
                        <TableCell>₹{t.amountReceived.toFixed(2)}</TableCell>
                        <TableCell className={t.outstandingDuesFromBuyer > 0 ? 'text-destructive' : ''}>₹{t.outstandingDuesFromBuyer.toFixed(2)}</TableCell>
                         <TableCell className='text-right'>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(t.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No sales recorded yet.
                      </TableCell>
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

