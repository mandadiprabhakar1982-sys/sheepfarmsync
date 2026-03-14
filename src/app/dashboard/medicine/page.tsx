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
  Plus,
  ShoppingBag,
  History,
  ClipboardList
} from 'lucide-react';
import { format, addMonths } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { HighFidelityHealth } from '@/components/logo';
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
    return [...healthTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks]);

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
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[24px] bg-[#14532d] flex items-center justify-center shadow-xl">
            <HighFidelityHealth className="h-10 w-10 text-[#14b8a6]" />
          </div>
          <div>
            <h1 className="text-[34px] font-black text-[#1e293b] uppercase leading-tight">Medicines & Health</h1>
            <p className="text-[13px] font-black uppercase tracking-[4px] text-[#94a3b8] mt-1">SYNCHRONIZED OPERATIONAL ENVIRONMENT</p>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-white rounded-3xl flex flex-col items-center justify-center min-w-[200px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] border-t-4 border-[#14b8a6]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] leading-none mb-1">Total Health Cost</p>
          <p className="text-3xl font-black tracking-tighter text-[#14532d]">₹{totalMedicineCost.toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <div className="flex justify-center mb-12">
          <TabsList className="p-1 bg-[#e7eddc] rounded-2xl flex justify-start items-center h-16 w-fit shadow-inner">
            <TabsTrigger value="health" className="tab-inactive tab-active h-14 px-10 font-black text-[10px] tracking-[0.2em] uppercase">Health Track</TabsTrigger>
            <TabsTrigger value="cost" className="tab-inactive tab-active h-14 px-10 font-black text-[10px] tracking-[0.2em] uppercase">Cost Track</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="health" className="m-0 space-y-10 animate-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- CLINICAL ENTRY FORM --- */}
            <div className="lg:col-span-4">
              <Card className="form-card border-t-4 border-[#14b8a6] p-8">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
                    <Plus className="h-5 w-5 text-[#14b8a6]" />
                    Clinical Record
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-1">LOG ANIMAL TREATMENT PARAMETERS</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Form {...healthTaskForm}>
                    <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Event Date</Label>
                        <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left h-14 bg-[#f8fafc] border-[#d9e4cf] rounded-[14px] font-bold">
                              {healthTaskForm.watch('date') ? format(healthTaskForm.watch('date'), "PPP") : "Pick date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none shadow-2xl">
                            <Calendar mode="single" selected={healthTaskForm.watch('date')} onSelect={(d) => { healthTaskForm.setValue('date', d!); setIsTaskDateOpen(false); }} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Target Asset</Label>
                        <Select onValueChange={(v) => healthTaskForm.setValue('sheepId', v)}>
                          <SelectTrigger className="h-14"><SelectValue placeholder="Select tag" /></SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            {trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Medicine</Label>
                          <Input placeholder="e.g. Bio-Deworm" className="font-bold" {...healthTaskForm.register('medicineName')} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-40 ml-2">System Impact (₹)</Label>
                          <Input type="number" step="0.01" className="font-black text-emerald-600" {...healthTaskForm.register('cost')} />
                        </div>
                      </div>

                      <Button type="submit" className="primary-btn w-full !bg-[#14532d] hover:!bg-black flex items-center justify-center gap-3">
                        <Plus className="h-5 w-5" />
                        COMMIT CLINICAL EVENT
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* --- CLINICAL LEDGER --- */}
            <div className="lg:col-span-8">
              <Card className="form-card p-0 overflow-hidden">
                <CardHeader className="p-8 pb-4 bg-[#e2e8f0]/30 border-b">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none mb-2 uppercase text-[#14532d]">Clinical Ledger</CardTitle>
                      <CardDescription className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">HISTORICAL RECORD OF ANIMAL TREATMENT</CardDescription>
                    </div>
                    <History className="h-10 w-10 text-[#14532d]/10" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px] w-full">
                    <Table>
                      <TableHeader className="bg-[#e2e8f0]">
                        <TableRow className="border-none">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10">Temporal Node</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Asset ID</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Treatment Type</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-10">Impact (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedHealthTasks.length > 0 ? (
                          sortedHealthTasks.map((t) => (
                            <TableRow key={t.id} className="hover:bg-neutral-50 transition-colors border-b border-neutral-50 group">
                              <TableCell className="pl-10 py-6 text-xs font-bold text-slate-500 uppercase">{t.date}</TableCell>
                              <TableCell><Badge className="bg-[#14b8a6]/10 text-[#14b8a6] border-none font-black text-[10px] px-3">{t.sheepId}</Badge></TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-slate-900">{t.medicineName}</span>
                                  <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">{t.healthType}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-10">
                                <div className="flex items-center justify-end gap-4">
                                  <span className="text-sm font-black text-slate-900">₹{t.cost.toLocaleString()}</span>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteTask(t.id, t._path)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest">No clinical records discovered</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="m-0 space-y-10 animate-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- PROCUREMENT ENTRY FORM --- */}
            <div className="lg:col-span-4">
              <Card className="form-card border-t-4 border-[#14b8a6] p-8">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
                    <ShoppingBag className="h-5 w-5 text-[#14b8a6]" />
                    Procurement Entry
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-1">LOG MEDICINE PURCHASES & STOCK</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Form {...medicineExpenseForm}>
                    <form onSubmit={medicineExpenseForm.handleSubmit(onMedicineExpenseSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Purchase Date</Label>
                        <Popover open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left h-14 bg-[#f8fafc] border-[#d9e4cf] rounded-[14px] font-bold">
                              {medicineExpenseForm.watch('date') ? format(medicineExpenseForm.watch('date'), "PPP") : "Pick date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none shadow-2xl">
                            <Calendar mode="single" selected={medicineExpenseForm.watch('date')} onSelect={(d) => { medicineExpenseForm.setValue('date', d!); setIsExpenseDateOpen(false); }} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Shop / Entity Name</Label>
                        <Input placeholder="e.g. Apex Pharma" className="font-bold" {...medicineExpenseForm.register('shopName')} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-40 ml-2">Total Amount (₹)</Label>
                          <Input type="number" step="0.01" className="font-black" {...medicineExpenseForm.register('totalAmountSpent')} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase opacity-40 ml-2 text-rose-400">Outstanding (₹)</Label>
                          <Input type="number" step="0.01" className="font-bold text-rose-400" {...medicineExpenseForm.register('outstandingDues')} />
                        </div>
                      </div>

                      <Button type="submit" className="primary-btn w-full !bg-[#14532d] hover:!bg-black flex items-center justify-center gap-3">
                        <Plus className="h-5 w-5" />
                        COMMIT PROCUREMENT RECORD
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* --- PROCUREMENT LEDGER --- */}
            <div className="lg:col-span-8">
              <Card className="form-card p-0 overflow-hidden">
                <CardHeader className="p-8 pb-4 bg-[#e2e8f0]/30 border-b">
                  <div className="flex justify-between items-end">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none mb-2 uppercase text-[#14532d]">Procurement Ledger</CardTitle>
                      <CardDescription className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">TEMPORAL AUDIT OF PHARMACEUTICAL SPENDS</CardDescription>
                    </div>
                    <ClipboardList className="h-10 w-10 text-[#14532d]/10" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px] w-full">
                    <Table>
                      <TableHeader className="bg-[#e2e8f0]">
                        <TableRow className="border-none">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10">Temporal Node</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Supplier / Entity</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Outstanding</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-10">Value Payload (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMedicineExpenses.length > 0 ? (
                          sortedMedicineExpenses.map((e) => (
                            <TableRow key={e.id} className="hover:bg-neutral-50 transition-colors border-b border-neutral-50 group">
                              <TableCell className="pl-10 py-6 text-xs font-bold text-slate-500 uppercase">{e.date}</TableCell>
                              <TableCell><span className="text-sm font-black text-slate-900">{e.shopName}</span></TableCell>
                              <TableCell className="text-right">
                                {e.outstandingDues > 0 ? (
                                  <span className="text-[10px] font-black text-rose-600">₹{e.outstandingDues.toLocaleString()} DUE</span>
                                ) : (
                                  <span className="text-[10px] font-black text-emerald-600">PAID</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right pr-10">
                                <div className="flex items-center justify-end gap-4">
                                  <span className="text-sm font-black text-slate-900">₹{e.totalAmountSpent.toLocaleString()}</span>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteExpense(e.id, e._path)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-40 italic uppercase text-[12px] font-black tracking-widest">No procurement records discovered</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- FOOTER STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center gap-6 border-none hover:scale-[1.01] transition-all">
          <div className="h-14 w-14 rounded-2xl bg-[#f1f5f0] flex items-center justify-center text-[#14532d]">
            <Scale className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-[#14532d]">Clinical Mass</p>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Control Metrics</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center gap-6 border-none hover:scale-[1.01] transition-all">
          <div className="h-14 w-14 rounded-2xl bg-[#f1f5f0] flex items-center justify-center text-[#14532d]">
            <IndianRupee className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-[#14532d]">₹{totalMedicineCost.toLocaleString()}</p>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Active Spend</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center gap-6 border-none hover:scale-[1.01] transition-all">
          <div className="h-14 w-14 rounded-2xl bg-[#f1f5f0] flex items-center justify-center text-[#14532d]">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-[#14532d]">{sortedHealthTasks.length + sortedMedicineExpenses.length}</p>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Sync Density</p>
          </div>
        </div>
      </div>
    </div>
  );
}
