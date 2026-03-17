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
  PlusCircle,
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  ShoppingBag,
  Stethoscope,
  Heart,
  Loader2,
  Syringe
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
    toast({ title: 'Success!', description: 'Medical record recorded.' });
  };

  const onMedicineExpenseSubmit: SubmitHandler<MedicineExpenseFormData> = (data) => {
    addMedicineExpense({
      ...data,
      date: format(data.date, 'yyyy-MM-dd')
    });
    medicineForm.reset();
    setIsProcurementDialogOpen(false);
    toast({ title: 'Success!', description: 'Medicine purchase recorded.' });
  };

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `Today - ${dateStr}`;
    if (isYesterday(d)) return `Yesterday - ${dateStr}`;
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative">
      {/* MOBILE NEURAL VIEW */}
      <div className="block md:hidden mobile-neural-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Medical & Health</h1>
          <p className="text-sm font-medium text-white/40">Clinical history and pharma audit.</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="mobile-glass-card p-5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Med Spend</p>
            <h2 className="text-2xl font-black text-white tracking-tight">₹{totalMedicineCost.toLocaleString()}</h2>
          </div>
          <div className="mobile-glass-card p-5 border-l-4 border-l-rose-500">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Alerts</p>
            <h2 className="text-2xl font-black text-rose-400 tracking-tight">None</h2>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-10 p-1.5 bg-white/5 rounded-2xl h-14 border border-white/10">
            <TabsTrigger value="clinical" className="flex-1 rounded-xl text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white">Clinical</TabsTrigger>
            <TabsTrigger value="pharma" className="flex-1 rounded-xl text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white">Med Cost</TabsTrigger>
          </TabsList>

          <TabsContent value="clinical" className="space-y-8 pb-32">
            {groupedClinical.length > 0 ? groupedClinical.map((group) => (
              <div key={group.date} className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/30 px-2">{formatGroupDate(group.date)}</p>
                <div className="space-y-4">
                  {group.items.map((task) => (
                    <div key={task.id} className="mobile-glass-card p-5 flex items-center justify-between group active:scale-[0.98] transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-primary/20 text-primary border-none font-black text-[7px] uppercase px-1.5 py-0.5">ID: {task.sheepId}</Badge>
                          <h3 className="text-lg font-black text-white truncate leading-none">{task.medicineName}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{task.healthType} • {task.administeredBy}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-primary">₹{task.cost}</p>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Logged</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs text-white">No clinical records found</div>}
          </TabsContent>

          <TabsContent value="pharma" className="space-y-8 pb-32">
            {groupedPharma.length > 0 ? groupedPharma.map((group) => (
              <div key={group.date} className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/30 px-2">{formatGroupDate(group.date)}</p>
                <div className="space-y-4">
                  {group.items.map((expense) => (
                    <div key={expense.id} className="mobile-glass-card p-5 flex items-center justify-between group active:scale-[0.98] transition-all">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-white truncate leading-none mb-1">{expense.shopName}</h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{expense.description || 'Verified Bill'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-primary">₹{expense.totalAmountSpent.toLocaleString()}</p>
                        {expense.outstandingDues > 0 ? (
                          <Badge className="bg-rose-500/10 text-rose-400 border-none font-black text-[8px] uppercase px-2 py-0.5 mt-1">₹{expense.outstandingDues} Due</Badge>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Paid</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs text-white">No bills discovered</div>}
          </TabsContent>
        </Tabs>

        <button 
          onClick={() => activeTab === 'clinical' ? setIsClinicalDialogOpen(true) : setIsProcurementDialogOpen(true)}
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-all z-[120]"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* DESKTOP VIEW - MERGED TACTICAL HUB */}
      <div className="hidden md:flex flex-col h-full">
        <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
          <CardHeader className="bg-[#0FA5A0] text-white p-8 shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Syringe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight leading-none uppercase text-white">Medical & Health</CardTitle>
                </div>
                <CardDescription className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Clinical History & Medicine Costs</CardDescription>
              </div>

              {/* MERGED SEARCH MATRIX */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input 
                  placeholder={activeTab === 'clinical' ? "Search Sheep ID or Medicine..." : "Search Shop or Bill..."} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="h-12 pl-11 pr-4 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus-visible:ring-white/20" 
                />
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => activeTab === 'clinical' ? setIsClinicalDialogOpen(true) : setIsProcurementDialogOpen(true)} 
                  className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-2 shadow-xl border-none"
                >
                  <PlusCircle className="h-5 w-5" />
                  {activeTab === 'clinical' ? 'Log Treatment' : 'Buy Medicine'}
                </Button>
                
                <div className="px-6 py-2 bg-black/20 rounded-xl text-white flex items-center gap-4 border border-white/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Med Spend</p>
                    <p className="text-2xl font-black tracking-tighter leading-none mt-1">₹{totalMedicineCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="px-8 pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1.5 bg-[#D7F2F1] rounded-2xl h-14 md:h-16 md:max-w-md shadow-inner">
                <TabsTrigger value="clinical" className="tab-trigger-tactical">
                  <Activity className="h-3.5 w-3.5" /> Clinical Records
                </TabsTrigger>
                <TabsTrigger value="pharma" className="tab-trigger-tactical">
                  <History className="h-3.5 w-3.5" /> Medical Bills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clinical" className="m-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <Table>
                    <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white">Sheep (Medicine)</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-white">Treatment Type</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHealthTasks.map((task) => (
                        <TableRow key={task.id} className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{task.date}</TableCell>
                          <TableCell>
                            <div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{task.medicineName} (ID: {task.sheepId})</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.administeredBy}</span></div>
                          </TableCell>
                          <TableCell className="text-center"><Badge className="bg-[#D7F2F1] text-[#0FA5A0] border-none font-black text-[10px] px-3 uppercase tracking-widest">{task.healthType}</Badge></TableCell>
                          <TableCell className="text-right pr-10">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-[16px] font-black text-[#2F4F4F]">₹{task.cost.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteHealthTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="pharma" className="m-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <Table>
                    <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-white">Bill Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-white">Shop Identity</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-white">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-white">Amount Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{expense.date}</TableCell>
                          <TableCell>
                            <div className="flex flex-col"><span className="text-[14px] font-black text-[#2F4F4F]">{expense.shopName}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{expense.description || 'Medicine Bill'}</span></div>
                          </TableCell>
                          <TableCell className="text-center">
                            {expense.outstandingDues > 0 ? <Badge variant="destructive" className="font-black text-[10px] uppercase tracking-widest shadow-sm">₹{expense.outstandingDues} Due</Badge> : <Badge className="bg-[#ecfdf5] text-[#43A047] border-none font-black text-[10px] px-3 uppercase tracking-widest">Paid</Badge>}
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <div className="flex items-center justify-end gap-4">
                              <span className="text-[16px] font-black text-[#2F4F4F]">₹{expense.totalAmountSpent.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteMedicineExpense(expense.id, expense._path)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Stethoscope className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Treatment Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Record medical treatment or vaccination</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
            <Form {...healthTaskForm}><form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Sheep Tag ID</Label><FormControl><Input placeholder="e.g. 101" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medicine Name</Label><FormControl><Input placeholder="e.g. Albendazole" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medicine Cost (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-[#0FA5A0]" {...field} /></FormControl></FormItem>)} />
                <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (<FormItem><Label className="form-label-tactical">By Staff/Vet</Label><FormControl><Input placeholder="Who gave medicine" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Record Treatment</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcurementDialogOpen} onOpenChange={setIsProcurementDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><ShoppingBag className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Medicine Purchase</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document medicine purchase from shop</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
            <Form {...medicineForm}><form onSubmit={medicineForm.handleSubmit(onMedicineExpenseSubmit)} className="space-y-6">
              <FormField control={medicineForm.control} name="shopName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Shop Name</Label><FormControl><Input placeholder="Medical Shop Identity" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={medicineForm.control} name="totalAmountSpent" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Bill (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-[#0FA5A0]" {...field} /></FormControl></FormItem>)} />
                <FormField control={medicineForm.control} name="outstandingDues" render={({ field }) => (<FormItem><Label className="form-label-tactical">Due Amount (₹)</Label><FormControl><Input type="number" className="form-input-tactical text-rose-600" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Record Medicine Bill</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
