'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Camera as CameraIcon } from 'lucide-react';
import Image from 'next/image';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useFarm } from '@/context/FarmContext';

// Schema for the flock tracking form
const trackingFormSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  weight: z.coerce.number().positive('Weight must be a positive number'),
  age: z.coerce.number().int().positive('Age in months must be a positive integer'),
});

type TrackingFormData = z.infer<typeof trackingFormSchema>;

const chartConfig = {
  averageWeight: {
    label: 'Average Weight (kg)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


export default function LivestockPage() {
  const { toast } = useToast();
  const { trackedAnimals, addTrackedAnimal, deleteTrackedAnimal } = useFarm();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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

  const chartData = useMemo(() => {
    if (trackedAnimals.length === 0) {
      return [];
    }

    const weightByAge = trackedAnimals.reduce((acc, animal) => {
      const age = animal.age;
      if (!acc[age]) {
        acc[age] = { totalWeight: 0, count: 0 };
      }
      acc[age].totalWeight += animal.weight;
      acc[age].count += 1;
      return acc;
    }, {} as Record<number, { totalWeight: number; count: number }>);

    return Object.entries(weightByAge)
      .map(([age, { totalWeight, count }]) => ({
        age: `${age} mo`,
        averageWeight: parseFloat((totalWeight / count).toFixed(2)),
      }))
      .sort((a, b) => parseInt(a.age) - parseInt(b.age));
  }, [trackedAnimals]);
  
  // Effect to get camera permission
  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    addTrackedAnimal({ ...data, photoDataUrl: capturedImage || undefined });
    trackingForm.reset();
    setCapturedImage(null);
    toast({
      title: 'Success!',
      description: 'Animal has been added to your flock.',
    });
  };

  const handleDeleteTrackedAnimal = (id: string) => {
    deleteTrackedAnimal(id);
    toast({
      title: 'Deleted',
      description: 'Animal record has been deleted.',
      variant: 'destructive'
    });
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Flock Management"
        description="Track individual animals in your flock."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Animal to Flock</CardTitle>
              <CardDescription>Fill out the form to add a new animal.</CardDescription>
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
                              <Image src={capturedImage} alt="Captured photo of an animal" layout="fill" objectFit="cover" />
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
                    Add Animal
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Tracked Animals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Tag ID</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Age (months)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackedAnimals.length > 0 ? (
                    trackedAnimals.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell>
                          <div className="relative h-12 w-16 overflow-hidden rounded-md">
                            {animal.photoDataUrl ? (
                              <Image src={animal.photoDataUrl} alt={`Photo of ${animal.tagId}`} layout="fill" objectFit="cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">No Photo</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{animal.tagId}</TableCell>
                        <TableCell>{animal.weight} kg</TableCell>
                        <TableCell>{animal.age}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTrackedAnimal(animal.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No animals tracked yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Monthly Weight Analysis</CardTitle>
              <CardDescription>
                Average weight of your flock by age (in months).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="age"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${value} kg`}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="averageWeight"
                        fill="var(--color-averageWeight)"
                        radius={4}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-muted-foreground">
                    Not enough data to display the chart. Add animals to your flock to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
