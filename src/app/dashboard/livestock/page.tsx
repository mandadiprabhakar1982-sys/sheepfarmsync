'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Pencil, 
  Wheat,
  Camera,
  RotateCcw,
  Search,
  X,
  Calendar as CalendarIcon,
  PlusCircle,
  Footprints,
  Scale,
  Plus,
  LayoutGrid,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const assetSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  registrationDate: z.date({ required_error: 'Registration date is required' }),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  age: z.coerce.number().min(0, 'Age is required'),
  currentWeight: z.coerce.number().min(1, 'Weight is required'),
  breed: z.string().min(1, 'Breed is required').default('Standard'),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const { 
    trackedSheep, addTrackedSheep, updateTrackedSheep, deleteTrackedSheep,
    totalDailyFeed, totalTracked, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard' },
  });

  const editAssetForm = useForm<AssetFormData>({ resolver: zodResolver(assetSchema) });

  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    if (!searchTerm.trim()) return trackedSheep;
    const term = searchTerm.toLowerCase();
    return trackedSheep.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
  }, [trackedSheep, searchTerm]);

  const onAssetSubmit: SubmitHandler<AssetFormData> = (data) => {
    addTrackedSheep({ ...data, registrationDate: format(data.registrationDate, 'yyyy-MM-dd'), photoDataUrl: capturedPhoto || undefined });
    assetForm.reset();
    setCapturedPhoto(null);
    stopCamera();
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

  const stopCamera = () => {
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-white/5 rounded-full border-t-[#10B981] animate-spin" />
          <p className="text-[12px] font-black text-[#10B981]/40 uppercase tracking-[0.3em]">SYNCHRONIZING ASSETS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">Livestock Registry</h1>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">PRECISION ASSET TRACKING & BIO-DATA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card glass-glow-green rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-6 right-6 text-white/20"><LayoutGrid className="h-6 w-6" /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Tracked Animals</p>
          <p className="text-4xl font-black tracking-tighter text-white">{totalTracked}</p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-4">Assets Registered</p>
        </div>
        <div className="glass-card glass-glow-blue rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-6 right-6 text-white/20"><Scale className="h-6 w-6" /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Total Biomass</p>
          <p className="text-4xl font-black tracking-tighter text-white">{(totalTracked * 50).toLocaleString()} kg</p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-4">Combined Flock Mass</p>
        </div>
        <div className="glass-card glass-glow-red rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-6 right-6 text-white/20"><Wheat className="h-6 w-6" /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Daily Feed (kg)</p>
          <p className="text-4xl font-black tracking-tighter text-white">{totalDailyFeed.toFixed(0)}</p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-4">Requirement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#10B981] transition-colors" />
            <Input 
              placeholder="Filter by Tag ID or Breed..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-14 pl-14 rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/20 font-bold text-sm focus-visible:ring-[#10B981]/20" 
            />
          </div>

          <div className="glass-card rounded-[32px] overflow-hidden">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-white/[0.02] border-b border-white/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white/40">Asset ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white/40">Attributes</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white/40">Weight</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white/40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((sheep) => (
                    <TableRow key={sheep.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5">
                      <TableCell className="py-6 pl-10">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                            {sheep.photoDataUrl ? (
                              <img src={sheep.photoDataUrl} className="h-full w-full object-cover" alt="Sheep" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><Camera className="h-5 w-5 text-white/10" /></div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-black text-white">{sheep.tagId}</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase mt-1 tracking-widest">{sheep.breed || 'Standard'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white/80 uppercase tracking-tight">{sheep.gender}</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase">{sheep.age} Months</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[15px] font-black text-white">{sheep.currentWeight} kg</TableCell>
                      <TableCell className="text-right pr-10">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white" onClick={() => handleEditAsset(sheep)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="glass-card rounded-[32px] p-10 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10 text-[#10B981]">
              <Plus className="h-6 w-6 stroke-[3px]" />
              <h3 className="text-[18px] font-black uppercase tracking-[0.1em]">Add New Sheep</h3>
            </div>
            
            <Form {...assetForm}>
              <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Registration Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-14 w-full rounded-2xl bg-white/5 border-white/10 font-bold text-left px-6 hover:bg-white/10 transition-all">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-white/10 bg-[#16191E] shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="text-white" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={assetForm.control} name="breed" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Breed</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-[#16191E] border-white/10">
                            {['Standard', 'Nellore', 'Deccani'].map(b => <SelectItem key={b} value={b} className="text-white focus:bg-[#10B981]">{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={assetForm.control} name="age" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Age (Mos)</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                          <FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-[#16191E] border-white/10">
                            {[1,2,3,4,5,6,12,18,24].map(m => <SelectItem key={m} value={m.toString()} className="text-white focus:bg-[#10B981]">{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Tag ID</Label>
                      <FormControl><Input placeholder="e.g. SHP-325" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-black px-6 focus-visible:ring-[#10B981]/20" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-black text-[16px] shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none uppercase tracking-[0.2em] transition-all active:scale-95">
                  Add Animal
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-white/10 bg-[#0F1115] shadow-2xl">
          <DialogHeader className="bg-white/[0.02] p-8 border-b border-white/5 text-left">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3">
              <Pencil className="h-5 w-5 text-[#10B981]" /> Asset Parameters
            </DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Adjust record for: {editingAsset?.tagId}</DialogDescription>
          </DialogHeader>
          <Form {...editAssetForm}>
            <form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)} className="p-8 space-y-6">
              <FormField control={editAssetForm.control} name="currentWeight" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-14 rounded-2xl bg-white/5 border-white/10 font-black text-lg px-6" {...field} /></FormControl></FormItem>
              )} />
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsEditAssetOpen(false)} className="h-14 flex-1 rounded-2xl border-white/10 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-[#10B981] text-white font-black uppercase text-xs shadow-xl">Save Adjustments</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}