
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
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/page-header';

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
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Photo Zoom State
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [zoomedAssetId, setZoomedAssetId] = useState<string | null>(null);

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

  const capturePhoto = () => {
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
        assetForm.setValue('imageUrl', dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCapturedPhoto(dataUrl);
        assetForm.setValue('imageUrl', dataUrl);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPhoto = () => {
    setCapturedPhoto(null);
    assetForm.setValue('imageUrl', '');
    setIsCameraActive(false);
  };

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    if (!searchTerm.trim()) return trackedSheep;
    const term = searchTerm.toLowerCase();
    return trackedSheep.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
  }, [trackedSheep, searchTerm]);

  const onAssetSubmit: SubmitHandler<AssetFormData> = async (data) => {
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }

      addTrackedSheep({ 
        ...data, 
        imageUrl: finalUrl,
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd') 
      });
      
      assetForm.reset();
      setCapturedPhoto(null);
      stopCamera();
      setIsEntryDialogOpen(false);
      toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized with cloud storage.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'Could not sync asset visual data.' });
    } finally {
      setIsUploading(false);
    }
  };

  const onEditAssetSubmit: SubmitHandler<AssetFormData> = (data) => {
    if (!editingAsset) return;
    updateTrackedSheep(editingAsset.id, { ...data, registrationDate: format(data.registrationDate, 'yyyy-MM-dd') }, editingAsset._path);
    setIsEditAssetOpen(false);
    toast({ title: 'Record Updated', description: `Asset ${data.tagId} synchronized.` });
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    editAssetForm.reset({
      tagId: asset.tagId, 
      registrationDate: asset.registrationDate ? new Date(asset.registrationDate) : new Date(), 
      gender: asset.gender, 
      age: asset.age, 
      currentWeight: asset.currentWeight, 
      breed: asset.breed || 'Standard',
      imageUrl: asset.imageUrl
    });
    setIsEditAssetOpen(true);
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
        <PageHeader
          title="Livestock Registry"
          description="PRECISION ASSET TRACKING & BIO-DATA"
          className="mb-0"
        />
        
        <div className="flex items-center gap-4">
          <Dialog open={isEntryDialogOpen} onOpenChange={(open) => {
            if (!open) {
              stopCamera();
              resetPhoto();
            }
            setIsEntryDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { assetForm.reset(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Add New Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Registry Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new livestock asset into digital flock</DialogDescription>
              </DialogHeader>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="mb-8 space-y-4">
                  <Label className="form-label-tactical text-slate-400">Identity Capture</Label>
                  <div className="relative group">
                    <div className="w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                      {capturedPhoto ? (
                        <>
                          <img src={capturedPhoto} className="w-full h-full object-cover" alt="Captured sheep" />
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg"
                            onClick={resetPhoto}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : isCameraActive ? (
                        <div className="relative w-full h-full">
                          <video 
                            ref={videoRef} 
                            className="w-full h-full object-cover" 
                            autoPlay 
                            muted 
                            playsInline 
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none border-2 border-emerald-500/30 rounded-3xl" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 rounded-full bg-white shadow-sm border border-slate-100 text-slate-300">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Media</p>
                        </div>
                      )}
                    </div>

                    {!capturedPhoto && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {isCameraActive ? (
                          <Button 
                            type="button" 
                            onClick={capturePhoto} 
                            className="col-span-2 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest gap-2"
                          >
                            <Camera className="h-5 w-5" />
                            Capture Frame
                          </Button>
                        ) : (
                          <>
                            <Button 
                              type="button" 
                              onClick={startCamera} 
                              className="h-12 rounded-xl bg-neutral-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest gap-2"
                            >
                              <Camera className="h-4 w-4 text-emerald-400" />
                              Open Camera
                            </Button>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2"
                              >
                                <Upload className="h-4 w-4 text-blue-500" />
                                Gallery
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {hasCameraPermission === false && (
                      <Alert variant="destructive" className="mt-4 rounded-2xl border-none bg-rose-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Camera Access Denied</AlertTitle>
                        <AlertDescription className="text-[10px] font-bold">Please allow camera permissions in browser settings.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <Form {...assetForm}>
                  <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Tag ID</Label><FormControl><Input placeholder="e.g. A-102" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                          <FormItem className="flex flex-col"><Label className="form-label-tactical text-slate-400">Reg. Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="form-input-tactical bg-slate-50 border-slate-200 text-left px-4">{field.value ? format(field.value, "MMM dd, yyyy") : "Select"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={assetForm.control} name="breed" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-white border-slate-200">{['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></FormItem>
                        )} />
                        <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical bg-slate-50 border-slate-200 font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={assetForm.control} name="age" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Age (Mos)</Label><Select onValueChange={field.onChange} defaultValue={field.value.toString()}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-white border-slate-200">{[1,2,3,4,5,6,12,18,24].map(m => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}</SelectContent></Select></FormItem>
                        )} />
                        <FormField control={assetForm.control} name="gender" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-white border-slate-200"><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>
                        )} />
                      </div>
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                      {isUploading ? (
                        <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Persisting Asset...</>
                      ) : (
                        'Synchronize Record'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Flock</p>
              <p className="text-xl font-black tracking-tight">{totalSheep}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tracked Assets</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">{totalTracked || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">INDIVIDUALLY LOGGED</p>
        </div>

        <div className="glass-card glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Biomass</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">{(totalTracked || 0) * 50}<span className="text-2xl ml-2 opacity-20">kg</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Scale className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ESTIMATED FLOCK MASS</p>
        </div>

        <div className="glass-card glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Feed</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">{totalDailyFeed ? totalDailyFeed.toFixed(0) : 0}<span className="text-2xl ml-2 opacity-20">kg</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">MINIMUM REQUIREMENT</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Filter by Tag ID or Breed..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-16 pl-16 rounded-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 font-bold shadow-sm" 
          />
        </div>

        <div className="glass-card rounded-[40px] overflow-hidden border-slate-100 bg-white">
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Asset Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Bio-Attributes</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Current Weight</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
                  <TableRow key={sheep.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100">
                    <TableCell className="py-6 pl-10">
                      <div className="flex items-center gap-6">
                        <div 
                          className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 cursor-zoom-in group/img transition-transform active:scale-95"
                          onClick={() => {
                            if (sheep.imageUrl) {
                              setZoomedPhoto(sheep.imageUrl);
                              setZoomedAssetId(sheep.tagId);
                            }
                          }}
                        >
                          {sheep.imageUrl ? (
                            <img src={sheep.imageUrl} className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="Sheep" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center"><Camera className="h-6 w-6 text-slate-300" /></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-black text-slate-900 uppercase">{sheep.tagId}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{sheep.breed || 'Standard'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{sheep.gender || 'FEMALE'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{sheep.age} Months Old</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[16px] font-black text-slate-900">{sheep.currentWeight} kg</TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                          onClick={() => handleEditAsset(sheep)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" 
                          onClick={() => deleteTrackedSheep(sheep.id, sheep._path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No biological records discovered</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={!!zoomedPhoto} onOpenChange={(open) => !open && setZoomedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-neutral-900">
          {zoomedPhoto && (
            <div className="flex flex-col h-full relative">
              <div className="absolute top-6 left-8 z-20">
                <Badge className="bg-emerald-500 text-neutral-900 border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">
                  Identity Zoom: {zoomedAssetId}
                </Badge>
              </div>
              <div className="absolute top-6 right-8 z-20">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setZoomedPhoto(null)}
                  className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="w-full aspect-square md:aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src={zoomedPhoto} 
                  className="w-full h-full object-contain animate-in zoom-in-95 duration-500" 
                  alt="Expanded sheep identity" 
                />
              </div>
              <div className="p-10 bg-neutral-900 text-white border-t border-white/5">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{zoomedAssetId}</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Verified Digital Registry Asset</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-slate-200 bg-white shadow-2xl">
          <DialogHeader className="bg-slate-50 p-8 border-b border-slate-100 text-left">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3 text-slate-900">
              <Pencil className="h-5 w-5 text-emerald-600" /> Adjust Record
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Adjust registry parameters for asset: {editingAsset?.tagId}</DialogDescription>
          </DialogHeader>
          <Form {...editAssetForm}>
            <form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)} className="p-8 space-y-6">
              <FormField control={editAssetForm.control} name="currentWeight" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-lg px-6 text-slate-900" {...field} /></FormControl></FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditAssetOpen(false)} className="h-14 flex-1 rounded-2xl border-slate-200 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">
                  <Save className="mr-2 h-4 w-4" /> Update Ledger
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
