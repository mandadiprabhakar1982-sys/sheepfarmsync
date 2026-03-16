'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2,
  Plus,
  Heart,
  Syringe,
  Pill,
  Search,
  ShoppingCart,
  Zap,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  Activity,
  History,
  FileText
} from 'lucide-react';
import { format, addMonths } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    trackedSheep, totalMedicineCost, isLoading
  } = useFarm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskDateOpen, setIsTaskDateOpen] = useState(false);
  const [isExpenseDateOpen, setIsExpenseDateOpen] = useState(false);
  
  // Modal Triggers
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);
  const [isProcurementDialogOpen, setIsProcurementDialogOpen] = useState(false);

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
    const filtered = healthTasks.filter(t => 
      (t.sheepId || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthTasks, searchTerm]);

  const sortedMedicineExpenses = useMemo(() => {
    if (!medicineExpenses) return [];
    return [...medicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [medicineExpenses]);

  const totalOutstanding = useMemo(() => {
    return (medicineExpenses || []).reduce((s, e) => s + (e.outstandingDues || 0), 0);
  }, [medicineExpenses]);

  const onHealthTaskSubmit: SubmitHandler<HealthTaskFormData> = (data) => {
    addHealthTask({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : format(addMonths(data.date, 3), 'yyyy-MM-dd'),
    });
    healthTaskForm.reset();
    setIsClinicalDialogOpen(false);
    toast({ title: 'Success!', description: 'Clinical record committed.' });
  };

  const onMedicineExpenseSubmit: SubmitHandler<MedicineExpenseFormData> = (data) => {
    addMedicineExpense({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    medicineExpenseForm.reset();
    setIsProcurementDialogOpen(false);
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

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-emerald-500 animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">SYNCHRONIZING CLINICAL DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Medicines & Health"
          description="OPERATIONAL STAFF & CLINICAL DISBURSEMENTS"
          className="mb-0"
        />
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white gap-2 shadow-xl border-none">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                Record Health
                <ChevronDown className="h-4 w-4 opacity-40 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl p-2 border-none mt-2">
              <DropdownMenuLabel className="p-4 bg-neutral-50 rounded-xl mb-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Ledger Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">Pharma Total</span>
                    <span className="text-xs font-black text-emerald-600">₹{totalMedicineCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">Events Logged</span>
                    <span className="text-xs font-black text-slate-900">{healthTasks?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600">Unsettled Dues</span>
                    <span className="text-xs font-black text-rose-600">₹{totalOutstanding.toLocaleString()}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-100" />
              <div className="p-1 space-y-1">
                <DropdownMenuItem 
                  onClick={() => setIsClinicalDialogOpen(true)}
                  className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
                >
                  <Syringe className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Clinical Event</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsProcurementDialogOpen(true)}
                  className="rounded-lg h-12 gap-3 cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                >
                  <Pill className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Procurement Entry</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Pharma</p>
              <p className="text-xl font-black tracking-tight text-white">₹{totalMedicineCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-white/50 backdrop-blur rounded-2xl h-14 w-fit shadow-sm border border-white/20 p-1">
            <TabsTrigger value="health" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-10 data-[state=active]:bg-white data-[state=active]:shadow-lg">
              <Activity className="h-3 w-3 mr-2" /> Health Track
            </TabsTrigger>
            <TabsTrigger value="cost" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-10 data-[state=active]:bg-white data-[state=active]:shadow-lg">
              <History className="h-3 w-3 mr-2" /> Cost Track
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="health" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                placeholder="Filter by Asset ID or Medicine..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="h-16 pl-16 rounded-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 font-bold shadow-sm" 
              />
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <ScrollArea className="h-[600px] w-full">
                <Table>
                  <TableHeader className="bg-slate-50 border-none">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Event Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Asset ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Treatment</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHealthTasks.length > 0 ? sortedHealthTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                        <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{task.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] px-3 uppercase tracking-tight">{task.sheepId}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-black text-slate-900">{task.medicineName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.healthType} • {task.dose}{task.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <div className="flex items-center justify-end gap-4">
                            <span className="text-[16px] font-black text-slate-900">₹{task.cost.toLocaleString()}</span>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteTask(task.id, task._path)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No clinical events recorded</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader className="bg-slate-50 border-none">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Temporal Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Supplier / Entity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right text-slate-400">Outstanding</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value Payload</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMedicineExpenses.length > 0 ? sortedMedicineExpenses.map((exp) => (
                    <TableRow key={exp.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                      <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{exp.date}</TableCell>
                      <TableCell><span className="text-[14px] font-black text-slate-900">{exp.shopName}</span></TableCell>
                      <TableCell className="text-right">
                        {exp.outstandingDues > 0 ? (
                          <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[10px] px-3">₹{exp.outstandingDues.toLocaleString()} DUE</Badge>
                        ) : (
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">CLEARED</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-4">
                          <span className="text-[16px] font-black text-slate-900">₹{exp.totalAmountSpent.toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteExpense(exp.id, exp._path)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-32 opacity-20 font-black uppercase text-xs">No procurement records discovered</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- ENTRY DIALOGS --- */}

      <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Syringe className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Clinical Event</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new health protocol to ledger</DialogDescription>
          </DialogHeader>
          
          <div className="p-8">
            <Form {...healthTaskForm}>
              <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={healthTaskForm.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical text-slate-400">Event Date</Label>
                      <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-slate-200 bg-white shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsTaskDateOpen(false); }} initialFocus className="text-slate-900" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (
                    <FormItem>
                      <Label className="form-label-tactical text-slate-400">Target Asset</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue placeholder="Select Tag" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white border-slate-200">
                          {trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={healthTaskForm.control} name="healthType" render={({ field }) => (
                      <FormItem>
                        <Label className="form-label-tactical text-slate-400">Protocol Type</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-white border-slate-200">{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={healthTaskForm.control} name="animalGroup" render={({ field }) => (
                      <FormItem>
                        <Label className="form-label-tactical text-slate-400">Flock Group</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="form-input-tactical bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-white border-slate-200">{animalGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical text-slate-400">Medicine</Label><FormControl><Input placeholder="Identity" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={healthTaskForm.control} name="cost" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical text-slate-400">Impact (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 text-emerald-600 font-black" {...field} /></FormControl></FormItem>
                    )} />
                  </div>

                  <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical text-slate-400">Administered By</Label><FormControl><Input placeholder="Staff Identity" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                  Commit Clinical Record
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcurementDialogOpen} onOpenChange={setIsProcurementDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Pill className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Procurement Entry</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Commit new pharmacy expense to ledger</DialogDescription>
          </DialogHeader>
          
          <div className="p-8">
            <Form {...medicineExpenseForm}>
              <form onSubmit={medicineExpenseForm.handleSubmit(onMedicineExpenseSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField control={medicineExpenseForm.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Label className="form-label-tactical text-slate-400">Purchase Date</Label>
                      <Popover open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-slate-50 border-slate-200">
                            {field.value ? format(field.value, "MMMM do, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-slate-200 bg-white shadow-2xl">
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsExpenseDateOpen(false); }} initialFocus className="text-slate-900" />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />

                  <FormField control={medicineExpenseForm.control} name="shopName" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical text-slate-400">Shop / Entity Identity</Label><FormControl><Input placeholder="e.g. Apex Pharma" className="form-input-tactical bg-slate-50 border-slate-200" {...field} /></FormControl></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={medicineExpenseForm.control} name="totalAmountSpent" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical text-slate-400">Total Spend (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 font-black" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={medicineExpenseForm.control} name="outstandingDues" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical text-slate-400">Outstanding (₹)</Label><FormControl><Input type="number" className="form-input-tactical bg-slate-50 border-slate-200 text-rose-600 font-black" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-xl">
                  Commit Procurement
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
