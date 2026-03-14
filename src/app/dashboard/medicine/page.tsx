'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon, 
  Trash2,
  Syringe
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useState, useMemo } from 'react';

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
import { PageHeader } from '@/components/page-header';

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
    <div className="container mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-start mb-10">
        <PageHeader
          title="Health & Medicine"
          description="Clinical Audit & Medical Records"
        />
        <div className="bg-white/90 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[180px] border-t-4 border-[#14b8a6]">
          <p className="subtitle !text-[10px] mb-1">Total Procurement</p>
          <p className="text-3xl font-black text-[#14b8a6]">₹{totalMedicineCost.toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="mb-10 p-1 bg-slate-200/50 rounded-2xl flex justify-start items-center h-16 w-fit shadow-inner">
          <TabsTrigger value="health" className="tab-inactive data-[state=active]:tab-active h-14 px-10">Treatment Track</TabsTrigger>
          <TabsTrigger value="cost" className="tab-inactive data-[state=active]:tab-active h-14 px-10">Procurement Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Card className="form-card p-10 border-t-4 border-[#14b8a6]">
              <Form {...healthTaskForm}>
                <form onSubmit={healthTaskForm.handleSubmit(onHealthTaskSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={healthTaskForm.control} name="date" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Date</Label>
                        <Popover open={isTaskDateOpen} onOpenChange={setIsTaskDateOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="h-14 bg-[#f8fafc] border-slate-200 font-bold text-left px-4">
                              {field.value ? format(field.value, "MMM dd, yy") : "Select"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-20" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start"><Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsTaskDateOpen(false); }} initialFocus /></PopoverContent>
                        </Popover>
                      </FormItem>
                    )} />
                    <FormField control={healthTaskForm.control} name="sheepId" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Sheep ID</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-14 bg-[#f8fafc] border-slate-200 font-bold"><SelectValue placeholder="Select Asset" /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-xl">{trackedSheep?.map(s => <SelectItem key={s.id} value={s.tagId}>{s.tagId}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={healthTaskForm.control} name="healthType" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Treatment Type</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-14"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>{healthTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={healthTaskForm.control} name="administeredBy" render={({ field }) => (
                      <FormItem>
                        <Label className="subtitle !text-[10px] ml-2 mb-2">Administered By</Label>
                        <FormControl><Input className="h-14" placeholder="Identity" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={healthTaskForm.control} name="medicineName" render={({ field }) => (
                    <FormItem>
                      <Label className="subtitle !text-[10px] ml-2 mb-2">Medicine Name</Label>
                      <FormControl><Input className="h-14" placeholder="e.g. Albendazole" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <Button type="submit" className="primary-btn w-full !bg-[#14b8a6]">Commit Record</Button>
                </form>
              </Form>
            </Card>
          </div>
          <div className="lg:col-span-8">
            <Card className="form-card p-0 overflow-hidden">
              <Table>
                <TableHeader className="sync-table-header">
                  <TableRow>
                    <TableHead className="subtitle !text-[10px] py-6 pl-10">Date</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6">Asset</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6">Treatment</TableHead>
                    <TableHead className="subtitle !text-[10px] py-6 text-right pr-10">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHealthTasks.map(t => (
                    <TableRow key={t.id} className="sync-table-row">
                      <TableCell className="pl-10 py-6 text-xs font-bold text-slate-500">{t.date}</TableCell>
                      <TableCell><span className="text-sm font-black text-slate-900">{t.sheepId}</span></TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 uppercase">{t.healthType}</span>
                          <span className="text-[10px] text-slate-400">{t.medicineName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex items-center justify-end gap-3">
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-none font-bold">LOGGED</Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteTask(t.id, t._path)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}