'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Camera as CameraIcon, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Line } from 'recharts';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartContainer, ChartTooltipContent, type ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useFarm } from '@/context/FarmContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TrackedSheep } from '@/lib/types';

// Schema for the flock tracking form
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
  const { trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep } = useFarm();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheep, setEditingSheep] = useState<TrackedSheep | null>(null);


  // Camera state
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const trackingForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      tagId: '',
      weight: 0,
      age: 0,
    },
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


  const chartData = useMemo(() => {
    if (!trackedSheep || trackedSheep.length < 2) {
      return [];
    }

    const weightByAge = trackedSheep.reduce((acc, sheep) => {
      const age = sheep.age;
      if (!acc[age]) {
        acc[age] = { totalWeight: 0, count: 0 };
      }
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

    if (sortedAverageWeights.length < 2) {
      return [];
    }
    
    return sortedAverageWeights.map((current, index) => {
      let growth = 0;
      if (index > 0) {
        const previous = sortedAverageWeights[index - 1];
        const weightDiff = current.averageWeight - previous.averageWeight;
        const ageDiff = current.age - previous.age;
        if (ageDiff > 0) {
          growth = parseFloat((weightDiff / ageDiff).toFixed(2));
        }
      }
      return {
        age: `${current.age} mo`,
        averageWeight: current.averageWeight,
        growth: growth,
      };
    });
  }, [trackedSheep]);

  
  // Effect to get camera permission
  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      } else {
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  }, [toast]);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
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
    toast({
      title: 'Success!',
      description: 'Sheep has been added to your farm.',
    });
  };

  const onEditSubmit: SubmitHandler<TrackingFormData> = (data) => {
    if (!editingSheep) return;

    const updatedData = {
      tagId: data.tagId,
      age: data.age,
      currentWeight: data.weight,
      previousWeight: editingSheep.currentWeight, // Set previous weight
      photoDataUrl: editingSheep.photoDataUrl,
    };

    updateTrackedSheep(editingSheep.id, updatedData);
    setIsEditDialogOpen(false);
    setEditingSheep(null);
    toast({
      title: 'Updated!',
      description: 'Sheep record has been updated.',
    });
  };

  const handleDeleteTrackedSheep = (id: string) => {
    deleteTrackedSheep(id);
    toast({
      title: 'Deleted',
      description: 'Sheep record has been deleted.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (sheep: TrackedSheep) => {
    setEditingSheep(sheep);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Sheep Management"
        description="Track individual sheep in your farm."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Sheep to Farm</CardTitle>
              <CardDescription>Fill out the form to add a new sheep.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...trackingForm}>
                <form onSubmit={trackingForm.handleSubmit(onTrackingSubmit)} className="space-y-4">
                  <FormField control={trackingForm.control} name="tagId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag ID</FormLabel>
                      <FormControl><Input placeholder="e.g., A-001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                    <FormField control={trackingForm.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={trackingForm.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (months)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="space-y-2">
                    <FormLabel>Photo</FormLabel>
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                          {!capturedImage ? (
                              <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                          ) : (
                              <Image src={capturedImage} alt="Captured photo of a sheep" layout="fill" objectFit="cover" />
                          )}
                      </div>
                      {hasCameraPermission === false && (
                        <Alert variant="destructive">
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                        </Alert>
                    )}
                      <canvas ref={canvasRef} className="hidden"></canvas>
                      <div className="flex gap-2">
                      {!capturedImage ? (
                          <Button type="button" onClick={handleCapture} disabled={hasCameraPermission === false} className="w-full">
                              <CameraIcon className="mr-2 h-4 w-4" />
                              Capture Photo
                          </Button>
                      ) : (
                          <Button type="button" variant="outline" onClick={() => setCapturedImage(null)} className="w-full">
                              Retake
                          </Button>
                      )}
                      </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sheep
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Tracked Sheep</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Tag ID</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Prev. Wt.</TableHead>
                    <TableHead>Curr. Wt.</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackedSheep && trackedSheep.length > 0 ? (
                    trackedSheep.map((sheep) => {
                       const weightChange = sheep.previousWeight != null ? sheep.currentWeight - sheep.previousWeight : null;
                       return (
                      <TableRow key={sheep.id}>
                        <TableCell>
                          <div className="relative h-12 w-16 overflow-hidden rounded-md">
                            {sheep.photoDataUrl ? (
                              <Image src={sheep.photoDataUrl} alt={`Photo of ${sheep.tagId}`} layout="fill" objectFit="cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">No Photo</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{sheep.tagId}</TableCell>
                        <TableCell>{sheep.age} mo</TableCell>
                        <TableCell>{sheep.previousWeight ? `${sheep.previousWeight.toFixed(1)} kg` : 'N/A'}</TableCell>
                        <TableCell>{sheep.currentWeight.toFixed(1)} kg</TableCell>
                        <TableCell>
                          {weightChange !== null ? (
                            <span className={`flex items-center gap-1 font-medium ${weightChange >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {weightChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                              {Math.abs(weightChange).toFixed(1)} kg
                            </span>
                           ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end">
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(sheep)}>
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteTrackedSheep(sheep.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                        </TableCell>
                      </TableRow>
                       )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No sheep tracked yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Weight Progress Summary</CardTitle>
              <CardDescription>
                Average weight and estimated monthly growth of your tracked sheep.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="age"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="var(--color-averageWeight)"
                        tickFormatter={(value) => `${value}kg`}
                        domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--color-growth)"
                        tickFormatter={(value) => `${value}kg`}
                        domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Legend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="averageWeight"
                        yAxisId="left"
                        fill="var(--color-averageWeight)"
                        radius={4}
                        name="Avg. Weight"
                    />
                    <Line
                        type="monotone"
                        dataKey="growth"
                        yAxisId="right"
                        stroke="var(--color-growth)"
                        strokeWidth={2}
                        dot={{
                            r: 4,
                            fill: "var(--color-growth)",
                            stroke: "hsl(var(--background))",
                            strokeWidth: 2,
                        }}
                        activeDot={{
                            r: 6,
                        }}
                        name="Monthly Growth"
                    />
                  </ComposedChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center p-4 text-center">
                  <p className="text-muted-foreground">
                    Not enough data to display growth chart. Add at least two sheep records with different ages to see progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sheep Record</DialogTitle>
            <DialogDescription>
              Update the details of your sheep. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="tagId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (months)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
