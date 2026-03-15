'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2,
  Plus,
  History,
  Activity,
  Heart,
  Syringe,
  Pill,
  Search,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { format, addMonths } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  cost: z.coerce.number().nonnegative().default(0),
});

const medicineExpenseFormSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required.'),
  date: z.date({ required_error: 'Date required.' }),
  description: z.string().optional(),
  costOfMedicines: z.coerce.number().positive('Must be positive.'),
  totalAmountSpent: z.coerce.number().positive('Must be positive.'),
  outstandingDues: z.coerce.number().nonnegative().default(0),
});

type HealthTaskFormData = z.infer<typeof healthTaskFormSchema>;
type MedicineExpenseFormData = z.infer<typeof medicineExpenseFormSchema>;

export default function MedicinePage() {
  const { toast } = useToast();
  const { 
    healthTasks, addHealthTask, deleteHealthTask,
    medicineExpenses, addMedicineExpense, deleteMedicineExpense,
    trackedSheep, totalMedicineCost
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskDateOpen, setIsTaskDateOpen] = useState(false);
  const [isExpenseDateOpen, setIsExpenseDateOpen] = useState(false);

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { 
      date: new Date(), animalGroup: 'Adult', healthType: 'Treatment', symptom: 'None', unit: 'ml', route: 'Oral', administeredBy: '', cost: 0
    },
  });

  const medicineExpenseForm = useForm<MedicineExpenseFormData>({
    resolver: zodResolver(medicineExpenseFormSchema),
    defaultValues: {
      shopName: '',
      date: new Date(),
      costOfMedicines: 0,
      totalAmountSpent: 0,
      outstandingDues: 0,
    }
  });

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    const filtered = healthTasks.filter(t => t.sheepId.toLowerCase().includes(searchTerm.toLowerCase()) || t.medicineName.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks, searchTerm]);

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    addHealthTask({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd'),
    });
    healthTaskForm.reset();
    toast({ title: 'Success!', description: 'Clinical record committed.' });
  };

  const onMedicineExpenseSubmit: SubmitHandler<MedicineExpenseFormData> = (data) => {
    addMedicineExpense({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    medicineExpenseForm.reset();
    toast({ title: 'Success!', description: 'Procurement cost recorded.' });
  };

  const handleDeleteTask = (id: string, path?: string) => {
    deleteHealthTask(id, path);
    toast({ title: 'Deleted', description: 'Medical record removed.', variant: 'destructive' });
  };

  const handleDeleteExpense = (id: string, path?: string) => {
    deleteMedicineExpense(id, path);
    toast({ title: 'Deleted', description: 'Expense record removed.', variant: 'destructive' });
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-xl font-medium text-white/80">Medicines & Health</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mt-1">SYNCHRONIZED CLINICAL ENVIRONMENT</p>
      </div>

      {/* TACTICAL STAT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card glass-sheen glow-gold rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Health Investment</p>
              <p className="text-5xl font-black tracking-tighter text-white">₹{totalMedicineCost.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#FFC857]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">TOTAL PHARMA SPEND</p>
        </div>

        <div className="glass-card glass-sheen glow-purple rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Clinical Events</p>
              <p className="text-5xl font-black tracking-tighter text-white">{healthTasks?.length || 0}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Heart className="h-5 w-5 text-[#A78BFA]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">TREATMENTS LOGGED</p>
        </div>

        <div className="glass-card glass-sheen glow-coral rounded-[32px] p-8 h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Outstanding Dues</p>
              <p className="text-5xl font-black tracking-tighter text-white">₹{(medicineExpenses || []).reduce((s, e) => s + (e.outstandingDues || 0), 0).toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-[#ef4444]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">PHARMACY LIABILITIES</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <div className="flex justify-start mb-10">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
            <TabsTrigger value="health" className="tab-inactive data-[state=active]:bg-white/10 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8">Health Track</TabsTrigger>
            <TabsTrigger value="cost" className="tab-inactive data-[state=active]:bg-white/10 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-8">Cost Track</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="health" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* MAIN LEDGER AREA */}
            <div className="lg:col-span-8 space-y-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  placeholder="Filter by Asset ID or Medicine..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="h-16 pl-16 rounded-full bg-white/5 border-none text-white placeholder:text-white/20 font-bold shadow-2xl" 
                />
              </div>

              <div className="glass-card glass-sheen rounded-[40px] overflow-hidden">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="bg-white/5 border-none">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white/40">Event Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Asset ID</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Treatment</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white/40">Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHealthTasks.length > 0 ? sortedHealthTasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-white/40 uppercase tracking-widest">{task.date}</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[10px] px-3">{task.sheepId}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-black text-white">{task.medicineName}</span>
                              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{task.healthType} • {task.dose}{task.unit}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-[16px] font-black text-white">₹{task.cost.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No clinical events recorded</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>

            {/* REGISTRATION PANEL */}
            <div className="lg:col-span-4">
              <div className="glass-card glass-sheen rounded-[40px] p-10 h-full border-t-2 border-white/10">
                <div className="flex items-center gap-3 mb-10 text-emerald-400">
                  <Syringe className="h-6 w-6" />
                  <h3 className="text-lg font-black uppercase tracking-widest">Clinical Event</h3>
                </div>
                
                <Form {...healthTaskForm}>
                  <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <FormField control={healthTaskForm.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical">Event Date</Label>
                          <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                                {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </Trigger>
                            <PopoverContent className="w-auto p-0 border-white/10 bg-[#0a2e1a] shadow-2xl">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsTaskDateOpen(false); }} initialFocus className="text-white" />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />

                      <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (
                        <FormItem>
                          <Label className="form-label-tactical">Target Asset</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="form-input-tactical"><SelectValue placeholder="Select Tag" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-[#0a2e1a] border-white/10">
                              {trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={healthTaskForm.control} name="healthType" render={({ field }) => (
                          <FormItem>
                            <Label className="form-label-tactical">Protocol Type</Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent className="bg-[#0a2e1a] border-white/10">{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="animalGroup" render={({ field }) => (
                          <FormItem>
                            <Label className="form-label-tactical">Flock Group</Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger className="form-input-tactical"><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent className="bg-[#0a2e1a] border-white/10">{animalGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical">Medicine</Label><FormControl><Input placeholder="Identity" className="form-input-tactical" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical">Impact (₹)</Label><FormControl><Input type="number" className="form-input-tactical text-emerald-400 font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical">Administered By</Label><FormControl><Input placeholder="Staff Identity" className="form-input-tactical" {...field} /></FormControl></FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl">
                      Commit Record
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* PROCUREMENT LEDGER */}
            <div className="lg:col-span-8">
              <div className="glass-card glass-sheen rounded-[40px] overflow-hidden">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="bg-white/5 border-none">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white/40">Temporal Node</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white/40">Supplier / Entity</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right text-white/40">Outstanding</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white/40">Value Payload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.length > 0 ? sortedMedicineExpenses.map((exp) => (
                        <TableRow key={exp.id} className="hover:bg-white/5 transition-colors border-b border-white/5 group">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-white/40 uppercase tracking-widest">{exp.date}</TableCell>
                          <TableCell><span className="text-[14px] font-black text-white">{exp.shopName}</span></TableCell>
                          <TableCell className="text-right">
                            {exp.outstandingDues > 0 ? (
                              <Badge className="bg-rose-500/10 text-rose-400 border-none font-black text-[10px] px-3">₹{exp.outstandingDues.toLocaleString()} DUE</Badge>
                            ) : (
                              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">CLEARED</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-[16px] font-black text-white">₹{exp.totalAmountSpent.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteExpense(exp.id, exp._path)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No procurement records discovered</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>

            {/* PROCUREMENT PANEL */}
            <div className="lg:col-span-4">
              <div className="glass-card glass-sheen rounded-[40px] p-10 h-full border-t-2 border-white/10">
                <div className="flex items-center gap-3 mb-10 text-blue-400">
                  <Pill className="h-6 w-6" />
                  <h3 className="text-lg font-black uppercase tracking-widest">Procurement Entry</h3>
                </div>
                
                <Form {...medicineExpenseForm}>
                  <form onSubmit={medicineExpenseForm.handleSubmit(onMedicineExpenseSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <FormField control={medicineExpenseForm.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label className="form-label-tactical">Purchase Date</Label>
                          <Popover open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                                {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                                <CalendarIcon className="h-4 w-4 opacity-20" />
                              </Button>
                            </Trigger>
                            <PopoverContent className="w-auto p-0 border-white/10 bg-[#0a2e1a] shadow-2xl">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsExpenseDateOpen(false); }} initialFocus className="text-white" />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />

                      <FormField control={medicineExpenseForm.control} name="shopName" render={({ field }) => (
                        <FormItem><Label className="form-label-tactical">Shop / Entity Identity</Label><FormControl><Input placeholder="e.g. Apex Pharma" className="form-input-tactical" {...field} /></FormControl></FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={medicineExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical">Total Spend (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={medicineExpenseForm.control} name="outstandingDues" render={({ field }) => (
                          <FormItem><Label className="form-label-tactical">Outstanding (₹)</Label><FormControl><Input type="number" className="form-input-tactical text-rose-400 font-black" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-blue-800 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl">
                      Commit Procurement
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* FOOTER ACCENT */}
      <div className="fixed bottom-12 right-12 opacity-40 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
