'use client';

import { useState, useEffect } from 'react';
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
import type { LaborCost } from '@/lib/types';

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  date: z.date({ required_error: 'A date is required.' }),
  dailyWages: z.coerce.number().nonnegative().optional(),
  monthlyWages: z.coerce.number().nonnegative().optional(),
  numberOfLaborers: z.coerce.number().int().positive('Must be a positive number'),
  advancePayments: z.coerce.number().nonnegative('Cannot be negative'),
  foodCosts: z.coerce.number().nonnegative('Cannot be negative'),
  fuelCosts: z.coerce.number().nonnegative('Cannot be negative'),
  totalLaborCosts: z.coerce.number().positive('Total must be calculated and positive'),
});

type LaborFormData = z.infer<typeof formSchema>;

export default function LaborPage() {
  const { toast } = useToast();
  const [costs, setCosts] = useState<LaborCost[]>([]);
  const form = useForm<LaborFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: '',
      dailyWages: 0,
      monthlyWages: 0,
      numberOfLaborers: 1,
      advancePayments: 0,
      foodCosts: 0,
      fuelCosts: 0,
      totalLaborCosts: 0,
    },
  });

  const watchedFields = form.watch([
    'dailyWages',
    'monthlyWages',
    'numberOfLaborers',
    'advancePayments',
    'foodCosts',
    'fuelCosts',
  ]);

  useEffect(() => {
    const [daily, monthly, num, advance, food, fuel] = watchedFields;
    const totalWages = (daily || 0) * (num || 1) + (monthly || 0);
    const total = totalWages + (advance || 0) + (food || 0) + (fuel || 0);
    form.setValue('totalLaborCosts', total);
  }, [watchedFields, form]);

  const onSubmit: SubmitHandler<LaborFormData> = (data) => {
    const newCost = { ...data, id: crypto.randomUUID(), date: format(data.date, 'yyyy-MM-dd') };
    setCosts((prev) => [...prev, newCost]);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Employee cost has been recorded.',
    });
  };
  
   const deleteCost = (id: string) => {
    setCosts(costs.filter(c => c.id !== id));
     toast({
      title: 'Deleted',
      description: 'Cost record has been deleted.',
      variant: 'destructive'
    });
  }


  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Employee Costs"
        description="Document all expenses related to farm employees."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Employee Cost</CardTitle>
               <CardDescription>Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="employeeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ram Singh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
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
                   <FormField control={form.control} name="numberOfLaborers" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="dailyWages" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Wages</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="monthlyWages" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Wages</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField control={form.control} name="advancePayments" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Payments (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="foodCosts" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Costs (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="fuelCosts" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Costs (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="totalLaborCosts" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Employee Costs (₹)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} readOnly className="bg-muted" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Employee Cost
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Cost History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Advances</TableHead>
                    <TableHead>Food/Fuel</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.length > 0 ? (
                    costs.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.date}</TableCell>
                        <TableCell>{c.employeeName}</TableCell>
                        <TableCell>{c.numberOfLaborers}</TableCell>
                        <TableCell>₹{c.advancePayments.toFixed(2)}</TableCell>
                        <TableCell>₹{(c.foodCosts + c.fuelCosts).toFixed(2)}</TableCell>
                        <TableCell>₹{c.totalLaborCosts.toFixed(2)}</TableCell>
                         <TableCell className='text-right'>
                            <Button variant="ghost" size="icon" onClick={() => deleteCost(c.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No employee costs recorded yet.
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
