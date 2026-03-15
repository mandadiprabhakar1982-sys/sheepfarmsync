'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Plus,
  ShieldCheck,
  Wheat
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const { feedCosts, addFeedCost, deleteFeedCost, totalFeedCost, isLoading } = useFarm();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  const form = useForm<FeedFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: 0,
      quantity: 0,
      bags: 0,
    },
  });

  const sortedFeedCosts = useMemo(() => {
    if (!feedCosts) return [];
    return [...feedCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedCosts]);

  const onSubmit: SubmitHandler<FeedFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addFeedCost(newCost);
    form.reset();
    setIsEntryDialogOpen(false);
    toast({
      title: 'Success!',
      description: 'Feed cost has been recorded.',
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

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING FEED DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Feed Management"
          description="OPERATIONAL INVENTORY & PROCUREMENT"
          className="mb-0"
        />
        
        <div className="flex items-center gap-4">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { form.reset(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Ledger Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Feed Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new inventory procurement to ledger</DialogDescription>
              </DialogHeader>
              
              <div className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical text-slate-400">Transaction Date</Label>
                          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                                {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-slate-200 bg-white shadow-2xl">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus className="text-slate-900" />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="feedType" render={({ field }) => (
                          <FormItem>
                            <Label className="form-label-tactical text-slate-400">Category</Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-white border-slate-200">
                                {feedTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="quantity" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="bags" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Bags (Optional)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="cost" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Total Price (₹)</Label><FormControl><Input type="number" step="0.01" className="form-input-tactical bg-slate-50 border-slate-200 text-emerald-600 font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                      Record Procurement
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Total Expend</p>
              <p className="text-xl font-black tracking-tight text-white">₹{totalFeedCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-[#84cc16] text-white p-10 py-12">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Wheat className="h-6 w-6" />
                  <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Inventory Stream</CardTitle>
                </div>
                <CardDescription className="text-emerald-100/60 text-xs font-black uppercase tracking-[0.2em]">High-fidelity operational records</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">₹{totalFeedCost.toLocaleString()}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase py-6 pl-10">Temporal Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-center">Packaging</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right">Quantity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right pr-10">Value Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFeedCosts.length > 0 ? sortedFeedCosts.map((c) => (
                  <TableRow key={c.id} className="group hover:bg-neutral-50 transition-colors border-b border-slate-100">
                    <TableCell className="pl-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">{c.date}</TableCell>
                    <TableCell><span className="text-[14px] font-black text-slate-900 uppercase">{c.feedType}</span></TableCell>
                    <TableCell className="text-center">
                      {c.bags ? <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] px-3">{c.bags} BAGS</Badge> : <span className="text-[10px] text-slate-300 font-bold uppercase">BULK</span>}
                    </TableCell>
                    <TableCell className="text-right"><span className="text-[16px] font-black text-slate-900">{c.quantity} KG</span></TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-[18px] font-black text-emerald-700">₹{c.cost.toLocaleString()}</span>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteCost(c.id, c._path)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-32 opacity-20 font-black uppercase text-xs">No disbursement records discovered</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}