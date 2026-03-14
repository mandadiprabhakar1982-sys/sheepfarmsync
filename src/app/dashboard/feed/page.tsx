'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Wheat, Package, Circle, ArrowDownCircle } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';


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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
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
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl">
      <div className="mb-12 relative">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-[#A68A56] rounded-full" />
          <h1 className="text-2xl font-black text-neutral-900">Feed Procurement</h1>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-1 pl-4">
          AUDIT-GRADE TRACKING OF NUTRITIONAL ACQUISITIONS AND TMR BAG INVENTORY.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* --- PROCUREMENT ENTRY FORM --- */}
        <div className="lg:col-span-4">
          <Card className="border-none bg-[#FDFBF0] rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-24 border-t-4 border-[#A68A56]">
            <CardHeader className="p-8 pb-4 bg-[#A68A56] text-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight uppercase">Procurement Entry</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-[8px] font-bold uppercase tracking-widest">LOG A NEW FEED PURCHASE BATCH</CardDescription>
                </div>
                <ArrowDownCircle className="h-6 w-6 opacity-40" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="feedType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Nutrition Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            {feedTypes.map((type) => (
                              <SelectItem key={type} value={type} className="font-bold">{type}</SelectItem>
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Purchase Date</FormLabel>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={'outline'}
                                className={cn(
                                  'h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6 text-left',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none rounded-2xl shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }}
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
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Cost (₹)</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type="number" step="0.01" className="h-12 rounded-xl bg-white border-none shadow-sm font-black px-4 pr-10" {...field} />
                            </FormControl>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-300">₹</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Qty (KG)</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type="number" step="0.1" className="h-12 rounded-xl bg-white border-none shadow-sm font-black px-4 pr-10" {...field} />
                            </FormControl>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-300">KG</span>
                          </div>
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full border border-neutral-400 flex items-center justify-center">
                            <div className="h-1 w-1 bg-neutral-400 rounded-full" />
                          </div>
                          TMR Bags Count
                        </FormLabel>
                        <FormControl>
                          <Input type="number" className="h-14 rounded-2xl bg-white border-none shadow-sm font-black text-lg px-6" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl bg-[#1a4d38] hover:bg-[#0a2618] text-white border-none flex items-center justify-center gap-3">
                    <div className="h-4 w-4 rounded-full border-2 border-white/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full" />
                    </div>
                    COMMIT PURCHASE
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* --- PROCUREMENT LEDGER --- */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-[#708090]/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#708090]/10 to-[#2c3e50]/20 opacity-50 pointer-events-none" />
            <CardHeader className="p-8 pb-0 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wheat className="h-5 w-5 text-[#2c3e50]" />
                    <CardTitle className="text-xl font-black tracking-tight text-[#2c3e50]">Procurement Ledger</CardTitle>
                  </div>
                  <CardDescription className="text-[#2c3e50]/60 text-[9px] font-black uppercase tracking-widest">HISTORICAL RECORD OF ALL FEED ACQUISITIONS</CardDescription>
                </div>
                <Package className="h-10 w-10 text-[#2c3e50]/10" />
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-8 relative z-10">
              <div className="bg-[#FDFBF0]/80 h-14 flex items-center px-10 border-b border-white/10">
                <div className="grid grid-cols-5 w-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60">Date</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60">Category</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-center">Packaging</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right">Quantity</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3e50]/60 text-right pr-4">Total Cost</span>
                </div>
              </div>
              <ScrollArea className="max-h-[600px] w-full">
                {sortedFeedCosts && sortedFeedCosts.length > 0 ? (
                  <Table>
                    <TableBody>
                      {sortedFeedCosts.map((c) => (
                        <TableRow key={c.id} className="group hover:bg-white/10 transition-all cursor-zoom-in border-b border-white/5" onClick={() => handleEditClick(c)}>
                          <TableCell className="pl-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest w-1/5">{c.date}</TableCell>
                          <TableCell className="w-1/5">
                            <div className="flex items-center gap-2">
                              <Circle className={cn(
                                "h-2 w-2 fill-current",
                                c.feedType === 'TMR' ? 'text-[#A68A56]' : 'text-emerald-500'
                              )} />
                              <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">{c.feedType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center w-1/5">
                            {c.bags ? (
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A68A56]/10 border border-[#A68A56]/20">
                                <Package className="h-3 w-3 text-[#A68A56]" />
                                <span className="text-[10px] font-black text-[#A68A56] uppercase tracking-widest">{c.bags} BAGS</span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">BULK MIX</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right w-1/5">
                            <span className="text-sm font-black text-neutral-900">{c.quantity}</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase ml-1.5">KG</span>
                          </TableCell>
                          <TableCell className="text-right pr-10 w-1/5">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-sm font-black text-neutral-900">₹{c.cost.toLocaleString()}</span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[#A68A56]/10 text-[#A68A56] hover:bg-[#A68A56]/20" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={(e) => { e.stopPropagation(); handleDeleteCost(c.id, c._path); }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-48 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <Wheat className="h-16 w-16 text-[#2c3e50]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#2c3e50]">NO PROCUREMENT RECORDS DISCOVERED</h3>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Update historical procurement parameters
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm">
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button type="button" variant={'outline'} className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-sm">
                              {field.value ? format(field.value, 'MMM dd, yy') : <span>Pick date</span>}
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Total Cost (₹)</FormLabel>
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Qty (KG)</FormLabel>
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">TMR Bags Count</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">
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
