'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Pencil, Skull, History, AlertTriangle, ArrowDownCircle } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';


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
  const { deadAnimals, addDeadAnimal, deleteDeadAnimal, updateDeadAnimal, totalDead } = useFarm();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDeadAnimal, setEditingDeadAnimal] = useState<DeadAnimal | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  
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
      description: 'Mortality record committed.',
    });
  };
  
  const onEditSubmit: SubmitHandler<MortalityFormData> = (data) => {
    if (!editingDeadAnimal) return;
    const updatedData = { ...data, dateOfDeath: format(data.dateOfDeath, 'yyyy-MM-dd') };
    updateDeadAnimal(editingDeadAnimal.id, updatedData, editingDeadAnimal._path);
    setIsEditDialogOpen(false);
    setEditingDeadAnimal(null);
    toast({
      title: 'Updated!',
      description: 'Audit record adjusted.',
    });
  };

  const handleDeleteRecord = (id: string, path?: string) => {
    deleteDeadAnimal(id, path);
     toast({
      title: 'Deleted',
      description: 'Record purged from ledger.',
      variant: 'destructive'
    });
  }

  const handleEditClick = (animal: DeadAnimal) => {
    setEditingDeadAnimal(animal);
    setIsEditDialogOpen(true);
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-[#962d2b] rounded-full" />
            <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Loss Audit Ledger</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-1 pl-4">
            HIGH-PRECISION TRACKING OF ANIMAL MORTALITIES AND PATHOLOGICAL CAUSES.
          </p>
        </div>
        
        <div className="px-6 py-3 bg-rose-50 rounded-2xl flex flex-col items-center justify-center min-w-[160px] shadow-xl border border-rose-100">
          <p className="text-[8px] font-black uppercase text-rose-900/60 tracking-widest leading-none mb-1">Total Loss Count</p>
          <p className="text-xl font-black tracking-tight text-rose-900">{totalDead.toString()} Head</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* --- ENTRY FORM --- */}
        <div className="lg:col-span-4">
          <Card className="border-none bg-[#FDFBF0] rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-24 border-t-4 border-[#962d2b]">
            <CardHeader className="p-8 pb-4 bg-[#962d2b] text-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-300" />
                    <CardTitle className="text-base font-black tracking-tight uppercase">Loss Entry</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-[8px] font-bold uppercase tracking-widest">RECORD A NEW MORTALITY EVENT</CardDescription>
                </div>
                <ArrowDownCircle className="h-6 w-6 opacity-40" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="dateOfDeath"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Event Date</Label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={'outline'}
                                className={cn(
                                  'h-14 rounded-2xl bg-white border-none shadow-sm font-bold px-6 text-left text-xs',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none rounded-2xl shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }}
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sheepCount"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Count</Label>
                          <FormControl>
                            <Input type="number" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-base px-4" {...field} />
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
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Tag (Opt)</Label>
                          <FormControl>
                            <Input placeholder="e.g. A-001" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm px-4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="causeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Pathological Cause</Label>
                        <FormControl>
                          <Input placeholder="e.g., Illness, predator" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-sm px-4" {...field} />
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
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Clinical Notes</Label>
                        <FormControl>
                          <Textarea placeholder="Any additional details..." className="min-h-[100px] rounded-2xl bg-white border-none shadow-sm font-bold p-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl bg-[#1a1a1a] hover:bg-black text-white border-none flex items-center justify-center gap-3">
                    <Skull className="h-4 w-4 text-rose-500" />
                    COMMIT LOSS RECORD
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* --- LOSS LEDGER --- */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-[#708090]/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#708090]/10 to-[#2c3e50]/20 opacity-50 pointer-events-none" />
            <CardHeader className="p-8 pb-0 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skull className="h-5 w-5 text-rose-900" />
                    <CardTitle className="text-xl font-black tracking-tight text-neutral-900">Temporal Loss Archive</CardTitle>
                  </div>
                  <CardDescription className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">HISTORICAL RECORD OF FLOCK DEPLETION EVENTS</CardDescription>
                </div>
                <History className="h-10 w-10 text-rose-900/10" />
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-8 relative z-10">
              <div className="bg-rose-900/80 h-14 flex items-center px-10">
                <div className="grid grid-cols-5 w-full items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Temporal Node</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Asset ID</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 text-center">Qty</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Cause / Condition</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 text-right pr-4">Action</span>
                </div>
              </div>
              <ScrollArea className="max-h-[600px] w-full">
                {sortedDeadAnimals && sortedDeadAnimals.length > 0 ? (
                  <Table>
                    <TableBody>
                      {sortedDeadAnimals.map((animal) => (
                        <TableRow key={animal.id} className="group hover:bg-white/10 transition-all border-b border-white/5" onClick={() => handleEditClick(animal)}>
                          <TableCell className="pl-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest w-1/5">{animal.dateOfDeath}</TableCell>
                          <TableCell className="w-1/5">
                            <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">{animal.tagId || 'UNTAGGED'}</span>
                          </TableCell>
                          <TableCell className="text-center w-1/5">
                            <span className="inline-flex items-center justify-center bg-rose-50 text-rose-900 rounded-lg px-3 py-1 text-xs font-black">
                              {animal.sheepCount}
                            </span>
                          </TableCell>
                          <TableCell className="w-1/5">
                            <span className="text-sm font-black text-neutral-900 truncate block max-w-[150px]">{animal.causeOfDeath}</span>
                          </TableCell>
                          <TableCell className="text-right pr-10 w-1/5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200" onClick={(e) => { e.stopPropagation(); handleEditClick(animal); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100" onClick={(e) => { e.stopPropagation(); handleDeleteRecord(animal.id, animal._path); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-48 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <Skull className="h-16 w-16 text-rose-900" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-neutral-900">NO MORTALITY EVENTS RECORDED</h3>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" />
              Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Update historical mortality parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 p-8 bg-white">
              <FormField
                control={editForm.control}
                name="dateOfDeath"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button type="button" variant={'outline'} className="h-12 rounded-xl bg-neutral-50 border-none font-bold text-left px-4 text-sm">
                            {field.value ? format(field.value, 'PPP') : <span>Pick date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="sheepCount"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Count</Label>
                      <FormControl><Input type="number" className="h-12 rounded-xl bg-neutral-50 border-none font-black px-4" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="tagId"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tag ID</Label>
                      <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="causeOfDeath"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Cause</Label>
                    <FormControl><Input className="h-12 rounded-xl bg-neutral-50 border-none font-bold px-4" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 gap-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
                <Button type="submit" className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-neutral-900 text-white hover:bg-neutral-800 flex-1">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
