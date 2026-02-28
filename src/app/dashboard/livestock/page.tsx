'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Camera as CameraIcon, Pencil, ArrowUp, ArrowDown, Loader2, User, ImageIcon, ZoomIn, X } from 'lucide-react';
import Image from 'next/image';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    label: 'Avg. Weight',
    color: 'hsl(var(--primary))',
  },
  growth: {
    label: 'Monthly Growth',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function LivestockPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep, isLoading } = useFarm();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const sortedTrackedSheep = useMemo(() => {
    if (!trackedSheep) return [];
    return [...trackedSheep].sort((a, b) => a.tagId.localeCompare(b.tagId));
  }, [trackedSheep]);

  const chartData = useMemo(() => {
    if (!trackedSheep || trackedSheep.length < 2) return [];

    const weightByAge = trackedSheep.reduce((acc, sheep) => {
      const age = sheep.age;
      if (!acc[age]) acc[age] = { totalWeight: 0, count: 0 };
      acc[age].totalWeight += sheep.currentWeight;
      acc[age].count += 1;
      return acc;
    }, {} as Record<number, { totalWeight: number; count: number }>);

    const sortedAverageWeights = Object.entries(weightByAge)
      .map(([age, { totalWeight, count }]) => ({
        age: parseInt(age),
        averageWeight: parseFloat((totalWeight / count).toFixed(2)),
      }))
      .sort((a, b) => a.age - b.age);

    return sortedAverageWeights.map((current, index) => {
      let growth = 0;
      if (index > 0) {
        const previous = sortedAverageWeights[index - 1];
        const weightDiff = current.averageWeight - previous.averageWeight;
        const ageDiff = current.age - previous.age;
        if (ageDiff > 0) growth = parseFloat((weightDiff / ageDiff).toFixed(2));
      }
      return {
        age: `${current.age} mo`,
        averageWeight: current.averageWeight,
        growth: growth,
      };
    });
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

  const onTrackingSubmit: SubmitHandler<TrackingFormData> = (data) => {
    addTrackedSheep({ 
      tagId: data.tagId,
      age: data.age,
      currentWeight: data.weight,
      photoDataUrl: capturedImage || undefined 
    });
    trackingForm.reset();
    setCapturedImage(null);
    toast({ title: 'Success!', description: 'Sheep record added.' });
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
    });
    setIsEditDialogOpen(false);
    setEditingSheep(null);
    toast({ title: 'Updated!', description: 'Record updated.' });
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
      return format(date, 'MMM dd, yyyy, hh:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Flock Records"
        description="Collaborative community log of individually tracked sheep."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-primary/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg">Register Sheep</CardTitle>
              <CardDescription>Record weight and age for tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...trackingForm}>
                <form onSubmit={trackingForm.handleSubmit(onTrackingSubmit)} className="space-y-4">
                  <FormField control={trackingForm.control} name="tagId" render={({ field }) => (
                    <FormItem><FormLabel>Tag ID</FormLabel><FormControl><Input placeholder="e.g., A-101" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={trackingForm.control} name="weight" render={({ field }) => (
                      <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={trackingForm.control} name="age" render={({ field }) => (
                      <FormItem><FormLabel>Age (mo)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Reference Photo</FormLabel>
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                          {!capturedImage ? (
                              <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                          ) : (
                              <div className="relative h-full w-full">
                                <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="cover" unoptimized />
                                <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white" onClick={() => setCapturedImage(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                          )}
                      </div>
                      <canvas ref={canvasRef} className="hidden"></canvas>
                      {!capturedImage && (
                          <Button type="button" onClick={handleCapture} disabled={hasCameraPermission === false} className="w-full" variant="outline">
                              <CameraIcon className="mr-2 h-4 w-4" /> Capture
                          </Button>
                      )}
                  </div>

                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Save Record
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-8 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Community Flock</CardTitle>
                <CardDescription>Records from all shepherds in the community.</CardDescription>
              </div>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[80px]">Photo</TableHead>
                      <TableHead>Tag ID</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTrackedSheep.length > 0 ? (
                      sortedTrackedSheep.map((sheep) => {
                        const weightChange = sheep.previousWeight != null ? sheep.currentWeight - sheep.previousWeight : null;
                        const isOwner = user?.uid === sheep.createdBy;
                        return (
                          <TableRow key={sheep.id} className="group transition-colors">
                            <TableCell>
                              <div 
                                className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted border flex items-center justify-center cursor-zoom-in group/photo"
                                onClick={() => sheep.photoDataUrl && setPreviewPhoto(sheep.photoDataUrl)}
                              >
                                {sheep.photoDataUrl ? (
                                  <>
                                    <Image 
                                      src={sheep.photoDataUrl} 
                                      alt={`Sheep ${sheep.tagId}`} 
                                      layout="fill" 
                                      objectFit="cover" 
                                      unoptimized
                                      className="transition-transform duration-300 group-hover/photo:scale-125"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                      <ZoomIn className="h-4 w-4 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-muted-foreground opacity-20" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">{sheep.tagId}</TableCell>
                            <TableCell>{sheep.age} mo</TableCell>
                            <TableCell className="font-medium">{sheep.currentWeight.toFixed(1)}kg</TableCell>
                            <TableCell>
                              {weightChange !== null ? (
                                <span className={cn("flex items-center gap-0.5 text-xs font-bold", weightChange >= 0 ? "text-green-600" : "text-destructive")}>
                                  {weightChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                  {Math.abs(weightChange).toFixed(1)}
                                </span>
                              ) : <span className="text-xs text-muted-foreground italic">New</span>}
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">
                              {formatTimestamp(sheep.createdAt)}
                            </TableCell>
                            <TableCell className="text-[10px] truncate max-w-[100px] font-medium" title={sheep.creatorEmail}>
                              {sheep.creatorName || sheep.creatorEmail || 'Shepherd'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isOwner ? (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingSheep(sheep); setIsEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTrackedSheep(sheep.id)}><Trash2 className="h-4 w-4" /></Button>
                                  </>
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground/30 mr-2" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground italic">No community records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growth Analytics</CardTitle>
              <CardDescription>Visualizing community-wide flock performance.</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="age" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis yAxisId="left" stroke="var(--color-averageWeight)" tickFormatter={(v) => `${v}kg`} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-growth)" tickFormatter={(v) => `+${v}kg`} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    <Bar dataKey="averageWeight" yAxisId="left" fill="var(--color-averageWeight)" radius={[4, 4, 0, 0]} name="Avg. Weight" barSize={40} />
                    <Line type="monotone" dataKey="growth" yAxisId="right" stroke="var(--color-growth)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-growth)" }} name="Growth Trend" />
                  </ComposedChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center p-6 text-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm max-w-[250px]">Record more sheep to see community growth trends.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Update Sheep Record</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField control={editForm.control} name="tagId" render={({ field }) => (
                <FormItem><FormLabel>Tag ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editForm.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age (mo)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <DialogFooter><Button type="submit" className="w-full">Save Changes</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-2xl">
            {previewPhoto && (
              <Image 
                src={previewPhoto} 
                alt="Photo Preview" 
                layout="fill" 
                objectFit="contain" 
                className="bg-black/90"
                unoptimized 
              />
            )}
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-md"
              onClick={() => setPreviewPhoto(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
