'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2,
  Syringe,
  Scale,
  IndianRupee,
  Activity,
  Plus
} from 'lucide-react';
import { format, addMonths } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { HighFidelityHealth } from '@/components/logo';

const animalGroups = ['Lamb', 'Adult', 'Pregnant', 'Ram'] as const;
const healthTypes = ['Vaccination', 'Deworming', 'Supplement', 'Treatment'] as const;
const symptoms = ['Fever', 'Worms', 'Cough', 'Injury', 'None', 'Other'] as const;
const units = ['ml', 'mg', 'tablet'] as const;
const routes = ['Oral', 'Injection'] as const;

const healthTaskFormSchema = z.object({
  date: z.date({ required_error: 'Date required.' }),
  sheepId: z.string().min(1, 'Select a sheep.'),
  animalGroup: z.enum(animalGroups),
  healthType: z.enum(healthTypes),
  symptom: z.enum(symptoms),
  medicineName: z.string().min(1, 'Required.'),
  dose: z.coerce.number().positive('Positive.'),
  unit: z.enum(units),
  route: z.enum(routes),
  nextDueDate: z.date().optional(),
  administeredBy: z.string().min(1, 'Required.'),
  notes: z.string().optional(),
});

type HealthTaskFormData = z.infer<typeof healthTaskFormSchema>;

export default function MedicinePage() {
  const { toast } = useToast();
  const { 
    healthTasks, addHealthTask, deleteHealthTask,
    trackedSheep, totalMedicineCost
  } = useFarm();
  
  const [isTaskDateOpen, setIsTaskDateOpen] = useState(false);

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { 
      date: new Date(), animalGroup: 'Adult', healthType: 'Treatment', symptom: 'None', unit: 'ml', route: 'Oral', administeredBy: ''
    },
  });

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    return [...healthTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks]);

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    addHealthTask({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd'),
    });
    healthTaskForm.reset();
    toast({ title: 'Success!', description: 'Clinical record committed.' });
  };

  const handleDeleteTask = (id: string, path?: string) => {
    deleteHealthTask(id, path);
    toast({ title: 'Deleted', description: 'Medical record removed.', variant: 'destructive' });
  };

  return (
    <div className="container mx-auto max-w-6xl animate-in fade-in duration-700">
      {/* Module Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="h-20 w-20 rounded-[24px] bg-[#14532d] flex items-center justify-center shadow-xl">
          <HighFidelityHealth className="h-10 w-10 text-[#4caf50]" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-[#14532d] tracking-tight">Medicines & Health</h1>
          <p className="subtitle mt-1">SYNCHRONIZED OPERATIONAL ENVIRONMENT</p>
        </div>
      </div>

      <Card className="form-card overflow-hidden">
        <Tabs defaultValue="health" className="w-full">
          <CardContent className="p-10 space-y-10">
            {/* Tactical Sub-Nav */}
            <div className="flex justify-start">
              <TabsList className="bg-[#e7eddc] p-1.5 rounded-[22px] h-14 w-fit">
                <TabsTrigger value="health" className="tab-inactive data-[state=active]:tab-active font-black text-[10px] tracking-[0.2em] px-8 h-11">
                  HEALTH TRACK
                </TabsTrigger>
                <TabsTrigger value="cost" className="tab-inactive data-[state=active]:tab-active font-black text-[10px] tracking-[0.2em] px-8 h-11">
                  COST TRACK
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="health" className="m-0 space-y-10">
              {/* Header Context Bar */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Treatment Ledger</h3>
                  <span className="text-neutral-200">|</span>
                  <span className="text-xs font-bold text-neutral-900">SHEEP (CONTROL)</span>
                </div>
                <div className="bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100">
                  <span className="text-[10px] font-black text-neutral-400 mr-2">LOGGED ASSETS:</span>
                  <span className="text-sm font-black text-[#14532d]">{trackedSheep?.length || 0}</span>
                </div>
              </div>

              {/* Clinical Table */}
              <div className="rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-[#f8fafc]">
                    <TableRow className="border-none">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 pl-8">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Operation</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Treatment Pair</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Outcome</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-8">System</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHealthTasks.length > 0 ? (
                      sortedHealthTasks.map((t) => (
                        <TableRow key={t.id} className="hover:bg-neutral-50/50 transition-colors border-b border-neutral-50">
                          <TableCell className="pl-8 py-6">
                            <span className="text-xs font-black text-neutral-900 uppercase">{t.date}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-neutral-500 uppercase">{t.animalGroup}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-neutral-900">{t.healthType}</span>
                              <span className="text-[10px] text-neutral-400 font-bold uppercase">{t.medicineName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[9px] px-3">STABLE</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-xs font-mono font-bold text-neutral-400">#{t.id.slice(0, 5)}</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-rose-500" onClick={() => handleDeleteTask(t.id, t._path)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 opacity-20 italic font-black uppercase text-[10px]">No records discovered</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Foot Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-white border border-neutral-100 p-6 rounded-[22px] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-[#f1f5f0] flex items-center justify-center text-[#14532d]">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tight text-[#14532d]">2,410 kg</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Mass</p>
                  </div>
                </div>
                <div className="bg-white border border-neutral-100 p-6 rounded-[22px] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-[#f1f5f0] flex items-center justify-center text-[#14532d]">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tight text-[#14532d]">₹{totalMedicineCost.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Spend</p>
                  </div>
                </div>
                <div className="bg-white border border-neutral-100 p-6 rounded-[22px] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-[#f1f5f0] flex items-center justify-center text-[#14532d]">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tight text-[#14532d]">{sortedHealthTasks.length}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Event Density</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}