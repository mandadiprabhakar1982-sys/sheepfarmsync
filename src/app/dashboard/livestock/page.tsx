'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusCircle, 
  Trash2, 
  Pencil, 
  Scale, 
  ShoppingBag,
  Wheat,
  Info,
  CheckCircle2,
  Syringe,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const quickEntrySchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
});

type QuickEntryData = z.infer<typeof quickEntrySchema>;

export default function LivestockPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { 
    trackedSheep, 
    addTrackedSheep, 
    totalSheep,
    avgWeight,
    totalDailyFeed,
    totalFeedCost
  } = useFarm();
  
  const [viewingSheep, setViewingSheep] = useState<any>(null);

  const form = useForm<QuickEntryData>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: { tagId: '' },
  });

  const lambsCount = useMemo(() => {
    return (trackedSheep || []).filter(s => s.age < 6).length;
  }, [trackedSheep]);

  const onQuickSubmit: SubmitHandler<QuickEntryData> = (data) => {
    addTrackedSheep({ 
      tagId: data.tagId,
      age: 6,
      currentWeight: 30,
      gender: 'female',
      breed: 'Standard'
    });
    form.reset();
    toast({ title: 'Record Saved', description: `Asset ${data.tagId} synchronized.` });
  };

  const MetricCard = ({ title, value, sub, color, icon: Icon }: any) => (
    <Card className={cn("border-none shadow-sm rounded-2xl overflow-hidden text-white h-full", color)}>
      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
        <div className="flex justify-between items-start">
          <p className="text-[18px] font-bold opacity-90 uppercase tracking-tight">{title}</p>
          {Icon && <Icon className="h-5 w-5 opacity-40" />}
        </div>
        <div className="flex justify-between items-baseline mt-2">
          <p className="text-[32px] font-black tracking-tighter leading-none">{value}</p>
          <p className="text-[12px] font-black opacity-60 uppercase">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-500">
      <PageHeader
        title="Farm Overview"
        description="PRECISION MANAGEMENT SUITE"
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: META INFO (DESKTOP ONLY) */}
        <div className="hidden xl:block lg:col-span-3 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl bg-white/50 backdrop-blur-sm p-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-primary/40 mb-6">CSS Font Sizes</h3>
            <div className="space-y-4 font-mono text-[12px]">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-primary/60">.app-header</span>
                <span className="ml-auto font-bold">24px</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-primary/60">.card-title</span>
                <span className="ml-auto font-bold">18px</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-primary/60">.button</span>
                <span className="ml-auto font-bold">16px</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-primary/60">.form-label</span>
                <span className="ml-auto font-bold">14px</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-primary/60">.info-text</span>
                <span className="ml-auto font-bold">12px</span>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl bg-white p-0 overflow-hidden">
             <div className="bg-primary/5 p-4 border-b border-primary/5">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-primary/60">Font Size Breakdown</h3>
             </div>
             <Table>
                <TableHeader>
                   <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase py-3">Element</TableHead>
                      <TableHead className="text-[10px] font-black uppercase py-3 text-right">Size</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {[
                     { e: 'App Title', s: '24px', c: 'bg-lime-400' },
                     { e: 'Card Title', s: '18px', c: 'bg-emerald-500' },
                     { e: 'Button', s: '16px', c: 'bg-blue-500' },
                     { e: 'Form Label', s: '14px', c: 'bg-rose-500' },
                     { e: 'Info Text', s: '12px', c: 'bg-slate-300' },
                   ].map((row) => (
                     <TableRow key={row.e} className="hover:bg-neutral-50/50 h-10">
                        <TableCell className="py-0 flex items-center gap-2">
                           <div className={cn("h-2 w-2 rounded-full", row.c)} />
                           <span className="text-[12px] font-bold text-neutral-600">{row.e}</span>
                        </TableCell>
                        <TableCell className="py-0 text-right font-black text-[12px] text-neutral-400">{row.s}</TableCell>
                     </TableRow>
                   ))}
                </TableBody>
             </Table>
          </Card>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="lg:col-span-12 xl:col-span-9 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-neutral-100 p-8 flex flex-row items-center justify-between">
              <CardTitle className="text-[18px] font-black tracking-tight text-neutral-900 uppercase">Sheep Farm Dashboard</CardTitle>
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-neutral-200" />
                <div className="h-1 w-1 rounded-full bg-neutral-200" />
                <div className="h-1 w-1 rounded-full bg-neutral-200" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* TOP METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MetricCard 
                  title="Total Animals" 
                  value={totalSheep.toString()} 
                  sub="18px / 22px Card" 
                  color="bg-emerald-600" 
                />
                <MetricCard 
                  title="Lambs" 
                  value={lambsCount.toString()} 
                  sub="18px / 22px Call" 
                  color="bg-amber-500" 
                  icon={Syringe}
                />
              </div>

              {/* SUB METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MetricCard 
                  title="Feed Cost Today" 
                  value={`₹${(totalFeedCost / 30).toLocaleString()}`} 
                  sub="22px Card" 
                  color="bg-blue-500" 
                />
                <MetricCard 
                  title="Daily Feed (KG)" 
                  value={totalDailyFeed.toFixed(1)} 
                  sub="9md" 
                  color="bg-rose-500" 
                  icon={Wheat}
                />
              </div>

              {/* ACTION ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[16px] tracking-widest shadow-lg shadow-emerald-600/20 border-none">
                  Add Animal
                </Button>
                <Button className="h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase text-[16px] tracking-widest shadow-lg shadow-blue-500/20 border-none">
                  Feed Entry
                </Button>
                <Button className="h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[16px] tracking-widest shadow-lg shadow-amber-500/20 border-none">
                  View Sales
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
                {/* DATA TABLE AREA */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-neutral-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4 pl-6">ID</TableHead>
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Breed</TableHead>
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Weight</TableHead>
                          <TableHead className="text-[12px] font-black uppercase tracking-widest py-4">Health</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trackedSheep && trackedSheep.length > 0 ? (
                          trackedSheep.slice(0, 5).map((sheep) => (
                            <TableRow key={sheep.id} className="hover:bg-neutral-50 transition-colors cursor-pointer group" onClick={() => setViewingSheep(sheep)}>
                              <TableCell className="font-black text-[14px] py-4 pl-6 uppercase text-primary/80">{sheep.tagId}</TableCell>
                              <TableCell className="text-[14px] font-bold text-neutral-500">{sheep.breed || 'Suffolk'}</TableCell>
                              <TableCell className="text-[14px] font-black text-neutral-900">{sheep.currentWeight} kg</TableCell>
                              <TableCell>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase h-6 px-2">Good</Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-[14px] text-muted-foreground italic uppercase tracking-widest">Awaiting assets...</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-5 rounded-[1.25rem] bg-blue-50 border border-blue-100 flex items-center gap-4">
                    <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0 shadow-sm" />
                    <p className="text-[12px] font-bold text-blue-800 tracking-tight leading-relaxed italic">
                      Keep a close watch for signs of illness in lambs.
                    </p>
                  </div>
                </div>

                {/* QUICK INPUT FORM AREA */}
                <div className="lg:col-span-5">
                  <div className="bg-neutral-50/50 rounded-3xl p-8 border border-neutral-100">
                    <h3 className="text-[18px] font-black text-neutral-900 uppercase tracking-tight mb-6">Input Form</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onQuickSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="tagId"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="text-[14px] font-black uppercase tracking-widest opacity-40 ml-2">Tag ID</Label>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. SHP325" 
                                  className="h-14 rounded-2xl bg-white border-neutral-200 shadow-sm font-bold text-[16px] px-6 focus-visible:ring-emerald-500/20" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[16px] tracking-[0.2em] shadow-xl shadow-emerald-600/20 border-none transition-all active:scale-[0.98]">
                          Save Record
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-primary/10" />
              <h2 className="text-[12px] font-black text-primary/40 tracking-[0.4em] uppercase whitespace-nowrap px-4">
                Operational Breakdown
              </h2>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            <div className="h-32 rounded-[2.5rem] bg-white border-4 border-dashed border-neutral-50 flex items-center justify-center opacity-30">
               <Info className="h-6 w-6 text-primary" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
