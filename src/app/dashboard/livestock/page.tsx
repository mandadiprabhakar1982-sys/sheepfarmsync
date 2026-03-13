'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Trash2, 
  Pencil, 
  Scale, 
  ShoppingBag,
  Wheat,
  Info,
  CheckCircle2,
  Syringe,
  ChevronRight,
  Plus,
  Camera,
  RotateCcw,
  User,
  Calendar,
  Weight,
  Loader2,
  Search,
  X,
  Save
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
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
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  age: z.coerce.number().min(0, 'Age is required'),
  currentWeight: z.coerce.number().min(1, 'Weight is required'),
  breed: z.string().min(1, 'Breed is required').default('Standard'),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { 
    trackedSheep, 
    addTrackedSheep, 
    updateTrackedSheep,
    deleteTrackedSheep,
    totalDailyFeed,
    totalFeedCost,
    totalTracked,
    isLoading
  } = useFarm();
  
  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editing State
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Camera States
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      tagId: '',
      gender: 'female',
      age: 6,
      currentWeight: 25,
      breed: 'Standard'
    },
  });

  const editForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const filteredAssets = useMemo(() => {
    if (!trackedSheep) return [];
    if (!searchTerm.trim()) return trackedSheep;
    
    const term = searchTerm.toLowerCase();
    return trackedSheep.filter(s => 
      s.tagId.toLowerCase().includes(term) || 
      (s.breed || '').toLowerCase().includes(term)
    );
  }, [trackedSheep, searchTerm]);

  const onQuickSubmit: SubmitHandler<AssetFormData> = (data) => {
    addTrackedSheep({ 
      ...data,
      photoDataUrl: capturedPhoto || undefined
    });
    form.reset({
      tagId: '',
      gender: 'female',
      age: 6,
      currentWeight: 25,
      breed: 'Standard'
    });
    setCapturedPhoto(null);
    setIsCameraOpen(false);
    toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized.` });
  };

  const onEditSubmit: SubmitHandler<AssetFormData> = (data) => {
    if (!editingAsset) return;
    updateTrackedSheep(editingAsset.id, data, editingAsset._path);
    setIsEditOpen(false);
    setEditingAsset(null);
    toast({ title: 'Record Updated', description: `Asset ${data.tagId} parameters synchronized.` });
  };

  const handleEditClick = (asset: any) => {
    setEditingAsset(asset);
    editForm.reset({
      tagId: asset.tagId,
      gender: asset.gender,
      age: asset.age,
      currentWeight: asset.currentWeight,
      breed: asset.breed || 'Standard',
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string, path?: string) => {
    deleteTrackedSheep(id, path);
    toast({ title: 'Record Deleted', description: 'Asset has been removed from ledger.', variant: 'destructive' });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const MetricCard = ({ title, value, sub, color, icon: Icon }: any) => (
    <Card className={cn("border-none shadow-sm rounded-2xl overflow-hidden text-white h-full", color)}>
      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
        <div className="flex justify-between items-start">
          <p className="text-[18px] font-bold opacity-90 uppercase tracking-tight">{title}</p>
          {Icon && <Icon className="h-5 w-5 opacity-40" />}
        </div>
        <div className="flex justify-between items-baseline mt-2">
          <p className="text-[32px] font-black tracking-tighter leading-none">{value}</p>
          <p className="text-[12px] font-black opacity-60 uppercase">{sub}</p>
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
        title="Flock Intelligence"
        description="PRECISION ASSET MANAGEMENT"
        className="mb-8"
      />

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-neutral-100 p-8 flex flex-row items-center justify-between">
              <CardTitle className="text-[18px] font-black tracking-tight text-neutral-900 uppercase">Sheep Farm Dashboard</CardTitle>
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-neutral-200" />
                <div className="h-1 w-1 rounded-full bg-neutral-200" />
                <div className="h-1 w-1 rounded-full bg-neutral-200" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard 
                  title="Track Animal" 
                  value={totalTracked.toString()} 
                  sub="Assets Registered" 
                  color="bg-emerald-600" 
                />
                <MetricCard 
                  title="Feed Cost Today" 
                  value={`₹${Math.round(totalFeedCost / 30).toLocaleString()}`} 
                  sub="Daily Amortized" 
                  color="bg-blue-500" 
                />
                <MetricCard 
                  title="Daily Feed (KG)" 
                  value={totalDailyFeed.toFixed(1)} 
                  sub="Requirement" 
                  color="bg-rose-500" 
                  icon={Wheat}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
                <div className="lg:col-span-7 space-y-6">
                  {/* FILTER BAR */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Filter by Tag ID or Breed..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 pl-12 rounded-2xl bg-neutral-50 border-none shadow-inner font-bold text-sm"
                    />
                    {searchTerm && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-neutral-100 overflow-hidden shadow-sm bg-white">
                    <ScrollArea className="h-[600px] w-full">
                      <Table>
                        <TableHeader className="bg-neutral-50/50 sticky top-0 z-10 backdrop-blur-md">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[12px] font-black uppercase tracking-widest py-4 pl-6">ID</TableHead>
                            <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Attributes</TableHead>
                            <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Weight</TableHead>
                            <TableHead className="text-[12px] font-black uppercase tracking-widest py-4 text-right pr-6">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAssets.length > 0 ? (
                            filteredAssets.map((sheep) => (
                              <TableRow key={sheep.id} className="hover:bg-neutral-50 transition-colors group">
                                <TableCell className="font-black text-[14px] py-4 pl-6 uppercase text-primary/80">
                                  <div className="flex items-center gap-3">
                                    {sheep.photoDataUrl ? (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-neutral-200 shrink-0 shadow-sm bg-white cursor-zoom-in hover:scale-110 hover:border-primary/50 transition-all group/img">
                                            <img 
                                              src={sheep.photoDataUrl} 
                                              alt={sheep.tagId} 
                                              className="h-full w-full object-cover transition-transform group-hover/img:scale-110" 
                                            />
                                          </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none sm:rounded-[2rem] overflow-hidden">
                                          <DialogHeader className="sr-only">
                                            <DialogTitle>Sheep Photo: {sheep.tagId}</DialogTitle>
                                          </DialogHeader>
                                          <img src={sheep.photoDataUrl} alt={sheep.tagId} className="w-full h-auto" />
                                        </DialogContent>
                                      </Dialog>
                                    ) : (
                                      <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 border border-dashed border-neutral-300">
                                        <Camera className="h-4 w-4 text-neutral-400" />
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="leading-none">{sheep.tagId}</span>
                                      <span className="text-[10px] font-bold text-muted-foreground mt-1">{sheep.breed || 'Standard'}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-neutral-500 uppercase tracking-tight">{sheep.gender}</span>
                                    <span className="text-[10px] font-medium text-neutral-400">{sheep.age} Months</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-[14px] font-black text-neutral-900">
                                  {sheep.currentWeight} kg
                                  {sheep.previousWeight && (
                                    <div className={cn(
                                      "text-[10px] font-bold mt-0.5",
                                      sheep.currentWeight > sheep.previousWeight ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                      {sheep.currentWeight > sheep.previousWeight ? '+' : ''}{(sheep.currentWeight - sheep.previousWeight).toFixed(1)}kg
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-lg bg-neutral-100 hover:bg-neutral-200"
                                      onClick={() => handleEditClick(sheep)}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-blue-600" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100"
                                      onClick={() => handleDeleteClick(sheep.id, sheep._path)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-20 text-[14px] text-muted-foreground italic uppercase tracking-widest">
                                <div className="flex flex-col items-center gap-4 opacity-40">
                                  <Info className="h-10 w-10" />
                                  <span>{searchTerm ? "No matching assets found" : "No assets logged in flock"}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-neutral-50/50 rounded-3xl p-8 border border-neutral-100">
                    <h3 className="text-[18px] font-black text-[#2e7d32] uppercase tracking-[0.1em] mb-6 flex items-center gap-3">
                      <div className="h-5 w-1.5 bg-[#2e7d32] rounded-full" />
                      Add New Sheep
                    </h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onQuickSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="tagId"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Tag ID</Label>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. SHP325" 
                                    className="h-14 rounded-2xl bg-white border-neutral-200 shadow-sm font-bold text-[16px] px-6 focus-visible:ring-emerald-500/20" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="breed"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Breed</Label>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Nellore, Deccani" 
                                    className="h-14 rounded-2xl bg-white border-neutral-200 shadow-sm font-bold text-[16px] px-6 focus-visible:ring-emerald-500/20" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Gender</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-14 rounded-2xl bg-white border-neutral-200 shadow-sm font-bold">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Age (Months)</Label>
                                <FormControl>
                                  <Input type="number" className="h-14 rounded-2xl bg-white border-neutral-200 shadow-sm font-bold" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="currentWeight"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Initial Weight (KG)</Label>
                                <FormControl>
                                  <Input type="number" step="0.1" className="h-14 rounded-2xl bg-white border-neutral-200 shadow-sm font-bold text-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* CAMERA INTERFACE */}
                        <div className="space-y-4">
                          <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Sheep Photo</Label>
                          
                          {!capturedPhoto && !isCameraOpen && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={startCamera}
                              className="w-full h-24 border-dashed border-2 rounded-2xl flex flex-col gap-2 bg-white"
                            >
                              <Camera className="h-6 w-6 text-neutral-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Open Camera</span>
                            </Button>
                          )}

                          {isCameraOpen && (
                            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                                <Button type="button" onClick={capturePhoto} className="h-12 w-12 rounded-full bg-white text-black hover:bg-neutral-200 p-0">
                                  <div className="h-10 w-10 rounded-full border-2 border-black" />
                                </Button>
                                <Button type="button" variant="destructive" onClick={stopCamera} className="h-12 rounded-xl">Cancel</Button>
                              </div>
                            </div>
                          )}

                          {capturedPhoto && (
                            <div className="relative rounded-2xl overflow-hidden aspect-video border-2 border-emerald-500/20">
                              <img src={capturedPhoto} alt="Sheep capture" className="w-full h-full object-cover" />
                              <Button 
                                type="button" 
                                size="icon" 
                                onClick={() => { setCapturedPhoto(null); startCamera(); }}
                                className="absolute top-2 right-2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {hasCameraPermission === false && (
                            <Alert variant="destructive">
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        <Button type="submit" className="w-full h-16 rounded-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-[20px] shadow-lg transition-all active:translate-y-1 active:shadow-none border-b-4 border-[#1b5e20] uppercase tracking-wide">
                          Add Animal
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-primary/10" />
              <h2 className="text-[12px] font-black text-primary/40 tracking-[0.4em] uppercase whitespace-nowrap px-4">
                Operational Breakdown
              </h2>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            <div className="h-32 rounded-[2.5rem] bg-white border-4 border-dashed border-neutral-50 flex items-center justify-center opacity-30">
               <Info className="h-6 w-6 text-primary" />
            </div>
          </section>
        </div>
      </div>

      {/* EDIT ASSET DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Update Asset Parameters
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Adjust clinical record for Tag ID: {editingAsset?.tagId}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="tagId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <Label className="text-xs font-black uppercase opacity-40 ml-2">Tag ID</Label>
                      <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <Label className="text-xs font-black uppercase opacity-40 ml-2">Breed</Label>
                      <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-xs font-black uppercase opacity-40 ml-2">Gender</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-xs font-black uppercase opacity-40 ml-2">Age (Months)</Label>
                      <FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <Label className="text-xs font-black uppercase opacity-40 ml-2">Current Weight (KG)</Label>
                      <FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black text-lg px-4" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-12 px-6 rounded-xl font-bold border-neutral-200 uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1 text-xs">
                  <Save className="mr-2 h-4 w-4" /> Save Adjustments
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
