'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shell } from '@/components/shared/Shell';
import { useFarm } from '@/context/FarmContext';
import { WebSheepTable } from '@/components/web/WebSheepTable';
import { MobileSheepList } from '@/components/mobile/MobileSheepList';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { 
  Plus, 
  X, 
  Loader2, 
  Camera, 
  ImageIcon, 
  Upload, 
  Calendar as CalendarIcon,
  Pencil
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/firebase';
import { uploadToStorage } from '@/lib/upload';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogClose 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { TrackedSheep } from '@/lib/types';

const assetSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  breed: z.string().min(1).default('Standard'),
  age: z.coerce.number().min(0),
  registrationDate: z.date({ required_error: 'Date is required' }),
  currentWeight: z.coerce.number().min(1),
  gender: z.enum(['male', 'female']).default('female'),
  imageUrl: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function SheepPage() {
  const { toast } = useToast();
  const storage = useStorage();
  const { width, isHydrated } = useWindowDimensions();
  const { trackedSheep, addTrackedSheep, updateTrackedSheep, isLoading } = useFarm();
  
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { tagId: '', breed: 'Standard', age: 6, currentWeight: 25, gender: 'female', registrationDate: new Date() },
  });

  const editForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const stats = useMemo(() => {
    if (!trackedSheep || trackedSheep.length === 0) return { count: 0, avgWeight: 0 };
    const count = trackedSheep.length;
    const totalWeight = trackedSheep.reduce((acc, s) => acc + (s.currentWeight || 0), 0);
    return {
      count,
      avgWeight: (totalWeight / count).toFixed(1)
    };
  }, [trackedSheep]);

  const handleEdit = (sheep: TrackedSheep) => {
    setEditingSheep(sheep);
    const regDate = sheep.registrationDate ? parseISO(sheep.registrationDate) : new Date();
    editForm.reset({
      tagId: sheep.tagId,
      breed: sheep.breed || 'Standard',
      age: sheep.age,
      registrationDate: isValid(regDate) ? regDate : new Date(),
      currentWeight: sheep.currentWeight,
      gender: (sheep.gender as 'male' | 'female') || 'female',
      imageUrl: sheep.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Access Denied' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const activeForm = isEntryDialogOpen ? assetForm : editForm;
      activeForm.setValue('imageUrl', canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const activeForm = isEntryDialogOpen ? assetForm : editForm;
      reader.onloadend = () => activeForm.setValue('imageUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onAssetSubmit: SubmitHandler<AssetFormData> = async (data) => {
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }
      addTrackedSheep({ ...data, imageUrl: finalUrl || '', registrationDate: format(data.registrationDate, 'yyyy-MM-dd') });
      assetForm.reset(); setIsEntryDialogOpen(false);
      toast({ title: 'Record Saved', description: `Sheep ${data.tagId} enrolled.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Save failed.' });
    } finally { setIsUploading(false); }
  };

  const onEditSubmit: SubmitHandler<AssetFormData> = async (data) => {
    if (!editingSheep) return;
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }
      updateTrackedSheep(editingSheep.id, { ...data, imageUrl: finalUrl || '', registrationDate: format(data.registrationDate, 'yyyy-MM-dd') }, editingSheep._path);
      setIsEditDialogOpen(false); setEditingSheep(null);
      toast({ title: 'Synchronized', description: 'Record updated.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Update failed.' });
    } finally { setIsUploading(false); }
  };

  if (isLoading || !isHydrated) {
    return (
      <Shell>
        <div className="p-6 animate-pulse space-y-6 h-full flex flex-col">
          <div className="h-20 bg-white rounded-xl border border-slate-100" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-xl" />)}
          </div>
          <div className="flex-1 bg-white rounded-xl" />
        </div>
      </Shell>
    );
  }

  const isMobile = width < 768;

  return (
    <Shell>
      <div className="h-full flex flex-col overflow-hidden">
        {isMobile ? (
          <div className="flex flex-col h-full bg-[#f4f7f6]">
            <header className="shrink-0 p-5 bg-emerald-600 text-white shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-black uppercase tracking-tight">Flock Records</h1>
                <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase">Live Sync</div>
              </div>
              <p className="text-3xl font-black">#{stats.count}</p>
            </header>
            <div className="flex-1 overflow-y-auto px-4 pt-6">
              <MobileSheepList onEdit={handleEdit} />
            </div>
          </div>
        ) : (
          <div className="h-full bg-[#f8fafc] flex flex-col font-sans text-slate-800 overflow-hidden">
            <header className="shrink-0 flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#005f4b]">
                  SHEEP<span className="text-[#14d5c7] ml-1">SYNC</span> <span className="text-slate-400 font-light ml-1 text-lg">PRO</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Inventory Management / {format(new Date(), 'MMMM yyyy')}
                </p>
              </div>
              <button 
                onClick={() => { assetForm.reset({ registrationDate: new Date(), breed: 'Standard', age: 6, currentWeight: 25 }); setIsEntryDialogOpen(true); }}
                className="bg-[#0FA5A0] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#134E4A] transition-all flex items-center gap-2 shadow-2xl shadow-[#0FA5A0]/20 active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[3px]" /> ENROLL NEW ASSET
              </button>
            </header>

            <div className="shrink-0 grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Head", val: stats.count.toLocaleString(), color: "text-slate-800" },
                { label: "Avg Weight", val: `${stats.avgWeight} kg`, color: "text-slate-800" },
                { label: "Health Index", val: "98%", color: "text-emerald-600" },
                { label: "Alerts", val: "0", color: "text-slate-400" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.val}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto no-scrollbar">
                <WebSheepTable onEdit={handleEdit} />
              </div>
            </div>
          </div>
        )}

        {/* MOBILE FAB */}
        <button 
          onClick={() => { assetForm.reset({ registrationDate: new Date(), breed: 'Standard', age: 6, currentWeight: 25 }); setIsEntryDialogOpen(true); }}
          className="md:hidden fixed bottom-24 right-6 h-16 w-16 rounded-full bg-[#0FA5A0] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"
        >
          <Plus className="h-8 w-8" />
        </button>

        {/* ENROLLMENT DIALOG */}
        <Dialog open={isEntryDialogOpen} onOpenChange={(open) => { setIsEntryDialogOpen(open); if (!open) stopCamera(); }}>
          <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
            <div className="bg-neutral-900 p-8 text-white flex justify-between items-center shrink-0">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Sheep Popup</DialogTitle>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">New Asset Enrollment</p>
              </div>
              <DialogClose className="text-white/40 hover:text-white transition-colors"><X className="h-6 w-6" /></DialogClose>
            </div>
            
            <div className="p-8 overflow-y-auto no-scrollbar">
              <Form {...assetForm}>
                <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                      <FormItem><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tag ID</Label><FormControl><Input placeholder="e.g. 101" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-6" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={assetForm.control} name="breed" render={({ field }) => (
                      <FormItem><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Breed</Label><FormControl><Input placeholder="e.g. Standard" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-6" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={assetForm.control} name="age" render={({ field }) => (
                      <FormItem><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Age (Months)</Label><FormControl><Input type="number" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-6" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                      <FormItem className="flex flex-col"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Date</Label>
                        <Popover><PopoverTrigger asChild><Button variant="outline" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg justify-between px-6">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<CalendarIcon className="h-4 w-4 opacity-20" /></Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><HorizontalDatePicker selectedDate={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                      </FormItem>
                    )} />
                    <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (
                      <FormItem className="md:col-span-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-14 bg-[#D7F2F1] border-none rounded-2xl font-black text-2xl px-6 text-[#0FA5A0]" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="h-32 w-full rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                      {!isCameraActive && (assetForm.watch('imageUrl') ? <Image src={assetForm.watch('imageUrl')!} alt="Sheep" fill className="object-cover" /> : <ImageIcon className="h-10 w-10 text-slate-200" />)}
                      {isCameraActive && <Button type="button" onClick={capturePhoto} className="absolute bottom-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-[#0FA5A0]" />}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={startCamera} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest"><Camera className="h-4 w-4 mr-2 text-[#0FA5A0]" /> Camera</Button>
                      <div className="relative flex-1">
                        <Button type="button" className="w-full h-12 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest"><Upload className="h-4 w-4 mr-2 text-[#0FA5A0]" /> File</Button>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUploading} 
                    className="w-full h-16 rounded-2xl bg-[#0FA5A0] text-white font-black uppercase tracking-[0.2em] hover:bg-[#134E4A] transition-all flex items-center justify-center shadow-xl shadow-[#0FA5A0]/20 active:scale-95"
                  >
                    {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Sheep'}
                  </button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* EDIT DIALOG */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) stopCamera(); }}>
          <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
            <div className="bg-neutral-900 p-8 text-white flex justify-between items-center shrink-0">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Record: {editingSheep?.tagId}</DialogTitle>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Asset Modification Audit</p>
              </div>
              <DialogClose className="text-white/40 hover:text-white transition-colors"><X className="h-6 w-6" /></DialogClose>
            </div>
            
            <div className="p-8 overflow-y-auto no-scrollbar">
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={editForm.control} name="tagId" render={({ field }) => (
                      <FormItem><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tag ID</Label><FormControl><Input className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-6" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={editForm.control} name="breed" render={({ field }) => (
                      <FormItem><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Breed</Label><FormControl><Input className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-6" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={editForm.control} name="age" render={({ field }) => (
                      <FormItem><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Age (Months)</Label><FormControl><Input type="number" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg px-6" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={editForm.control} name="registrationDate" render={({ field }) => (
                      <FormItem className="flex flex-col"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Date</Label>
                        <Popover><PopoverTrigger asChild><Button variant="outline" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg justify-between px-6">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<CalendarIcon className="h-4 w-4 opacity-20" /></Button></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><HorizontalDatePicker selectedDate={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="currentWeight" render={({ field }) => (
                      <FormItem className="md:col-span-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-14 bg-[#D7F2F1] border-none rounded-2xl font-black text-2xl px-6 text-[#0FA5A0]" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="h-32 w-full rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                      {!isCameraActive && (editForm.watch('imageUrl') ? <Image src={editForm.watch('imageUrl')!} alt="Sheep" fill className="object-cover" /> : <ImageIcon className="h-10 w-10 text-slate-200" />)}
                      {isCameraActive && <Button type="button" onClick={capturePhoto} className="absolute bottom-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-[#0FA5A0]" />}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={startCamera} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest"><Camera className="h-4 w-4 mr-2 text-[#0FA5A0]" /> Camera</Button>
                      <div className="relative flex-1">
                        <Button type="button" className="w-full h-12 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest"><Upload className="h-4 w-4 mr-2 text-[#0FA5A0]" /> File</Button>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUploading} 
                    className="w-full h-16 rounded-2xl bg-neutral-900 text-white font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center shadow-xl active:scale-95"
                  >
                    {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Changes'}
                  </button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
