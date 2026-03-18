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
  Loader2,
  Syringe
} from 'lucide-react';
import { format, addMonths, parseISO, isToday, isYesterday } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
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
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative px-4 md:px-0">
      <div className="flex-1 min-h-0 flex flex-col premium-card overflow-hidden bg-white">
        <CardHeader className="bg-[#0FA5A0] text-white p-2.5 px-5 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Syringe className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight leading-none uppercase text-white">Medical & Health</CardTitle>
              </div>
              <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] ml-7">Clinical History & Medicine Costs</CardDescription>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input 
                placeholder={activeTab === 'clinical' ? "Search ID or Med..." : "Search Shop or Bill..."} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-8 pl-9 pr-3 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold focus-visible:ring-white/20" 
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => activeTab === 'clinical' ? setIsClinicalDialogOpen(true) : setIsProcurementDialogOpen(true)} 
                className="h-8 px-3 rounded-lg font-black uppercase tracking-widest bg-white text-[#0FA5A0] hover:bg-white/90 gap-1.5 shadow-xl border-none text-[10px]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {activeTab === 'clinical' ? 'Log Treatment' : 'Buy Medicine'}
              </Button>
              
              <div className="px-3 py-0.5 bg-black/20 rounded-lg text-white flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <p className="text-[6px] font-black uppercase tracking-widest opacity-40 leading-none">Net Med Spend</p>
                  <p className="text-base font-black tracking-tighter leading-none mt-0.5">₹{totalMedicineCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="px-8 pt-6 flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-[#D7F2F1] rounded-2xl h-12 md:max-w-md shadow-inner shrink-0">
              <TabsTrigger value="clinical" className="rounded-xl font-black text-[9px] uppercase h-10">
                <Activity className="h-3 w-3 mr-1.5" /> Clinical Records
              </TabsTrigger>
              <TabsTrigger value="pharma" className="rounded-xl font-black text-[9px] uppercase h-10">
                <History className="h-3 w-3 mr-1.5" /> Medical Bills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clinical" className="flex-1 min-h-0 overflow-y-auto pb-32 m-0">
              <Table>
                <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Sheep (Medicine)</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Treatment Type</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Cost</TableHead>
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
            </TabsContent>

            <TabsContent value="pharma" className="flex-1 min-h-0 overflow-y-auto pb-32 m-0">
              <Table>
                <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-10 text-white">Bill Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-white">Shop Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center text-white">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right pr-10 text-white">Amount Paid</TableHead>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* DIALOGS */}
      <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white h-[80dvh] max-h-[80dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Stethoscope className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Treatment Entry</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...healthTaskForm}>
            <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Sheep Tag ID</Label><FormControl><Input placeholder="e.g. 101" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                    <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medicine Name</Label><FormControl><Input placeholder="e.g. Albendazole" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medicine Cost (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-[#0FA5A0]" {...field} /></FormControl></FormItem>)} />
                    <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (<FormItem><Label className="form-label-tactical">By Staff/Vet</Label><FormControl><Input placeholder="Who gave medicine" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Record Treatment</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcurementDialogOpen} onOpenChange={setIsProcurementDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white h-[70dvh] max-h-[70dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><ShoppingBag className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase text-white">Medicine Purchase</DialogTitle></div>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...medicineForm}>
            <form onSubmit={medicineForm.handleSubmit(onMedicineExpenseSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <FormField control={medicineForm.control} name="shopName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Shop Name</Label><FormControl><Input placeholder="Medical Shop Identity" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={medicineForm.control} name="totalAmountSpent" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Bill (₹)</Label><FormControl><Input type="number" className="form-input-tactical font-black text-[#0FA5A0]" {...field} /></FormControl></FormItem>)} />
                    <FormField control={medicineForm.control} name="outstandingDues" render={({ field }) => (<FormItem><Label className="form-label-tactical">Due Amount (₹)</Label><FormControl><Input type="number" className="form-input-tactical text-rose-600" {...field} /></FormControl></FormItem>)} />
                  </div>
                </div>
              </div>
              <div className="p-6 shrink-0 border-t"><Button type="submit" className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl">Record Medicine Bill</Button></div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
