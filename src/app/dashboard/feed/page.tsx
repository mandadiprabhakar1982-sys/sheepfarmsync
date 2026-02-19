'use client';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const feedTypes = ['TMR', 'Silage', 'Groundnut', 'Other'] as const;

const formSchema = z.object({
  feedType: z.enum(feedTypes, { required_error: 'Please select a feed type.' }),
  date: z.date({ required_error: 'A date is required.' }),
  cost: z.coerce.number().positive('Must be a positive number'),
  quantity: z.coerce.number().positive('Must be a positive number'),
});

type FeedFormData = z.infer<typeof formSchema>;

export default function FeedPage() {
  const { toast } = useToast();
  const { feedCosts, addFeedCost, deleteFeedCost } = useFarm();
  
  const form = useForm<FeedFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: 0,
      quantity: 0,
    },
  });

  const onSubmit: SubmitHandler<FeedFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addFeedCost(newCost);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Feed cost has been recorded.',
    });
  };
  
  const handleDeleteCost = (id: string) => {
    deleteFeedCost(id);
     toast({
      title: 'Deleted',
      description: 'Cost record has been deleted.',
      variant: 'destructive'
    });
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Feed Costs"
        description="Record expenses for all types of animal feed."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Feed Cost</CardTitle>
               <CardDescription>Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="feedType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feed Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a feed type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {feedTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Cost
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Feed Cost History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedCosts.length > 0 ? (
                    feedCosts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.date}</TableCell>
                        <TableCell>{c.feedType}</TableCell>
                        <TableCell>₹{c.cost.toFixed(2)}</TableCell>
                        <TableCell>{c.quantity}</TableCell>
                         <TableCell className='text-right'>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCost(c.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No feed costs recorded yet.
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
