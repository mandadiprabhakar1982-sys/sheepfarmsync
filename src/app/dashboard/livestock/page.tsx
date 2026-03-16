'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Pencil, 
  Search,
  Camera,
  Upload,
  X,
  PlusCircle,
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  LayoutGrid,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useStorage } from '@/firebase';
import { uploadToStorage } from '@/lib/upload';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const assetSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  registrationDate: z.date({ required_error: 'Registration date is required' }),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }).default('female'),
  age: z.coerce.number().min(0, 'Age is required'),
  currentWeight: z.coerce.number().min(1, 'Weight is required'),
  breed: z.string().min(1, 'Breed is required').default('Standard'),
  imageUrl: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const storage = useStorage();
  const { 
    trackedSheep, addTrackedSheep, updateTrackedSheep, deleteTrackedSheep,
    totalDailyFeed, totalTracked, totalSheep, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [zoomedAsset, setZoomedAsset] = useState<any>(null);

  // Camera & Photo State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard', imageUrl: '' 
    },
  });

  const editAssetForm = useForm<AssetFormData>({ resolver: zodResolver(assetSchema) });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setIsCameraActive(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Please enable camera permissions.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = (formToSet: any) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      formToSet.setValue('imageUrl', dataUrl);
      stopCamera();
    }
  };

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    let list = trackedSheep;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
    }
    if (genderFilter !== 'all') list = list.filter(s => s.gender === genderFilter);
    return list;
  }, [trackedSheep, searchTerm, genderFilter]);

  const onAssetSubmit: SubmitHandler<AssetFormData> = async (data) => {
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }
      addTrackedSheep({ 
        ...data, 
        imageUrl: finalUrl || '',
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd') 
      });
      assetForm.reset();
      setIsEntryDialogOpen(false);
      toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not sync asset.' });
    } finally {
      setIsUploading(false);
    }
  };

  const onEditAssetSubmit: SubmitHandler<AssetFormData> = async (data) => {
    if (!editingAsset) return;
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }
      updateTrackedSheep(editingAsset.id, { 
        ...data, 
        imageUrl: finalUrl || editingAsset.imageUrl, 
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd') 
      }, editingAsset._path);
      setIsEditAssetOpen(false);
      setEditingAsset(null);
      toast({ title: 'Updated', description: `Asset ${data.tagId} synced.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Update failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING REGISTRY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader title="Livestock Hub" description="PRECISION ASSET REGISTRY" className="mb-0" />
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl border-none">
                <LayoutGrid className="h-5 w-5 text-emerald-400" />
                Record Asset
                <ChevronDown className="h-4 w-4 opacity-40 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-2xl p-2 border-none mt-2">
              <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Registry Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Tracked Assets</span><span className="text-xs font-black text-emerald-600">{totalTracked} Head</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Daily Feed</span><span className="text-xs font-black text-amber-600">{totalDailyFeed.toFixed(0)}kg</span></div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-100" />
              <div className="p-1"><DropdownMenuItem onClick={() => setIsEntryDialogOpen(true)} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"><PlusCircle className="h-4 w-4" /><span className="text-[11px] font-black uppercase tracking-wider">Add New Animal</span></DropdownMenuItem></div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Flock</p><p className="text-xl font-black tracking-tight">{totalSheep}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input placeholder="Search Tag ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-16 pl-16 rounded-full bg-white border-none text-slate-900 font-bold shadow-sm" />
          </div>
          
          <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-white/60 shadow-sm">
            {['all', 'male', 'female'].map((g) => (
              <Button key={g} variant="ghost" onClick={() => setGenderFilter(g as any)} className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", genderFilter === g ? "bg-white shadow-md text-emerald-600" : "text-slate-400")}>{g}</Button>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-emerald-600 text-white p-10 py-12">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3"><LayoutGrid className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Livestock Registry</CardTitle></div>
                <CardDescription className="text-emerald-100/60 text-xs font-black uppercase tracking-[0.2em]">Verified Individual Records</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">{filteredAssets.length} ASSETS</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Asset ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Attributes</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Weight</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
                  <TableRow key={sheep.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors group">
                    <TableCell className="pl-10 py-10">
                      <div className="flex items-center gap-6">
                        <div 
                          className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 cursor-zoom-in active:scale-95 transition-transform shrink-0 relative"
                          onClick={() => { setZoomedAsset(sheep); }}
                        >
                          {sheep.imageUrl ? (
                            <Image 
                              src={sheep.imageUrl} 
                              alt={`Sheep ${sheep.tagId}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300">
                              <ImageIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">{sheep.tagId}</span>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sheep.breed || 'STANDARD'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-slate-900 uppercase">{sheep.gender || 'FEMALE'}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sheep.age} MONTHS</span>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-emerald-600 uppercase tracking-tight">
                          <CalendarDays className="h-2.5 w-2.5" />
                          Reg: {sheep.registrationDate || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xl font-black text-slate-900 tracking-tight">{sheep.currentWeight} kg</span>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"
                          onClick={() => { 
                            setEditingAsset(sheep); 
                            editAssetForm.reset({ 
                              ...sheep, 
                              registrationDate: sheep.registrationDate ? new Date(sheep.registrationDate) : new Date() 
                            }); 
                            setIsEditAssetOpen(true); 
                          }}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => deleteTrackedSheep(sheep.id, sheep._path)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs tracking-widest">No assets match your filter</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* --- IDENTITY ZOOM DIALOG --- */}
      <Dialog open={!!zoomedAsset} onOpenChange={(o) => !o && setZoomedAsset(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-neutral-900">
          <DialogHeader className="sr-only">
            <DialogTitle>Asset Identity Zoom: {zoomedAsset?.tagId}</DialogTitle>
            <DialogDescription>Full biological specification review</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full relative">
            <div className="absolute top-6 left-8 z-20">
              <Badge className="bg-emerald-500 text-neutral-900 border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">ID: {zoomedAsset?.tagId}</Badge>
            </div>
            <div className="w-full aspect-video relative overflow-hidden bg-black flex items-center justify-center">
              {zoomedAsset?.imageUrl ? (
                <Image 
                  src={zoomedAsset.imageUrl} 
                  alt="Sheep" 
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/20">
                  <ImageIcon className="h-20 w-20" />
                  <p className="text-xs font-black uppercase tracking-widest">No Visual Evidence</p>
                </div>
              )}
            </div>
            <div className="p-10 bg-neutral-900 text-white border-t border-white/5">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">{zoomedAsset?.tagId}</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Verified Biological Record</p>
                  </div>
                  <div className="flex gap-8">
                    <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Breed</p><p className="text-xs font-black uppercase text-emerald-400">{zoomedAsset?.breed || 'Standard'}</p></div>
                    <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Weight</p><p className="text-xs font-black">{zoomedAsset?.currentWeight} KG</p></div>
                    <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Age</p><p className="text-xs font-black">{zoomedAsset?.age} MOS</p></div>
                    <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Registered</p><p className="text-xs font-black">{zoomedAsset?.registrationDate || 'N/A'}</p></div>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><ShieldCheck className="h-6 w-6" /></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ENTRY DIALOG --- */}
      <Dialog open={isEntryDialogOpen} onOpenChange={(o) => { if (!o) stopCamera(); setIsEntryDialogOpen(o); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight uppercase">Enroll Asset</DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Register new biological asset</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="mb-8 space-y-4">
              <Label className="form-label-tactical">Asset Proof</Label>
              <div className="w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                {isCameraActive ? (
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 rounded-full bg-white shadow-sm border border-slate-100 text-slate-300"><ImageIcon className="h-8 w-8" /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Awaiting Media</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isCameraActive ? (
                  <Button type="button" onClick={() => capturePhoto(assetForm)} className="col-span-2 h-14 rounded-xl bg-emerald-600 text-white font-black uppercase text-xs">Capture Photo</Button>
                ) : (
                  <>
                    <Button type="button" onClick={startCamera} className="h-12 rounded-xl bg-neutral-900 text-white font-black text-[10px] uppercase gap-2"><Camera className="h-4 w-4 text-emerald-400" /> Open Camera</Button>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => { assetForm.setValue('imageUrl', reader.result as string); };
                          reader.readAsDataURL(file);
                        }
                      }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase gap-2"><Upload className="h-4 w-4 text-blue-500" /> Gallery</Button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Form {...assetForm}><form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={assetForm.control} name="tagId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Tag ID</Label><FormControl><Input placeholder="e.g. 31-1" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="form-label-tactical">Registration Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                          {field.value ? format(field.value, "MMM dd, yyyy") : "Select date"}
                          <CalendarDays className="h-4 w-4 opacity-20" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={assetForm.control} name="breed" render={({ field }) => (<FormItem><Label className="form-label-tactical">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={assetForm.control} name="gender" render={({ field }) => (<FormItem><Label className="form-label-tactical">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">MALE</SelectItem><SelectItem value="female">FEMALE</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={assetForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical">Age (Months)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest shadow-xl">
                {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Synchronize Record'}
              </Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight uppercase">Update Record</DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Adjust asset parameters</DialogDescription>
          </DialogHeader>
          <div className="p-8">
            <Form {...editAssetForm}><form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editAssetForm.control} name="tagId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Tag ID</Label><FormControl><Input className="form-input-tactical bg-slate-50" {...field} /></FormControl></FormItem>)} />
                <FormField control={editAssetForm.control} name="registrationDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="form-label-tactical">Registration Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                          {field.value ? format(field.value, "MMM dd, yyyy") : "Select date"}
                          <CalendarDays className="h-4 w-4 opacity-20" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editAssetForm.control} name="breed" render={({ field }) => (<FormItem><Label className="form-label-tactical">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <FormField control={editAssetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editAssetForm.control} name="gender" render={({ field }) => (<FormItem><Label className="form-label-tactical">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">MALE</SelectItem><SelectItem value="female">FEMALE</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={editAssetForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical">Age (Months)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest shadow-xl">
                {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Adjustments'}
              </Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
