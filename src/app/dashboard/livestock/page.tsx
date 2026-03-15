'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
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
} from '@/components/ui/dialog';

const assetSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  registrationDate: z.date({ required_error: 'Registration date is required' }),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }).default('female'),
  age: z.coerce.number().min(0, 'Age is required'),
  currentWeight: z.coerce.number().min(1, 'Weight is required'),
  breed: z.string().min(1, 'Breed is required').default('Standard'),
  shepherd: z.string().optional(),
  task: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const { 
    trackedSheep, addTrackedSheep, updateTrackedSheep,
    totalDailyFeed, totalTracked, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  
  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard', shepherd: '', task: 'Flock Check-in' },
  });

  const editAssetForm = useForm<AssetFormData>({ resolver: zodResolver(assetSchema) });

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    if (!searchTerm.trim()) return trackedSheep;
    const term = searchTerm.toLowerCase();
    return trackedSheep.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
  }, [trackedSheep, searchTerm]);

  const onAssetSubmit: SubmitHandler<AssetFormData> = (data) => {
    addTrackedSheep({ ...data, registrationDate: format(data.registrationDate, 'yyyy-MM-dd') });
    assetForm.reset();
    toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized.` });
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
      tagId: asset.tagId, registrationDate: asset.registrationDate ? new Date(asset.registrationDate) : new Date(), gender: asset.gender, age: asset.age, currentWeight: asset.currentWeight, breed: asset.breed || 'Standard',
    });
    setIsEditAssetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-emerald-500/40 uppercase tracking-[0.3em]">SYNCHRONIZING ASSETS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-xl font-medium text-white/80">Livestock Registry</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">PRECISION ASSET TRACKING & BIO-DATA</p>
      </div>

      {/* TACTICAL STAT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card glass-sheen glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Tracked Animals</p>
              <p className="text-5xl font-black tracking-tighter text-white">{totalTracked || 100}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#FFC857]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">ASSETS REGISTERED</p>
        </div>

        <div className="glass-card glass-sheen glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Biomass</p>
              <p className="text-5xl font-black tracking-tighter text-white">{(totalTracked || 100) * 50}<span className="text-2xl ml-2 opacity-40">kg</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Scale className="h-5 w-5 text-[#A78BFA]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">COMBINED FLOCK MASS</p>
        </div>

        <div className="glass-card glass-sheen glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Daily Feed (KG)</p>
              <p className="text-5xl font-black tracking-tighter text-white">{totalDailyFeed ? totalDailyFeed.toFixed(0) : 250}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-[#ef4444]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">REQUIREMENT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* MAIN LEDGER AREA */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input 
              placeholder="Filter by Tag ID or Breed..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-16 pl-16 rounded-full bg-white/5 border-none text-white placeholder:text-white/20 font-bold shadow-2xl" 
            />
          </div>

          <div className="glass-card glass-sheen rounded-[40px] overflow-hidden">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-white/5 border-none">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white/40">Asset ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Attributes</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Weight</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white/40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length > 0 ? filteredAssets.map((sheep) => (
                    <TableRow key={sheep.id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                      <TableCell className="py-6 pl-10">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 shrink-0">
                            {sheep.photoDataUrl ? (
                              <img src={sheep.photoDataUrl} className="h-full w-full object-cover" alt="Sheep" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><Camera className="h-6 w-6 text-white/10" /></div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[16px] font-black text-white">{sheep.tagId}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase mt-1 tracking-widest">{sheep.breed || 'Standard'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white/60 uppercase tracking-tight">{sheep.gender || 'FEMALE'}</span>
                          <span className="text-[10px] font-bold text-white/30 uppercase">{sheep.age} Months</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[16px] font-black text-white">{sheep.currentWeight} kg</TableCell>
                      <TableCell className="text-right pr-10">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-full bg-[#b07d62]/20 hover:bg-[#b07d62]/40 text-[#b07d62] transition-all" 
                          onClick={() => handleEditAsset(sheep)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No assets recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        {/* REGISTRATION PANEL */}
        <div className="lg:col-span-4">
          <div className="glass-card glass-sheen rounded-[40px] p-10 h-full border-t-2 border-white/10">
            <div className="flex items-center gap-3 mb-10 text-emerald-400">
              <Plus className="h-6 w-6" />
              <h3 className="text-lg font-black uppercase tracking-widest">Add New Sheep</h3>
            </div>
            
            <Form {...assetForm}>
              <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-10">
                <div className="space-y-8">
                  <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Registration Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-white/10 bg-[#0a2e1a] shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="text-white" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={assetForm.control} name="breed" render={({ field }) => (
                      <FormItem>
                        <Label className="form-label-tactical">Breed</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-[#0a2e1a] border-white/10">
                            {['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={assetForm.control} name="age" render={({ field }) => (
                      <FormItem>
                        <Label className="form-label-tactical">Age (Mos)</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                          <FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-[#0a2e1a] border-white/10">
                            {[1,2,3,4,5,6,12,18,24].map(m => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label-tactical">Labor Assignment</Label>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-2 mb-2">Assign Shepherd</p>
                    <Input placeholder="e.g., S. Singh" className="form-input-tactical" {...assetForm.register('shepherd')} />
                  </div>

                  <FormField control={assetForm.control} name="task" render={({ field }) => (
                    <FormItem>
                      <Label className="form-label-tactical">Task Description</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="bg-[#0a2e1a] border-white/10">
                          {['Flock Check-in', 'Medical Check', 'Tagging', 'Sorting'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl">
                  Add Animal
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-white/10 bg-[#0F1115] shadow-2xl">
          <DialogHeader className="bg-white/5 p-8 border-b border-white/5 text-left">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-500" /> Asset Parameters
            </DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Adjust record for: {editingAsset?.tagId}</DialogDescription>
          </DialogHeader>
          <Form {...editAssetForm}>
            <form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)} className="p-8 space-y-6">
              <FormField control={editAssetForm.control} name="currentWeight" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-14 rounded-2xl bg-white/5 border-white/10 font-black text-lg px-6" {...field} /></FormControl></FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditAssetOpen(false)} className="h-14 flex-1 rounded-2xl border-white/10 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">Save Adjustments</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* FOOTER ACCENT */}
      <div className="fixed bottom-12 right-12 opacity-40 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}