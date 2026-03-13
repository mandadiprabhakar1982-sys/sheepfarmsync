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
  Weight
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

const quickEntrySchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  age: z.coerce.number().min(0, 'Age is required'),
  initialWeight: z.coerce.number().min(1, 'Initial weight is required'),
  breed: z.string().min(1, 'Breed is required').default('Standard'),
});

type QuickEntryData = z.infer<typeof quickEntrySchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { 
    trackedSheep, 
    addTrackedSheep, 
    totalSheep,
    lambsCount,
    totalDailyFeed,
    totalFeedCost
  } = useFarm();
  
  const [viewingSheep, setViewingSheep] = useState<any>(null);
  
  // Camera States
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalTrackedWeight = useMemo(() => {
    return (trackedSheep || []).reduce((acc, s) => acc + Number(s.currentWeight || 0), 0);
  }, [trackedSheep]);

  const form = useForm<QuickEntryData>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: { 
      tagId: '',
      gender: 'female',
      age: 6,
      initialWeight: 25,
      breed: 'Standard'
    },
  });

  const onQuickSubmit: SubmitHandler<QuickEntryData> = (data) => {
    addTrackedSheep({ 
      tagId: data.tagId,
      age: data.age,
      currentWeight: data.initialWeight,
      gender: data.gender,
      breed: data.breed,
      photoDataUrl: capturedPhoto || undefined
    });
    form.reset({
      tagId: '',
      gender: 'female',
      age: 6,
      initialWeight: 25,
      breed: 'Standard'
    });
    setCapturedPhoto(null);
    setIsCameraOpen(false);
    toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized.` });
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  title="Track Animal" 
                  value={`${totalTrackedWeight.toLocaleString()} KG`} 
                  sub="Flock Weight" 
                  color="bg-emerald-600" 
                />
                <MetricCard 
                  title="Lambs" 
                  value={(lambsCount || 0).toString()} 
                  sub="Under 6 Months" 
                  color="bg-amber-500" 
                  icon={Syringe}
                />
                <MetricCard 
                  title="Feed Cost Today" 
                  value={`₹${(totalFeedCost / 30).toLocaleString()}`} 
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
                  <div className="rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-neutral-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4 pl-6">ID</TableHead>
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Breed</TableHead>
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trackedSheep && trackedSheep.length > 0 ? (
                          trackedSheep.slice(0, 10).map((sheep) => (
                            <TableRow key={sheep.id} className="hover:bg-neutral-50 transition-colors cursor-pointer group" onClick={() => setViewingSheep(sheep)}>
                              <TableCell className="font-black text-[14px] py-4 pl-6 uppercase text-primary/80">{sheep.tagId}</TableCell>
                              <TableCell className="text-[14px] font-bold text-neutral-500">{sheep.breed || 'Standard'}</TableCell>
                              <TableCell className="text-[14px] font-black text-neutral-900">{sheep.currentWeight} kg</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-10 text-[14px] text-muted-foreground italic uppercase tracking-widest">Awaiting assets...</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-neutral-50/50 rounded-3xl p-8 border border-neutral-100">
                    <h3 className="text-[18px] font-black text-neutral-900 uppercase tracking-tight mb-6">Asset Input Form</h3>
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
                            name="initialWeight"
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

                        <Button type="submit" className="w-full h-16 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase text-[16px] tracking-[0.2em] shadow-xl transition-all active:scale-[0.98]">
                          Save Record
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
    </div>
  );
}
