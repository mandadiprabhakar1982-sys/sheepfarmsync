'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Search,
  Plus,
  ShieldCheck,
  X,
  Loader2,
  Pencil,
  Camera,
  ImageIcon,
  Upload,
  Calendar as CalendarIcon,
  ChevronRight,
  Activity,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';
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
  healthStatus: z.string().optional(),
  vaccination: z.string().optional(),
  notes: z.string().optional(),
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
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [isRegDatePickerOpen, setIsRegDatePickerOpen] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard', imageUrl: '', color: 'Brown', source: 'On Farm', healthStatus: 'Healthy', vaccination: 'None', notes: '' 
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
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraActive(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
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
      color: sheep.color || 'Brown',
      source: sheep.source || 'On Farm',
      healthStatus: sheep.healthStatus || 'Healthy',
      vaccination: sheep.vaccination || 'None',
      notes: sheep.notes || '',
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
    return () => stopCamera();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#14d5c7]" />
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Synchronizing Registry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#020617]">
      {/* HEADER SECTION */}
      <header className="shrink-0 px-5 pt-4 pb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[34px] font-[800] text-white tracking-tight leading-[1.1]">Sheep List</h2>
          <div className="px-3 py-1.5 rounded-full bg-[#14d5c7]/10 border border-[#14d5c7]/20 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-[#14d5c7]" />
            <span className="text-[9px] font-black text-[#14d5c7] uppercase tracking-widest">{totalSheep} Head</span>
          </div>
        </div>
        <p className="text-white/40 text-sm font-medium mb-6">Verified Individual Flock Registry</p>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input 
            placeholder="Search Tag ID or Breed..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20 shadow-xl" 
          />
        </div>
      </header>

      {/* INDEPENDENT SCROLLING CONTAINER */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 space-y-4">
          {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
            <div 
              key={sheep.id} 
              className="hub-node p-4 flex items-center gap-4 card-inner-shadow cursor-pointer"
              onClick={() => handleEditClick(sheep)}
            >
              <div className="card-gloss-overlay" />
              <div 
                className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0 shadow-2xl"
                onClick={(e) => { e.stopPropagation(); if (sheep.imageUrl) setZoomImage(sheep.imageUrl); }}
              >
                {sheep.imageUrl ? (
                  <Image src={sheep.imageUrl} alt="Sheep" fill className="object-cover" sizes="64px" />
                ) : <ImageIcon className="h-full w-full p-4 text-white/10" />}
              </div>
              
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-black text-white tracking-tight leading-none">Tag: {sheep.tagId}</h3>
                  <Badge className="bg-[#14d5c7]/20 text-[#14d5c7] border-none font-black text-[7px] uppercase px-1.5 py-0.5">Verified</Badge>
                </div>
                <p className="text-xs font-black text-[#14d5c7] leading-none mb-2">{sheep.breed || 'Standard'}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-2.5 w-2.5 text-white/40" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">{sheep.age} Mos</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-white/10" />
                  <span className="text-[10px] font-bold text-white/40 uppercase">{sheep.gender}</span>
                  <div className="h-1 w-1 rounded-full bg-white/10" />
                  <span className="text-[10px] font-bold text-white/40 uppercase">{sheep.currentWeight} KG</span>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-white/20 shrink-0 relative z-10" />
            </div>
          )) : (
            <div className="py-24 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <Activity className="h-8 w-8 text-white/20" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">No Assets Discovered</h3>
                <p className="text-white/30 text-[10px] mt-1 uppercase font-bold">Use the + button to enroll sheep</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { assetForm.reset({ registrationDate: new Date(), color: 'Brown', source: 'On Farm', breed: 'Standard', gender: 'female', age: 6, currentWeight: 25 }); setIsEntryDialogOpen(true); }}
        className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-[#14d5c7] text-[#020617] shadow-[0_0_30px_rgba(20,213,199,0.4)] flex items-center justify-center active:scale-90 transition-all z-30"
      >
        <Plus className="h-8 w-8 stroke-[3px]" />
      </button>

      {/* ZOOM DIALOG */}
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none z-[200]">
          <div className="relative aspect-square w-full">
            {zoomImage && <Image src={zoomImage} alt="Zoomed view" fill className="object-contain" />}
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 rounded-full" onClick={() => setZoomImage(null)}><X className="h-6 w-6" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ENTRY DIALOG */}
      <Dialog open={isEntryDialogOpen} onOpenChange={(open) => { setIsEntryDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl h-[88dvh] max-h-[88dvh] flex flex-col z-[100] bg-white">
          <div className="bg-[#111111] p-8 text-white relative shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#14d5c7]/10 flex items-center justify-center text-[#14d5c7] border border-[#14d5c7]/20">
                <Plus className="h-6 w-6 stroke-[3px]" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Enrollment</DialogTitle>
            </div>
            <DialogClose className="absolute right-8 top-8 text-white/40 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </DialogClose>
          </div>

          <div className="dialog-body p-0 flex flex-col min-h-0 bg-white">
            <div className="flex-1 overflow-y-auto pb-10">
              <div className="min-h-[500px]">
                {/* PHOTO SECTION */}
                <div className="p-8 pb-4">
                  <div className="h-48 w-full rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                    <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                    {!isCameraActive && (assetForm.watch('imageUrl') ? (
                      <div className="relative w-full h-full">
                        <Image src={assetForm.watch('imageUrl')!} alt="Preview" fill className="object-cover" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full" onClick={() => assetForm.setValue('imageUrl', '')}><X className="h-5 w-5" /></Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Photo Optional</span>
                      </div>
                    ))}
                    {isCameraActive && <div className="absolute bottom-4 left-0 right-0 flex justify-center"><Button type="button" onClick={capturePhoto} className="rounded-full h-12 w-12 p-0 bg-[#14d5c7] border-4 border-white shadow-2xl" /></div>}
                  </div>
                  
                  {!isCameraActive && !assetForm.watch('imageUrl') && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Button type="button" onClick={startCamera} className="bg-[#111111] hover:bg-black text-white rounded-2xl h-14 uppercase font-black text-[10px] tracking-widest gap-3 shadow-xl">
                        <Camera className="h-5 w-5 text-[#14d5c7]" />
                        Camera
                      </Button>
                      <div className="relative">
                        <Button type="button" className="w-full bg-[#111111] hover:bg-black text-white rounded-2xl h-14 uppercase font-black text-[10px] tracking-widest gap-3 shadow-xl">
                          <Upload className="h-5 w-5 text-[#14d5c7]" />
                          File
                        </Button>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, assetForm)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* FORM FIELDS */}
                <Form {...assetForm}>
                  <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="px-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Tag ID</Label>
                          <FormControl><Input className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6 focus-visible:ring-2 focus-visible:ring-[#14d5c7]/20" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical ml-1">Reg. Date</Label>
                          <Popover open={isRegDatePickerOpen} onOpenChange={setIsRegDatePickerOpen} modal={true}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6 justify-between hover:bg-slate-100 transition-colors">
                                {field.value instanceof Date ? format(field.value, "MMM dd, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 text-slate-300" />
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
                                  setIsRegDatePickerOpen(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="breed" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Breed</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6 focus:ring-[#14d5c7]/20">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Nellore">Nellore</SelectItem>
                              <SelectItem value="Deccani">Deccani</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={assetForm.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Gender</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="age" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Age (Months)</Label>
                          <FormControl><Input type="number" className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Weight (KG)</Label>
                          <FormControl><Input type="number" step="0.1" className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={assetForm.control} name="color" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Color</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="Brown">Brown</SelectItem>
                              <SelectItem value="White">White</SelectItem>
                              <SelectItem value="Black">Black</SelectItem>
                              <SelectItem value="Spotted">Spotted</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={assetForm.control} name="source" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Source</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              <SelectItem value="On Farm">On Farm</SelectItem>
                              <SelectItem value="Purchased">Purchased</SelectItem>
                              <SelectItem value="Gift">Gift</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>

                    <div className="pt-10 pb-10">
                      <button type="submit" disabled={isUploading || isCameraActive} className="w-full h-20 rounded-full bg-[#14d5c7] hover:bg-[#14d5c7]/90 text-[#020617] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 text-lg flex items-center justify-center">
                        {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Enrollment'}
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl h-[88dvh] max-h-[88dvh] flex flex-col z-[100] bg-white">
          <div className="bg-[#111111] p-8 text-white relative shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#14d5c7]/10 flex items-center justify-center text-[#14d5c7] border border-[#14d5c7]/20">
                <Pencil className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Update Record</DialogTitle>
            </div>
            <DialogClose className="absolute right-8 top-8 text-white/40">
              <X className="h-6 w-6" />
            </DialogClose>
          </div>

          <div className="dialog-body p-0 flex flex-col min-h-0 bg-white">
            <div className="flex-1 overflow-y-auto pb-10">
              <div className="min-h-[500px]">
                <div className="p-8 pb-4">
                  <div className="h-48 w-full rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                    <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                    {!isCameraActive && (editForm.watch('imageUrl') ? (
                      <div className="relative w-full h-full">
                        <Image src={editForm.watch('imageUrl')!} alt="Preview" fill className="object-cover" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full" onClick={() => editForm.setValue('imageUrl', '')}><X className="h-5 w-5" /></Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      </div>
                    ))}
                    {isCameraActive && <div className="absolute bottom-4 left-0 right-0 flex justify-center"><Button type="button" onClick={capturePhoto} className="rounded-full h-12 w-12 p-0 bg-[#14d5c7] border-4 border-white shadow-2xl" /></div>}
                  </div>
                  {!isCameraActive && (
                    <div className="flex gap-4 mt-6">
                      <Button type="button" variant="outline" onClick={startCamera} className="flex-1 h-12 text-[10px] font-black uppercase rounded-xl border-slate-200"><Camera className="h-4 w-4 mr-2" /> Camera</Button>
                      <div className="relative flex-1"><Button type="button" variant="outline" className="w-full h-12 text-[10px] font-black uppercase rounded-xl border-slate-200"><Upload className="h-4 w-4 mr-2" /> File</Button><input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, editForm)} /></div>
                    </div>
                  )}
                </div>

                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="px-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField control={editForm.control} name="tagId" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Tag ID</Label>
                          <FormControl><Input className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="currentWeight" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical ml-1">Weight (KG)</Label>
                          <FormControl><Input type="number" step="0.1" className="h-14 rounded-2xl bg-slate-50 border-none text-slate-900 font-bold px-6" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <div className="flex gap-4 pt-10 pb-10">
                      <Button type="button" variant="outline" onClick={() => { deleteTrackedSheep(editingSheep!.id, editingSheep!._path); setIsEditDialogOpen(false); }} className="h-20 w-20 rounded-full border-rose-100 text-rose-600 shadow-xl shrink-0 flex items-center justify-center"><Trash2 className="h-6 w-6" /></Button>
                      <button type="submit" disabled={isUploading || isCameraActive} className="flex-1 h-20 rounded-full bg-[#14d5c7] hover:bg-[#14d5c7]/90 text-[#020617] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 text-lg flex items-center justify-center">
                        {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
