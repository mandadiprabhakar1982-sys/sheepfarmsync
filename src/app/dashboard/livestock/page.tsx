'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Trash2, 
  Pencil, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Save, 
  Search,
  Activity,
  Scale,
  MoreVertical,
  Camera,
  Wheat,
  UploadCloud,
  Image as LucideImage,
  Filter,
  Venus,
  Mars,
  AlertTriangle,
  Syringe,
  Calendar as CalendarIcon,
  ShieldCheck,
  User,
  History as HistoryIcon,
  LayoutGrid,
  ChevronLeft,
  ListChecks
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
import { useLanguage } from '@/context/LanguageContext';
import { StatCard } from '@/components/stat-card';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TrackedSheep } from '@/lib/types';
import { useUser } from '@/firebase';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { t } = useLanguage();
  const { 
    trackedSheep, 
    addTrackedSheep, 
    deleteTrackedSheep, 
    updateTrackedSheep, 
    healthTasks,
    totalTracked,
    avgWeight,
    totalDailyFeed
  } = useFarm();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices && activeTab === 'register') {
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
  }, [activeTab]);
  
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
    setActiveTab('all');
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
    if (viewingSheep?.id === editingSheep.id) {
      setViewingSheep(prev => prev ? ({ ...prev, ...data, currentWeight: data.weight, previousWeight: weightChanged ? prev.currentWeight : prev.previousWeight }) : null);
    }
    toast({ title: 'Updated!', description: 'Audit record synchronized.' });
  };

  const sheepMedicalHistory = useMemo(() => {
    if (!viewingSheep || !healthTasks) return [];
    return healthTasks.filter(task => task.sheepId === viewingSheep.tagId);
  }, [viewingSheep, healthTasks]);

  // INLINE ASSET AUDIT DASHBOARD (MOBILE MODEL TRANSITION)
  if (viewingSheep) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-10 max-w-5xl animate-in fade-in slide-in-from-right-4 duration-500">
        <Button 
          variant="ghost" 
          className="mb-6 h-12 rounded-2xl text-[16px] font-bold uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors flex items-center gap-2"
          onClick={() => setViewingSheep(null)}
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Ledger
        </Button>

        <div className="flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-neutral-100 p-8 md:p-12 space-y-12">
          {/* SIDE-BY-SIDE ASSET HEADER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <div className="relative aspect-square rounded-[2rem] bg-neutral-900 overflow-hidden shadow-2xl">
                {viewingSheep.photoDataUrl ? (
                  <Image src={viewingSheep.photoDataUrl} alt={viewingSheep.tagId} fill className="object-cover" />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center",
                    viewingSheep.gender === 'female' ? "bg-pink-500/10" : "bg-blue-500/10"
                  )}>
                    <LucideImage className="h-24 w-24 text-neutral-200" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-[24px] font-black text-neutral-900 tracking-tighter uppercase">Asset {viewingSheep.tagId}</h2>
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-xl border-2 border-white",
                    viewingSheep.gender === 'female' ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                  )}>
                    {viewingSheep.gender === 'female' ? <Venus className="h-5 w-5" /> : <Mars className="h-5 w-5" />}
                  </div>
                </div>
                <p className="text-[18px] font-bold text-neutral-400 uppercase tracking-[0.2em]">{viewingSheep.breed || 'Standard Breed'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Current / Prev Wt</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[22px] font-black text-neutral-900">{viewingSheep.currentWeight}kg</p>
                      {viewingSheep.previousWeight && (
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] font-bold text-muted-foreground/40">/</span>
                          <span className="text-[16px] font-bold text-muted-foreground/60">{viewingSheep.previousWeight}kg</span>
                          {viewingSheep.currentWeight >= viewingSheep.previousWeight ? (
                            <ArrowUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Temporal Age</p>
                    <p className="text-[22px] font-black text-neutral-900">{viewingSheep.age} mos</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <Wheat className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-primary/60">Daily Nutrition Ratio</p>
                    <p className="text-[22px] font-black text-neutral-900">{(viewingSheep.currentWeight * 0.04).toFixed(2)}kg</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[12px] font-bold border-primary/20 text-primary uppercase h-6 px-2 rounded-lg">Balanced 4%</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-[18px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3">
                <Syringe className="h-5 w-5" /> Clinical History Ledger
              </h3>
              <div className="space-y-4">
                {sheepMedicalHistory.length > 0 ? (
                  sheepMedicalHistory.map((task) => (
                    <div key={task.id} className="p-5 rounded-[1.25rem] bg-neutral-50 border border-neutral-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[16px] font-bold text-neutral-900 leading-none">{task.healthType}</p>
                          <p className="text-[12px] font-bold text-muted-foreground mt-1.5 uppercase tracking-widest">{task.medicineName} • {task.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[12px] font-bold uppercase tracking-widest h-8 px-3 rounded-lg border-neutral-200 bg-white">
                        Due: {task.nextDueDate}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-12 rounded-[2rem] border-2 border-dashed border-neutral-100 text-center opacity-40">
                    <p className="text-[14px] font-bold uppercase tracking-widest">No clinical records discovered in the cloud</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[18px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5" /> Identity & Ownership Audit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-neutral-50/50 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Provisioned By</p>
                    <p className="text-[14px] font-bold text-neutral-900">{viewingSheep.creatorName || 'Staff Shepherd'}</p>
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-neutral-50/50 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <HistoryIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Synchronized</p>
                    <p className="text-[14px] font-bold text-neutral-900">
                      {viewingSheep.createdAt ? format(viewingSheep.createdAt.toDate(), "MMM dd, yyyy") : 'Initial Sync'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-8 gap-4 border-t border-neutral-100 flex items-center">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-[1rem] text-[16px] font-bold uppercase tracking-[0.2em] border-neutral-200 shadow-sm bg-white hover:bg-neutral-900 hover:text-white transition-all"
              onClick={() => {
                setEditingSheep(viewingSheep);
                setIsEditDialogOpen(true);
              }}
            >
              <Pencil className="mr-3 h-4 w-4" /> Adjust Audit
            </Button>
            <Button 
              variant="destructive" 
              className="h-14 w-14 rounded-[1rem] shadow-xl shadow-destructive/20 transition-all active:scale-90"
              onClick={() => {
                deleteTrackedSheep(viewingSheep.id, viewingSheep._path);
                setViewingSheep(null);
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-6xl">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <PageHeader
          title={t('flock_intel')}
          description="Global asset tracking and physiological monitoring."
          className="mb-0"
        />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search Tag ID..." 
              value={searchTagId}
              onChange={(e) => setSearchTagId(e.target.value)}
              className="pl-10 h-10 w-48 rounded-xl bg-white border-none shadow-sm font-medium text-[14px]" 
            />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500"><Filter className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500"><MoreVertical className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-12">
        <StatCard
            title={t('tracked')}
            value={totalTracked.toString()}
            icon={ListChecks}
            variant="warning"
            description="ID Verified"
        />
        <StatCard
            title={t('avg_weight')}
            value={`${avgWeight.toFixed(1)} kg`}
            icon={Scale}
            variant="info"
            description="Mean Weight"
        />
        <StatCard
            title={t('daily_feed_qty')}
            value={`${totalDailyFeed.toFixed(1)} kg`}
            icon={Wheat}
            variant="default"
            description="Nutritional Load"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <TabsList className="bg-neutral-100/50 p-1.5 rounded-2xl h-14 w-full max-w-2xl mx-auto grid grid-cols-3">
          <TabsTrigger value="all" className="rounded-xl text-[16px] font-bold uppercase tracking-widest h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary text-neutral-500">
            All Animals ({filteredAndSortedSheep.length})
          </TabsTrigger>
          <TabsTrigger value="register" className="rounded-xl text-[16px] font-bold uppercase tracking-widest h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 text-neutral-500">
            <PlusCircle className="h-4 w-4 mr-2" /> Register Entry
          </TabsTrigger>
          <TabsTrigger value="groups" className="rounded-xl text-[16px] font-bold uppercase tracking-widest h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary text-neutral-500">
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedSheep.length > 0 ? (
              filteredAndSortedSheep.map((sheep) => (
                <Card 
                  key={sheep.id} 
                  className="border-none shadow-sm hover:shadow-xl transition-all active:scale-[0.98] rounded-[2rem] bg-white cursor-pointer group overflow-hidden"
                  onClick={() => setViewingSheep(sheep)}
                >
                  <CardContent className="p-6 flex items-center gap-5">
                    <div className="relative h-16 w-16 shrink-0">
                      <Avatar className="h-16 w-16 rounded-[1.25rem] border-2 border-neutral-50 shadow-sm overflow-hidden">
                        <AvatarFallback className={cn(
                          "rounded-[1.25rem] transition-colors font-black text-xl",
                          sheep.gender === 'female' ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                        )}>
                          {sheep.tagId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg",
                        sheep.gender === 'female' ? "bg-pink-500 text-white" : "bg-blue-500 text-white"
                      )}>
                        {sheep.gender === 'female' ? <Venus className="h-3 w-3" /> : <Mars className="h-3 w-3" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[18px] font-bold text-neutral-900 leading-none uppercase">
                        {sheep.tagId}
                      </h3>
                      {sheep.breed && (
                        <p className="text-[12px] font-bold text-neutral-400 mt-2 uppercase tracking-widest truncate">
                          {sheep.breed}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 border-none text-[12px] font-bold h-6 px-2 tracking-widest">
                          {sheep.currentWeight} KG
                        </Badge>
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 border-none text-[12px] font-bold h-6 px-2 tracking-widest">
                          {sheep.age} MOS
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-neutral-300 hover:text-primary hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          setEditingSheep(sheep);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-neutral-300 hover:text-destructive hover:bg-destructive/5 transition-colors"
                        onClick={() => deleteTrackedSheep(sheep.id, sheep._path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-32 text-center">
                <p className="text-[18px] font-bold text-neutral-400 uppercase tracking-[0.3em]">No records discovered in the global ledger</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="max-w-2xl mx-auto border-none bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-neutral-900 p-10 text-white text-center relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><LayoutGrid className="h-32 w-32 rotate-12" /></div>
              <CardTitle className="text-[18px] font-bold flex items-center justify-center gap-3 relative z-10">
                <PlusCircle className="h-6 w-6 text-emerald-400" />
                Register Entry
              </CardTitle>
              <CardDescription className="text-[12px] font-bold text-white/40 uppercase tracking-[0.2em] relative z-10">Synchronize new livestock with community records</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <Form {...trackingForm}>
                <form onSubmit={trackingForm.handleSubmit(onTrackingSubmit)} className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-1 w-10 bg-emerald-500 rounded-full" />
                      <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">Visual Documentation</span>
                    </div>
                    
                    <div className="relative aspect-video rounded-3xl bg-neutral-50 overflow-hidden group border-2 border-dashed border-neutral-200">
                      {capturedImage ? (
                        <div className="relative w-full h-full">
                          <Image src={capturedImage} alt="Captured" fill className="object-cover" />
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl"
                            onClick={() => setCapturedImage(null)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                          {hasCameraPermission === false && (
                            <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center p-8 text-center">
                              <AlertTriangle className="h-10 w-10 text-amber-400 mb-4" />
                              <p className="text-[16px] font-bold text-white uppercase tracking-[0.2em]">Camera Access Restricted</p>
                              <p className="text-[12px] font-bold text-white/40 mt-2 leading-relaxed">Please enable hardware permissions or use the manual gallery upload protocol.</p>
                            </div>
                          )}
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-8">
                            <Button 
                              type="button"
                              onClick={handleCapture}
                              className="bg-neutral-900/90 backdrop-blur-xl text-white border-none h-12 px-6 rounded-2xl flex-1 text-[16px] font-bold uppercase tracking-widest shadow-2xl"
                            >
                              <Camera className="mr-3 h-5 w-5 text-emerald-400" /> Capture
                            </Button>
                            <Button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-emerald-600/90 backdrop-blur-xl text-white border-none h-12 px-6 rounded-2xl flex-1 text-[16px] font-bold uppercase tracking-widest shadow-2xl"
                            >
                              <UploadCloud className="mr-3 h-5 w-5 text-emerald-400" /> Upload
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

                    <div className="flex items-center gap-3 mt-10 mb-2">
                      <div className="h-1 w-10 bg-blue-500 rounded-full" />
                      <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">Identification Metrics</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={trackingForm.control} name="tagId" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Unique Tag ID</Label>
                          <FormControl>
                            <Input placeholder="e.g. A-101" className="h-12 rounded-2xl bg-neutral-50 border-none shadow-sm text-[14px] font-bold px-6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <FormField control={trackingForm.control} name="breed" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Clinical Breed</Label>
                          <FormControl>
                            <Input placeholder="e.g. Beltex" className="h-12 rounded-2xl bg-neutral-50 border-none shadow-sm text-[14px] font-bold px-6" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={trackingForm.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Gender</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl bg-neutral-50 border-none text-[14px] font-bold px-6">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="female" className="text-[14px] font-bold">Female</SelectItem>
                              <SelectItem value="male" className="text-[14px] font-bold">Male</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={trackingForm.control} name="weight" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Initial Weight (kg)</Label>
                          <FormControl>
                            <Input type="number" step="0.1" className="h-12 rounded-2xl bg-neutral-50 border-none shadow-sm text-[22px] font-black px-6" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={trackingForm.control} name="age" render={({ field }) => (
                        <FormItem>
                          <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Age (months)</Label>
                          <FormControl>
                            <Input type="number" className="h-12 rounded-2xl bg-neutral-50 border-none shadow-sm text-[14px] font-bold px-6" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-16 rounded-[1.25rem] text-[16px] font-bold uppercase tracking-[0.25em] shadow-2xl shadow-primary/20 bg-neutral-900 hover:bg-neutral-800 transition-all text-white">
                    <PlusCircle className="mr-4 h-6 w-6 text-emerald-400" /> Commit Record to Ledger
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="py-32 text-center bg-white/50 rounded-[3rem] border-4 border-dashed border-neutral-100">
            <p className="text-[18px] font-bold text-neutral-400 uppercase tracking-[0.3em]">Group Analytics Suite coming in v2.8</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-[18px] font-bold flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Update Record
            </DialogTitle>
            <DialogDescription className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Adjust physical metrics and identification parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8">
              <FormField control={editForm.control} name="tagId" render={({ field }) => (
                <FormItem>
                  <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Unique Tag ID</Label>
                  <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none text-[14px] font-bold px-4" {...field} /></FormControl>
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Gender</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none text-[14px] font-bold px-4"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="breed" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Breed</Label>
                    <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none text-[14px] font-bold px-4" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Current Weight (kg)</Label>
                    <FormControl><Input type="number" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none text-[22px] font-black px-4" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="age" render={({ field }) => (
                  <FormItem>
                    <Label className="text-[14px] font-bold uppercase tracking-widest opacity-40 ml-2">Age (months)</Label>
                    <FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none text-[14px] font-bold px-4" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-6 rounded-xl text-[14px] font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 flex-1 rounded-xl text-[16px] font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">
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
