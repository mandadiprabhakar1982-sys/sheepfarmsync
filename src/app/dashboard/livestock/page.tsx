'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Search,
  LayoutGrid,
  Plus,
  PlusCircle,
  ShieldCheck,
  X,
  Loader2,
  Pencil,
  Camera,
  Maximize2,
  Image as ImageIcon,
  Upload,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useStorage } from '@/firebase';
import { uploadToStorage } from '@/lib/upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { TrackedSheep } from '@/lib/types';
import { cn } from '@/lib/utils';

const assetSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  registrationDate: z.date({ required_error: 'Registration date is required' }),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }).default('female'),
  age: z.coerce.number().min(0, 'Age is required'),
  currentWeight: z.coerce.number().min(1, 'Weight is required'),
  breed: z.string().min(1, 'Breed is required').default('Standard'),
  imageUrl: z.string().optional(),
  color: z.string().optional(),
  source: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const storage = useStorage();
  const { 
    trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep,
    totalSheep, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMobileTab, setActiveMobileTab] = useState<'identity' | 'attributes'>('identity');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [isRegDatePickerOpen, setIsRegDatePickerOpen] = useState(false);
  const [isEditRegDatePickerOpen, setIsEditRegDatePickerOpen] = useState(false);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard', imageUrl: '', color: '', source: '' 
    },
  });

  const editForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    let list = trackedSheep;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
    }
    return list;
  }, [trackedSheep, searchTerm]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasCameraPermission(true);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsCameraActive(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const activeForm = isEntryDialogOpen ? assetForm : editForm;
        activeForm.setValue('imageUrl', dataUrl);
        stopCamera();
      }
    }
  };

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
      toast({ title: 'Record Saved', description: `Sheep ${data.tagId} synchronized.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save sheep.' });
    } finally {
      setIsUploading(false);
    }
  };

  const onEditSubmit: SubmitHandler<AssetFormData> = async (data) => {
    if (!editingSheep) return;
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }
      updateTrackedSheep(editingSheep.id, { 
        ...data, 
        imageUrl: finalUrl || '', 
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd') 
      }, editingSheep._path);
      setIsEditDialogOpen(false);
      setEditingSheep(null);
      toast({ title: 'Synchronized', description: 'Sheep records updated.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update record.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (sheep: TrackedSheep) => {
    setEditingSheep(sheep);
    const regDate = sheep.registrationDate ? parseISO(sheep.registrationDate) : new Date();
    editForm.reset({
      tagId: sheep.tagId,
      registrationDate: isValid(regDate) ? regDate : new Date(),
      gender: (sheep.gender as 'male' | 'female') || 'female',
      age: sheep.age,
      currentWeight: sheep.currentWeight,
      breed: sheep.breed || 'Standard',
      imageUrl: sheep.imageUrl || '',
      color: sheep.color || '',
      source: sheep.source || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, form: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative md:px-0 bg-[#020617] md:bg-transparent">
      {/* MOBILE PREMIUM HEADER */}
      <div className="md:hidden flex flex-col bg-gradient-to-br from-[#0FA5A0] to-[#176E6C] rounded-b-[2.5rem] overflow-hidden shadow-2xl relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white blur-[80px] rounded-full" />
        </div>
        
        <div className="p-8 pt-10 pb-6 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none">Sheep Registry</h1>
              <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mt-1">Verified Individual Flock Records</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder="Search Tag or Breed..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-12 pl-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold border-none shadow-inner" 
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 bg-black/20 backdrop-blur-xl rounded-2xl flex items-center gap-3 border border-white/10 shadow-inner">
              <div className="h-6 w-6 rounded-full bg-[#0FA5A0]/20 flex items-center justify-center border border-[#0FA5A0]/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">Net Sheep</p>
                <p className="text-xl font-black text-white tracking-tighter mt-0.5">{totalSheep}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-t border-white/10">
          <button 
            onClick={() => setActiveMobileTab('identity')}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
              activeMobileTab === 'identity' ? "text-white" : "text-white/40"
            )}
          >
            Sheep Identity
            {activeMobileTab === 'identity' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveMobileTab('attributes')}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
              activeMobileTab === 'attributes' ? "text-white" : "text-white/40"
            )}
          >
            Attributes
            {activeMobileTab === 'attributes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-full" />}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-xl md:shadow-sm md:overflow-hidden md:m-4">
        <div className="hidden md:flex bg-[#0FA5A0] text-white p-2.5 px-5 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tighter leading-none uppercase">Sheep Registry</CardTitle>
              <CardDescription className="text-white/60 text-[8px] font-bold uppercase tracking-[0.2em]">Verified Individual Flock Records</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input 
                placeholder="Search Tag or Breed..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold" 
              />
            </div>

            <div className="px-3 py-1 bg-black/20 rounded-lg flex items-center gap-2 border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <div>
                <p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Sheep</p>
                <p className="text-base font-black tracking-tighter leading-none mt-0.5">{totalSheep}</p>
              </div>
            </div>

            <Button 
              onClick={() => {
                assetForm.reset({ registrationDate: new Date() });
                setIsEntryDialogOpen(true);
              }} 
              className="h-8 px-3 rounded-lg bg-white text-[#0FA5A0] hover:bg-white/90 text-[10px]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Sheep
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="md:hidden p-6 space-y-4 pb-32">
            {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
              <div 
                key={sheep.id} 
                className="bg-white rounded-[1.5rem] p-4 flex items-center gap-4 shadow-xl active:scale-[0.98] transition-all relative overflow-hidden"
                onClick={() => handleEditClick(sheep)}
              >
                <div 
                  className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0 shadow-sm cursor-zoom-in group/img"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sheep.imageUrl) setZoomImage(sheep.imageUrl);
                  }}
                >
                  {sheep.imageUrl ? (
                    <Image src={sheep.imageUrl} alt="Sheep" fill className="object-cover" sizes="64px" />
                  ) : <ImageIcon className="h-full w-full p-4 text-slate-200" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-slate-900 leading-none mb-1">Tag: {sheep.tagId}</h3>
                  <p className="text-[13px] font-black text-[#0FA5A0] leading-none mb-2">{sheep.breed || 'Standard'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {sheep.age} Months • {sheep.gender} • {sheep.registrationDate}
                  </p>
                </div>

                <div className="shrink-0 ml-2">
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </div>
              </div>
            )) : (
              <div className="py-24 text-center opacity-20 font-black uppercase text-[10px] tracking-widest text-white">No assets discovered</div>
            )}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 pl-10 text-white w-[25%]">Sheep Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-white w-[25%]">Attributes</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-center text-white w-[15%]">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right text-white w-[15%]">Weight</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 pr-10 text-right text-white w-[20%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((sheep) => (
                  <TableRow key={sheep.id} className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                    <TableCell className="pl-10 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0 cursor-zoom-in group/img"
                          onClick={() => sheep.imageUrl && setZoomImage(sheep.imageUrl)}
                        >
                          {sheep.imageUrl ? (
                            <>
                              <Image src={sheep.imageUrl} alt="Sheep" fill className="object-cover" sizes="40px" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize2 className="h-4 w-4 text-white" />
                              </div>
                            </>
                          ) : <ImageIcon className="h-full w-full p-2 text-slate-200" />}
                        </div>
                        <span className="text-[13px] font-black text-[#2F4F4F]">Tag: {sheep.tagId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-600">{sheep.breed || 'Standard'}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sheep.age} Months • {sheep.gender} • {sheep.registrationDate || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-[#ecfdf5] text-[#059669] border-none font-black text-[9px] px-2.5 py-0.5 uppercase tracking-widest">Verified</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[16px] font-black text-[#2F4F4F]">{sheep.currentWeight} kg</span>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={() => handleEditClick(sheep)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => deleteTrackedSheep(sheep.id, sheep._path)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <button 
        onClick={() => {
          assetForm.reset({ registrationDate: new Date() });
          setIsEntryDialogOpen(true);
        }}
        className="md:hidden fixed bottom-24 right-6 h-16 w-16 rounded-full bg-[#0FA5A0] text-white shadow-[0_10px_30px_rgba(15,165,160,0.4)] flex items-center justify-center active:scale-90 transition-all z-20 border-4 border-white/10"
      >
        <Plus className="h-8 w-8 stroke-[3px]" />
      </button>

      {/* ENROLLMENT DIALOG */}
      <Dialog open={isEntryDialogOpen} onOpenChange={(open) => { setIsEntryDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[95dvh] flex flex-col z-[100]">
          <DialogHeader className="bg-[#111111] p-8 text-left text-white shrink-0 relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]">
                <Plus className="h-6 w-6 stroke-[3px]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight uppercase text-white leading-none">Sheep Enrollment</DialogTitle>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Enroll new animal into farm registry</DialogDescription>
              </div>
            </div>
            <DialogClose className="absolute right-6 top-8 text-white/40 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </DialogClose>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-8 pt-10 pb-12">
              <Form {...assetForm}>
                <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-10">
                  <div className="space-y-8">
                    {/* CAMERA UI */}
                    <div className="flex flex-col items-center gap-6">
                      <div className="h-56 w-full max-w-[340px] rounded-[2rem] bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
                        <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                        
                        {!isCameraActive && (
                          assetForm.watch('imageUrl') ? (
                            <div className="relative w-full h-full">
                              <Image src={assetForm.watch('imageUrl')!} alt="Preview" fill className="object-cover" />
                              <Button type="button" variant="destructive" size="icon" className="absolute top-3 right-3 h-9 w-9 rounded-full shadow-lg" onClick={() => assetForm.setValue('imageUrl', '')}>
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <ImageIcon className="h-12 w-12 text-neutral-300" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Profile Image Required</span>
                            </div>
                          )
                        )}

                        {isCameraActive && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <Button type="button" onClick={capturePhoto} className="rounded-full h-14 w-14 p-0 bg-[#0FA5A0] hover:bg-[#0FA5A0]/90 border-4 border-white shadow-2xl">
                              <div className="h-7 w-7 rounded-full border-2 border-white" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {hasCameraPermission === false && (
                        <Alert variant="destructive" className="max-w-[340px] rounded-2xl border-rose-100 bg-rose-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="text-[10px] font-black uppercase">Access Denied</AlertTitle>
                          <AlertDescription className="text-[10px] font-bold opacity-70">Please allow camera permissions in your browser settings to use this feature.</AlertDescription>
                        </Alert>
                      )}

                      {!(isCameraActive) && (
                        <div className="flex gap-4 w-full max-w-[340px]">
                          <Button type="button" variant="outline" onClick={startCamera} className="flex-1 h-12 text-[10px] font-black uppercase rounded-2xl gap-2 border-slate-200 hover:bg-slate-50">
                            <Camera className="h-4 w-4" /> Use Camera
                          </Button>
                          <div className="relative flex-1">
                            <Button type="button" variant="outline" className="w-full h-12 text-[10px] font-black uppercase rounded-2xl gap-2 border-slate-200 hover:bg-slate-50">
                              <Upload className="h-4 w-4" /> Select File
                            </Button>
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleImageChange(e, assetForm)} />
                          </div>
                        </div>
                      )}

                      {isCameraActive && (
                        <Button type="button" variant="ghost" onClick={stopCamera} className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                          Cancel Live Feed
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Sheep Tag ID</Label><FormControl><Input placeholder="e.g. 101-A" className="h-12 rounded-xl bg-white border-slate-200 font-bold px-4" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Reg. Date</Label>
                          <Popover open={isRegDatePickerOpen} onOpenChange={setIsRegDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 w-full text-left justify-between font-black uppercase text-[12px]">
                                {field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-none bg-white shadow-2xl z-[150]" align="start">
                              <Calendar 
                                mode="single" 
                                selected={field.value} 
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                    setIsRegDatePickerOpen(false);
                                  }
                                }} 
                                initialFocus 
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="breed" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold"><SelectValue placeholder="Select Breed" /></SelectTrigger></FormControl><SelectContent className="z-[160]"><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Nellore">Nellore</SelectItem><SelectItem value="Deccani">Deccani</SelectItem></SelectContent></Select></FormItem>
                      )} />
                      <FormField control={assetForm.control} name="gender" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold"><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl><SelectContent className="z-[160]"><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Age (Months)</Label><FormControl><Input type="number" placeholder="4" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                      <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Weight (KG)</Label><FormControl><Input type="number" step="0.1" placeholder="20" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="color" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Color</Label><FormControl><Input placeholder="White/Brown" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                      <FormField control={assetForm.control} name="source" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Source</Label><FormControl><Input placeholder="Internal/Purchase" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                    </div>
                  </div>
                  <Button type="submit" disabled={isUploading || isCameraActive} className="w-full h-16 rounded-full bg-gradient-to-r from-[#0FA5A0] to-[#176E6C] text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-none">
                    {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Enrollment'}
                  </Button>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[95dvh] flex flex-col z-[100]">
          <DialogHeader className="bg-[#111111] p-8 text-left text-white shrink-0 relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]">
                <Pencil className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight uppercase text-white leading-none">Update Record</DialogTitle>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Adjust sheep registry parameters</DialogDescription>
              </div>
            </div>
            <DialogClose className="absolute right-6 top-8 text-white/40 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </DialogClose>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-8 pt-10 pb-12">
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-10">
                  <div className="space-y-8">
                    {/* IMAGE PREVIEW */}
                    <div className="flex flex-col items-center gap-6">
                      <div className="h-56 w-full max-w-[340px] rounded-[2rem] bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
                        <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                        
                        {!isCameraActive && (
                          editForm.watch('imageUrl') ? (
                            <div className="relative w-full h-full">
                              <Image src={editForm.watch('imageUrl')!} alt="Preview" fill className="object-cover" />
                              <Button type="button" variant="destructive" size="icon" className="absolute top-3 right-3 h-9 w-9 rounded-full shadow-lg" onClick={() => editForm.setValue('imageUrl', '')}>
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <ImageIcon className="h-12 w-12 text-neutral-300" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Profile Image Required</span>
                            </div>
                          )
                        )}

                        {isCameraActive && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <Button type="button" onClick={capturePhoto} className="rounded-full h-14 w-14 p-0 bg-[#0FA5A0] hover:bg-[#0FA5A0]/90 border-4 border-white shadow-2xl">
                              <div className="h-7 w-7 rounded-full border-2 border-white" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {hasCameraPermission === false && (
                        <Alert variant="destructive" className="max-w-[340px] rounded-2xl border-rose-100 bg-rose-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="text-[10px] font-black uppercase">Access Denied</AlertTitle>
                          <AlertDescription className="text-[10px] font-bold opacity-70">Please allow camera permissions in your browser settings.</AlertDescription>
                        </Alert>
                      )}

                      {!(isCameraActive) && (
                        <div className="flex gap-4 w-full max-w-[340px]">
                          <Button type="button" variant="outline" onClick={startCamera} className="flex-1 h-12 text-[10px] font-black uppercase rounded-2xl gap-2 border-slate-200 hover:bg-slate-50">
                            <Camera className="h-4 w-4" /> Use Camera
                          </Button>
                          <div className="relative flex-1">
                            <Button type="button" variant="outline" className="w-full h-12 text-[10px] font-black uppercase rounded-2xl gap-2 border-slate-200 hover:bg-slate-50">
                              <Upload className="h-4 w-4" /> Select File
                            </Button>
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleImageChange(e, editForm)} />
                          </div>
                        </div>
                      )}

                      {isCameraActive && (
                        <Button type="button" variant="ghost" onClick={stopCamera} className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                          Cancel Live Feed
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={editForm.control} name="tagId" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Sheep Tag ID</Label><FormControl><Input className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={editForm.control} name="registrationDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Reg. Date</Label>
                          <Popover open={isEditRegDatePickerOpen} onOpenChange={setIsEditRegDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 w-full text-left justify-between font-black uppercase text-[12px]">
                                {field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-none bg-white shadow-2xl z-[150]" align="start">
                              <Calendar 
                                mode="single" 
                                selected={field.value} 
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                    setIsEditRegDatePickerOpen(false);
                                  }
                                }} 
                                initialFocus 
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={editForm.control} name="breed" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent className="z-[160]"><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Nellore">Nellore</SelectItem><SelectItem value="Deccani">Deccani</SelectItem></SelectContent></Select></FormItem>
                      )} />
                      <FormField control={editForm.control} name="gender" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent className="z-[160]"><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={editForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Age (Months)</Label><FormControl><Input type="number" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                      <FormField control={editForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={editForm.control} name="color" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Color</Label><FormControl><Input placeholder="White/Brown" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                      <FormField control={editForm.control} name="source" render={({ field }) => (<FormItem><Label className="form-label-tactical text-[10px] font-black uppercase opacity-40 mb-2">Source</Label><FormControl><Input placeholder="Internal/Purchase" className="h-12 rounded-xl bg-white border-slate-200 font-bold" {...field} /></FormControl></FormItem>)} />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => deleteTrackedSheep(editingSheep!.id, editingSheep!._path)} className="h-16 rounded-full border-rose-100 text-rose-600 font-black uppercase tracking-widest px-8 transition-all active:scale-95">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                    <Button type="submit" disabled={isUploading || isCameraActive} className="flex-1 h-16 rounded-full bg-gradient-to-r from-[#0FA5A0] to-[#176E6C] text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 border-none">
                      {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* IMAGE ZOOM DIALOG */}
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none z-[200]">
          <DialogHeader className="sr-only">
            <DialogTitle>Visual Asset Inspection</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-square w-full">
            {zoomImage && <Image src={zoomImage} alt="Zoomed view" fill className="object-contain" />}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 rounded-full"
              onClick={() => setZoomImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
