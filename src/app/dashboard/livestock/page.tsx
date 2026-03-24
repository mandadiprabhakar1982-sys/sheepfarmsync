'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Search,
  Plus,
  X,
  Loader2,
  Pencil,
  Camera,
  ImageIcon,
  Upload,
  ChevronRight,
  Scale,
  Calendar,
  CheckCircle2
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TrackedSheep } from '@/lib/types';
import { cn } from '@/lib/utils';

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

export default function LivestockPage() {
  const { toast } = useToast();
  const storage = useStorage();
  const { 
    trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep,
    isLoading, totalSheep
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    return trackedSheep.filter(s => 
      s.tagId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.breed || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trackedSheep, searchTerm]);

  const avgWeight = useMemo(() => {
    if (!trackedSheep || trackedSheep.length === 0) return 0;
    return (trackedSheep.reduce((acc, s) => acc + (s.currentWeight || 0), 0) / trackedSheep.length).toFixed(1);
  }, [trackedSheep]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, form: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => form.setValue('imageUrl', reader.result as string);
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

  const handleEditClick = (sheep: TrackedSheep) => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-10 animate-pulse space-y-8">
        <div className="h-32 bg-slate-200 rounded-3xl w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[2rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f4f7f6]">
      {/* HEADER SECTION - Editorial Style */}
      <header className="shrink-0 px-4 md:px-10 pt-10 pb-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0FA5A0] mb-4">
              Live Asset Registry • {format(new Date(), 'MMMM yyyy')}
            </p>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-none text-slate-900 uppercase">
              Sheep<br />Record
            </h1>
          </div>
          <button 
            onClick={() => { assetForm.reset({ registrationDate: new Date(), breed: 'Standard', age: 6, currentWeight: 25 }); setIsEntryDialogOpen(true); }}
            className="hidden md:flex bg-[#0FA5A0] text-white px-10 py-5 rounded-full font-black text-lg hover:bg-[#134E4A] transition-all shadow-2xl shadow-[#0FA5A0]/20 items-center gap-3 active:scale-95"
          >
            <span className="text-2xl">+</span> ENROLL ANIMAL
          </button>
        </div>

        {/* STATS OVERVIEW - Big Letters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-12 border-t border-b border-slate-200 py-12">
          <div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Total Head</p>
            <p className="text-5xl md:text-7xl font-black italic text-slate-800">{totalSheep.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Avg. Weight</p>
            <p className="text-5xl md:text-7xl font-black text-slate-800">{avgWeight}<span className="text-xl md:text-2xl ml-2 text-slate-300">KG</span></p>
          </div>
          <div className="hidden md:block">
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Health Index</p>
            <p className="text-5xl md:text-7xl font-black text-[#0FA5A0]">98%</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-xl gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Tag ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="border-none shadow-none focus-visible:ring-0 pl-12 h-12 font-bold text-slate-700" 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-32">
        {/* COMPACT DATA TABLE */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-none">
                <TableHead className="text-[10px] font-black text-slate-400 px-6 py-5 uppercase tracking-widest">Profile</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag Identity</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Genetic Breed</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maturity</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Mass (KG)</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
                <TableRow key={sheep.id} className="group hover:bg-emerald-50/30 transition-colors border-t border-slate-50">
                  <TableCell className="px-6 py-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 relative overflow-hidden flex-shrink-0">
                      {sheep.imageUrl ? (
                        <Image src={sheep.imageUrl} alt={sheep.tagId} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-200">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xl md:text-3xl font-black tracking-tight text-slate-800">#{sheep.tagId}</span>
                  </TableCell>
                  <TableCell className="text-lg font-bold text-slate-500">{sheep.breed}</TableCell>
                  <TableCell className="text-lg font-bold text-slate-400">{sheep.age} Mos</TableCell>
                  <TableCell className="text-right">
                    <span className="text-3xl md:text-4xl font-black tracking-tighter text-[#0FA5A0]">{sheep.currentWeight}</span>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditClick(sheep)} className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#0FA5A0] shadow-sm flex items-center justify-center transition-all">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete record?')) deleteTrackedSheep(sheep.id, sheep._path); }} className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center opacity-20 font-black uppercase text-[10px] tracking-widest">Awaiting Registry Sync...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { assetForm.reset({ registrationDate: new Date(), breed: 'Standard', age: 6, currentWeight: 25 }); setIsEntryDialogOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 h-16 w-16 rounded-full bg-[#0FA5A0] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* SHEEP POPUP - ENROLLMENT DIALOG */}
      <Dialog open={isEntryDialogOpen} onOpenChange={(open) => { setIsEntryDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col font-sans">
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
                      <Popover><PopoverTrigger asChild><Button variant="outline" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg justify-between px-6">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<Calendar className="h-4 w-4 opacity-20" /></Button></PopoverTrigger>
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
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, assetForm)} />
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
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col font-sans">
          <div className="bg-neutral-900 p-8 text-white flex justify-between items-center shrink-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Record: {editingSheep?.tagId}</DialogTitle>
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
                      <Popover><PopoverTrigger asChild><Button variant="outline" className="h-14 bg-slate-50 border-none rounded-2xl font-black text-lg justify-between px-6">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}<Calendar className="h-4 w-4 opacity-20" /></Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><HorizontalDatePicker selectedDate={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="currentWeight" render={({ field }) => (
                    <FormItem className="md:col-span-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-14 bg-[#D7F2F1] border-none rounded-2xl font-black text-2xl px-6 text-[#0FA5A0]" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-[#0FA5A0] text-white font-black uppercase tracking-[0.2em] hover:bg-[#134E4A] transition-all flex items-center justify-center shadow-xl active:scale-95">
                  {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Save Changes'}
                </button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
