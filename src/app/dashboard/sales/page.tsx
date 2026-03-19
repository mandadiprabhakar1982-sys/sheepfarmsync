'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  ArrowRightLeft, 
  ShieldCheck, 
  X, 
  Plus, 
  CheckCircle2, 
  Search 
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
    sales, addSale, postToMarketplace,
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
    toast({ title: 'Pashu Sold', description: 'Transaction recorded in selling ledger.' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl animate-pulse space-y-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-[#edf2f7] rounded-2xl w-full" />)}
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
                  <ArrowRightLeft className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight leading-none uppercase text-white">Sheep Selling</CardTitle>
              </div>
              <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] ml-7">Verified Cattle Trade Audit</CardDescription>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input 
                placeholder="Search Buyer or Village..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold focus-visible:ring-white/20" 
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsDisposalOpen(true)} 
                className="h-8 px-3 rounded-lg font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-1.5 shadow-xl border-none text-[10px]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Record Sale
              </Button>
              
              <div className="px-3 py-0.5 bg-black/20 rounded-lg text-white flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Sale Revenue</p>
                  <p className="text-base font-black tracking-tighter leading-none mt-0.5">₹{totalSales.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* MOBILE VIEW */}
          <div className="block md:hidden p-4 space-y-8">
            {combinedLedger.length > 0 ? combinedLedger.map((item) => (
              <div key={item.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5", item._type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{item._type === 'sale' ? 'AMMAKAM' : 'BUY'}</Badge>
                    <h3 className="text-lg font-black text-[#2F4F4F] truncate leading-none">{item.entity}</h3>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.loc} • {item.animalCount} Head</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-xl font-black", item._type === 'sale' ? "text-[#059669]" : "text-slate-900")}>
                    {item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}
                  </p>
                  {item.dues > 0 ? (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-widest">₹{item.dues.toLocaleString()} Raavalasi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">SETTLED</span>
                    </div>
                  )}
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No selling records discovered</div>}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Selling Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Counterparty (Buyer)</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Head Count</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Transaction Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedLedger.map((item) => (
                  <TableRow key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{item.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{item.entity}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{item.loc} • {item._type === 'sale' ? 'SELLING' : 'BUYING'}</span></div>
                    </TableCell>
                    <TableCell className="text-center"><span className="text-[14px] font-black">{item.animalCount} Head</span></TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex flex-col items-end">
                        <span className={cn("text-[18px] font-black", item._type === 'sale' ? "text-emerald-600" : "text-slate-900")}>{item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}</span>
                        {item.dues > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase">₹{item.dues.toLocaleString()} Raavalasi</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isDisposalOpen} onOpenChange={setIsDisposalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Selling Entry</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...salesForm}>
            <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={salesForm.control} name="buyerName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Buyer Identity</Label><FormControl><Input placeholder="e.g. John Doe" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={salesForm.control} name="animalCount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Head Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={salesForm.control} name="salePrice" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl">Record Pashu Sell</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
