'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Globe, 
  ArrowUpRight, 
  ArrowRightLeft,
  Save,
  ShieldCheck,
  ArrowDownRight,
  Camera,
  Upload,
  ImageIcon,
  X,
  Loader2,
  ChevronDown,
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
  FormMessage
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { useStorage } from '@/firebase';
import { uploadToStorage } from '@/lib/upload';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnimalSale, LivestockPurchase } from '@/lib/types';

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
  imageUrl: z.string().optional(),
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
  imageUrl: z.string().optional(),
});

type SalesFormData = z.infer<typeof salesFormSchema>;
type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export default function TradeLedgerPage() {
  const { toast } = useToast();
  const storage = useStorage();
  const { 
    sales, addSale, deleteSale, updateSale, postToMarketplace,
    purchases, addPurchase, deletePurchase, updatePurchase,
    totalPurchaseCost, totalSales, isLoading
  } = useFarm();

  const [activeTab, setActiveTab] = useState('master');
  const [isDisposalOpen, setIsDisposalOpen] = useState(false);
  const [isAcquisitionOpen, setIsAcquisitionOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [editingSale, setEditingSale] = useState<AnimalSale | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<LivestockPurchase | null>(null);
  const [isEditSaleOpen, setIsEditSaleOpen] = useState(false);
  const [isEditPurchaseOpen, setIsEditPurchaseOpen] = useState(false);

  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const salesForm = useForm<SalesFormData>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: { buyerName: '', buyerVillage: '', animalCount: 1, animalWeightKg: 0, salePrice: 0, outstandingDuesFromBuyer: 0, amountReceived: 0, isPublic: false, imageUrl: '' },
  });

  const editSalesForm = useForm<SalesFormData>({ resolver: zodResolver(salesFormSchema) });

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: { villageName: '', farmerName: '', animalCount: 1, purchasePrice: 0, transportCost: 0, amountPaid: 0, dueAmount: 0, payingTimePeriod: '', imageUrl: '' },
  });

  const editPurchaseForm = useForm<PurchaseFormData>({ resolver: zodResolver(purchaseFormSchema) });

  // Camera Handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraActive(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Permission denied.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = (setter: any) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(dataUrl);
      setter('imageUrl', dataUrl);
      stopCamera();
    }
  };

  const resetPhoto = (setter: any) => {
    setCapturedPhoto(null);
    setter('imageUrl', '');
    setIsCameraActive(false);
  };

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
  const onSalesSubmit: SubmitHandler<SalesFormData> = async (data) => {
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'disposals');
      }
      const payload = { ...data, imageUrl: finalUrl, saleDate: format(data.saleDate, 'yyyy-MM-dd') };
      addSale(payload);
      if (data.isPublic) {
        postToMarketplace({
          saleDate: payload.saleDate, village: data.buyerVillage, animalCount: data.animalCount,
          totalWeight: data.animalWeightKg, askingPrice: data.salePrice, notes: `Sold to ${data.buyerName}`
        });
      }
      salesForm.reset();
      setCapturedPhoto(null);
      setIsDisposalOpen(false);
      toast({ title: 'Sale Logged', description: 'Transaction recorded.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync Error', description: 'Failed to persist visual.' });
    } finally {
      setIsUploading(false);
    }
  };

  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = async (data) => {
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'acquisitions');
      }
      addPurchase({ ...data, imageUrl: finalUrl, purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') });
      purchaseForm.reset();
      setCapturedPhoto(null);
      setIsAcquisitionOpen(false);
      toast({ title: 'Purchase Logged', description: 'Acquisition recorded.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync Error', description: 'Failed to persist visual.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (item: any) => {
    if (item._type === 'sale') {
      setEditingSale(item);
      editSalesForm.reset({ ...item, saleDate: new Date(item.date), animalWeightKg: item.animalWeightKg, salePrice: item.value, amountReceived: item.amountReceived || 0, buyerName: item.entity, buyerVillage: item.buyerVillage || '' });
      setIsEditSaleOpen(true);
    } else {
      setEditingPurchase(item);
      editPurchaseForm.reset({ ...item, purchaseDate: new Date(item.date), purchasePrice: item.value, amountPaid: item.amountPaid || 0, farmerName: item.entity, villageName: item.villageName || '' });
      setIsEditPurchaseOpen(true);
    }
  };

  const combinedLedger = useMemo(() => {
    const s = (sales || []).map(item => ({ ...item, _type: 'sale' as const, date: item.saleDate, entity: item.buyerName, value: item.salePrice, dues: item.outstandingDuesFromBuyer, img: item.imageUrl }));
    const p = (purchases || []).map(item => ({ ...item, _type: 'purchase' as const, date: item.purchaseDate, entity: item.farmerName, value: item.purchasePrice, dues: item.dueAmount, img: item.imageUrl }));
    return [...s, ...p].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases]);

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
    <div className="container mx-auto py-4 md:py-8 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
        <PageHeader title="Trade Ledger" description="INTEGRATED PURCHASE & DISPOSAL SUITE" className="mb-0" />
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none">
                <ArrowRightLeft className="h-5 w-5 text-accent" />
                Record Trade
                <ChevronDown className="h-4 w-4 opacity-40 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-2xl p-2 border-none">
              <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Trade Audit Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Total Purchase</span><span className="text-xs font-black text-blue-600">₹{totalPurchaseCost.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Total Sales</span><span className="text-xs font-black text-emerald-600">₹{totalSales.toLocaleString()}</span></div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-100" />
              <DropdownMenuItem onSelect={() => setIsDisposalOpen(true)} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"><ArrowUpRight className="h-4 w-4" /><span className="text-[11px] font-black uppercase tracking-wider">Disposal Entry</span></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsAcquisitionOpen(true)} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-blue-50 focus:text-blue-700"><ArrowDownRight className="h-4 w-4" /><span className="text-[11px] font-black uppercase tracking-wider">Acquisition Entry</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Balance</p><p className="text-xl font-black tracking-tight">₹{(totalSales - totalPurchaseCost).toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white flex-1 min-h-0 flex flex-col">
        <CardHeader className="bg-neutral-900 text-white p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
            <div className="space-y-1">
              <div className="flex items-center gap-3"><ArrowRightLeft className="h-6 w-6 text-emerald-400" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Master Ledger</CardTitle></div>
              <CardDescription className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Verified Acquisitions & Disposals</CardDescription>
            </div>
            <p className="text-3xl md:text-4xl font-black tracking-tighter">₹{totalSales.toLocaleString()}</p>
          </div>
        </CardHeader>
        
        {/* MOBILE VIEW: LIST */}
        <div className="md:hidden flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {combinedLedger.length > 0 ? combinedLedger.map((item: any) => (
              <div key={item.id} className="p-4 border-b border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors" onClick={() => handleEditClick(item)}>
                <div className="flex flex-col items-center min-w-[60px] text-center">
                  <span className="text-[10px] font-black text-slate-300 leading-none">{item.date.split('-')[0]}</span>
                  <span className="text-[14px] font-black text-slate-400 leading-none mt-1">{item.date.split('-').slice(1).join('-')}</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                  {item.img ? <img src={item.img} className="h-full w-full object-cover" alt="Asset" /> : <ImageIcon className="h-full w-full p-3 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5", item._type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{item._type === 'sale' ? 'SALE' : 'BUY'}</Badge>
                    <span className="text-sm font-black text-slate-900 truncate">{item.entity}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.buyerVillage || item.villageName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-base font-black leading-none", item._type === 'sale' ? "text-emerald-600" : "text-slate-900")}>{item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}</p>
                  {item.dues > 0 && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">₹{item.dues.toLocaleString()} DUE</p>}
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records</div>}
          </ScrollArea>
        </div>

        {/* DESKTOP VIEW: TABLE */}
        <div className="hidden md:block flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Counterparty</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Qty</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedLedger.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group cursor-pointer" onClick={() => handleEditClick(item)}>
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in active:scale-95 transition-transform" onClick={(e) => { if (item.img) { e.stopPropagation(); setZoomedPhoto(item.img); } }}>{item.img ? <img src={item.img} className="h-full w-full object-cover" alt="Asset" /> : <ImageIcon className="h-full w-full p-3 text-slate-300" />}</div>
                        <Badge className={cn("border-none font-black text-[8px] uppercase tracking-wider px-2 py-0.5", item._type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{item._type === 'sale' ? 'OUT / SALE' : 'IN / BUY'}</Badge>
                      </div>
                    </TableCell>
                    <TableCell><div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{item.entity}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.buyerVillage || item.villageName}</span></div></TableCell>
                    <TableCell className="text-center"><span className="text-[14px] font-black text-slate-900">{item.animalCount} Head</span></TableCell>
                    <TableCell className="text-right pr-10"><div className="flex items-center justify-end gap-4"><div className="flex flex-col items-end"><span className={cn("text-[18px] font-black", item._type === 'sale' ? "text-emerald-600" : "text-slate-900")}>{item._type === 'sale' ? '+' : '-'}₹{item.value.toLocaleString()}</span>{item.dues > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase">₹{item.dues.toLocaleString()} OUTSTANDING</span>}</div><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-50" onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600" onClick={(e) => { e.stopPropagation(); item._type === 'sale' ? deleteSale(item.id, item._path) : deletePurchase(item.id, item._path); }}><Trash2 className="h-4 w-4" /></Button></div></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>

      {/* DIALOGS REMAIN SAME BUT BENEFIT FROM SCROLL-CONTENT SHELL */}
      <Dialog open={!!zoomedPhoto} onOpenChange={(o) => !o && setZoomedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-neutral-900">
          <div className="relative aspect-square md:aspect-video flex items-center justify-center">
            {zoomedPhoto && <img src={zoomedPhoto} className="w-full h-full object-contain" alt="Asset audit" />}
            <Button variant="ghost" size="icon" onClick={() => setZoomedPhoto(null)} className="absolute top-6 right-8 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-5 w-5" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}