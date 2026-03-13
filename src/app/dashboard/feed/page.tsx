'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Wheat, Package } from 'lucide-react';
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
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { FeedCost } from '@/lib/types';


const feedTypes = ['TMR', 'Silage', 'Groundnut', 'Other'] as const;

const formSchema = z.object({
  feedType: z.enum(feedTypes, { required_error: 'Please select a feed type.' }),
  date: z.date({ required_error: 'A date is required.' }),
  cost: z.coerce.number().positive('Must be a positive number'),
  quantity: z.coerce.number().positive('Must be a positive number'),
  bags: z.coerce.number().int().nonnegative('Must be non-negative').optional(),
});

type FeedFormData = z.infer<typeof formSchema>;

export default function FeedPage() {
  const { toast } = useToast();
  const { feedCosts, addFeedCost, deleteFeedCost, updateFeedCost } = useFarm();
  const [editingFeedCost, setEditingFeedCost] = useState<FeedCost | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const form = useForm<FeedFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: 0,
      quantity: 0,
      bags: 0,
    },
  });

  const editForm = useForm<FeedFormData>({
    resolver: zodResolver(formSchema),
  });

  const sortedFeedCosts = useMemo(() => {
    if (!feedCosts) return [];
    return [...feedCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedCosts]);

  useEffect(() => {
    if (editingFeedCost) {
      editForm.reset({
        ...editingFeedCost,
        date: new Date(editingFeedCost.date),
        bags: editingFeedCost.bags || 0,
      });
    }
  }, [editingFeedCost, editForm]);

  const onSubmit: SubmitHandler<FeedFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addFeedCost(newCost);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Feed cost has been recorded.',
    });
  };

  const onEditSubmit: SubmitHandler<FeedFormData> = (data) => {
    if (!editingFeedCost) return;
    const updatedData = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    updateFeedCost(editingFeedCost.id, updatedData, editingFeedCost._path);
    setIsEditOpen(false);
    setEditingFeedCost(null);
    toast({
      title: 'Updated!',
      description: 'Feed cost record has been updated successfully.',
    });
  };
  
  const handleDeleteCost = (id: string, path?: string) => {
    deleteFeedCost(id, path);
     toast({
      title: 'Deleted',
      description: 'Cost record has been deleted.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (cost: FeedCost) => {
    setEditingFeedCost(cost);
    setIsEditOpen(true);
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Feed Procurement"
        description="Audit-grade tracking of nutritional acquisitions and TMR bag inventory."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-neutral-900 text-white p-8">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Procurement Entry
              </CardTitle>
               <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Log a new feed purchase batch</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="feedType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Nutrition Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none font-bold px-6">
                              <SelectValue placeholder="Select type" />
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Purchase Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={'outline'}
                                className={cn(
                                  'h-14 rounded-2xl bg-neutral-50 border-none font-bold px-6 text-left',
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Cost (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} />
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Qty (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 flex items-center gap-2">
                          <Package className="h-3 w-3" /> TMR Bags Count
                        </FormLabel>
                        <FormControl>
                          <Input type="number" className="h-14 rounded-2xl bg-neutral-50 border-none font-black text-lg px-6" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800">
                    <PlusCircle className="mr-3 h-6 w-6 text-emerald-400" />
                    Commit Purchase
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary p-8 text-white">
              <CardTitle className="text-xl font-black tracking-tight leading-none mb-2 flex items-center gap-3">
                <Wheat className="h-6 w-6 text-emerald-200" />
                Procurement Ledger
              </CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Historical record of all feed acquisitions</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="text-[9px] font-black uppercase pl-8 py-5">Date</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Category</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-center">Packaging</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-right">Quantity</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-right pr-8">Total Cost</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFeedCosts && sortedFeedCosts.length > 0 ? (
                    sortedFeedCosts.map((c) => (
                      <TableRow key={c.id} className="group hover:bg-neutral-50 transition-all cursor-zoom-in active:scale-[0.995]" onClick={() => handleEditClick(c)}>
                        <TableCell className="pl-8 text-[10px] font-bold text-muted-foreground uppercase">{c.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              c.feedType === 'TMR' ? 'bg-amber-500' : 'bg-emerald-500'
                            )} />
                            <span className="text-sm font-black tracking-tight">{c.feedType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {c.bags ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                              <Package className="h-3 w-3" /> {c.bags} Bags
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">Bulk Mix</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-black">{c.quantity} <span className="text-[10px] opacity-40">KG</span></TableCell>
                        <TableCell className="text-right pr-8 text-sm font-black text-emerald-600">₹{c.cost.toLocaleString()}</TableCell>
                         <TableCell className='pr-8 text-right' onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100" onClick={() => handleEditClick(c)}>
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => handleDeleteCost(c.id, c._path)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic opacity-40 uppercase tracking-widest text-[10px] font-black">
                        NO PROCUREMENT RECORDS LOGGED
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Update Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Adjust procurement parameters and inventory count
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="feedType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {feedTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button type="button" variant={'outline'} className="h-12 rounded-xl bg-neutral-50 border-none font-bold">
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Cost (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Qty (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="bags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">TMR Bags Count</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
