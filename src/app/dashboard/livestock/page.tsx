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
  Image as LucideImage
} from 'lucide-react';
import Image from 'next/image';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Area } from 'recharts';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TrackedSheep } from '@/lib/types';
import { useUser } from '@/firebase';

const trackingFormSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  weight: z.coerce.number().positive('Weight must be a positive number'),
  age: z.coerce.number().int().positive('Age in months must be a positive integer'),
});

type TrackingFormData = z.infer<typeof trackingFormSchema>;

const chartConfig = {
  averageWeight: {
    label: 'Avg. Weight (kg)',
    color: 'hsl(var(--primary))',
  },
  averageFeed: {
    label: 'Daily Feed (kg)',
    color: '#f59e0b',
  },
  growth: {
    label: 'Growth Velocity',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function LivestockPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep, isLoading, userRole } = useFarm();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [searchTagId, setSearchTagId] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const trackingForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: { tagId: '', weight: 0, age: 0 },
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

  const chartData = useMemo(() => {
    if (!trackedSheep || trackedSheep.length === 0) return [];

    const totalWeight = trackedSheep.reduce((acc, s) => acc + s.currentWeight, 0);
    const avgWeight = totalWeight / trackedSheep.length;
    
    const dailyGain = 0.20; 
    const daysInMonth = 30;
    const monthlyGain = dailyGain * daysInMonth;

    return [
      {
        batch: 'Current',
        averageWeight: parseFloat(avgWeight.toFixed(2)),
        averageFeed: parseFloat((avgWeight * 0.04).toFixed(2)),
        growth: 0,
      },
      {
        batch: '+1 Month',
        averageWeight: parseFloat((avgWeight + monthlyGain).toFixed(2)),
        averageFeed: parseFloat(((avgWeight + monthlyGain) * 0.04).toFixed(2)),
        growth: monthlyGain,
      },
      {
        batch: '+2 Months',
        averageWeight: parseFloat((avgWeight + (monthlyGain * 2)).toFixed(2)),
        averageFeed: parseFloat(((avgWeight + (monthlyGain * 2)) * 0.04).toFixed(2)),
        growth: monthlyGain,
      },
      {
        batch: '+3 Months',
        averageWeight: parseFloat((avgWeight + (monthlyGain * 3)).toFixed(2)),
        averageFeed: parseFloat(((avgWeight + (monthlyGain * 3)) * 0.04).toFixed(2)),
        growth: monthlyGain,
      },
    ];
  }, [trackedSheep]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
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
      previousWeight: weightChanged ? editingSheep.currentWeight : (editingSheep.previousWeight || undefined),
      photoDataUrl: editingSheep.photoDataUrl,
    }, editingSheep._path);
    setIsEditDialogOpen(false);
    setEditingSheep(null);
    toast({ title: 'Updated!', description: 'Audit record synchronized.' });
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const canManageAll = userRole === 'admin' || userRole === 'collaborator';

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Flock Intelligence"
          description="High-precision community log of individually tracked livestock."
          className="mb-0"
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 px-6 py-3 bg-neutral-900 rounded-2xl text-white shadow-xl">
            <Activity className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Global Tracked</p>
              <p className="text-xl font-black tracking-tight">{(trackedSheep || []).length} Head</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-3 bg-emerald-600 rounded-2xl text-white shadow-xl">
            <Wheat className="h-5 w-5 text-emerald-200" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none">Flock Daily Feed</p>
              <p className="text-xl font-black tracking-tight">{nutritionStats.total.toFixed(1)} KG</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-white border border-neutral-100 rounded-2xl text-neutral-900 shadow-xl">
            <Scale className="h-5 w-5 text-primary opacity-40" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Avg Feed/Head</p>
              <p className="text-xl font-black tracking-tight">{nutritionStats.avg.toFixed(2)} KG</p>
            </div>
          </div>
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
                <form onSubmit={trackingForm.handleSubmit(onTrackingSubmit)} className="space-y-8">
                  <div className="space-y-4">
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
                  
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Visual Reference Audit</Label>
                    <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border-4 border-dashed border-neutral-100 bg-neutral-50 flex flex-col items-center justify-center group">
                        {!capturedImage ? (
                            <>
                              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay muted playsInline />
                              <div className="relative z-10 flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" onClick={handleCapture} className="rounded-full h-16 w-16 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-none shadow-2xl scale-110">
                                  <Camera className="h-8 w-8" />
                                </Button>
                                <span className="text-[9px] font-black uppercase text-white tracking-[0.2em] drop-shadow-md">Tap to Snapshot</span>
                              </div>
                              <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center gap-2">
                                 <LucideImage className="h-8 w-8 text-neutral-200" />
                                 <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">Awaiting Visual Input</p>
                              </div>
                            </>
                        ) : (
                            <div className="relative h-full w-full animate-in zoom-in-95 duration-300">
                              <Image src={capturedImage} alt="Captured audit photo" layout="fill" objectFit="cover" unoptimized />
                              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-2xl" onClick={() => setCapturedImage(null)}>
                                    <X className="h-6 w-6 text-rose-600" />
                                 </Button>
                              </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" onClick={handleCapture} disabled={hasCameraPermission === false || !!capturedImage} className="h-12 rounded-xl font-bold bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-none transition-all active:scale-95" variant="outline">
                            <CameraIcon className="mr-2 h-4 w-4" /> Snapshot
                        </Button>
                        <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={!!capturedImage} className="h-12 rounded-xl font-bold bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-none transition-all active:scale-95" variant="outline">
                            <UploadCloud className="mr-2 h-4 w-4 text-emerald-600" /> Upload
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
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
        
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight leading-none mb-2">Community Flock Ledger</CardTitle>
                  <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-widest">Global synchronized database of individually tracked assets</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Search Tag ID..."
                    className="pl-11 h-12 rounded-2xl bg-white/10 border-none text-white placeholder:text-white/30 focus-visible:ring-white/20 font-bold"
                    value={searchTagId}
                    onChange={(e) => setSearchTagId(e.target.value)}
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="w-[100px] pl-8 py-5 text-[9px] font-black uppercase">Ref Photo</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Identity</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Physicals</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Nutrition</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Growth</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Verification</TableHead>
                    <TableHead className="w-[80px] pr-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSheep.length > 0 ? (
                    filteredAndSortedSheep.map((sheep) => {
                      const weightChange = sheep.previousWeight != null ? sheep.currentWeight - sheep.previousWeight : null;
                      const isOwner = user?.uid === sheep.createdBy;
                      const canManage = isOwner || canManageAll;
                      const dailyFeed = sheep.currentWeight * 0.04;

                      return (
                        <TableRow key={sheep.id} className="group hover:bg-neutral-50 transition-all cursor-zoom-in active:scale-[0.995]" onClick={() => sheep.photoDataUrl && setPreviewPhoto(sheep.photoDataUrl)}>
                          <TableCell className="pl-8">
                            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-neutral-100 border-2 border-white shadow-md group/photo">
                              {sheep.photoDataUrl ? (
                                <>
                                  <Image 
                                    src={sheep.photoDataUrl} 
                                    alt={`Sheep ${sheep.tagId}`} 
                                    layout="fill" 
                                    objectFit="cover" 
                                    unoptimized
                                    className="transition-transform duration-500 group-hover/photo:scale-125"
                                  />
                                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="h-4 w-4 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center opacity-20">
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-base font-black tracking-tight">{sheep.tagId}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Logged {formatTimestamp(sheep.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 text-sm font-black">
                                <Scale className="h-3 w-3 text-primary opacity-40" />
                                {sheep.currentWeight.toFixed(1)} <span className="text-[10px] opacity-40">KG</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mt-1">
                                <History className="h-2.5 w-2.5 opacity-40" />
                                {sheep.age} <span className="text-[8px] opacity-40 uppercase">Mo</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                                <Wheat className="h-3 w-3 opacity-60" />
                                {dailyFeed.toFixed(2)} <span className="text-[8px] opacity-60">KG/D</span>
                              </div>
                              <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest mt-1">4% Body Wt</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {weightChange !== null ? (
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                                weightChange >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                              )}>
                                {weightChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(weightChange).toFixed(1)}kg
                              </div>
                            ) : (
                              <Badge variant="secondary" className="bg-neutral-100 text-neutral-400 text-[8px] font-black uppercase tracking-widest border-none">Initial</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                <AvatarFallback className="text-[10px] font-black bg-neutral-100">{(sheep.creatorName?.[0] || 'S').toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 max-w-[120px]">
                                <span className="text-[10px] font-black truncate flex items-center gap-1 leading-none uppercase">
                                  {sheep.creatorName || 'Shepherd'}
                                </span>
                                <span className="text-[8px] font-bold text-muted-foreground truncate mt-1">{sheep.creatorEmail || 'Private User'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canManage ? (
                                <>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200" onClick={() => { setEditingSheep(sheep); setIsEditDialogOpen(true); }}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={() => deleteTrackedSheep(sheep.id, sheep._path)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <MoreVertical className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-24 text-muted-foreground italic opacity-40 uppercase tracking-widest text-[10px] font-black">
                        {searchTagId ? `No assets found matching "${searchTagId}"` : 'NO COMMUNITY RECORDS DISCOVERED'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-neutral-50 p-8 border-b border-neutral-100">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Growth Projections
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Next 90-day predictive analytics based on 200g daily gain velocity</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Feed</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="batch" 
                      tickLine={false} 
                      tickMargin={15} 
                      axisLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke="var(--color-averageWeight)" 
                      tickFormatter={(v) => `${v}kg`} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900 }} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#f59e0b" 
                      tickFormatter={(v) => `${v}kg`} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900 }} 
                    />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend iconType="circle" />
                    <Bar 
                      dataKey="averageWeight" 
                      yAxisId="left" 
                      fill="var(--color-averageWeight)" 
                      radius={[8, 8, 0, 0]} 
                      name="Projected Avg. Weight" 
                      barSize={40} 
                    />
                    <Area
                      type="monotone"
                      dataKey="averageFeed"
                      yAxisId="right"
                      fill="#f59e0b"
                      stroke="#f59e0b"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Daily Feed Intake"
                    />
                    <Line 
                      type="step" 
                      dataKey="growth" 
                      yAxisId="left" 
                      stroke="var(--color-growth)" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "var(--color-growth)", strokeWidth: 2, stroke: "#fff" }} 
                      name="Gain Velocity" 
                    />
                  </ComposedChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center p-10 text-center border-4 border-dashed rounded-[2rem] border-neutral-50 gap-4 opacity-40">
                  <Activity className="h-12 w-12 text-primary" />
                  <p className="text-xs font-black uppercase tracking-widest max-w-[250px]">Insufficient community data to render predictive intelligence reports.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">
                  <Save className="mr-2 h-4 w-4 text-emerald-400" /> Commit Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <DialogHeader className="sr-only">
            <DialogTitle>Audit Photo Reference</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square md:aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
            {previewPhoto && (
              <Image 
                src={previewPhoto} 
                alt="Audit Photo" 
                layout="fill" 
                objectFit="contain" 
                className="bg-black/95"
                unoptimized 
              />
            )}
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-8 right-8 h-14 w-14 rounded-full bg-white/10 hover:bg-white/30 text-white border-none backdrop-blur-xl transition-all active:scale-90"
              onClick={() => setPreviewPhoto(null)}
            >
              <X className="h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
