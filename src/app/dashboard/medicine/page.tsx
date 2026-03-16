'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2,
  Plus,
  Syringe,
  Pill,
  Search,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  Activity,
  History,
  Pencil,
  Save,
  Clock
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    healthTasks, addHealthTask, deleteHealthTask, updateHealthTask,
    medicineExpenses, addMedicineExpense, deleteMedicineExpense, updateMedicineExpense,
    totalMedicineCost, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);
  const [isProcurementDialogOpen, setIsProcurementDialogOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HealthTask | null>(null);
  const [editingExpense, setEditingExpense] = useState<MedicineExpense | null>(null);

  const healthTaskForm = useForm<HealthTaskFormData>({
    resolver: zodResolver(healthTaskFormSchema),
    defaultValues: { date: new Date(), animalGroup: 'Adult', healthType: 'Treatment', symptom: 'None', unit: 'ml', route: 'Oral', administeredBy: '', cost: 0 },
  });

  const medicineExpenseForm = useForm<MedicineExpenseFormData>({
    resolver: zodResolver(medicineExpenseFormSchema),
    defaultValues: { shopName: '', date: new Date(), costOfMedicines: 0, totalAmountSpent: 0, outstandingDues: 0 }
  });

  const sortedHealthTasks = useMemo(() => {
    if (!healthTasks) return [];
    const filtered = healthTasks.filter(t => (t.sheepId || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks, searchTerm]);

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    addHealthTask({ ...data, date: format(data.date, 'yyyy-MM-dd'), nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd') });
    healthTaskForm.reset(); setIsClinicalDialogOpen(false); toast({ title: 'Success!', description: 'Clinical record committed.' });
  };

  const onMedicineExpenseSubmit: SubmitHandler<MedicineExpenseFormData> = (data) => {
    addMedicineExpense({ ...data, date: format(data.date, 'yyyy-MM-dd') });
    medicineExpenseForm.reset(); setIsProcurementDialogOpen(false); toast({ title: 'Success!', description: 'Procurement cost recorded.' });
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
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
        <PageHeader title="Medicines & Health" description="OPERATIONAL STAFF & CLINICAL DISBURSEMENTS" className="mb-0" />
        
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button className="h-10 md:h-12 px-4 md:px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl border-none text-[10px] md:text-sm">
                <PlusCircle className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                Record Health
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 opacity-40 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl p-2 border-none mt-2">
              <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Ledger Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600">Pharma Total</span><span className="text-xs font-black text-emerald-600">₹{totalMedicineCost.toLocaleString()}</span></div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-100" />
              <div className="p-1 space-y-1">
                <DropdownMenuItem onSelect={() => setIsClinicalDialogOpen(true)} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-emerald-50">
                  <Syringe className="h-4 w-4" /><span className="text-[11px] font-black uppercase tracking-wider">Clinical Event</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsProcurementDialogOpen(true)} className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-blue-50">
                  <Pill className="h-4 w-4" /><span className="text-[11px] font-black uppercase tracking-wider">Procurement Entry</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="px-4 md:px-6 py-2 md:py-3 bg-neutral-900 rounded-xl md:rounded-2xl text-white flex items-center gap-3 md:gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
            <div>
              <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Pharma</p>
              <p className="text-sm md:text-xl font-black tracking-tight text-white">₹{totalMedicineCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex justify-center mb-6 shrink-0">
          <TabsList className="bg-[#e7eddc] p-1 rounded-2xl h-12 md:h-14 w-fit shadow-inner">
            <TabsTrigger value="health" className="tab-inactive data-[state=active]:tab-active font-black text-[8px] md:text-[10px] uppercase tracking-widest px-4 md:px-10"><Activity className="h-3 w-3 mr-2" /> Health Track</TabsTrigger>
            <TabsTrigger value="cost" className="tab-inactive data-[state=active]:tab-active font-black text-[8px] md:text-[10px] uppercase tracking-widest px-4 md:px-10"><History className="h-3 w-3 mr-2" /> Cost Track</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="health" className="m-0 flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="relative shrink-0">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input placeholder="Filter by Asset ID or Medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-14 pl-16 rounded-full bg-white border-none shadow-sm font-bold" />
            </div>

            <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white flex-1 min-h-0 flex flex-col">
              <CardHeader className="bg-emerald-600 text-white p-6 md:p-10 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><Activity className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Clinical Log</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Bio-Security & Treatment Records</CardDescription>
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">{healthTasks?.length || 0} EVENTS</p>
                </div>
              </CardHeader>
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="md:hidden">
                    {sortedHealthTasks.length > 0 ? sortedHealthTasks.map((task) => (
                      <div key={task.id} className="p-4 border-b border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center min-w-[60px] text-center">
                          <span className="text-[10px] font-black text-slate-300 leading-none">{task.date.split('-')[0]}</span>
                          <span className="text-[14px] font-black text-slate-400 leading-none mt-1">{task.date.split('-').slice(1).join('-')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[7px] uppercase px-1.5 py-0.5">{task.sheepId}</Badge>
                            <span className="text-sm font-black text-slate-900 truncate">{task.medicineName}</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.healthType} • {task.dose}{task.unit}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-slate-900">₹{task.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No clinical events</div>}
                  </div>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                        <TableRow className="border-none"><TableHead className="py-8 pl-10 text-slate-400">Event Date</TableHead><TableHead className="py-8 text-slate-400">Asset ID</TableHead><TableHead className="py-8 text-slate-400">Treatment</TableHead><TableHead className="py-8 text-right pr-10 text-slate-400">Impact</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedHealthTasks.map((task) => (
                          <TableRow key={task.id} className="hover:bg-slate-50 border-b border-slate-100 cursor-pointer">
                            <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{task.date}</TableCell>
                            <TableCell><Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black">{task.sheepId}</Badge></TableCell>
                            <TableCell><div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{task.medicineName}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{task.healthType} • {task.dose}{task.unit}</span></div></TableCell>
                            <TableCell className="text-right pr-10"><span className="text-[16px] font-black text-slate-900">₹{task.cost.toLocaleString()}</span></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="m-0 flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white flex-1 min-h-0 flex flex-col">
            <CardHeader className="bg-blue-600 text-white p-6 md:p-10 shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-3"><History className="h-6 w-6" /><CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase">Pharma Procurement</CardTitle></div>
                  <CardDescription className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Historical Supply Ledger</CardDescription>
                </div>
                <p className="text-3xl md:text-4xl font-black tracking-tighter">₹{totalMedicineCost.toLocaleString()}</p>
              </div>
            </CardHeader>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="md:hidden">
                  {sortedMedicineExpenses.length > 0 ? sortedMedicineExpenses.map((exp) => (
                    <div key={exp.id} className="p-4 border-b border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center min-w-[60px] text-center">
                        <span className="text-[10px] font-black text-slate-300 leading-none">{exp.date.split('-')[0]}</span>
                        <span className="text-[14px] font-black text-slate-400 leading-none mt-1">{exp.date.split('-').slice(1).join('-')}</span>
                      </div>
                      <div className="flex-1 min-w-0"><span className="text-sm font-black text-slate-900 truncate block mb-1">{exp.shopName}</span></div>
                      <div className="text-right shrink-0"><p className="text-base font-black text-slate-900">₹{exp.totalAmountSpent.toLocaleString()}</p></div>
                    </div>
                  )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No procurement records</div>}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                      <TableRow className="border-none"><TableHead className="py-8 pl-10 text-slate-400">Date</TableHead><TableHead className="py-8 text-slate-400">Supplier</TableHead><TableHead className="py-8 text-right pr-10 text-slate-400">Total Spent</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMedicineExpenses.map((exp) => (
                        <TableRow key={exp.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{exp.date}</TableCell>
                          <TableCell><span className="text-[14px] font-black text-slate-900">{exp.shopName}</span></TableCell>
                          <TableCell className="text-right pr-10"><span className="text-[16px] font-black text-slate-900">₹{exp.totalAmountSpent.toLocaleString()}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Syringe className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Clinical Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Document new treatment event into registry</DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <Form {...healthTaskForm}><form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (<FormItem><Label className="form-label-tactical">Asset ID</Label><FormControl><Input placeholder="e.g. 101" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medicine</Label><FormControl><Input placeholder="e.g. Albendazole" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={healthTaskForm.control} name="dose" render={({ field }) => (<FormItem><Label className="form-label-tactical">Dose Qty</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (<FormItem><Label className="form-label-tactical">Staff Name</Label><FormControl><Input placeholder="Who gave it?" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl">Commit Clinical Record</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcurementDialogOpen} onOpenChange={setIsProcurementDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400"><Pill className="h-5 w-5" /></div><DialogTitle className="text-xl font-black tracking-tight uppercase">Pharma Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new procurement to ledger</DialogDescription>
          </DialogHeader>
          <div className="p-8">
            <Form {...medicineExpenseForm}><form onSubmit={medicineExpenseForm.handleSubmit(onMedicineExpenseSubmit)} className="space-y-6">
              <FormField control={medicineExpenseForm.control} name="shopName" render={({ field }) => (<FormItem><Label className="form-label-tactical">Medical Shop Name</Label><FormControl><Input className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={medicineExpenseForm.control} name="totalAmountSpent" render={({ field }) => (<FormItem><Label className="form-label-tactical">Total Cost (₹)</Label><FormControl><Input type="number" step="0.01" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                <FormField control={medicineExpenseForm.control} name="outstandingDues" render={({ field }) => (<FormItem><Label className="form-label-tactical">Dues (₹)</Label><FormControl><Input type="number" step="0.01" className="form-input-tactical text-rose-600 font-bold" {...field} /></FormControl></FormItem>)} />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase shadow-xl">Log Procurement</Button>
            </form></Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
