'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Search,
  ImageIcon,
  Loader2,
  LayoutGrid,
  Plus,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  X
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
import { PageHeader } from '@/components/page-header';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    trackedSheep, addTrackedSheep, deleteTrackedSheep,
    totalSheep, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard', imageUrl: '' 
    },
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

  const groupedAssets = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredAssets.forEach(asset => {
      const date = asset.registrationDate || 'Old Records';
      if (!groups[date]) groups[date] = [];
      groups[date].push(asset);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [filteredAssets]);

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

  const formatGroupDate = (dateStr: string) => {
    if (dateStr === 'Old Records') return dateStr;
    const d = parseISO(dateStr);
    if (isToday(d)) return `Today - ${dateStr}`;
    if (isYesterday(d)) return `Yesterday - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="md:animate-in md:fade-in md:duration-700 max-w-7xl mx-auto h-full flex flex-col relative">
      {/* MOBILE VIEW */}
      <div className="block md:hidden mobile-neural-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Sheep Registry</h1>
          <p className="text-sm font-medium text-white/40">High-fidelity flock records audit.</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="mobile-glass-card p-5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Herd</p>
            <h2 className="text-3xl font-black text-white tracking-tighter">{totalSheep}</h2>
          </div>
          <div className="mobile-glass-card p-5 border-l-4 border-l-primary">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Status</p>
            <h2 className="text-xl font-black text-emerald-400 tracking-tight">Active</h2>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input 
            placeholder="Search Sheep Tag..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20" 
          />
        </div>

        <div className="space-y-8 pb-32">
          {groupedAssets.length > 0 ? groupedAssets.map((group) => (
            <div key={group.date} className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/30 px-2">{formatGroupDate(group.date)}</p>
              <div className="space-y-4">
                {group.items.map((sheep) => (
                  <div key={sheep.id} className="mobile-glass-card p-5 flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative shrink-0">
                        {sheep.imageUrl ? <Image src={sheep.imageUrl} alt="Sheep" fill className="object-cover" sizes="48px" /> : <LayoutGrid className="h-full w-full p-3 text-white/10" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-white leading-none mb-1">#{sheep.tagId}</h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{sheep.breed || 'Standard'} • {sheep.age} Mos</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-primary">{sheep.currentWeight}kg</p>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs text-white">No records discovered</div>}
        </div>

        <button 
          onClick={() => setIsEntryDialogOpen(true)}
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 shrink-0">
          <PageHeader title="Sheep Registry" description="High-Fidelity Flock Records" className="mb-0" />

          <div className="flex items-center gap-4">
            <Button onClick={() => setIsEntryDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-[#0FA5A0] hover:bg-[#176E6C] text-white gap-2 shadow-xl border-none">
              <PlusCircle className="h-5 w-5 text-white" />
              Add Sheep
            </Button>
            <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Sheep</p>
                <p className="text-xl font-black tracking-tight">{totalSheep}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-1 min-h-0 flex flex-col">
          <div className="relative shrink-0 w-full max-w-xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search Sheep Tag or Breed..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-white border-none text-[#2F4F4F] font-bold shadow-sm" 
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
          </div>

          <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
            <CardHeader className="bg-[#0FA5A0] text-white p-8 shrink-0">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-3"><LayoutGrid className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase text-white">Sheep Registry</CardTitle></div>
                  <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Individual Flock Records</CardDescription>
                </div>
                <p className="text-3xl font-black tracking-tighter">{totalSheep} Head</p>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white">Sheep Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white">Attributes</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-white">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white">Current Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((sheep) => (
                    <TableRow key={sheep.id} className="hover:bg-slate-50 border-b border-slate-100 group cursor-pointer transition-colors">
                      <TableCell className="pl-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0">
                            {sheep.imageUrl ? <Image src={sheep.imageUrl} alt="Sheep" fill className="object-cover" sizes="48px" /> : <LayoutGrid className="h-full w-full p-3 text-slate-200" />}
                          </div>
                          <span className="text-[16px] font-black text-[#2F4F4F]">Tag: {sheep.tagId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col"><span className="text-[14px] font-bold text-slate-600">{sheep.breed || 'Standard'}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sheep.age} Months • {sheep.gender}</span></div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#ecfdf5] text-[#43A047] border-none font-black text-[10px] px-3 uppercase tracking-widest">Verified</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <span className="text-xl font-black text-[#2F4F4F]">{sheep.currentWeight} kg</span>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => { e.stopPropagation(); deleteTrackedSheep(sheep.id, sheep._path); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Sheep Enrollment</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new animal into farm registry</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...assetForm}><form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-8">
              <div className="space-y-6">
                <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                  <FormItem><Label className="form-label-tactical">Sheep Tag ID</Label><FormControl><Input placeholder="e.g. 101-A" className="form-input-tactical" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={assetForm.control} name="breed" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Breed</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Nellore">Nellore</SelectItem><SelectItem value="Deccani">Deccani</SelectItem></SelectContent></Select></FormItem>
                  )} />
                  <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (<FormItem><Label className="form-label-tactical">Weight (KG)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">{isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enroll Sheep'}</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
