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
  Loader2
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false);

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
    if (isToday(d)) return `Today - ${dateStr}`;
    if (isYesterday(d)) return `Yesterday - ${dateStr}`;
    return dateStr;
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
                <div className="p-1 bg-white/20 rounded-lg">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight leading-none uppercase text-white">Sheep Buying</CardTitle>
              </div>
              <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] ml-7">Verified Sheep Procurement Audit</CardDescription>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input 
                placeholder="Search Farmer or Village..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold focus-visible:ring-white/20" 
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsEntryDialogOpen(true)} 
                className="h-8 px-3 rounded-lg font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-1.5 shadow-xl border-none text-[10px]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Record Buy
              </Button>
              
              <div className="px-3 py-0.5 bg-black/20 rounded-lg text-white flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Buy Spend</p>
                  <p className="text-base font-black tracking-tighter leading-none mt-0.5">₹{totalPurchaseCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* MOBILE VIEW */}
          <div className="block md:hidden p-4 space-y-8">
            {groupedPurchases.length > 0 ? groupedPurchases.map((group) => (
              <div key={group.date} className="space-y-4">
                <div className="px-2 py-2 mb-3 bg-[#D7F2F1] rounded-lg">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#176E6C]">{formatGroupDate(group.date)}</p>
                </div>
                <div className="space-y-4">
                  {group.items.map((p) => (
                    <div key={p.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all" onClick={() => handleEditClick(p)}>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-[#2F4F4F] truncate leading-none mb-1">{p.farmerName}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {p.villageName} • {p.animalCount} Head
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-[#2F4F4F]">₹{p.purchasePrice.toLocaleString()}</p>
                        {p.dueAmount > 0 ? (
                          <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] uppercase px-2 py-0.5 mt-1 tracking-tighter">₹{p.dueAmount} Due</Badge>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#43A047] border border-[#d1fae5] mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Settled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No buying records found</div>}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Buying Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Farmer / Village</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Head Count</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Purchase Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50 border-b border-slate-100 group cursor-pointer transition-colors" onClick={() => handleEditClick(p)}>
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{p.purchaseDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{p.farmerName}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{p.villageName}</span></div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-[#D7F2F1] text-[#0FA5A0] border-none font-black text-[10px] px-3 uppercase tracking-widest">{p.animalCount} Head</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[18px] font-black text-[#2F4F4F]">₹{p.purchasePrice.toLocaleString()}</span>
                          {p.dueAmount > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase">₹{p.dueAmount.toLocaleString()} Pending</span>}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-emerald-50 text-[#43A047]" onClick={(e) => { e.stopPropagation(); handleEditClick(p); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600" onClick={(e) => { e.stopPropagation(); deletePurchase(p.id, p._path); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
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
              <DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Buying Entry</DialogTitle>
            </div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...purchaseForm}>
            <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={purchaseForm.control} name="purchaseDate" render={({ field }) => (
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
                    <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Farmer Name</Label><FormControl><Input placeholder="Seller Name" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Village</Label><FormControl><Input placeholder="Location" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Head Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Payable (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 text-rose-600" {...field} readOnly /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Record Sheep Buy</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]">
                <Pencil className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Update Purchase</DialogTitle>
            </div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={editForm.control} name="purchaseDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Date of Buying</Label>
                      <Popover open={isEditDatePickerOpen} onOpenChange={setIsEditDatePickerOpen}>
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
                              setIsEditDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Farmer Name</Label><FormControl><Input placeholder="Farmer Name" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={editForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical">Purchase Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={editForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical">Amount Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Save Changes</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
