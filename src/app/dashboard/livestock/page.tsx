'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Camera as CameraIcon } from 'lucide-react';
import Image from 'next/image';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { LivestockPurchase, TrackedAnimal } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for the purchase form
const purchaseFormSchema = z.object({
  villageName: z.string().min(1, 'Village name is required'),
  farmerName: z.string().min(1, 'Farmer name is required'),
  animalCount: z.coerce.number().int().positive('Must be a positive number'),
  purchasePrice: z.coerce.number().positive('Must be a positive number'),
  amountPaid: z.coerce.number().nonnegative('Cannot be negative'),
  dueAmount: z.coerce.number().nonnegative('Due amount is calculated and cannot be negative'),
  payingTimePeriod: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

// Schema for the flock tracking form
const trackingFormSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  weight: z.coerce.number().positive('Weight must be a positive number'),
  age: z.coerce.number().int().positive('Age in months must be a positive integer'),
});

type TrackingFormData = z.infer<typeof trackingFormSchema>;


export default function LivestockPage() {
  const { toast } = useToast();
  
  // State for purchases
  const [purchases, setPurchases] = useState<LivestockPurchase[]>([]);
  
  // State for flock tracking
  const [trackedAnimals, setTrackedAnimals] = useState<TrackedAnimal[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Camera state
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      villageName: '',
      farmerName: '',
      animalCount: 0,
      purchasePrice: 0,
      amountPaid: 0,
      dueAmount: 0,
      payingTimePeriod: '',
    },
  });

  const trackingForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      tagId: '',
      weight: 0,
      age: 0,
    },
  });
  
  const purchasePrice = purchaseForm.watch('purchasePrice');
  const amountPaid = purchaseForm.watch('amountPaid');

  useEffect(() => {
    const due = (purchasePrice || 0) - (amountPaid || 0);
    purchaseForm.setValue('dueAmount', due > 0 ? due : 0);
  }, [purchasePrice, amountPaid, purchaseForm]);

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


  const onPurchaseSubmit: SubmitHandler<PurchaseFormData> = (data) => {
    setPurchases((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
    purchaseForm.reset();
    toast({
      title: 'Success!',
      description: 'Livestock purchase has been recorded.',
    });
  };
  
  const deletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
     toast({
      title: 'Deleted',
      description: 'Purchase record has been deleted.',
      variant: 'destructive'
    });
  }
  
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
    setTrackedAnimals((prev) => [...prev, { ...data, id: crypto.randomUUID(), photoDataUrl: capturedImage || undefined }]);
    trackingForm.reset();
    setCapturedImage(null);
    toast({
      title: 'Success!',
      description: 'Animal has been added to your flock.',
    });
  };

  const deleteTrackedAnimal = (id: string) => {
    setTrackedAnimals(trackedAnimals.filter(a => a.id !== id));
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
        description="Log new purchases and track individual animals in your flock."
      />
      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking">Flock Tracking</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="tracking" className="mt-8">
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
              <div className="lg:col-span-2">
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
                                <Button variant="ghost" size="icon" onClick={() => deleteTrackedAnimal(animal.id)}>
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
              </div>
            </div>
        </TabsContent>
        <TabsContent value="purchases" className="mt-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Purchase</CardTitle>
                  <CardDescription>Fill out the form below.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...purchaseForm}>
                    <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-4">
                      <FormField control={purchaseForm.control} name="villageName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Village Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Green Valley" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={purchaseForm.control} name="farmerName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farmer Name</FormLabel>
                            <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={purchaseForm.control} name="animalCount" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Animal Count</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={purchaseForm.control} name="purchasePrice" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purchase Cost (₹)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={purchaseForm.control} name="amountPaid" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount Paid (₹)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                       <FormField control={purchaseForm.control} name="dueAmount" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Amount (₹)</FormLabel>
                            <FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <FormField control={purchaseForm.control} name="payingTimePeriod" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paying Time Period</FormLabel>
                            <FormControl><Input placeholder="e.g., 30 days" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <Button type="submit" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Purchase
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Village</TableHead>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Payment Period</TableHead>
                        <TableHead className='text-right'>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.length > 0 ? (
                        purchases.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.villageName}</TableCell>
                            <TableCell>{p.farmerName}</TableCell>
                            <TableCell>{p.animalCount}</TableCell>
                            <TableCell>₹{p.purchasePrice.toFixed(2)}</TableCell>
                            <TableCell>₹{p.amountPaid.toFixed(2)}</TableCell>
                            <TableCell className={p.dueAmount > 0 ? 'text-destructive' : ''}>
                              ₹{(p.dueAmount).toFixed(2)}
                            </TableCell>
                            <TableCell>{p.payingTimePeriod}</TableCell>
                            <TableCell className='text-right'>
                                <Button variant="ghost" size="icon" onClick={() => deletePurchase(p.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            No purchases recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
