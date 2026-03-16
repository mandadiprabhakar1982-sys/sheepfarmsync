'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Pencil, 
  Search,
  Calendar as CalendarIcon,
  Plus,
  Scale,
  Users,
  ClipboardList,
  Camera,
  Upload,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  ShieldCheck,
  Image as ImageIcon,
  Save,
  Maximize2,
  Loader2,
  ChevronDown,
  LayoutGrid,
  Filter,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useStorage } from '@/firebase';
import { uploadToStorage } from '@/lib/upload';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/page-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  const [breedFilter, setBreedFilter] = useState('all');
  
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Photo Zoom State
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [zoomedAsset, setZoomedAsset] = useState<any>(null);

  // Camera & Photo State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
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

  const defaultSheepImage = PlaceHolderImages.find(img => img.id === 'dash-flock')?.imageUrl || '';

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasCameraPermission(true);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = (formToSet: any) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataUrl);
        formToSet.setValue('imageUrl', dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, formToSet: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedPhoto(dataUrl);
        formToSet.setValue('imageUrl', dataUrl);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPhoto = (formToSet: any) => {
    setCapturedPhoto(null);
    formToSet.setValue('imageUrl', '');
    setIsCameraActive(false);
  };

  const breeds = useMemo(() => {
    const bSet = new Set(['Standard', 'Nellore', 'Deccani']);
    trackedSheep?.forEach(s => { if (s.breed) bSet.add(s.breed); });
    return Array.from(bSet);
  }, [trackedSheep]);

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    let list = trackedSheep;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
    }
    
    if (genderFilter !== 'all') {
      list = list.filter(s => s.gender === genderFilter);
    }
    
    if (breedFilter !== 'all') {
      list = list.filter(s => s.breed === breedFilter);
    }
    
    return list;
  }, [trackedSheep, searchTerm, genderFilter, breedFilter]);

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
      setCapturedPhoto(null);
      stopCamera();
      setIsEntryDialogOpen(false);
      toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'Could not sync asset data.' });
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
        imageUrl: finalUrl, 
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd') 
      }, editingAsset._path);
      setIsEditAssetOpen(false);
      setEditingAsset(null);
      setCapturedPhoto(null);
      toast({ title: 'Record Updated', description: `Asset ${data.tagId} synchronized.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not sync changes.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    setCapturedPhoto(asset.imageUrl || null);
    editAssetForm.reset({
      tagId: asset.tagId, 
      registrationDate: asset.registrationDate ? new Date(asset.registrationDate) : new Date(), 
      gender: asset.gender || 'female', 
      age: asset.age || 6, 
      currentWeight: asset.currentWeight || 25, 
      breed: asset.breed || 'Standard',
      imageUrl: asset.imageUrl || ''
    });
    setIsEditAssetOpen(true);
  };

  const handleZoomAsset = (asset: any) => {
    setZoomedAsset(asset);
    setZoomedPhoto(asset.imageUrl || defaultSheepImage);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING ASSETS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader title="Livestock Hub" description="PRECISION ASSET REGISTRY & BIO-DATA" className="mb-0" />
        
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
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">Tracked Assets</span>
                    <span className="text-xs font-black text-emerald-600">{totalTracked} Head</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">Total Biomass</span>
                    <span className="text-xs font-black text-blue-600">{totalTracked * 50}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">Daily Feed</span>
                    <span className="text-xs font-black text-amber-600">{totalDailyFeed.toFixed(0)}kg</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-100" />
              <div className="p-1">
                <DropdownMenuItem onClick={() => setIsEntryDialogOpen(true)} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                  <PlusCircle className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Add New Animal</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Flock</p>
              <p className="text-xl font-black tracking-tight">{totalSheep}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input placeholder="Filter by Tag ID or Breed..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-16 pl-16 rounded-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 font-bold shadow-sm" />
          </div>
          
          <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-100 shadow-sm">
            <Button variant="ghost" onClick={() => setGenderFilter('all')} className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest", genderFilter === 'all' ? "bg-white shadow-md text-emerald-600" : "text-slate-400")}>All</Button>
            <Button variant="ghost" onClick={() => setGenderFilter('male')} className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest", genderFilter === 'male' ? "bg-white shadow-md text-blue-600" : "text-slate-400")}>Male</Button>
            <Button variant="ghost" onClick={() => setGenderFilter('female')} className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest", genderFilter === 'female' ? "bg-white shadow-md text-rose-600" : "text-slate-400")}>Female</Button>
          </div>

          <Select value={breedFilter} onValueChange={setBreedFilter}>
            <SelectTrigger className="h-16 w-full lg:w-48 rounded-2xl bg-white border-slate-200 font-black text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5" /><SelectValue placeholder="Breed" /></div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all" className="font-bold">ALL BREEDS</SelectItem>
              {breeds.map(b => <SelectItem key={b} value={b} className="font-bold uppercase">{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-emerald-600 text-white p-10 py-12">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-6 w-6" />
                  <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Livestock Registry</CardTitle>
                </div>
                <CardDescription className="text-emerald-100/60 text-xs font-black uppercase tracking-[0.2em]">Verified Individual Biological Records</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">{filteredAssets.length} ASSETS</p>
            </div>
          </CardHeader>
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Asset Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Bio-Attributes</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Registration</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Current Weight</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
                  <TableRow key={sheep.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100">
                    <TableCell className="py-6 pl-10">
                      <div className="flex items-center gap-6">
                        <div 
                          className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 cursor-zoom-in group/img transition-transform active:scale-95 flex items-center justify-center relative shadow-inner" 
                          onClick={() => handleZoomAsset(sheep)}
                        >
                          <img 
                            src={sheep.imageUrl || defaultSheepImage} 
                            className={cn(
                              "h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-500",
                              !sheep.imageUrl && "p-2 opacity-40 grayscale"
                            )} 
                            alt="Sheep" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-black text-slate-900 uppercase leading-none mb-1">{sheep.tagId}</span>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{sheep.breed || 'Standard'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={cn("text-[11px] font-black uppercase tracking-tight", sheep.gender === 'male' ? "text-blue-600" : "text-rose-600")}>
                          {sheep.gender || 'FEMALE'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{sheep.age} Months Old</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarIcon className="h-3 w-3" />
                        <span className="text-[11px] font-bold uppercase">{sheep.registrationDate || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[18px] font-black text-slate-900 tracking-tighter">{sheep.currentWeight} kg</span>
                        <span className="text-[8px] font-black uppercase text-slate-300">Live Weight</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={() => handleEditAsset(sheep)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => deleteTrackedSheep(sheep.id, sheep._path)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-32 opacity-20 font-black uppercase text-xs">No biological records match your filter</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>

      {/* --- ENTRY DIALOG --- */}
      <Dialog open={isEntryDialogOpen} onOpenChange={(open) => { if (!open) { stopCamera(); resetPhoto(assetForm); } setIsEntryDialogOpen(open); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Registry Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new livestock asset into digital flock</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="mb-8 space-y-4">
              <Label className="form-label-tactical text-slate-400">Identity Capture</Label>
              <div className="relative group">
                <div className="w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {capturedPhoto ? (
                    <><img src={capturedPhoto} className="w-full h-full object-cover" alt="Sheep" /><Button size="icon" variant="destructive" className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg" onClick={() => resetPhoto(assetForm)}><X className="h-4 w-4" /></Button></>
                  ) : isCameraActive ? (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 rounded-full bg-white shadow-sm border border-slate-100 text-slate-300"><ImageIcon className="h-8 w-8" /></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Media</p>
                    </div>
                  )}
                </div>
                {!capturedPhoto && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {isCameraActive ? <Button type="button" onClick={() => capturePhoto(assetForm)} className="col-span-2 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest gap-2"><Camera className="h-5 w-5" /> Capture Frame</Button> :
                    <><Button type="button" onClick={startCamera} className="h-12 rounded-xl bg-neutral-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest gap-2"><Camera className="h-4 w-4 text-emerald-400" /> Open Camera</Button>
                    <div className="relative"><input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, assetForm)} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><Button type="button" variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2"><Upload className="h-4 w-4 text-blue-500" /> Gallery</Button></div></>}
                  </div>
                )}
              </div>
            </div>
            <Form {...assetForm}><form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={assetForm.control} name="tagId" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Tag ID</Label><FormControl><Input placeholder="e.g. A-102" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>)} />
                  <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (<FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Reg. Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical bg-slate-50 border-slate-200 text-left px-4">{field.value ? format(field.value, "MMM dd, yyyy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={assetForm.control} name="breed" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-white border-slate-200">{['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical bg-slate-50 border-slate-200 font-black" {...field} /></FormControl></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={assetForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Age (Mos)</Label><Select onValueChange={field.onChange} defaultValue={field.value.toString()}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-white border-slate-200">{[1,2,3,4,5,6,12,18,24].map(m => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={assetForm.control} name="gender" render={({ field }) => (<FormItem><Label className="form-label-tactical text-slate-400">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-white border-slate-200"><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>)} />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                {isUploading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Persisting Asset...</> : 'Synchronize Record'}
              </Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditAssetOpen} onOpenChange={(o) => { if (!o) { stopCamera(); resetPhoto(editAssetForm); } setIsEditAssetOpen(o); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Pencil className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Adjust Record</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update parameters for asset: {editingAsset?.tagId}</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="mb-8 space-y-4">
              <Label className="form-label-tactical text-slate-400">Media Update</Label>
              <div className="w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                {capturedPhoto ? (
                  <><img src={capturedPhoto} className="w-full h-full object-cover" alt="Sheep" /><Button size="icon" variant="destructive" className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg" onClick={() => resetPhoto(editAssetForm)}><X className="h-4 w-4" /></Button></>
                ) : isCameraActive ? (
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 rounded-full bg-white shadow-sm border border-slate-100 text-slate-300"><ImageIcon className="h-8 w-8" /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Media</p>
                  </div>
                )}
              </div>
              {!capturedPhoto && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {isCameraActive ? <Button type="button" onClick={() => capturePhoto(editAssetForm)} className="col-span-2 h-14 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest gap-2">Capture New Frame</Button> :
                  <><Button type="button" onClick={startCamera} className="h-12 rounded-xl bg-neutral-900 text-white font-black text-[10px] uppercase tracking-widest gap-2"><Camera className="h-4 w-4 text-emerald-400" /> Open Camera</Button>
                  <div className="relative"><input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, editAssetForm)} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><Button type="button" variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2"><Upload className="h-4 w-4 text-blue-500" /> Gallery</Button></div></>}
                </div>
              )}
            </div>
            <Form {...editAssetForm}><form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={editAssetForm.control} name="tagId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Tag ID</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <FormField control={editAssetForm.control} name="registrationDate" render={({ field }) => (<FormItem className="flex flex-col"><Label className="form-label-tactical">Reg. Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical">{field.value ? format(field.value, "MMM dd, yyyy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={editAssetForm.control} name="breed" render={({ field }) => (<FormItem><Label className="form-label-tactical">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={editAssetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical font-black" {...field} /></FormControl></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={editAssetForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical">Age (Mos)</Label><Select onValueChange={field.onChange} defaultValue={field.value.toString()}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent>{[1,2,3,4,5,6,12,18,24].map(m => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                  <FormField control={editAssetForm.control} name="gender" render={({ field }) => (<FormItem><Label className="form-label-tactical">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>)} />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] shadow-xl">
                {isUploading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Updating...</> : 'Sync Changes'}
              </Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!zoomedPhoto} onOpenChange={(open) => !open && setZoomedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-neutral-900">
          {zoomedPhoto && (
            <div className="flex flex-col h-full relative">
              <div className="absolute top-6 left-8 z-20"><Badge className="bg-emerald-500 text-neutral-900 border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">Identity Zoom: {zoomedAsset?.tagId}</Badge></div>
              <div className="absolute top-6 right-8 z-20"><Button variant="ghost" size="icon" onClick={() => setZoomedPhoto(null)} className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"><X className="h-5 w-5" /></Button></div>
              <div className="w-full aspect-square md:aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                <img src={zoomedPhoto} className="w-full h-full object-contain animate-in zoom-in-95 duration-500" alt="Sheep" />
              </div>
              <div className="p-10 bg-neutral-900 text-white border-t border-white/5">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">{zoomedAsset?.tagId}</h3>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[widest]">Verified Digital Registry Asset</p>
                    </div>
                    <div className="flex gap-10">
                      <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Breed</p><p className="text-xs font-black uppercase text-emerald-400">{zoomedAsset?.breed || 'Standard'}</p></div>
                      <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Gender</p><p className="text-xs font-black uppercase">{zoomedAsset?.gender || 'Female'}</p></div>
                      <div><p className="text-[8px] font-black uppercase text-white/30 mb-1">Live weight</p><p className="text-xs font-black uppercase">{zoomedAsset?.currentWeight} KG</p></div>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><ShieldCheck className="h-6 w-6" /></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}