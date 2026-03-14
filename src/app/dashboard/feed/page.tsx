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
import { PageHeader } from '@/components/page-header';

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
      description: 'Feed cost record updated.',
    });
  };
  
  const handleDeleteCost = (id: string, path?: string) => {
    deleteFeedCost(id, path);
     toast({
      title: 'Deleted',
      description: 'Cost record deleted.',
      variant: 'destructive'
    });
  }

  return (
    <div className="container mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-start mb-10">
        <PageHeader
          title="Feed Management"
          description="Operational Inventory & Procurement"
        />
        <div className="sync-card p-6 px-10 flex items-center gap-10 border border-white/40">
          <div className="space-y-1 text-center">
            <p className="subtitle !text-[9px] !tracking-widest">Total Expend</p>
            <p className="text-2xl font-black tracking-tighter text-[#84cc16]">₹{totalFeedCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="mb-10 p-1 bg-slate-200/50 rounded-2xl flex justify-start items-center h-16 w-fit shadow-inner">
          <TabsTrigger value="entry" className="tab-inactive tab-active h-14 px-10 font-bold">Record Entry</TabsTrigger>
          <TabsTrigger value="history" className="tab-inactive tab-active h-14 px-10 font-bold">Purchase Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Card className="sync-card p-10 border-t-4 border-[#84cc16]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="subtitle !text-[10px] ml-2 mb-2">Transaction Date</Label>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full text-left flex justify-between items-center h-14 bg-[#f8fafc] border-slate-200 font-bold">
                            {field.value ? format(field.value, 'MMMM dd, yyyy') : "Select Date"}
                            <CalendarIcon className="h-5 w-5 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="feedType" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Category</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-14 bg-[#f8fafc] border-slate-200 font-bold"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">{feedTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Weight (KG)</Label>
                        <FormControl><Input type="number" step="0.1" className="h-14" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="cost" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Total Price (₹)</Label>
                        <FormControl><Input type="number" step="0.01" className="h-14 font-black text-emerald-700" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bags" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Units (Bags)</Label>
                        <FormControl><Input type="number" className="h-14" placeholder="0" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" className="primary-btn w-full !bg-[#84cc16]">Record Entry</Button>
                </form>
              </Form>
            </Card>
          </div>
          <div className="lg:col-span-7">
            <div className="sync-card overflow-hidden">
              <Table>
                <TableHeader className="sync-table-header">
                  <TableRow>
                    <TableHead className="subtitle !text-[10px] py-6 pl-10">Date</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6">Type</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6 text-right">Qty</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6 text-right pr-10">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFeedCosts.map((c) => (
                    <TableRow key={c.id} className="sync-table-row">
                      <TableCell className="pl-10 py-6 text-xs font-bold text-slate-500">{c.date}</TableCell>
                      <TableCell><span className="text-sm font-black text-slate-900 uppercase">{c.feedType}</span></TableCell>
                      <TableCell className="text-right"><span className="text-sm font-black text-slate-900">{c.quantity} KG</span></TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <span className="text-sm font-black text-emerald-700">₹{c.cost.toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteCost(c.id, c._path)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
           <div className="sync-card p-0 overflow-hidden">
              <Table>
                <TableHeader className="sync-table-header">
                  <TableRow>
                    <TableHead className="subtitle !text-[10px] py-6 pl-10">Temporal Node</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6">Category</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6 text-center">Packaging</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6 text-right">Quantity</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6 text-right pr-10">Value Payload</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFeedCosts.map((c) => (
                    <TableRow key={c.id} className="sync-table-row">
                      <TableCell className="pl-10 py-6 text-[11px] font-black text-slate-500 uppercase">{c.date}</TableCell>
                      <TableCell><span className="text-sm font-bold text-slate-900 uppercase">{c.feedType}</span></TableCell>
                      <TableCell className="text-center">
                        {c.bags ? <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none">{c.bags} BAGS</Badge> : <span className="text-[10px] text-slate-400">BULK</span>}
                      </TableCell>
                      <TableCell className="text-right"><span className="text-sm font-black text-slate-900">{c.quantity} KG</span></TableCell>
                      <TableCell className="text-right pr-10"><span className="text-base font-black text-emerald-700">₹{c.cost.toLocaleString()}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}