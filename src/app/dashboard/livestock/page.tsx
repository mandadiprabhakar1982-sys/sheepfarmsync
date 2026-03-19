
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
  TrendingUp,
  Scale,
  Calendar
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
  registrationDate: z.date({ required_error: 'Registration date is required' }),
  gender: z.enum(['male', 'female']).default('female'),
  age: z.coerce.number().min(0),
  previousWeight: z.coerce.number().min(0).default(0),
  currentWeight: z.coerce.number().min(1),
  breed: z.string().min(1).default('Standard'),
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
    isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('All');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { tagId: '', breed: 'Standard', age: 6, currentWeight: 25, previousWeight: 0, gender: 'female', registrationDate: new Date() },
  });

  const editForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    return trackedSheep.filter(s => {
      const matchesSearch = s.tagId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (s.breed || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const gain = s.currentWeight - (s.previousWeight || 0);
      let matchesPerf = true;
      if (performanceFilter === 'Positive') matchesPerf = gain > 0;
      if (performanceFilter === 'Stable') matchesPerf = gain === 0;

      return matchesSearch && matchesPerf;
    });
  }, [trackedSheep, searchTerm, performanceFilter]);

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
      registrationDate: isValid(regDate) ? regDate : new Date(),
      gender: (sheep.gender as 'male' | 'female') || 'female',
      age: sheep.age,
      previousWeight: sheep.previousWeight || 0,
      currentWeight: sheep.currentWeight,
      breed: sheep.breed || 'Standard',
      imageUrl: sheep.imageUrl || '',
      color: sheep.color || 'Brown',
      source: sheep.source || 'On Farm',
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-10 animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 rounded-xl w-64 mb-8" />
        <div className="h-16 bg-slate-200 rounded-[15px] max-w-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[2rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f4f7f6]">
      <header className="shrink-0 px-4 md:px-10 pt-10 pb-6">
        <h1 className="text-3xl font-[800] text-[#1a252f] tracking-tight mb-8">Sheep Inventory</h1>

        <div className="flex flex-col sm:flex-row bg-white p-2 rounded-2xl sm:rounded-[15px] border border-[#e1e8ed] shadow-sm max-w-3xl mb-8 gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-[#95a5a6]" />
            <Input 
              placeholder="Search Tag ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="border-none shadow-none focus-visible:ring-0 pl-12 h-12 font-semibold" 
            />
          </div>
          <div className="hidden sm:block w-px bg-[#eee] mx-2 my-2" />
          <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
            <SelectTrigger className="border-none shadow-none focus:ring-0 w-full sm:w-48 font-bold text-[#7f8c8d]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Performance</SelectItem>
              <SelectItem value="Positive">Weight Gained</SelectItem>
              <SelectItem value="Stable">Stable Weight</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-32">
        {/* MOBILE VIEW: Card Grid */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredAssets.length > 0 ? filteredAssets.map((sheep) => {
            const gain = sheep.currentWeight - (sheep.previousWeight || 0);
            return (
              <Card key={sheep.id} className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden active:scale-[0.98] transition-all" onClick={() => handleEditClick(sheep)}>
                <CardContent className="p-0">
                  <div className="flex gap-4 p-5">
                    <div className="h-20 w-20 rounded-2xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                      {sheep.imageUrl ? (
                        <Image src={sheep.imageUrl} alt={sheep.tagId} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <Badge className="bg-[#e0f2f1] text-[#008080] border-none font-black text-[10px] uppercase px-2 py-0.5">
                          #{sheep.tagId}
                        </Badge>
                        <span className={cn("text-xs font-black", gain > 0 ? "text-emerald-500" : "text-slate-400")}>
                          {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)} kg
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight truncate">{sheep.breed}</h3>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> {sheep.currentWeight}kg</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {sheep.age}m</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="py-20 text-center opacity-40 font-black uppercase text-[10px] tracking-widest">No assets found</div>
          )}
        </div>

        {/* WEB VIEW: High-density data table */}
        <div className="hidden md:block bg-white rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-[#edf2f7] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#f8fafb]">
              <TableRow className="border-none">
                <TableHead className="text-[11px] font-black text-[#7f8c8d] px-6 py-5">Tag ID</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d]">Breed</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d]">Age</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d]">Date</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d]">Prev. Wt</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d]">Curr. Wt</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d]">Gain</TableHead>
                <TableHead className="text-[11px] font-black text-[#7f8c8d] text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((sheep) => {
                const gain = sheep.currentWeight - (sheep.previousWeight || 0);
                return (
                  <TableRow key={sheep.id} className="group hover:bg-[#f1f4f6] border-t border-[#f0f4f8] transition-colors">
                    <TableCell className="px-6 py-5">
                      <span className="bg-[#e0f2f1] text-[#008080] px-2.5 py-1 rounded-md text-xs font-bold">{sheep.tagId}</span>
                    </TableCell>
                    <TableCell className="font-semibold">{sheep.breed}</TableCell>
                    <TableCell className="font-semibold">{sheep.age} Mos</TableCell>
                    <TableCell className="text-[#7f8c8d] font-semibold">{sheep.registrationDate}</TableCell>
                    <TableCell className="font-semibold">{sheep.previousWeight || '0.0'} KG</TableCell>
                    <TableCell className="font-semibold">{sheep.currentWeight} KG</TableCell>
                    <TableCell>
                      <span className={cn("font-black", gain > 0 ? "text-[#2ecc71]" : "text-[#95a5a6]")}>
                        {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)} KG
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(sheep)} className="h-8 w-8 rounded-lg bg-[#f1f4f6] text-[#7f8c8d] hover:bg-[#00d1b2] hover:text-[#1a1a1a] flex items-center justify-center transition-all">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTrackedSheep(sheep.id, sheep._path); }} className="h-8 w-8 rounded-lg bg-[#f1f4f6] text-[#7f8c8d] hover:bg-[#ff4d4d] hover:text-white flex items-center justify-center transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <button 
        onClick={() => { assetForm.reset({ registrationDate: new Date(), breed: 'Standard', age: 6, currentWeight: 25, previousWeight: 0 }); setIsEntryDialogOpen(true); }}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 h-14 w-14 rounded-full bg-[#005f4b] text-white shadow-xl flex items-center justify-center active:scale-90 transition-all z-30"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={isEntryDialogOpen} onOpenChange={(open) => { setIsEntryDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[24px] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
          <div className="bg-[#1a1a1a] p-6 text-white flex justify-between items-center shrink-0">
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">Add Sheep Record</DialogTitle>
            <DialogClose className="text-white/40 hover:text-white transition-colors"><X className="h-5 w-5" /></DialogClose>
          </div>
          <div className="p-8 overflow-y-auto no-scrollbar">
            <Form {...assetForm}>
              <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Tag ID</Label><FormControl><Input className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={assetForm.control} name="breed" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Breed</Label><FormControl><Input className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={assetForm.control} name="age" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Age (Months)</Label><FormControl><Input type="number" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Date</Label>
                      <Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold justify-start px-3">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><HorizontalDatePicker selectedDate={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                    </FormItem>
                  )} />
                  <FormField control={assetForm.control} name="previousWeight" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Prev. Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Curr. Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="h-32 w-full rounded-xl bg-[#f8fafb] border-2 border-dashed border-[#f0f4f8] flex items-center justify-center overflow-hidden relative group">
                    <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                    {!isCameraActive && (assetForm.watch('imageUrl') ? <Image src={assetForm.watch('imageUrl')!} alt="Sheep" fill className="object-cover" /> : <ImageIcon className="h-10 w-10 text-slate-200" />)}
                    {isCameraActive && <Button type="button" onClick={capturePhoto} className="absolute bottom-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-[#00d1b2]" />}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={startCamera} className="flex-1 h-10 rounded-xl bg-[#1a1a1a] text-white text-[10px] font-black uppercase"><Camera className="h-4 w-4 mr-2" /> Camera</Button>
                    <div className="relative flex-1">
                      <Button type="button" className="w-full h-10 rounded-xl bg-[#1a1a1a] text-white text-[10px] font-black uppercase"><Upload className="h-4 w-4 mr-2" /> File</Button>
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, assetForm)} />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isUploading} className="w-full h-14 rounded-xl bg-[#00d1b2] text-[#1a1a1a] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center shrink-0">
                  {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enroll Sheep Asset'}
                </button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="sm:max-w-xl rounded-[24px] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
          <div className="bg-[#1a1a1a] p-6 text-white flex justify-between items-center shrink-0">
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">Edit Record: {editingSheep?.tagId}</DialogTitle>
            <DialogClose className="text-white/40 hover:text-white transition-colors"><X className="h-5 w-5" /></DialogClose>
          </div>
          <div className="p-8 overflow-y-auto no-scrollbar">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={editForm.control} name="tagId" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Tag ID</Label><FormControl><Input className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={editForm.control} name="breed" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Breed</Label><FormControl><Input className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={editForm.control} name="age" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Age (Months)</Label><FormControl><Input type="number" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={editForm.control} name="registrationDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Date</Label>
                      <Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold justify-start px-3">{field.value ? format(field.value, "MMM dd, yyyy") : "Pick date"}</Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><HorizontalDatePicker selectedDate={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="previousWeight" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Prev. Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={editForm.control} name="currentWeight" render={({ field }) => (
                    <FormItem><Label className="text-[11px] font-black text-[#95a5a6] uppercase mb-1">Curr. Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-12 bg-[#f8fafb] border-[#f0f4f8] rounded-xl font-bold" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <button type="submit" disabled={isUploading} className="w-full h-14 rounded-xl bg-[#00d1b2] text-[#1a1a1a] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center shrink-0">
                  {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
                </button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
