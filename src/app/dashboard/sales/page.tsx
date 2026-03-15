'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Globe, 
  ShoppingBag, 
  BadgeIndianRupee, 
  History, 
  ArrowUpRight, 
  TrendingUp, 
  HandCoins,
  ArrowRightLeft,
  Save,
  Plus,
  ShieldCheck,
  ArrowDownRight
} from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnimalSale, LivestockPurchase } from '@/lib/types';

// --- SCHEMAS ---

const salesFormSchema = z.object({
  saleDate: z.date({ required_error: 'A date is required.' }),
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerVillage: z.string().min(1, 'Village name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  animalWeightKg: z.coerce.number().positive('Must be a positive number'),
  salePrice: z.coerce.number().positive('Must be a positive number'),
  outstandingDuesFromBuyer: z.coerce.number().nonnegative('Cannot be negative'),
  amountReceived: z.coerce.number().nonnegative('Cannot be negative'),
  isPublic: z.boolean().default(false),
});

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

type SalesFormData = z.infer<typeof salesFormSchema>;
type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export default function TradeLedgerPage() {
  const { toast } = useToast();
  const { 
    sales, addSale, deleteSale, updateSale, postToMarketplace,
    purchases, addPurchase, deletePurchase, updatePurchase,
    totalReceivables, totalPayables, totalPurchaseCost, totalSales, isLoading
  } = useFarm();

  const [activeTab, setActiveTab] = useState('master');
  const [isDisposalOpen, setIsDisposalOpen] = useState(false);
  const [isAcquisitionOpen, setIsAcquisitionOpen] = useState(false);
  const [isEditSaleOpen, setIsEditSaleOpen] = useState(false);
  const [isEditPurchaseOpen, setIsEditPurchaseOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<AnimalSale | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<LivestockPurchase | null>(null);

  // --- FORMS ---

  const salesForm = useForm<SalesFormData>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: { buyerName: '', buyerVillage: '', animalCount: 1, animalWeightKg: 0, salePrice: 0, outstandingDuesFromBuyer: 0, amountReceived: 0, isPublic: false },
  });

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: { villageName: '', farmerName: '', animalCount: 1, purchasePrice: 0, transportCost: 0, amountPaid: 0, dueAmount: 0, payingTimePeriod: '' },
  });

  const editSalesForm = useForm<SalesFormData>({ resolver: zodResolver(salesFormSchema) });
  const editPurchaseForm = useForm<PurchaseFormData>({ resolver: zodResolver(purchaseFormSchema) });

  // --- AUTO-CALCULATIONS ---

  const watchedSalesFields = salesForm.watch(['salePrice', 'amountReceived']);
  useEffect(() => {
    const [price, received] = watchedSalesFields;
    salesForm.setValue('outstandingDuesFromBuyer', Math.max(0, (price || 0) - (received || 0)));
  }, [watchedSalesFields, salesForm]);

  const watchedPurchaseFields = purchaseForm.watch(['purchasePrice', 'amountPaid']);
  useEffect(() => {
    const [price, paid] = watchedPurchaseFields;
    purchaseForm.setValue('dueAmount', Math.max(0, (price || 0) - (paid || 0)));
  }, [watchedPurchaseFields, purchaseForm]);

  // --- HANDLERS ---

  const onSalesSubmit: SubmitHandler<SalesFormData> = (data) => {
    const payload = { ...data, saleDate: format(data.saleDate, 'yyyy-MM-dd') };
    addSale(payload);
    if (data.isPublic) {
      postToMarketplace({
        saleDate: payload.saleDate, village: data.buyerVillage, animalCount: data.animalCount,
        totalWeight: data.animalWeightKg, askingPrice: data.salePrice, notes: `Sold to ${data.buyerName}`
      });
    }
    salesForm.reset();
    setIsDisposalOpen(false);
    toast({ title: 'Sale Logged', description: 'Transaction recorded in master ledger.' });
  };

  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    addPurchase({ ...data, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') });
    purchaseForm.reset();
    setIsAcquisitionOpen(false);
    toast({ title: 'Purchase Logged', description: 'Acquisition recorded in master ledger.' });
  };

  const onEditSaleSubmit: SubmitHandler<SalesFormData> = (data) => {
    if (!editingSale) return;
    updateSale(editingSale.id, { ...data, saleDate: format(data.saleDate, 'yyyy-MM-dd') }, editingSale._path);
    setIsEditSaleOpen(false);
    toast({ title: 'Sale Updated', description: 'Ledger record adjusted.' });
  };

  const onEditPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    if (!editingPurchase) return;
    updatePurchase(editingPurchase.id, { ...data, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') }, editingPurchase._path);
    setIsEditPurchaseOpen(false);
    toast({ title: 'Acquisition Updated', description: 'Ledger record adjusted.' });
  };

  const handleEditSale = (sale: AnimalSale) => {
    setEditingSale(sale);
    editSalesForm.reset({ ...sale, saleDate: new Date(sale.saleDate) });
    setIsEditSaleOpen(true);
  };

  const handleEditPurchase = (purchase: LivestockPurchase) => {
    setEditingPurchase(purchase);
    editPurchaseForm.reset({ ...purchase, purchaseDate: new Date(purchase.purchaseDate) });
    setIsEditPurchaseOpen(true);
  };

  // --- COMBINED DATA LOGIC ---

  const combinedLedger = useMemo(() => {
    const s = (sales || []).map(item => ({ ...item, _type: 'sale' as const, date: item.saleDate, entity: item.buyerName, value: item.salePrice, dues: item.outstandingDuesFromBuyer }));
    const p = (purchases || []).map(item => ({ ...item, _type: 'purchase' as const, date: item.purchaseDate, entity: item.farmerName, value: item.purchasePrice, dues: item.dueAmount }));
    return [...s, ...p].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING TRADE DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Trade Ledger"
          description="INTEGRATED PURCHASE & DISPOSAL SUITE"
          className="mb-0"
        />
        
        <div className="flex flex-wrap items-center gap-4">
          <Dialog open={isDisposalOpen} onOpenChange={setIsDisposalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { salesForm.reset(); setIsDisposalOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none">
                <ArrowUpRight className="h-5 w-5" />
                Disposal Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Disposal Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit livestock outflow to master ledger</DialogDescription>
              </DialogHeader>
              <div className="p-8">
                <Form {...salesForm}>
                  <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-6">
                    <FormField control={salesForm.control} name="saleDate" render={({ field }) => (
                      <FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Date of Sale</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left bg-slate-50 border-slate-200">{field.value ? format(field.value, "MMM dd, yyyy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={salesForm.control} name="buyerName" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Buyer</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                      <FormField control={salesForm.control} name="buyerVillage" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Village</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={salesForm.control} name="animalCount" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Count</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                      <FormField control={salesForm.control} name="animalWeightKg" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Total KG</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                    </div>
                    <FormField control={salesForm.control} name="salePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-black text-emerald-600" {...field} /></FormControl></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={salesForm.control} name="amountReceived" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Received (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                      <FormField control={salesForm.control} name="outstandingDuesFromBuyer" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Due (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 border-rose-100 text-rose-600 font-black" {...field} readOnly /></FormControl></FormItem>)} />
                    </div>
                    <FormField control={salesForm.control} name="isPublic" render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-2xl border border-slate-100 p-4 bg-slate-50">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="leading-none"><Label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2 text-slate-600">Post to Marketplace <Globe className="h-3 w-3 text-primary" /></Label></div>
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">Commit Sale</Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAcquisitionOpen} onOpenChange={setIsAcquisitionOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { purchaseForm.reset(); setIsAcquisitionOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xl border-none">
                <ArrowDownRight className="h-5 w-5" />
                Acquisition Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Acquisition Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document livestock inflow into master ledger</DialogDescription>
              </DialogHeader>
              <div className="p-8">
                <Form {...purchaseForm}>
                  <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-6">
                    <FormField control={purchaseForm.control} name="purchaseDate" render={({ field }) => (
                      <FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Date of Entry</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left bg-slate-50 border-slate-200">{field.value ? format(field.value, "MMM dd, yyyy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Origin Farmer</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                      <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Village</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Count</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                      <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Cost (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-black text-blue-600" {...field} /></FormControl></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                      <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Due (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-rose-50 border-rose-100 text-rose-600 font-black" {...field} readOnly /></FormControl></FormItem>)} />
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">Commit Acquisition</Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Balance</p>
              <p className="text-xl font-black tracking-tight">₹{(totalSales - totalPurchaseCost).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card glow-blue rounded-3xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><ShoppingBag className="h-6 w-6" /></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Purchases</p><p className="text-2xl font-black">₹{totalPurchaseCost.toLocaleString()}</p></div>
        </div>
        <div className="glass-card glow-emerald rounded-3xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><BadgeIndianRupee className="h-6 w-6" /></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Sales</p><p className="text-2xl font-black">₹{totalSales.toLocaleString()}</p></div>
        </div>
        <div className="glass-card glow-gold rounded-3xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner"><HandCoins className="h-6 w-6" /></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Receivables</p><p className="text-2xl font-black text-amber-600">₹{totalReceivables.toLocaleString()}</p></div>
        </div>
        <div className="glass-card glow-coral rounded-3xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner"><ArrowRightLeft className="h-6 w-6" /></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Payables</p><p className="text-2xl font-black text-rose-600">₹{totalPayables.toLocaleString()}</p></div>
        </div>
      </div>

      <Tabs defaultValue="master" onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-[#e7eddc] p-1 rounded-2xl h-14 w-fit shadow-inner">
            <TabsTrigger value="master" className="tab-inactive data-[state=active]:tab-active font-black text-[10px] uppercase tracking-widest px-10">Master Ledger</TabsTrigger>
            <TabsTrigger value="sales" className="tab-inactive data-[state=active]:tab-active font-black text-[10px] uppercase tracking-widest px-10">Disposals</TabsTrigger>
            <TabsTrigger value="purchases" className="tab-inactive data-[state=active]:tab-active font-black text-[10px] uppercase tracking-widest px-10">Acquisitions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="master" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-slate-50 border-none">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Type</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Counterparty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Qty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedLedger.length > 0 ? combinedLedger.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.date}</TableCell>
                      <TableCell>
                        <Badge className={cn("border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5", item._type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>
                          {item._type === 'sale' ? 'OUT / SALE' : 'IN / BUY'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-slate-900">{item.entity}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.buyerVillage || item.villageName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center"><span className="text-[14px] font-black text-slate-900">{item.animalCount} Head</span></TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex flex-col items-end">
                          <span className={cn("text-[18px] font-black", item._type === 'sale' ? "text-emerald-600" : "text-slate-900")}>
                            {item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}
                          </span>
                          {item.dues > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase">₹{item.dues.toLocaleString()} OUTSTANDING</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-32 opacity-20 font-black uppercase text-xs">No trade records discovered</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase pl-10 py-6">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Buyer / Destination</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-center">Qty</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right pr-10">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales?.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50 border-b border-slate-100 group">
                    <TableCell className="pl-10 text-[10px] font-black text-slate-400 uppercase">{s.saleDate}</TableCell>
                    <TableCell><span className="text-sm font-black text-slate-900">{s.buyerName}</span></TableCell>
                    <TableCell className="text-center"><Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3">{s.animalCount} Head</Badge></TableCell>
                    <TableCell className="text-right pr-10 font-black text-emerald-600">₹{s.salePrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase pl-10 py-6">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Origin / Farmer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-center">Qty</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right pr-10">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases?.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50 border-b border-slate-100 group">
                    <TableCell className="pl-10 text-[10px] font-black text-slate-400 uppercase">{p.purchaseDate}</TableCell>
                    <TableCell><span className="text-sm font-black text-slate-900">{p.farmerName}</span></TableCell>
                    <TableCell className="text-center"><Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3">{p.animalCount} Head</Badge></TableCell>
                    <TableCell className="text-right pr-10 font-black text-slate-900">₹{p.purchasePrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- EDIT MODALS --- */}
      <Dialog open={isEditSaleOpen} onOpenChange={setIsEditSaleOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black uppercase">Update Disposal</DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] uppercase tracking-widest">Adjust record for: {editingSale?.buyerName}</DialogDescription>
          </DialogHeader>
          <Form {...editSalesForm}>
            <form onSubmit={editSalesForm.handleSubmit(onEditSaleSubmit)} className="space-y-6 p-8">
              <FormField control={editSalesForm.control} name="saleDate" render={({ field }) => (
                <FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left bg-slate-50 border-slate-200">{field.value ? format(field.value, "MMM dd, yy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editSalesForm.control} name="buyerName" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Buyer</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                <FormField control={editSalesForm.control} name="buyerVillage" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Village</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editSalesForm.control} name="salePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-black" {...field} /></FormControl></FormItem>)} />
                <FormField control={editSalesForm.control} name="amountReceived" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Received (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-bold text-emerald-600" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditSaleOpen(false)} className="h-12 px-6 rounded-xl font-bold uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase bg-neutral-900 text-white flex-1 text-xs"><Save className="mr-2 h-4 w-4 text-emerald-400" /> Save Adjustments</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPurchaseOpen} onOpenChange={setIsEditPurchaseOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black uppercase">Update Acquisition</DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] uppercase tracking-widest">Adjust record for: {editingPurchase?.farmerName}</DialogDescription>
          </DialogHeader>
          <Form {...editPurchaseForm}>
            <form onSubmit={editPurchaseForm.handleSubmit(onEditPurchaseSubmit)} className="space-y-6 p-8">
              <FormField control={editPurchaseForm.control} name="purchaseDate" render={({ field }) => (
                <FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical w-full text-left bg-slate-50 border-slate-200">{field.value ? format(field.value, "MMM dd, yy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editPurchaseForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Farmer</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                <FormField control={editPurchaseForm.control} name="villageName" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Village</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editPurchaseForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Cost (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-black" {...field} /></FormControl></FormItem>)} />
                <FormField control={editPurchaseForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Paid (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-bold text-blue-600" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditPurchaseOpen(false)} className="h-12 px-6 rounded-xl font-bold uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase bg-neutral-900 text-white flex-1 text-xs"><Save className="mr-2 h-4 w-4 text-emerald-400" /> Save Adjustments</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
