'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Skull, 
  History, 
  Plus,
  PlusCircle,
  ShieldCheck,
  Save,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Textarea } from '@/components/ui/textarea';
import type { DeadAnimal } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';

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
  const { 
    deadAnimals, 
    addDeadAnimal, 
    deleteDeadAnimal, 
    updateDeadAnimal, 
    totalDead, 
    isLoading 
  } = useFarm();
  
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
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
    setIsEntryDialogOpen(false);
    toast({
      title: 'Success!',
      description: 'Mortality record committed to ledger.',
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

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-rose-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING MORTALITY DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Loss Log"
          description="ANIMAL MORTALITIES & PATHOLOGICAL CAUSES"
          className="mb-0"
        />
        
        <div className="flex items-center gap-4">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { form.reset(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl">
                <PlusCircle className="h-5 w-5 text-rose-500" />
                Log Loss Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Loss Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit livestock mortality to master audit ledger</DialogDescription>
              </DialogHeader>
              
              <div className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <FormField control={form.control} name="dateOfDeath" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical text-slate-400">Event Date</Label>
                          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                                {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-slate-200 bg-white shadow-2xl">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus className="text-slate-900" />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="sheepCount" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Qty (Head)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="tagId" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical text-slate-400">Tag ID (Optional)</Label><FormControl><Input placeholder="e.g. A-102" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="causeOfDeath" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-slate-400">Pathological Cause</Label><FormControl><Input placeholder="e.g. Fever, Injury, Illness" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                      )} />

                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical text-slate-400">Clinical Notes</Label><FormControl><Textarea placeholder="Additional context..." className="min-h-[100px] form-input-tactical bg-slate-50 border-slate-200 pt-4" {...field} /></FormControl></FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                      Synchronize Loss Record
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Total Loss</p>
              <p className="text-xl font-black tracking-tight">{totalDead} Head</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-card glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Loss Count</p>
              <p className="text-5xl font-black tracking-tighter text-rose-600">{totalDead.toString()} <span className="text-2xl opacity-20">Head</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
              <Skull className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">FLOCK DEPLETION</p>
        </div>

        <div className="glass-card glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between bg-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Audit Entries</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900">{(deadAnimals || []).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <History className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">HISTORICAL RECORDS</p>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-neutral-900 text-white p-10 py-12">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Skull className="h-6 w-6 text-rose-500" />
                  <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Mortality Ledger</CardTitle>
                </div>
                <CardDescription className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Verified pathological loss audit</CardDescription>
              </div>
              <p className="text-4xl font-black tracking-tighter">{totalDead} Head</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-none">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Temporal Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Asset / Cause</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Quantity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDeadAnimals.length > 0 ? sortedDeadAnimals.map((animal) => (
                  <TableRow key={animal.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group" onClick={() => handleEditClick(animal)}>
                    <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{animal.dateOfDeath}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-slate-900">{animal.tagId || 'UNTAGGED'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{animal.causeOfDeath}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] px-3">{animal.sheepCount} Head</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={(evt) => { evt.stopPropagation(); handleDeleteRecord(animal.id, animal._path); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No mortality events discovered</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* --- EDIT MODAL --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-slate-200 bg-white shadow-2xl">
          <DialogHeader className="bg-slate-50 p-8 border-b border-slate-100 text-left">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3 text-slate-900">
              <Pencil className="h-5 w-5 text-emerald-600" /> Adjust Record
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Update historical mortality parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="p-8 space-y-6">
              <FormField control={editForm.control} name="causeOfDeath" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Pathological Cause</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="sheepCount" render={({ field }) => (
                  <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Count (Head)</Label><FormControl><Input type="number" className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-lg px-6" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editForm.control} name="tagId" render={({ field }) => (
                  <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Tag ID</Label><FormControl><Input className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-14 flex-1 rounded-2xl border-slate-200 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">
                  <Save className="mr-2 h-4 w-4" /> Save Adjustments
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
