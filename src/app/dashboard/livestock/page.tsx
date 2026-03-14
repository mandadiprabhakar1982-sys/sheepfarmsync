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
  ListChecks,
  Footprints,
  Scale,
  Plus
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

// --- SCHEMAS ---

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
    totalDailyFeed, totalFeedCost, totalTracked, isLoading
  } = useFarm();
  
  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editing Asset State
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  
  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- FORMS ---

  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '', registrationDate: new Date(), gender: 'female', age: 6, currentWeight: 25, breed: 'Standard'
    },
  });

  const editAssetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  // Attach stream to video element
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  // --- CALCULATIONS ---

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    if (!searchTerm.trim()) return trackedSheep;
    const term = searchTerm.toLowerCase();
    return trackedSheep.filter(s => s.tagId.toLowerCase().includes(term) || (s.breed || '').toLowerCase().includes(term));
  }, [trackedSheep, searchTerm]);

  // --- HANDLERS ---

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
    setEditingAsset(null);
    toast({ title: 'Record Updated', description: `Asset ${data.tagId} synchronized.` });
  };

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset);
    editAssetForm.reset({
      tagId: asset.tagId, registrationDate: asset.registrationDate ? new Date(asset.registrationDate) : new Date(), gender: asset.gender, age: asset.age, currentWeight: asset.currentWeight, breed: asset.breed || 'Standard',
    });
    setIsEditAssetOpen(true);
  };

  // --- CAMERA HELPERS ---

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast({ variant: 'destructive', title: 'Unsupported', description: 'Camera access unavailable.' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Please enable camera permissions.' });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
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
        setCapturedPhoto(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  // --- UI COMPONENTS ---

  const MetricCard = ({ title, value, sub, gradient, icon: Icon }: any) => (
    <Card className={cn("border-none shadow-xl rounded-3xl overflow-hidden text-white h-full bg-gradient-to-br", gradient)}>
      <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px] relative">
        <div className="absolute top-6 right-6 opacity-40">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">{title}</p>
          </div>
          <p className="text-[36px] font-black tracking-tighter leading-none">{value}</p>
        </div>
        <div className="mt-auto">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-primary/10 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-primary/40 uppercase tracking-[0.3em]">Synchronizing Assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-500">
      <PageHeader
        title="Livestock Registry"
        description="PRECISION ASSET TRACKING & BIO-DATA"
        className="mb-10"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <MetricCard 
          title="Tracked Animals" 
          value={totalTracked.toString()} 
          sub="Assets Registered" 
          gradient="from-emerald-500 to-emerald-700" 
          icon={Footprints} 
        />
        <MetricCard 
          title="Avg. Flock Weight" 
          value={`${Math.round(totalFeedCost / 30).toLocaleString()} kg`} 
          sub="Individual Mean" 
          gradient="from-blue-400 to-blue-600" 
          icon={Scale} 
        />
        <MetricCard 
          title="Daily Feed (KG)" 
          value={totalDailyFeed.toFixed(1)} 
          sub="Requirement" 
          gradient="from-rose-400 to-rose-500" 
          icon={Wheat} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter by Tag ID or Breed..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-14 pl-14 rounded-full bg-white border-none shadow-xl font-bold text-sm" 
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent">
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          <div className="rounded-[2.5rem] border-none overflow-hidden shadow-2xl bg-white">
            <ScrollArea className="h-[650px] w-full">
              <Table>
                <TableHeader className="bg-neutral-50/50 sticky top-0 z-10 backdrop-blur-md">
                  <TableRow className="hover:bg-transparent border-b border-neutral-100">
                    <TableHead className="text-[11px] font-black uppercase tracking-widest py-6 pl-10">Asset ID</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest py-6">Attributes</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest py-6">Weight</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest py-6 text-right pr-10">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((sheep) => (
                      <TableRow key={sheep.id} className="hover:bg-neutral-50 transition-colors group border-b border-neutral-50">
                        <TableCell className="py-6 pl-10">
                          <div className="flex items-center gap-5">
                            {sheep.photoDataUrl ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl shrink-0 cursor-zoom-in hover:scale-110 transition-all">
                                    <img src={sheep.photoDataUrl} alt={sheep.tagId} className="h-full w-full object-cover" />
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
                                  <DialogHeader className="sr-only"><DialogTitle>Asset Visual: {sheep.tagId}</DialogTitle></DialogHeader>
                                  <img src={sheep.photoDataUrl} alt={sheep.tagId} className="w-full rounded-[2.5rem]" />
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0 border-2 border-dashed border-neutral-200">
                                <Camera className="h-5 w-5 text-neutral-300" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-[15px] font-black text-neutral-900 leading-none">{sheep.tagId}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest opacity-60">{sheep.breed || 'Standard'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-neutral-900 uppercase tracking-tight">{sheep.gender || 'MALE'}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{sheep.age} Months</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[15px] font-black text-neutral-900">
                          {sheep.currentWeight} kg
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 shadow-sm" 
                            onClick={() => handleEditAsset(sheep)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest">No matching assets found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-none sticky top-24">
            <div className="flex items-center gap-3 mb-10 text-[#2e7d32]">
              <Plus className="h-6 w-6 stroke-[3px]" />
              <h3 className="text-[18px] font-black uppercase tracking-[0.1em]">Add New Sheep</h3>
            </div>
            
            <Form {...assetForm}>
              <form onSubmit={assetForm.handleSubmit(onAssetSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={assetForm.control} name="tagId" render={({ field }) => (
                    <FormItem>
                      <Label className="text-[11px] font-black uppercase tracking-widest opacity-40 ml-2">Tag ID</Label>
                      <FormControl>
                        <Input placeholder="e.g. SHP325" className="h-14 rounded-2xl bg-neutral-50 border-none shadow-inner font-bold text-[16px] px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={assetForm.control} name="registrationDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="text-[11px] font-black uppercase tracking-widest opacity-40 ml-2">Registration Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-14 w-full rounded-2xl bg-neutral-50 border-none shadow-inner font-bold text-left px-6">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-none rounded-2xl shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={assetForm.control} name="breed" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[11px] font-black uppercase tracking-widest opacity-40 ml-2">Breed</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none shadow-inner font-bold px-6">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="Standard" className="font-bold">Standard</SelectItem>
                            <SelectItem value="Nellore" className="font-bold">Nellore</SelectItem>
                            <SelectItem value="Deccani" className="font-bold">Deccani</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={assetForm.control} name="age" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[11px] font-black uppercase tracking-widest opacity-40 ml-2">Age (Mos)</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-none shadow-inner font-bold px-6">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {[1,2,3,4,5,6,12,18,24].map(m => (
                              <SelectItem key={m} value={m.toString()} className="font-bold">{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={assetForm.control} name="currentWeight" render={({ field }) => (
                      <FormItem>
                        <Label className="text-[11px] font-black uppercase tracking-widest opacity-40 ml-2">Weight (KG)</Label>
                        <FormControl>
                          <Input type="number" step="0.1" className="h-14 rounded-2xl bg-neutral-50 border-none shadow-inner font-black text-lg px-6" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-widest opacity-40 ml-2">Asset Photo</Label>
                      {!capturedPhoto && !isCameraOpen && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={startCamera} 
                          className="w-full h-14 border-dashed border-2 rounded-2xl flex items-center justify-center gap-3 bg-neutral-50 border-neutral-200 hover:bg-neutral-100 group transition-all"
                        >
                          <Camera className="h-5 w-5 text-neutral-300 group-hover:text-primary" />
                          <span className="text-[10px] font-black uppercase opacity-40 group-hover:opacity-100">Upload sheep photo...</span>
                        </Button>
                      )}
                      
                      {isCameraOpen && (
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                            <Button type="button" onClick={capturePhoto} className="h-12 w-12 rounded-full bg-white border-4 border-black p-0 shadow-2xl" />
                            <Button type="button" variant="destructive" onClick={stopCamera} className="h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest">Abort</Button>
                          </div>
                        </div>
                      )}
                      
                      {capturedPhoto && (
                        <div className="relative rounded-2xl overflow-hidden aspect-square border-2 border-emerald-500/20 shadow-xl">
                          <img src={capturedPhoto} alt="Capture" className="w-full h-full object-cover" />
                          <Button type="button" size="icon" onClick={() => { setCapturedPhoto(null); startCamera(); }} className="absolute top-2 right-2 h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-md">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-black text-[16px] shadow-2xl border-none uppercase tracking-[0.2em] transition-all active:scale-95">
                  Add Animal
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* --- DIALOGS: EDIT ASSET --- */}
      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
              <Pencil className="h-5 w-5 text-emerald-400" /> Asset Parameters
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Adjust record for: {editingAsset?.tagId}</DialogDescription>
          </DialogHeader>
          <Form {...editAssetForm}>
            <form onSubmit={editAssetForm.handleSubmit(onEditAssetSubmit)} className="space-y-6 p-8 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editAssetForm.control} name="tagId" render={({ field }) => (<FormItem className="col-span-2"><Label className="text-xs font-black uppercase opacity-40 ml-2">Tag ID</Label><FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" {...field} /></FormControl></FormItem>)} />
                <FormField control={editAssetForm.control} name="registrationDate" render={({ field }) => (<FormItem className="col-span-2"><Label className="text-xs font-black uppercase opacity-40 ml-2">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-12 w-full rounded-xl bg-neutral-50 border-none font-bold text-left px-4">{field.value ? format(field.value, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>)} />
                <FormField control={editAssetForm.control} name="gender" render={({ field }) => (<FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Gender</Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>)} />
                <FormField control={editAssetForm.control} name="currentWeight" render={({ field }) => (<FormItem className="col-span-2"><Label className="text-xs font-black uppercase opacity-40 ml-2">Weight (KG)</Label><FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-lg px-4" {...field} /></FormControl></FormItem>)} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button type="button" variant="outline" onClick={() => setIsEditAssetOpen(false)} className="h-12 px-6 rounded-xl font-bold uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase bg-neutral-900 text-white hover:bg-neutral-800 flex-1 text-xs">Save Adjustments</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
