'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  ArrowRightLeft, 
  ShieldCheck, 
  X, 
  Plus, 
  PlusCircle, 
  CheckCircle2, 
  Search 
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

type SalesFormData = z.infer<typeof salesFormSchema>;

export default function TradeLedgerPage() {
  const { toast } = useToast();
  const { 
    sales, addSale, deleteSale, postToMarketplace,
    purchases, totalSales, isLoading 
  } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDisposalOpen, setIsDisposalOpen] = useState(false);
  
  const salesForm = useForm<SalesFormData>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: { buyerName: '', buyerVillage: '', animalCount: 1, animalWeightKg: 0, salePrice: 0, outstandingDuesFromBuyer: 0, amountReceived: 0, isPublic: false },
  });

  const combinedLedger = useMemo(() => {
    const s = (sales || []).map(item => ({ ...item, _type: 'sale' as const, date: item.saleDate, entity: item.buyerName, value: item.salePrice, dues: item.outstandingDuesFromBuyer, loc: item.buyerVillage }));
    const p = (purchases || []).map(item => ({ ...item, _type: 'purchase' as const, date: item.purchaseDate, entity: item.farmerName, value: item.purchasePrice, dues: item.dueAmount, loc: item.villageName }));
    const filtered = [...s, ...p].filter(item => item.entity.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases, searchTerm]);

  const groupedLedger = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    combinedLedger.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [combinedLedger]);

  const onSalesSubmit: SubmitHandler<SalesFormData> = async (data) => {
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
    toast({ title: 'Sale Logged', description: 'Transaction recorded.' });
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
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING TRADE DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight">Trade Ledger</h2>
        <p className="text-xl font-black">₹{totalSales.toLocaleString()}</p>
      </div>

      <div className="md:hidden h-16 shrink-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Trade Ledger" description="DISPOSAL & ACQUISITION SUITE" className="mb-0 hidden md:block" />

        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => setIsDisposalOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none">
            <PlusCircle className="h-5 w-5 text-accent" />
            Log Sale
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Total Value</p><p className="text-xl font-black tracking-tight text-white">₹{totalSales.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Filter by Counterparty..." 
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
                <div className="flex items-center gap-3"><ArrowRightLeft className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Master Ledger</CardTitle></div>
                <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Cash Flow Audit</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">₹{totalSales.toLocaleString()}</p>
            </div>
          </CardHeader>

          {/* MOBILE VIEW */}
          <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
            <ScrollArea className="h-full px-4 pt-4">
              {groupedLedger.length > 0 ? groupedLedger.map((group) => (
                <div key={group.date} className="mb-8">
                  <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5", item._type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{item._type === 'sale' ? 'SALE' : 'BUY'}</Badge>
                            <h3 className="text-lg font-black text-slate-900 truncate leading-none">{item.entity}</h3>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.loc} • {item.animalCount} Head</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn("text-xl font-black", item._type === 'sale' ? "text-[#059669]" : "text-slate-900")}>
                            {item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}
                          </p>
                          {item.dues > 0 ? (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 mt-1">
                              <span className="text-[9px] font-black uppercase tracking-widest">₹{item.dues.toLocaleString()} DUE</span>
                            </div>
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
              <div className="p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4">Counterparty</th>
                      <th className="py-4 px-4 text-center">Asset Count</th>
                      <th className="py-4 px-4 text-right">Transaction Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedLedger.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-6 px-4 text-[11px] font-black text-slate-400">{item.date}</td>
                        <td className="py-6 px-4">
                          <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{item.entity}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{item.loc} • {item._type.toUpperCase()}</span></div>
                        </td>
                        <td className="py-6 px-4 text-center"><span className="text-[14px] font-black">{item.animalCount} Head</span></td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={cn("text-[18px] font-black", item._type === 'sale' ? "text-emerald-600" : "text-slate-900")}>{item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}</span>
                            {item.dues > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase">₹{item.dues.toLocaleString()} OUTSTANDING</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { salesForm.reset(); setIsDisposalOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={isDisposalOpen} onOpenChange={setIsDisposalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Disposal Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new sale to ledger</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...salesForm}><form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-6">
              <FormField control={salesForm.control} name="buyerName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Buyer Identity</Label><FormControl><Input placeholder="e.g. John Doe" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={salesForm.control} name="animalCount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Head Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={salesForm.control} name="salePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-emerald-600" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl">Commit Sale Record</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}