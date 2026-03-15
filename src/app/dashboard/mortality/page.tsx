'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Pencil, 
  Skull, 
  History, 
  AlertTriangle, 
  ArrowDownCircle,
  Plus
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';


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
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-xl font-medium text-white/80">Loss Audit Ledger</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">ANIMAL MORTALITIES & PATHOLOGICAL CAUSES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl">
        <div className="glass-card glass-sheen glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Loss Count</p>
              <p className="text-5xl font-black tracking-tighter text-white">{totalDead.toString()} <span className="text-2xl opacity-40">Head</span></p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Skull className="h-5 w-5 text-[#ef4444]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">FLOCK DEPLETION</p>
        </div>

        <div className="glass-card glass-sheen glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Loss Events</p>
              <p className="text-5xl font-black tracking-tighter text-white">{(deadAnimals || []).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <History className="h-5 w-5 text-[#A78BFA]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">AUDIT ENTRIES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card glass-sheen rounded-[40px] overflow-hidden">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-white/5 border-none">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white/40">Temporal Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Asset / Cause</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-white/40">Qty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white/40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDeadAnimals.length > 0 ? sortedDeadAnimals.map((animal) => (
                    <TableRow key={animal.id} className="hover:bg-white/5 transition-colors border-b border-white/5 group" onClick={() => handleEditClick(animal)}>
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-white/40 uppercase tracking-widest">{animal.dateOfDeath}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-white">{animal.tagId || 'UNTAGGED'}</span>
                          <span className="text-[10px] font-bold text-white/20 uppercase mt-1 tracking-widest">{animal.causeOfDeath}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-rose-500/10 text-rose-400 border-none font-black text-[10px] px-3">{animal.sheepCount} Head</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-all" onClick={(evt) => { evt.stopPropagation(); handleDeleteRecord(animal.id, animal._path); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No mortality events discovered</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card glass-sheen rounded-[40px] p-10 h-full border-t-2 border-white/10">
            <div className="flex items-center gap-3 mb-10 text-rose-400">
              <Skull className="h-6 w-6" />
              <h3 className="text-lg font-black uppercase tracking-widest">Loss Entry</h3>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={form.control} name="dateOfDeath" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical">Event Date</Label>
                      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-white/10 bg-[#0a2e1a] shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDatePickerOpen(false); }} initialFocus className="text-white" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="sheepCount" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="tagId" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Tag (Opt)</Label><FormControl><Input placeholder="e.g. A-001" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="causeOfDeath" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Pathological Cause</Label><FormControl><Input placeholder="e.g. Illness" className="form-input-tactical" {...field} /></FormControl></FormItem>
                  )} />

                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Clinical Notes</Label><FormControl><Textarea className="min-h-[100px] form-input-tactical pt-4" {...field} /></FormControl></FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-rose-900 hover:bg-rose-800 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl">
                  Commit Loss Record
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-white/10 bg-[#0F1115] shadow-2xl">
          <DialogHeader className="bg-white/5 p-8 border-b border-white/5 text-left text-white">
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-3">
              <Pencil className="h-5 w-5 text-emerald-400" /> Adjust Record
            </DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update mortality parameters</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="p-8 space-y-6">
              <FormField control={editForm.control} name="causeOfDeath" render={({ field }) => (
                <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Cause</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="sheepCount" render={({ field }) => (
                  <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Count</Label><FormControl><Input type="number" className="h-14 rounded-2xl bg-white/5 border-white/10 font-black text-lg px-6" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editForm.control} name="tagId" render={({ field }) => (
                  <FormItem><Label className="text-xs font-black uppercase opacity-40 ml-2">Tag ID</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-14 flex-1 rounded-2xl border-white/10 font-black uppercase text-xs">Cancel</Button>
                <Button type="submit" className="h-14 flex-1 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs shadow-xl">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-12 right-12 opacity-40 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
