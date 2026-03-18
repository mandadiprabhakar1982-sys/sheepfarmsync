'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Trash2, 
  Skull, 
  Plus,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';

const formSchema = z.object({
  dateOfDeath: z.date({ required_error: 'A date is required.' }),
  sheepCount: z.coerce.number().int().positive('Must be a positive number.'),
  tagId: z.string().optional(),
  causeOfDeath: z.string().min(1, 'Cause of death is required.'),
});

type MortalityFormData = z.infer<typeof formSchema>;

export default function MortalityPage() {
  const { toast } = useToast();
  const { deadAnimals, addDeadAnimal, deleteDeadAnimal, totalDead, isLoading } = useFarm();
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<MortalityFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { sheepCount: 1, tagId: '', causeOfDeath: '', dateOfDeath: new Date() },
  });

  const sortedDeadAnimals = useMemo(() => {
    if (!deadAnimals) return [];
    const filtered = deadAnimals.filter(a => (a.tagId || '').toLowerCase().includes(searchTerm.toLowerCase()) || a.causeOfDeath.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.dateOfDeath).getTime() - new Date(a.dateOfDeath).getTime());
  }, [deadAnimals, searchTerm]);

  const groupedMortality = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    sortedDeadAnimals.forEach(a => {
      if (!groups[a.dateOfDeath]) groups[a.dateOfDeath] = [];
      groups[a.dateOfDeath].push(a);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [sortedDeadAnimals]);

  const onSubmit: SubmitHandler<MortalityFormData> = (data) => {
    const newRecord = { ...data, dateOfDeath: format(data.dateOfDeath, 'yyyy-MM-dd') };
    addDeadAnimal(newRecord);
    form.reset();
    setIsEntryDialogOpen(false);
    toast({ title: 'Success!', description: 'Death record saved.' });
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER */}
      <div className="md:hidden shrink-0 bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight">Death Log</h2>
        <p className="text-xl font-black">{totalDead} Head</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Pashu Death Log" description="RECORD MORTALITIES & CAUSES" className="mb-0 hidden md:block" />

        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => setIsEntryDialogOpen(true)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-xl border-none">
            <PlusCircle className="h-5 w-5 text-white" />
            Log Death
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Total Deaths</p><p className="text-xl font-black tracking-tight text-white">{totalDead} Head</p></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 md:px-0 space-y-6">
          <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Filter by Pashu ID or Cause..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" 
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
          </div>

          <div className="md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
            <CardHeader className="bg-neutral-900 text-white p-10 shrink-0 hidden md:block">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-3"><Skull className="h-6 w-6 text-rose-500" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Death Records</CardTitle></div>
                  <CardDescription className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Verified Pashu Mortality Audit</CardDescription>
                </div>
                <p className="text-4xl font-black tracking-tighter text-rose-500">{totalDead} Head</p>
              </div>
            </CardHeader>

            {/* MOBILE VIEW */}
            <div className="block md:hidden bg-slate-50 rounded-2xl p-4">
              {groupedMortality.length > 0 ? groupedMortality.map((group) => (
                <div key={group.date} className="mb-8">
                  <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((a) => (
                      <div key={a.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-900 truncate leading-none mb-1">Tag: {a.tagId || 'Unknown'}</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{a.causeOfDeath}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-rose-600">{a.sheepCount} Head</p>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">RECORDED</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-40 font-black uppercase text-xs">No records found</div>}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
              <div className="p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="py-4 px-4">Death Date</th>
                      <th className="py-4 px-4">Pashu / Cause</th>
                      <th className="py-4 px-4 text-center">Quantity</th>
                      <th className="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDeadAnimals.map((a) => (
                      <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-6 px-4 text-[11px] font-black text-slate-400">{a.dateOfDeath}</td>
                        <td className="py-6 px-4">
                          <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">Tag: {a.tagId || 'N/A'}</span><span className="text-[10px] font-bold text-slate-400 uppercase">{a.causeOfDeath}</span></div>
                        </td>
                        <td className="py-6 px-4 text-center"><Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] px-3">{a.sheepCount} Head</Badge></td>
                        <td className="py-6 px-4 text-right">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-rose-600 hover:bg-rose-50" onClick={() => deleteDeadAnimal(a.id, a._path)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { form.reset(); setIsEntryDialogOpen(true); }}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-rose-600 text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white h-[75dvh] max-h-[75dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Death Entry</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={form.control} name="causeOfDeath" render={({ field }) => (<FormItem><Label className="form-label-tactical">Cause of Death</Label><FormControl><Input placeholder="e.g. Fever, Injury" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={form.control} name="sheepCount" render={({ field }) => (<FormItem><Label className="form-label-tactical">Head Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="tagId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Tag ID (Opt)</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase shadow-xl">Record Death</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
