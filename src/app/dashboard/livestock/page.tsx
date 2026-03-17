
'use client';

import { useState, useMemo } from 'react';
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
  CheckCircle2,
  X,
  Loader2,
  Pencil,
  Camera,
  Maximize2
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useStorage } from '@/firebase';
import { uploadToStorage } from '@/lib/upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TrackedSheep } from '@/lib/types';

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
    trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep,
    totalSheep, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard', imageUrl: '' 
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

  const onAssetSubmit: SubmitHandler<AssetFormData> = async (data) => {
    setIsUploading(true);
    try {
      let finalUrl = data.imageUrl;
      if (storage && data.imageUrl?.startsWith('data:')) {
        finalUrl = await uploadToStorage(storage, data.imageUrl, 'sheep_profiles');
      }
      addTrackedSheep({ ...data, imageUrl: finalUrl || '', registrationDate: format(data.registrationDate, 'yyyy-MM-dd') });
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
      updateTrackedSheep(editingSheep.id, { ...data, imageUrl: finalUrl || '', registrationDate: format(data.registrationDate, 'yyyy-MM-dd') }, editingSheep._path);
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
    editForm.reset({
      tagId: sheep.tagId,
      registrationDate: sheep.registrationDate ? parseISO(sheep.registrationDate) : new Date(),
      gender: sheep.gender || 'female',
      age: sheep.age,
      currentWeight: sheep.currentWeight,
      breed: sheep.breed || 'Standard',
      imageUrl: sheep.imageUrl || ''
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

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
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
                  <LayoutGrid className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight leading-none uppercase text-white">Sheep Registry</CardTitle>
              </div>
              <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] ml-7">Verified Individual Flock Records</CardDescription>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input 
                placeholder="Search Tag or Breed..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold focus-visible:ring-white/20" 
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsEntryDialogOpen(true)} 
                className="h-8 px-3 rounded-lg font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-1.5 shadow-xl border-none text-[10px]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Sheep
              </Button>
              
              <div className="px-3 py-0.5 bg-black/20 rounded-lg text-white flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Sheep</p>
                  <p className="text-base font-black tracking-tighter leading-none mt-0.5">{totalSheep}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 overflow-hidden">
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
                        ) : <LayoutGrid className="h-full w-full p-2 text-slate-200" />}
                      </div>
                      <span className="text-[13px] font-black text-[#2F4F4F]">Tag: {sheep.tagId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-600">{sheep.breed || 'Standard'}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sheep.age} Months • {sheep.gender}</span>
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
        </ScrollArea>
      </div>

      {/* ENROLLMENT DIALOG */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Sheep Enrollment</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new animal into farm registry</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...assetForm}>
              <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center overflow-hidden relative">
                        {assetForm.watch('imageUrl') ? (
                          <Image src={assetForm.watch('imageUrl')!} alt="Preview" fill className="object-cover" />
                        ) : (
                          <>
                            <Camera className="h-6 w-6 text-neutral-400 mb-1" />
                            <span className="text-[8px] font-black uppercase text-neutral-400">Add Photo</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, assetForm)} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical">Sheep Tag ID</Label><FormControl><Input placeholder="e.g. 101-A" className="form-input-tactical" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={assetForm.control} name="breed" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Nellore">Nellore</SelectItem><SelectItem value="Deccani">Deccani</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={assetForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical">Age (Months)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={assetForm.control} name="gender" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>
                    )} />
                  </div>
                </div>
                <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">
                  {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enroll Sheep'}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Pencil className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Update Record</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Adjust sheep registry parameters</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center overflow-hidden relative">
                        {editForm.watch('imageUrl') ? (
                          <Image src={editForm.watch('imageUrl')!} alt="Preview" fill className="object-cover" />
                        ) : (
                          <>
                            <Camera className="h-6 w-6 text-neutral-400 mb-1" />
                            <span className="text-[8px] font-black uppercase text-neutral-400">Add Photo</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e, editForm)} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <FormField control={editForm.control} name="tagId" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical">Sheep Tag ID</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={editForm.control} name="breed" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Nellore">Nellore</SelectItem><SelectItem value="Deccani">Deccani</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={editForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={editForm.control} name="age" render={({ field }) => (<FormItem><Label className="form-label-tactical">Age (Months)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={editForm.control} name="gender" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Gender</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>
                    )} />
                  </div>
                </div>
                <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl">
                  {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Synchronize Record'}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* IMAGE ZOOM DIALOG */}
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
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
