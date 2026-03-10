
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
  Mars
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const trackingFormSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  weight: z.coerce.number().positive('Weight must be a positive number'),
  age: z.coerce.number().int().positive('Age in months must be a positive integer'),
  gender: z.enum(['male', 'female']).default('female'),
  breed: z.string().optional(),
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <PageHeader
            title="My Flock"
            className="mb-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500"><Filter className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500"><Search className="h-5 w-5" /></Button>
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

          <div className="space-y-4">
            {activeTab === 'all' && filteredAndSortedSheep.length > 0 ? (
              filteredAndSortedSheep.map((sheep) => (
                <Card 
                  key={sheep.id} 
                  className="border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-[1.5rem] bg-white cursor-pointer group overflow-hidden"
                  onClick={() => {
                    if (canManageAll || user?.uid === sheep.createdBy) {
                      setEditingSheep(sheep);
                      setIsEditDialogOpen(true);
                    }
                  }}
                >
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className={cn(
                      "h-14 w-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                      sheep.gender === 'female' ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                    )}>
                      {sheep.gender === 'female' ? <Venus className="h-7 w-7" /> : <Mars className="h-7 w-7" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black tracking-tight text-neutral-900 leading-none">
                        Sheep {sheep.tagId}
                      </h3>
                      {sheep.breed && (
                        <p className="text-[13px] font-medium text-neutral-400 mt-1.5 uppercase tracking-wide">
                          {sheep.breed}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No records found</p>
              </div>
            )}
          </div>

          {/* Statistics Integration */}
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
                <div className="flex gap-2 flex-1">
                  <Button type="button" variant="destructive" className="h-12 px-4 rounded-xl font-black" onClick={() => { if(editingSheep) deleteTrackedSheep(editingSheep.id, editingSheep._path); setIsEditDialogOpen(false); }}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button type="submit" className="h-12 flex-1 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800">
                    <Save className="mr-2 h-4 w-4 text-emerald-400" /> Save
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
