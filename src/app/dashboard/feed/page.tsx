'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Wheat, Package, CheckCircle2, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FeedCost } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

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
  const { feedCosts, addFeedCost, deleteFeedCost, updateFeedCost, totalFeedCost } = useFarm();
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
    <div className="container mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2rem] bg-[#365314] flex items-center justify-center text-white shadow-2xl">
            <Wheat className="h-10 w-10 text-[#65a30d]" />
          </div>
          <div>
            <h1 className="page-title leading-none">Feed Management</h1>
            <p className="subtitle mt-3">TIGHTLY SYNCHRONIZED ENVIRONMENT</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 px-10 shadow-xl flex items-center gap-10 border border-white/40">
          <div className="space-y-1 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#365314]/40">Total Expenditure</p>
            <p className="text-2xl font-black tracking-tighter text-[#365314]">₹{totalFeedCost.toLocaleString()}</p>
          </div>
          <div className="h-10 w-px bg-[#365314]/10" />
          <div className="space-y-1 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#365314]/40">Active Batches</p>
            <p className="text-2xl font-black tracking-tighter text-[#365314]">{feedCosts?.length || 0}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="mb-12 p-1 bg-[#e7eddc] rounded-2xl flex justify-center items-center h-16 w-fit mx-auto shadow-inner">
          <TabsTrigger value="entry" className="tab-inactive tab-active h-14 px-10">
            <PlusCircle className="mr-2 h-4 w-4" /> Record Entry
          </TabsTrigger>
          <TabsTrigger value="history" className="tab-inactive tab-active h-14 px-10">
            <ShoppingCart className="mr-2 h-4 w-4" /> Cost Track
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="form-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-[#365314] mb-1">Feed Entry</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">BASIC LOGISTICS & CLASSIFICATION</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2">Transaction Date</Label>
                          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button type="button" variant="outline" className="w-full text-left flex justify-between items-center h-14 bg-[#f8fafc] rounded-xl border-[#d9e4cf] font-bold">
                                  {field.value ? format(field.value, 'MMMM dd, yyyy') : <span>Select Date</span>}
                                  <CalendarIcon className="h-5 w-5 opacity-20" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-none" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="feedType"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2">Category</Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 bg-[#f8fafc] rounded-xl border-[#d9e4cf] font-bold">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {feedTypes.map((type) => (
                                  <SelectItem key={type} value={type} className="font-bold">{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2">Weight (KG)</Label>
                            <FormControl>
                              <Input type="number" step="0.1" className="h-14 bg-[#f8fafc] rounded-xl border-[#d9e4cf] font-black text-lg" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-[#365314] mb-1">Financial Impact</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">FISCAL PAYLOAD & PACKAGING</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2">Total Fiscal Cost (₹)</Label>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-14 bg-[#f8fafc] rounded-xl border-[#d9e4cf] font-black text-xl text-emerald-700" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bags"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2">Packaging Units (Bags)</Label>
                          <FormControl>
                            <Input type="number" className="h-14 bg-[#f8fafc] rounded-xl border-[#d9e4cf] font-bold" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <Button type="submit" className="primary-btn w-full max-w-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    Record Entry
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="form-card p-0 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#f8fafc]">
                <TableRow className="border-b border-[#d9e4cf]">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10">Temporal Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center">Packaging</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right">Quantity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10">Value Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFeedCosts.map((c) => (
                  <TableRow key={c.id} className="group hover:bg-[#f7fbf3] transition-colors border-b border-[#d9e4cf]/30">
                    <TableCell className="pl-10 py-6 text-[11px] font-black text-[#64748b] uppercase tracking-widest">{c.date}</TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-[#365314] uppercase">{c.feedType}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {c.bags ? (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#65a30d]/10 text-[10px] font-black text-[#65a30d] uppercase tracking-widest">
                          <Package className="h-3 w-3" /> {c.bags} BAGS
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">BULK MIX</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-black text-[#365314]">{c.quantity} KG</span>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-6">
                        <span className="text-base font-black text-emerald-700 tracking-tighter">₹{c.cost.toLocaleString()}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100" onClick={() => handleEditClick(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600" onClick={() => handleDeleteCost(c.id, c._path)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-[#365314] p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-[#65a30d]" />
              Adjust Record
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="feedType" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Type</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-sm"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{feedTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 rounded-xl bg-[#f8fafc] border-[#d9e4cf] font-bold text-sm text-left">{field.value ? format(field.value, 'MMM dd, yy') : <span>Pick date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)} className="h-12 px-8 rounded-xl font-bold border-[#d9e4cf]">Cancel</Button>
                <Button type="submit" className="primary-btn flex-1">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}