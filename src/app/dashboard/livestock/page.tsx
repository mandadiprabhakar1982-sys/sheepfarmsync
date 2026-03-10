
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Trash2, 
  Camera as CameraIcon, 
  Pencil, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  ImageIcon, 
  ZoomIn, 
  X, 
  Save, 
  Search,
  Activity,
  History,
  Scale,
  MoreVertical,
  Camera,
  Wheat,
  TrendingUp,
  UploadCloud,
  CheckCircle2,
  Image as LucideImage,
  ChevronRight,
  Filter,
  Venus,
  Mars,
  RefreshCcw,
  AlertTriangle,
  FileText,
  Syringe,
  Calendar as CalendarIcon,
  ShieldCheck,
  User,
  History as HistoryIcon,
  TrendingUpDown
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TrackedSheep, HealthTask } from '@/lib/types';
import { useUser } from '@/firebase';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const trackingFormSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  weight: z.coerce.number().positive('Weight must be a positive number'),
  age: z.coerce.number().int().positive('Age in months must be a positive integer'),
  gender: z.enum(['male', 'female']).default('female'),
  breed: z.string().optional(),
});

type TrackingFormData = z.infer<typeof trackingFormSchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep, healthTasks, isLoading, userRole } = useFarm();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingSheep, setViewingSheep] = useState<TrackedSheep | null>(null);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [searchTagId, setSearchTagId] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const trackingForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: { tagId: '', weight: 0, age: 0, gender: 'female', breed: '' },
  });

  const editForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
  });

  useEffect(() => {
    if (editingSheep) {
      editForm.reset({
        tagId: editingSheep.tagId,
        weight: editingSheep.currentWeight,
        age: editingSheep.age,
        gender: editingSheep.gender || 'female',
        breed: editingSheep.breed || '',
      });
    }
  }, [editingSheep, editForm]);

  const filteredAndSortedSheep = useMemo(() => {
    if (!trackedSheep) return [];
    let filtered = [...trackedSheep];
    
    if (searchTagId.trim()) {
      filtered = filtered.filter(s => 
        s.tagId.toLowerCase().includes(searchTagId.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => 
      a.tagId.localeCompare(b.tagId, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [trackedSheep, searchTagId]);

  const nutritionStats = useMemo(() => {
    if (!trackedSheep || trackedSheep.length === 0) return { total: 0, avg: 0 };
    const total = trackedSheep.reduce((acc, s) => acc + (s.currentWeight * 0.04), 0);
    const avg = total / trackedSheep.length;
    return { total, avg };
  }, [trackedSheep]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      }
    };
    getCameraPermission();
  }, []);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        setCapturedImage(canvas.toDataURL('image/png'));
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onTrackingSubmit: SubmitHandler<TrackingFormData> = (data) => {
    addTrackedSheep({ 
      tagId: data.tagId,
      age: data.age,
      currentWeight: data.weight,
      gender: data.gender,
      breed: data.breed,
      photoDataUrl: capturedImage || undefined 
    });
    trackingForm.reset();
    setCapturedImage(null);
    toast({ title: 'Success!', description: 'Sheep record synchronized with global flock.' });
  };

  const onEditSubmit: SubmitHandler<TrackingFormData> = (data) => {
    if (!editingSheep) return;
    const weightChanged = data.weight !== editingSheep.currentWeight;
    updateTrackedSheep(editingSheep.id, {
      tagId: data.tagId,
      age: data.age,
      currentWeight: data.weight,
      gender: data.gender,
      breed: data.breed,
      previousWeight: weightChanged ? editingSheep.currentWeight : (editingSheep.previousWeight || undefined),
      photoDataUrl: editingSheep.photoDataUrl,
    }, editingSheep._path);
    setIsEditDialogOpen(false);
    setEditingSheep(null);
    toast({ title: 'Updated!', description: 'Audit record synchronized.' });
  };

  const sheepMedicalHistory = useMemo(() => {
    if (!viewingSheep || !healthTasks) return [];
    return healthTasks.filter(task => task.sheepId === viewingSheep.tagId);
  }, [viewingSheep, healthTasks]);

  const canManageAll = userRole === 'admin' || userRole === 'collaborator';

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <PageHeader
            title="Flock Intelligence"
            description="Global asset tracking and physiological monitoring."
            className="mb-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500"><Filter className="h-5 w-5" /></Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search Tag ID..." 
              value={searchTagId}
              onChange={(e) => setSearchTagId(e.target.value)}
              className="pl-10 h-10 w-48 rounded-xl bg-white border-none shadow-sm font-medium" 
            />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500"><MoreVertical className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-neutral-900 p-8 text-white">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Register Entry
              </CardTitle>
              <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Synchronize new livestock with community records</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...trackingForm}>
                <form onSubmit={trackingForm.handleSubmit(onTrackingSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Visual Documentation</Label>
                    
                    <div className="relative aspect-video rounded-2xl bg-neutral-100 overflow-hidden group border-2 border-dashed border-neutral-200">
                      {capturedImage ? (
                        <div className="relative w-full h-full">
                          <Image src={capturedImage} alt="Captured" fill className="object-cover" />
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                            onClick={() => setCapturedImage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                          {hasCameraPermission === false && (
                            <div className="absolute inset-0 bg-neutral-900/80 flex flex-col items-center justify-center p-6 text-center">
                              <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">Camera Access Denied</p>
                              <p className="text-[8px] text-white/60 mt-1">Please enable permissions or use manual upload.</p>
                            </div>
                          )}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="button"
                              onClick={handleCapture}
                              className="bg-neutral-900/80 backdrop-blur-md text-white border-none h-10 px-4 rounded-xl flex-1 font-bold text-[10px] uppercase tracking-widest"
                            >
                              <Camera className="mr-2 h-4 w-4" /> Capture
                            </Button>
                            <Button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-emerald-600/80 backdrop-blur-md text-white border-none h-10 px-4 rounded-xl flex-1 font-bold text-[10px] uppercase tracking-widest"
                            >
                              <UploadCloud className="mr-2 h-4 w-4" /> Upload
                            </Button>
                          </div>
                        </div>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                      />
                    </div>

                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Identification Metrics</Label>
                    <FormField control={trackingForm.control} name="tagId" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Tag ID (e.g., A-101)" className="h-14 rounded-2xl bg-neutral-50 border-none shadow-sm font-black text-base px-6 focus-visible:ring-primary/20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={trackingForm.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Gender</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={trackingForm.control} name="breed" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Breed</Label>
                          <FormControl>
                            <Input placeholder="e.g. Beltex" className="h-12 rounded-xl bg-neutral-50 border-none shadow-sm font-bold px-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={trackingForm.control} name="weight" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Weight (kg)</Label>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="Current" className="h-12 rounded-xl bg-neutral-50 border-none shadow-sm font-bold px-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={trackingForm.control} name="age" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Age (months)</Label>
                          <FormControl>
                            <Input type="number" placeholder="Months" className="h-12 rounded-xl bg-neutral-50 border-none shadow-sm font-bold px-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 transition-all hover:-translate-y-1">
                    <PlusCircle className="mr-3 h-6 w-6 text-emerald-400" /> Commit Record
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-neutral-100/50 p-1.5 rounded-2xl h-14 w-full max-w-md">
              <TabsTrigger value="all" className="rounded-xl font-bold text-[13px] h-full flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary text-neutral-500">
                All Animals ({filteredAndSortedSheep.length})
              </TabsTrigger>
              <TabsTrigger value="groups" className="rounded-xl font-bold text-[13px] h-full flex-1 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary text-neutral-500">
                Groups
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTab === 'all' && filteredAndSortedSheep.length > 0 ? (
              filteredAndSortedSheep.map((sheep) => (
                <Card 
                  key={sheep.id} 
                  className="border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-[1.5rem] bg-white cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setViewingSheep(sheep);
                    setIsDetailsOpen(true);
                  }}
                >
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="relative h-16 w-16 shrink-0">
                      <Avatar className="h-16 w-16 rounded-2xl border-2 border-neutral-50 shadow-sm overflow-hidden">
                        {sheep.photoDataUrl ? (
                          <AvatarImage src={sheep.photoDataUrl} className="object-cover" />
                        ) : (
                          <AvatarFallback className={cn(
                            "rounded-2xl transition-colors font-black text-lg",
                            sheep.gender === 'female' ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                          )}>
                            {sheep.tagId.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg",
                        sheep.gender === 'female' ? "bg-pink-500 text-white" : "bg-blue-500 text-white"
                      )}>
                        {sheep.gender === 'female' ? <Venus className="h-3 w-3" /> : <Mars className="h-3 w-3" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black tracking-tight text-neutral-900 leading-none">
                        Sheep {sheep.tagId}
                      </h3>
                      {sheep.breed && (
                        <p className="text-[11px] font-bold text-neutral-400 mt-1.5 uppercase tracking-wide truncate">
                          {sheep.breed}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 border-none text-[9px] font-black h-5 px-2">
                          {sheep.currentWeight} KG
                        </Badge>
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 border-none text-[9px] font-black h-5 px-2">
                          {sheep.age} MOS
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No records found</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-6 rounded-[2rem] bg-neutral-900 text-white shadow-xl flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Global Head</p>
                <p className="text-2xl font-black">{filteredAndSortedSheep.length}</p>
              </div>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-white border border-neutral-100 shadow-xl flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Avg Weight</p>
                <p className="text-2xl font-black">
                  {(filteredAndSortedSheep.reduce((acc, s) => acc + s.currentWeight, 0) / (filteredAndSortedSheep.length || 1)).toFixed(1)}kg
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white border border-neutral-100 shadow-xl flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Daily Feed</p>
                <p className="text-2xl font-black">{nutritionStats.total.toFixed(1)}kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOTAL INFORMATION DIALOG */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          {viewingSheep && (
            <div className="flex flex-col h-[85vh] md:h-auto overflow-hidden">
              <div className="relative h-64 shrink-0 bg-neutral-900">
                {viewingSheep.photoDataUrl ? (
                  <Image src={viewingSheep.photoDataUrl} alt={viewingSheep.tagId} fill className="object-cover opacity-80" />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center",
                    viewingSheep.gender === 'female' ? "bg-pink-500/20" : "bg-blue-500/20"
                  )}>
                    <LucideImage className="h-20 w-20 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-6 right-6 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Asset {viewingSheep.tagId}</h2>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shadow-lg",
                        viewingSheep.gender === 'female' ? "bg-pink-500 text-white" : "bg-blue-500 text-white"
                      )}>
                        {viewingSheep.gender === 'female' ? <Venus className="h-4 w-4" /> : <Mars className="h-4 w-4" />}
                      </div>
                    </div>
                    <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em]">{viewingSheep.breed || 'Standard Breed'}</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none font-black h-8 px-4 rounded-xl text-xs tracking-widest shadow-xl">VERIFIED</Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="p-6 rounded-[2rem] bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center text-center gap-2">
                    <Scale className="h-5 w-5 text-primary opacity-40" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Vitals Payload</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-black text-neutral-900">{viewingSheep.currentWeight}kg</p>
                      {viewingSheep.previousWeight && (
                        <div className="flex items-center text-[10px] font-black">
                          {viewingSheep.currentWeight >= viewingSheep.previousWeight ? (
                            <ArrowUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {viewingSheep.previousWeight && (
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Prev: {viewingSheep.previousWeight}kg</p>
                    )}
                  </div>
                  <div className="p-6 rounded-[2rem] bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center text-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary opacity-40" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Age</p>
                    <p className="text-2xl font-black text-neutral-900">{viewingSheep.age} mos</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center text-center gap-2">
                    <Wheat className="h-5 w-5 text-primary opacity-40" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Daily Feed</p>
                    <p className="text-2xl font-black text-neutral-900">{(viewingSheep.currentWeight * 0.04).toFixed(2)}kg</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3">
                      <Syringe className="h-4 w-4" /> Clinical History
                    </h3>
                    <div className="space-y-4">
                      {sheepMedicalHistory.length > 0 ? (
                        sheepMedicalHistory.map((task) => (
                          <div key={task.id} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                <Activity className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-neutral-900 leading-none">{task.healthType}</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-widest">{task.medicineName} • {task.date}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-6 px-3 border-neutral-200">
                              Next: {task.nextDueDate}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 rounded-[2rem] border-2 border-dashed border-neutral-100 text-center opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest">No medical records discovered</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4" /> Identity Audit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-neutral-50/50 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <User className="h-5 w-5 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Registered By</p>
                          <p className="text-xs font-bold text-neutral-900">{viewingSheep.creatorName || 'Staff Shepherd'}</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-neutral-50/50 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <HistoryIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Audit Timestamp</p>
                          <p className="text-xs font-bold text-neutral-900">
                            {viewingSheep.createdAt ? format(viewingSheep.createdAt.toDate(), "MMM dd, yyyy HH:mm") : 'Initial Sync'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <DialogFooter className="p-8 bg-neutral-50 gap-4 border-t border-neutral-100 flex-row">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-neutral-200"
                  onClick={() => {
                    setEditingSheep(viewingSheep);
                    setIsDetailsOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Audit
                </Button>
                <Button 
                  variant="destructive" 
                  className="h-14 w-14 rounded-2xl font-black shadow-xl shadow-destructive/20"
                  onClick={() => {
                    deleteTrackedSheep(viewingSheep.id, viewingSheep._path);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-6 w-6 text-emerald-400" />
              Update Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Adjust physical metrics and identification parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8">
              <FormField control={editForm.control} name="tagId" render={({ field }) => (
                <FormItem>
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Unique Tag ID</Label>
                  <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl>
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Gender</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="breed" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Breed</Label>
                    <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Current Weight (kg)</Label>
                    <FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="age" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Age (months)</Label>
                    <FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 flex-1 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">
                  <Save className="mr-2 h-4 w-4 text-emerald-400" /> Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
