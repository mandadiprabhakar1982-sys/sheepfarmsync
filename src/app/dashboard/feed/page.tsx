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
  Wheat,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';
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
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
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
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<FeedFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { cost: 0, quantity: 0, bags: 0, date: new Date() },
  });

  const sortedFeedCosts = useMemo(() => {
    if (!feedCosts) return [];
    const filtered = feedCosts.filter(f => f.feedType.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedCosts, searchTerm]);

  const onSubmit: SubmitHandler<FeedFormData> = (data) => {
    const newCost = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    addFeedCost(newCost);
    form.reset({ date: new Date() });
    setIsEntryDialogOpen(false);
    toast({ title: 'Success!', description: 'Fodder cost has been recorded.' });
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative px-4 md:px-0">
      <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
        <CardHeader className="bg-[#0FA5A0] text-white p-2.5 px-5 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg"><Wheat className="h-4 w-4 text-white" /></div>
                <CardTitle className="text-lg font-black tracking-tight leading-none uppercase text-white">Fodder Ledger</CardTitle>
              </div>
              <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] ml-7">Inventory Procurement History</CardDescription>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input placeholder="Search Feed Type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold focus-visible:ring-white/20" />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setIsEntryDialogOpen(true)} className="h-8 px-3 rounded-lg font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-1.5 shadow-xl border-none text-[10px]">
                <PlusCircle className="h-3.5 w-3.5" /> Record Fodder
              </Button>
              <div className="px-3 py-0.5 bg-black/20 rounded-lg text-white flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <div><p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Fodder Cost</p><p className="text-base font-black tracking-tighter leading-none mt-0.5">₹{totalFeedCost.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* MOBILE VIEW */}
          <div className="block md:hidden p-4 space-y-4">
            {sortedFeedCosts.length > 0 ? sortedFeedCosts.map((c) => (
              <div key={c.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-slate-100">
                <div className="flex-1 min-w-0"><h3 className="text-lg font-black text-[#2F4F4F] truncate leading-none mb-1">{c.feedType}</h3><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{c.date} • {c.quantity} KG</p></div>
                <div className="text-right shrink-0"><p className="text-xl font-black text-[#0FA5A0]">₹{c.cost.toLocaleString()}</p><Badge className="bg-[#D7F2F1] text-[#0FA5A0] border-none font-black text-[8px] uppercase px-2 py-0.5 mt-1 tracking-tighter">{c.bags || 0} Bags</Badge></div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No fodder records found</div>}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10"><TableRow className="border-none hover:bg-transparent"><TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Bill Date</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Category</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Packaging</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right text-white">Quantity</TableHead><TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Bill Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {sortedFeedCosts.map((c) => (
                  <TableRow key={c.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100"><TableCell className="pl-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">{c.date}</TableCell><TableCell><span className="text-[14px] font-black text-[#2F4F4F] uppercase">{c.feedType}</span></TableCell><TableCell className="text-center">{c.bags ? <Badge className="bg-[#D7F2F1] text-[#0FA5A0] border-none font-black text-[10px] px-3">{c.bags} Bags</Badge> : <span className="text-[10px] text-slate-300 font-bold uppercase">Bulk</span>}</TableCell><TableCell className="text-right"><span className="text-[16px] font-black text-[#2F4F4F]">{c.quantity} KG</span></TableCell><TableCell className="text-right pr-10"><div className="flex items-center justify-end gap-4"><span className="text-[18px] font-black text-[#0FA5A0]">₹{c.cost.toLocaleString()}</span><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteFeedCost(c.id, c._path)}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]">
                <Plus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Fodder Entry</DialogTitle>
            </div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Date of Buying</Label>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                            {field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[90vw] sm:w-[450px] p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-visible"
                          align="start"
                          side="bottom"
                          sideOffset={8}
                        >
                          <HorizontalDatePicker 
                            selectedDate={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setIsDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={form.control} name="feedType" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Category</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{feedTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={form.control} name="bags" render={({ field }) => (<FormItem><Label className="form-label-tactical">Bags (Optional)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Price (₹)</Label><FormControl><Input type="number" step="0.01" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase shadow-xl">Record Fodder Buy</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
