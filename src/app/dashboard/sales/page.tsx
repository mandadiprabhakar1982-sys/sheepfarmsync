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
  Save
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
  FormMessage,
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
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
    totalReceivables, totalPayables
  } = useFarm();

  const [activeTab, setActiveTab] = useState('sales');
  
  // Dialog States
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

  const watchedEditSalesFields = editSalesForm.watch(['salePrice', 'amountReceived']);
  useEffect(() => {
    if (!isEditSaleOpen) return;
    const [price, received] = watchedEditSalesFields;
    editSalesForm.setValue('outstandingDuesFromBuyer', Math.max(0, (price || 0) - (received || 0)));
  }, [watchedEditSalesFields, editSalesForm, isEditSaleOpen]);

  const watchedPurchaseFields = purchaseForm.watch(['purchasePrice', 'amountPaid']);
  useEffect(() => {
    const [price, paid] = watchedPurchaseFields;
    purchaseForm.setValue('dueAmount', Math.max(0, (price || 0) - (paid || 0)));
  }, [watchedPurchaseFields, purchaseForm]);

  const watchedEditPurchaseFields = editPurchaseForm.watch(['purchasePrice', 'amountPaid']);
  useEffect(() => {
    if (!isEditPurchaseOpen) return;
    const [price, paid] = watchedEditPurchaseFields;
    editPurchaseForm.setValue('dueAmount', Math.max(0, (price || 0) - (paid || 0)));
  }, [watchedEditPurchaseFields, editPurchaseForm, isEditPurchaseOpen]);

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
    toast({ title: 'Sale Logged', description: 'Transaction recorded in trade ledger.' });
  };

  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    addPurchase({ ...data, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') });
    purchaseForm.reset();
    toast({ title: 'Purchase Logged', description: 'Acquisition recorded in trade ledger.' });
  };

  const onEditSaleSubmit: SubmitHandler<SalesFormData> = (data) => {
    if (!editingSale) return;
    updateSale(editingSale.id, { ...data, saleDate: format(data.saleDate, 'yyyy-MM-dd') }, editingSale._path);
    setIsEditSaleOpen(false);
    toast({ title: 'Sale Updated', description: 'Ledger record has been adjusted.' });
  };

  const onEditPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    if (!editingPurchase) return;
    updatePurchase(editingPurchase.id, { ...data, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') }, editingPurchase._path);
    setIsEditPurchaseOpen(false);
    toast({ title: 'Acquisition Updated', description: 'Ledger record has been adjusted.' });
  };

  const handleEditSale = (sale: AnimalSale) => {
    setEditingSale(sale);
    editSalesForm.reset({
      ...sale,
      saleDate: new Date(sale.saleDate),
    });
    setIsEditSaleOpen(true);
  };

  const handleEditPurchase = (purchase: LivestockPurchase) => {
    setEditingPurchase(purchase);
    editPurchaseForm.reset({
      ...purchase,
      purchaseDate: new Date(purchase.purchaseDate),
    });
    setIsEditPurchaseOpen(true);
  };

  const sortedSales = useMemo(() => sales ? [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()) : [], [sales]);
  const sortedPurchases = useMemo(() => purchases ? [...purchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()) : [], [purchases]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Trade Ledger"
          description="INTEGRATED ACQUISITION & DISPOSAL SUITE"
          className="mb-0"
        />
        <div className="flex gap-4">
          <div className="px-5 py-2.5 bg-neutral-900 rounded-xl text-white flex items-center gap-4 shadow-xl">
            <HandCoins className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none">Total Receivables</p>
              <p className="text-lg font-black tracking-tight">₹{totalReceivables.toLocaleString()}</p>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-neutral-900 rounded-xl text-white flex items-center gap-4 shadow-xl">
            <ArrowRightLeft className="h-4 w-4 text-rose-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest opacity-40 leading-none">Total Payables</p>
              <p className="text-lg font-black tracking-tight">₹{totalPayables.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sales" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-10 p-1.5 bg-neutral-100 rounded-2xl grid grid-cols-2 h-14 max-w-md mx-auto">
          <TabsTrigger value="sales" className="rounded-xl font-black text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <BadgeIndianRupee className="h-4 w-4 mr-2" /> Sales History
          </TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-xl font-black text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <ShoppingBag className="h-4 w-4 mr-2" /> Acquisitions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Card className="border-none bg-neutral-50/50 sticky top-24 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardHeader className="bg-neutral-900 p-8 text-white">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Disposal Entry
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Record high-value livestock outflow</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...salesForm}>
                    <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-6">
                      <FormField control={salesForm.control} name="saleDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><Label className="text-xs font-black uppercase opacity-40 ml-2">Date of Sale</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-left px-4">{field.value ? format(field.value, "MMM dd, yy") : "Select"}<CalendarIcon className="ml-auto h-4 w-4 opacity-20" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                      )} />
                      <FormField control={salesForm.control} name="buyerName" render={({ field }) => (
                        <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Buyer Name</Label><FormControl><Input className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" placeholder="Identity" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={salesForm.control} name="buyerVillage" render={({ field }) => (
                        <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Village</Label><FormControl><Input className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" placeholder="Location" {...field} /></FormControl></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={salesForm.control} name="animalCount" render={({ field }) => (
                          <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Count</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={salesForm.control} name="animalWeightKg" render={({ field }) => (
                          <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Total Weight (kg)</Label><FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                      <FormField control={salesForm.control} name="salePrice" render={({ field }) => (
                        <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Total Value (₹)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" {...field} /></FormControl></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={salesForm.control} name="amountReceived" render={({ field }) => (
                          <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Received (₹)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-emerald-600" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={salesForm.control} name="outstandingDuesFromBuyer" render={({ field }) => (
                          <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2 text-rose-400">Due (₹)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-rose-500/10 border-none text-rose-400 font-black" {...field} readOnly /></FormControl></FormItem>
                        )} />
                      </div>
                      <FormField control={salesForm.control} name="isPublic" render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-2xl border border-neutral-100 p-4 bg-white/50">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <div className="leading-none"><FormLabel className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">Post to Marketplace <Globe className="h-3 w-3 text-primary" /></FormLabel></div>
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 text-white">Commit Sale</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-primary p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none mb-2">Disposal Ledger</CardTitle>
                      <CardDescription className="text-white/60 text-xs font-black uppercase tracking-widest">Audit-grade historical records of livestock sales</CardDescription>
                    </div>
                    <History className="h-7 w-7 text-emerald-400 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase pl-8 py-5">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Buyer / Destination</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Qty</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-right">Value</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-right pr-8">Status</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSales.length > 0 ? (
                        sortedSales.map((s) => (
                          <TableRow key={s.id} className="group hover:bg-neutral-50 border-neutral-50 transition-all cursor-zoom-in active:scale-[0.995]" onClick={() => handleEditSale(s)}>
                            <TableCell className="pl-8 text-[10px] font-black text-muted-foreground/60 uppercase">{s.saleDate}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-neutral-900">{s.buyerName}</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{s.buyerVillage}</span>
                              </div>
                            </TableCell>
                            <TableCell><Badge className="bg-primary/5 text-primary border-none font-black text-[10px] px-3">{s.animalCount} Head</Badge></TableCell>
                            <TableCell className="text-right font-black text-sm">₹{s.salePrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right pr-8">
                              {s.outstandingDuesFromBuyer > 0 ? (
                                <span className="text-[10px] font-black text-rose-600">₹{s.outstandingDuesFromBuyer.toLocaleString()} DUE</span>
                              ) : (
                                <span className="text-[10px] font-black text-emerald-600">PAID FULL</span>
                              )}
                            </TableCell>
                            <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-neutral-100" onClick={() => handleEditSale(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600" onClick={() => deleteSale(s.id, s._path)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={6} className="text-center py-20 opacity-40 font-black uppercase text-[10px]">No sales recorded yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Card className="border-none bg-neutral-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-24">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-emerald-400" /> Intake Entry
                  </CardTitle>
                  <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document livestock acquisition outflow</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...purchaseForm}>
                    <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-6">
                      <FormField control={purchaseForm.control} name="purchaseDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><Label className="text-[10px] font-black uppercase opacity-40 ml-2">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 w-full rounded-xl bg-white/5 border-none text-white font-bold text-left px-4">{field.value ? format(field.value, "MMM dd, yy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                      )} />
                      <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (
                        <FormItem><Label className="text-[10px] font-black uppercase opacity-40 ml-2">Origin Farmer</Label><FormControl><Input className="h-12 rounded-xl bg-white/5 border-none text-white font-bold" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (
                        <FormItem><Label className="text-[10px] font-black uppercase opacity-40 ml-2">Village</Label><FormControl><Input className="h-12 rounded-xl bg-white/5 border-none text-white font-bold" {...field} /></FormControl></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (
                          <FormItem><Label className="text-[10px] font-black uppercase opacity-40 ml-2">Count</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white/5 border-none text-white font-black" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (
                          <FormItem><Label className="text-[10px] font-black uppercase opacity-40 ml-2">Total Price (₹)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white/5 border-none text-white font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (
                          <FormItem><Label className="text-[10px] font-black uppercase opacity-40 ml-2">Paid (₹)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white/5 border-none text-white font-bold" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (
                          <FormItem><Label className="text-[10px] font-black uppercase opacity-40 ml-2 text-rose-400">Due (₹)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-rose-500/10 border-none text-rose-400 font-black" {...field} readOnly /></FormControl></FormItem>
                        )} />
                      </div>
                      <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-none">Commit Acquisition</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-primary p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none mb-2">Acquisition Ledger</CardTitle>
                      <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Complete history of livestock entries</CardDescription>
                    </div>
                    <History className="h-7 w-7 text-emerald-400 opacity-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase pl-8 py-5">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Origin / Farmer</TableHead>
                        <TableHead className="text-[10px] font-black uppercase">Qty</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-right">Value</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-right pr-8">Status</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPurchases.length > 0 ? (
                        sortedPurchases.map((p) => (
                          <TableRow key={p.id} className="group hover:bg-neutral-50 border-neutral-50 transition-all cursor-zoom-in active:scale-[0.995]" onClick={() => handleEditPurchase(p)}>
                            <TableCell className="pl-8 py-6 text-[10px] font-black text-muted-foreground/60 uppercase">{p.purchaseDate}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-neutral-900">{p.farmerName}</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{p.villageName}</span>
                              </div>
                            </TableCell>
                            <TableCell><Badge className="bg-primary/5 text-primary border-none font-black text-[10px] px-3">{p.animalCount} Head</Badge></TableCell>
                            <TableCell className="text-right font-black text-sm">₹{p.purchasePrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right pr-8">
                              {p.dueAmount > 0 ? (
                                <span className="text-[10px] font-black text-rose-600">₹{p.dueAmount.toLocaleString()} DUE</span>
                              ) : (
                                <span className="text-[10px] font-black text-emerald-600">PAID FULL</span>
                              )}
                            </TableCell>
                            <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-neutral-100" onClick={() => handleEditPurchase(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600" onClick={() => deletePurchase(p.id, p._path)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={6} className="text-center py-20 opacity-40 font-black uppercase text-[10px]">No acquisition records logged</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS: EDIT SALE --- */}
      <Dialog open={isEditSaleOpen} onOpenChange={setIsEditSaleOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black uppercase">Update Disposal</DialogTitle>
            <DialogDescription className="text-white/40 text-xs uppercase tracking-widest">Adjust record for: {editingSale?.buyerName}</DialogDescription>
          </DialogHeader>
          <Form {...editSalesForm}>
            <form onSubmit={editSalesForm.handleSubmit(onEditSaleSubmit)} className="space-y-6 p-8 bg-white">
              <FormField control={editSalesForm.control} name="saleDate" render={({ field }) => (
                <FormItem className="flex flex-col"><Label className="text-xs font-black uppercase opacity-40">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-left px-4">{field.value ? format(field.value, "MMM dd, yy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editSalesForm.control} name="buyerName" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Buyer</Label><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>)} />
                <FormField control={editSalesForm.control} name="buyerVillage" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Village</Label><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editSalesForm.control} name="salePrice" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Price</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
                <FormField control={editSalesForm.control} name="amountReceived" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Received</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-emerald-50 border-none text-emerald-600 font-bold" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditSaleOpen(false)} className="h-12 px-6 rounded-xl font-bold uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase bg-neutral-900 text-white hover:bg-neutral-800 flex-1 text-xs">
                  <Save className="mr-2 h-4 w-4" /> Save Ledger Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- DIALOGS: EDIT ACQUISITION --- */}
      <Dialog open={isEditPurchaseOpen} onOpenChange={setIsEditPurchaseOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black uppercase">Update Acquisition</DialogTitle>
            <DialogDescription className="text-white/40 text-xs uppercase tracking-widest">Adjust record for: {editingPurchase?.farmerName}</DialogDescription>
          </DialogHeader>
          <Form {...editPurchaseForm}>
            <form onSubmit={editPurchaseForm.handleSubmit(onEditPurchaseSubmit)} className="space-y-6 p-8 bg-white">
              <FormField control={editPurchaseForm.control} name="purchaseDate" render={({ field }) => (
                <FormItem className="flex flex-col"><Label className="text-xs font-black uppercase opacity-40">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-left px-4">{field.value ? format(field.value, "MMM dd, yy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editPurchaseForm.control} name="farmerName" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Farmer</Label><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>)} />
                <FormField control={editPurchaseForm.control} name="villageName" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Village</Label><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editPurchaseForm.control} name="purchasePrice" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Total Price</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl></FormItem>)} />
                <FormField control={editPurchaseForm.control} name="amountPaid" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40">Paid</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-emerald-50 border-none text-emerald-600 font-bold" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditPurchaseOpen(false)} className="h-12 px-6 rounded-xl font-bold uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase bg-neutral-900 text-white hover:bg-neutral-800 flex-1 text-xs">
                  <Save className="mr-2 h-4 w-4" /> Save Ledger Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
