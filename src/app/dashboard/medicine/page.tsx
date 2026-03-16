'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2,
  Plus,
  Activity,
  History,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  ShoppingBag,
  Stethoscope,
  Heart
} from 'lucide-react';
import { format, addMonths, parseISO, isToday, isYesterday } from 'date-fns';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { HealthTask, MedicineExpense } from '@/lib/types';

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
  date: z.date({ required_error: 'Date required.' }),
  shopName: z.string().min(1, 'Shop name required.'),
  description: z.string().optional(),
  costOfMedicines: z.coerce.number().nonnegative('Cost required.'),
  totalAmountSpent: z.coerce.number().nonnegative('Total required.'),
  outstandingDues: z.coerce.number().nonnegative().default(0),
});

type HealthTaskFormData = z.infer<typeof healthTaskFormSchema>;
type MedicineExpenseFormData = z.infer<typeof medicineExpenseFormSchema>;

export default function MedicinePage() {
  const { toast } = useToast();
  const { 
    healthTasks, addHealthTask, deleteHealthTask,
    medicineExpenses, addMedicineExpense, deleteMedicineExpense,
    totalMedicineCost, isLoading
  } = useFarm();
  
  const [activeTab, setActiveTab] = useState('clinical');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);
  const [isProcurementDialogOpen, setIsProcurementDialogOpen] = useState(false);
  
  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { date: new Date(), animalGroup: 'Adult', healthType: 'Treatment', symptom: 'None', unit: 'ml', route: 'Oral', administeredBy: '', cost: 0 },
  });

  const medicineForm = useForm<MedicineExpenseFormData>({
    resolver: zodResolver(medicineExpenseFormSchema),
    defaultValues: { date: new Date(), shopName: '', costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 },
  });

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    const filtered = healthTasks.filter(t => 
      (t.sheepId || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks, searchTerm]);

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    const filtered = medicineExpenses.filter(e => 
      (e.shopName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses, searchTerm]);

  // Grouping logic
  const groupData = (list: any[], dateKey: string) => {
    const groups: { [key: string]: any[] } = {};
    list.forEach(item => {
      const date = item[dateKey];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  };

  const groupedClinical = useMemo(() => groupData(sortedHealthTasks, 'date'), [sortedHealthTasks]);
  const groupedPharma = useMemo(() => groupData(sortedMedicineExpenses, 'date'), [sortedMedicineExpenses]);

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    addHealthTask({ 
      ...data, 
      date: format(data.date, 'yyyy-MM-dd'), 
      nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd') 
    });
    healthTaskForm.reset(); 
    setIsClinicalDialogOpen(false); 
    toast({ title: 'Success!', description: 'Clinical record committed.' });
  };

  const onMedicineExpenseSubmit: SubmitHandler<MedicineExpenseFormData> = (data) => {
    addMedicineExpense({
      ...data,
      date: format(data.date, 'yyyy-MM-dd')
    });
    medicineForm.reset();
    setIsProcurementDialogOpen(false);
    toast({ title: 'Success!', description: 'Procurement record committed.' });
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
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING CLINICAL DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER (HIGH PROFILE) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight uppercase">Health Hub</h2>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase opacity-60 leading-none mb-1">Net Exposure</p>
          <p className="text-xl font-black">₹{totalMedicineCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="md:hidden h-16 shrink-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Health & Pharma" description="CLINICAL REGISTRY & COST AUDIT" className="mb-0 hidden md:block" />

        <div className="hidden md:flex items-center gap-4">
          <Button 
            onClick={() => activeTab === 'clinical' ? setIsClinicalDialogOpen(true) : setIsProcurementDialogOpen(true)} 
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none"
          >
            <PlusCircle className="h-5 w-5 text-accent" />
            {activeTab === 'clinical' ? 'Log Clinical' : 'Record Procurement'}
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Exposure</p><p className="text-xl font-black tracking-tight text-white">₹{totalMedicineCost.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        <div className="relative shrink-0 w-full max-w-xl mx-auto md:mx-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder={activeTab === 'clinical' ? "Search Asset ID or Medicine..." : "Search Supplier or Expense..."} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" 
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-[#e7eddc] rounded-2xl h-14 md:h-16 md:max-w-md shadow-inner">
            <TabsTrigger value="clinical" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#059669] data-[state=active]:shadow-lg flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Clinical
            </TabsTrigger>
            <TabsTrigger value="pharma" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#059669] data-[state=active]:shadow-lg flex items-center gap-2">
              <History className="h-3.5 w-3.5" /> Pharma Costs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinical" className="flex-1 flex flex-col min-h-0 m-0">
            <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><Heart className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Clinical History</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Bio-Security & Medical Protocol Audit</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* MOBILE VIEW: CLINICAL History */}
              <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
                <ScrollArea className="h-full px-4 pt-4">
                  {groupedClinical.length > 0 ? groupedClinical.map((group) => (
                    <div key={group.date} className="mb-8">
                      <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                      </div>
                      <div className="space-y-4">
                        {group.items.map((task) => (
                          <div key={task.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[7px] uppercase px-1.5 py-0.5 tracking-tighter">{task.sheepId}</Badge>
                                <h3 className="text-lg font-black text-slate-900 truncate leading-none">{task.medicineName}</h3>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                {task.healthType} • {task.dose}{task.unit} • By {task.administeredBy}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-black text-[#059669]">₹{task.cost.toLocaleString()}</p>
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">APPLIED</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No clinical history records discovered</div>}
                  <div className="h-32" />
                </ScrollArea>
              </div>

              {/* DESKTOP VIEW: CLINICAL TABLE */}
              <div className="hidden md:block flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Asset / Treatment</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Category</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Treatment Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHealthTasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-slate-50 border-b border-slate-100 group">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{task.date}</TableCell>
                          <TableCell>
                            <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{task.medicineName} (ID: {task.sheepId})</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.dose}{task.unit} • {task.administeredBy}</span></div>
                          </TableCell>
                          <TableCell className="text-center"><Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">{task.healthType}</Badge></TableCell>
                          <TableCell className="text-right pr-10">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-[16px] font-black text-slate-900">₹{task.cost.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteHealthTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pharma" className="flex-1 flex flex-col min-h-0 m-0">
            <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><ShoppingBag className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Pharma Ledger</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Operational Medicine Procurement Audit</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* MOBILE VIEW: PHARMA Costs */}
              <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
                <ScrollArea className="h-full px-4 pt-4">
                  {groupedPharma.length > 0 ? groupedPharma.map((group) => (
                    <div key={group.date} className="mb-8">
                      <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                      </div>
                      <div className="space-y-4">
                        {group.items.map((expense) => (
                          <div key={expense.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-black text-slate-900 truncate leading-none mb-1">{expense.shopName}</h3>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                {expense.description || 'Verified Procurement'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-black text-slate-900">₹{expense.totalAmountSpent.toLocaleString()}</p>
                              {expense.outstandingDues > 0 ? (
                                <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] uppercase px-2 py-0.5 mt-1 tracking-tighter">₹{expense.outstandingDues} DUE</Badge>
                              ) : (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">SETTLED</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No pharma procurement records discovered</div>}
                  <div className="h-32" />
                </ScrollArea>
              </div>

              {/* DESKTOP VIEW: PHARMA TABLE */}
              <div className="hidden md:block flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Supplier / Description</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Total spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-slate-50 border-b border-slate-100 group">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{expense.date}</TableCell>
                          <TableCell>
                            <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{expense.shopName}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{expense.description || 'Procurement'}</span></div>
                          </TableCell>
                          <TableCell className="text-center">
                            {expense.outstandingDues > 0 ? <Badge variant="destructive" className="font-black text-[10px] uppercase tracking-widest shadow-sm">₹{expense.outstandingDues} Due</Badge> : <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">Paid</Badge>}
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-[16px] font-black text-slate-900">₹{expense.totalAmountSpent.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteMedicineExpense(expense.id, expense._path)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MOBILE FAB - Context Aware */}
      <button 
        onClick={() => activeTab === 'clinical' ? setIsClinicalDialogOpen(true) : setIsProcurementDialogOpen(true)}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full bg-[#059669] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* DIALOGS */}
      <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Stethoscope className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Clinical Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll treatment or clinical record into registry</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
            <Form {...healthTaskForm}><form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Asset ID</Label><FormControl><Input placeholder="e.g. 101" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medicine</Label><FormControl><Input placeholder="e.g. Albendazole" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (<FormItem><Label className="form-label-tactical">Impact Cost (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-emerald-600" {...field} /></FormControl></FormItem>)} />
                <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (<FormItem><Label className="form-label-tactical">Staff / Vet</Label><FormControl><Input placeholder="Identity" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl">Synchronize Record</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcurementDialogOpen} onOpenChange={setIsProcurementDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><ShoppingBag className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Pharma Purchase</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document pharma procurement from external supplier</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
            <Form {...medicineForm}><form onSubmit={medicineForm.handleSubmit(onMedicineExpenseSubmit)} className="space-y-6">
              <FormField control={medicineForm.control} name="shopName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Supplier Identity</Label><FormControl><Input placeholder="Shop or Brand Name" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={medicineForm.control} name="totalAmountSpent" render={({ field }) => (<FormItem><Label className="form-label-tactical">Invoice Total (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-emerald-600" {...field} /></FormControl></FormItem>)} />
                <FormField control={medicineForm.control} name="outstandingDues" render={({ field }) => (<FormItem><Label className="form-label-tactical">Liability (₹)</Label><FormControl><Input type="number" className="form-input-tactical text-rose-600" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl">Commit Pharma Cost</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
