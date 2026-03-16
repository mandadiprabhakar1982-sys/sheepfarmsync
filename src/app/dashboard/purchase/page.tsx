'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Trash2, 
  Calendar as CalendarIcon, 
  Pencil, 
  ShoppingBag,
  Search,
  X,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { LivestockPurchase } from '@/lib/types';

const purchaseFormSchema = z.object({
  purchaseDate: z.date({ required_error: 'A purchase date is required.' }),
  villageName: z.string().min(1, 'Village name is required'),
  farmerName: z.string().min(1, 'Farmer name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  purchasePrice: z.coerce.number().positive('Must be a positive number'),
  transportCost: z.coerce.number().nonnegative('Cannot be negative').optional(),
  amountPaid: z.coerce.number().nonnegative('Cannot be negative'),
  dueAmount: z.coerce.number().nonnegative(),
  payingTimePeriod: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export default function PurchasePage() {
  const { toast } = useToast();
  const { purchases, addPurchase, deletePurchase, updatePurchase, totalPurchaseCost, isLoading } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<LivestockPurchase | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      villageName: '',
      farmerName: '',
      animalCount: 1,
      purchasePrice: 0,
      transportCost: 0,
      amountPaid: 0,
      dueAmount: 0,
      payingTimePeriod: '',
      purchaseDate: new Date(),
    },
  });

  const editForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
  });

  // Entry Form Calc Logic
  const watchedPurchaseFields = purchaseForm.watch(['purchasePrice', 'amountPaid']);
  useEffect(() => {
    const [price, paid] = watchedPurchaseFields;
    const due = (price || 0) - (paid || 0);
    purchaseForm.setValue('dueAmount', due >= 0 ? due : 0);
  }, [watchedPurchaseFields, purchaseForm]);

  const filteredPurchases = useMemo(() => {
    if (!purchases) return [];
    const filtered = purchases.filter(p => 
      p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.villageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [purchases, searchTerm]);

  const groupedPurchases = useMemo(() => {
    const groups: { [key: string]: LivestockPurchase[] } = {};
    filteredPurchases.forEach(p => {
      if (!groups[p.purchaseDate]) groups[p.purchaseDate] = [];
      groups[p.purchaseDate].push(p);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [filteredPurchases]);

  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    const newPurchase = { ...data, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') };
    addPurchase(newPurchase);
    purchaseForm.reset();
    setIsEntryDialogOpen(false);
    toast({ title: 'Success!', description: 'Purchase record synchronized.' });
  };

  const onEditSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    if (!editingPurchase) return;
    const updatedData = { ...data, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') };
    updatePurchase(editingPurchase.id, updatedData, editingPurchase._path);
    setIsEditDialogOpen(false);
    setEditingPurchase(null);
    toast({ title: 'Updated!', description: 'Record parameters adjusted.' });
  };

  const handleEditClick = (purchase: LivestockPurchase) => {
    setEditingPurchase(purchase);
    editForm.reset({
      ...purchase,
      purchaseDate: new Date(purchase.purchaseDate),
      transportCost: purchase.transportCost || 0,
    });
    setIsEditDialogOpen(true);
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING ACQUISITIONS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight uppercase">Acquisitions</h2>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase opacity-60 leading-none mb-1">Net Purchase</p>
          <p className="text-xl font-black">₹{totalPurchaseCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="md:hidden h-16 shrink-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Sheep Acquisition" description="LIVESTOCK PROCUREMENT AUDIT" className="mb-0 hidden md:block" />

        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => setIsEntryDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none">
            <PlusCircle className="h-5 w-5 text-accent" />
            Log Purchase
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Purchase</p>
              <p className="text-xl font-black tracking-tight text-white">₹{totalPurchaseCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Search Farmer or Village..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" 
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
          <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3"><ShoppingBag className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Acquisition Ledger</CardTitle></div>
                <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Livestock Procurement Stream</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">₹{totalPurchaseCost.toLocaleString()}</p>
            </div>
          </CardHeader>

          {/* MOBILE VIEW */}
          <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
            <ScrollArea className="h-full px-4 pt-4">
              {groupedPurchases.length > 0 ? groupedPurchases.map((group) => (
                <div key={group.date} className="mb-8">
                  <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((p) => (
                      <div key={p.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all" onClick={() => handleEditClick(p)}>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-900 truncate leading-none mb-1">{p.farmerName}</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {p.villageName} • {p.animalCount} Head
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-slate-900">₹{p.purchasePrice.toLocaleString()}</p>
                          {p.dueAmount > 0 ? (
                            <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] uppercase px-2 py-0.5 mt-1 tracking-tighter">₹{p.dueAmount} DUE</Badge>
                          ) : (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">SETTLED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered</div>}
              <div className="h-32" />
            </ScrollArea>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Farmer / Village</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Asset Count</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Acquisition Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50 border-b border-slate-100 group cursor-pointer" onClick={() => handleEditClick(p)}>
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{p.purchaseDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{p.farmerName}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{p.villageName}</span></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-neutral-100 text-neutral-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">{p.animalCount} Head</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-[18px] font-black text-slate-900">₹{p.purchasePrice.toLocaleString()}</span>
                            {p.dueAmount > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase">₹{p.dueAmount.toLocaleString()} Outstanding</span>}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600" onClick={(e) => { e.stopPropagation(); handleEditClick(p); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600" onClick={(e) => { e.stopPropagation(); deletePurchase(p.id, p._path); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { purchaseForm.reset(); setIsEntryDialogOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* ENTRY DIALOG */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Acquisition Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new livestock acquisition into registry</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
            <Form {...purchaseForm}><form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-6">
              <FormField control={purchaseForm.control} name="purchaseDate" render={({ field }) => (
                <FormItem className="flex flex-col"><Label className="form-label-tactical">Transaction Date</Label><Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left justify-between">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<CalendarIcon className="h-4 w-4 opacity-20" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none bg-white shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus /></PopoverContent></Popover></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Farmer Name</Label><FormControl><Input placeholder="Seller Identity" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Village</Label><FormControl><Input placeholder="Location" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Head Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-slate-900" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-emerald-600" {...field} /></FormControl></FormItem>)} />
                <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Outstanding (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 text-rose-600 font-black" {...field} readOnly /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl">Synchronize Purchase</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Pencil className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Update Record</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Adjust historical acquisition parameters</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
            <Form {...editForm}><form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField control={editForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Farmer Name</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical">Purchase Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={editForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl">Save Adjustments</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
