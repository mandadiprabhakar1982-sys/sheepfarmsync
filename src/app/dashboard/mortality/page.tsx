'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFarm } from '@/context/FarmContext';
import { Textarea } from '@/components/ui/textarea';
import type { DeadAnimal } from '@/lib/types';


const formSchema = z.object({
  dateOfDeath: z.date({ required_error: 'A date is required.' }),
  sheepCount: z.coerce.number().int().positive('Must be a positive number.'),
  tagId: z.string().optional(),
  causeOfDeath: z.string().min(1, 'Cause of death is required.'),
  notes: z.string().optional(),
});

type MortalityFormData = z.infer<typeof formSchema>;

export default function MortalityPage() {
  const { toast } = useToast();
  const { deadAnimals, addDeadAnimal, deleteDeadAnimal, updateDeadAnimal } = useFarm();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDeadAnimal, setEditingDeadAnimal] = useState<DeadAnimal | null>(null);

  
  const form = useForm<MortalityFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sheepCount: 1,
      tagId: '',
      causeOfDeath: '',
      notes: '',
    },
  });

  const editForm = useForm<MortalityFormData>({
    resolver: zodResolver(formSchema),
  });

  const sortedDeadAnimals = useMemo(() => {
    if (!deadAnimals) return [];
    return [...deadAnimals].sort((a, b) => new Date(b.dateOfDeath).getTime() - new Date(a.dateOfDeath).getTime());
  }, [deadAnimals]);

  useEffect(() => {
    if (editingDeadAnimal) {
      editForm.reset({
        ...editingDeadAnimal,
        dateOfDeath: new Date(editingDeadAnimal.dateOfDeath),
      });
    }
  }, [editingDeadAnimal, editForm]);


  const onSubmit: SubmitHandler<MortalityFormData> = (data) => {
    const newRecord = { ...data, dateOfDeath: format(data.dateOfDeath, 'yyyy-MM-dd') };
    addDeadAnimal(newRecord);
    form.reset();
    toast({
      title: 'Success!',
      description: 'Mortality record has been added.',
    });
  };
  
  const onEditSubmit: SubmitHandler<MortalityFormData> = (data) => {
    if (!editingDeadAnimal) return;
    const updatedData = { ...data, dateOfDeath: format(data.dateOfDeath, 'yyyy-MM-dd') };
    updateDeadAnimal(editingDeadAnimal.id, updatedData);
    setIsEditDialogOpen(false);
    setEditingDeadAnimal(null);
    toast({
      title: 'Updated!',
      description: 'Mortality record has been updated successfully.',
    });
  };

  const handleDeleteRecord = (id: string) => {
    deleteDeadAnimal(id);
     toast({
      title: 'Deleted',
      description: 'Record has been deleted.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (animal: DeadAnimal) => {
    setEditingDeadAnimal(animal);
    setIsEditDialogOpen(true);
  };


  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Mortality Tracking"
        description="Record and view animal deaths."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Mortality Record</CardTitle>
               <CardDescription>Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dateOfDeath"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Death</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sheepCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sheep Count</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tagId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="causeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cause of Death</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Illness, predator" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mortality History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Tag ID</TableHead>
                    <TableHead>Cause of Death</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDeadAnimals && sortedDeadAnimals.length > 0 ? (
                    sortedDeadAnimals.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell>{animal.dateOfDeath}</TableCell>
                        <TableCell>{animal.sheepCount}</TableCell>
                        <TableCell>{animal.tagId || 'N/A'}</TableCell>
                        <TableCell>{animal.causeOfDeath}</TableCell>
                        <TableCell>{animal.notes || 'N/A'}</TableCell>
                         <TableCell className='text-right'>
                            <div className="flex items-center justify-end">
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(animal)}>
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(animal.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No mortality records yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mortality Record</DialogTitle>
            <DialogDescription>
              Update the details of the mortality record. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="dateOfDeath"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Death</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="sheepCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sheep Count</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="tagId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="causeOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cause of Death</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Illness, predator" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional details..." {...field} />
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
