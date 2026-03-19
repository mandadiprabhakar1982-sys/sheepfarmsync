'use client';

import { Shell } from '@/components/shared/Shell';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import { Stethoscope, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function HealthPage() {
  const { width, isHydrated } = useWindowDimensions();
  const { healthTasks, deleteHealthTask } = useFarm();
  const isMobile = isHydrated ? width < 768 : false;

  return (
    <Shell>
      <div className="h-full flex flex-col">
        <header className="shrink-0 flex items-center justify-between mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 md:text-slate-800 text-white uppercase">Health Portal</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Clinical History & Alerts</p>
          </div>
          <button className="h-12 w-12 md:h-14 md:w-auto md:px-8 rounded-2xl bg-[#0FA5A0] text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
            <PlusCircle className="h-6 w-6" />
            <span className="hidden md:inline font-black uppercase text-xs">Log Treatment</span>
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          {isMobile ? (
            <div className="space-y-4 px-4 pb-32">
              {healthTasks?.map((task) => (
                <div key={task.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-[#D7F2F1] text-[#0FA5A0] font-black text-[8px] uppercase">{task.healthType}</Badge>
                    <span className="text-[10px] font-black text-white/40">ID: {task.sheepId}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{task.medicineName}</h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase mt-2">{task.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden h-full">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-6 pl-10 text-[10px] font-black uppercase text-slate-400">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Sheep (Medicine)</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Treatment Type</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 text-right pr-10">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthTasks?.map((task) => (
                    <TableRow key={task.id} className="border-b border-slate-50">
                      <TableCell className="py-6 pl-10 text-sm font-bold text-slate-400">{task.date}</TableCell>
                      <TableCell className="font-bold text-slate-700">{task.medicineName} (ID: {task.sheepId})</TableCell>
                      <TableCell><Badge className="bg-[#D7F2F1] text-[#0FA5A0] border-none font-black text-[10px]">{task.healthType}</Badge></TableCell>
                      <TableCell className="text-right pr-10 text-emerald-600 font-black text-xs">ADMINISTERED</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}