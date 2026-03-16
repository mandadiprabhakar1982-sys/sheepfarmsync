'use client';

import { useWindowDimensions } from '@/hooks/use-mobile';
import { useFarm } from '@/context/FarmContext';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  ReceiptIndianRupee, 
  Wheat, 
  Users, 
  Heart, 
  Wallet, 
  Plus,
  Loader2,
  ChevronRight,
  Calendar as CalendarIcon,
  ShieldCheck,
  Save,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  HubSparkle,
  IconOverview,
  IconLedger,
  IconLiabilities,
  IconFlock,
  IconTrade,
  IconHealth,
  IconFeed,
  IconLabor,
  IconExpenses,
  IconFarmCost
} from '@/components/logo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

/**
 * @fileOverview Command Hub Gatekeeper
 * Features a new "Farm Ledger" Quick Entry card for synchronized cost auditing.
 */
export default function DashboardPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();
  const { toast } = useToast();
  
  const { 
    userRole, 
    totalExpenses, 
    totalReceivables, 
    totalPayables, 
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
    isLoading,
    addPurchase,
    addFeedCost,
    addMedicineExpense,
    addLaborCost
  } = useFarm();

  // Quick Entry State
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [pCost, setPCost] = useState('');
  const [fCost, setFCost] = useState('');
  const [mCost, setMCost] = useState('');
  const [lCost, setLCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading || width === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Dispatching Hub</p>
        </div>
      </div>
    );
  }

  const handleQuickSync = async () => {
    setIsSaving(true);
    const dateStr = format(entryDate, 'yyyy-MM-dd');
    
    try {
      if (pCost && parseFloat(pCost) > 0) {
        addPurchase({
          purchaseDate: dateStr,
          villageName: 'Quick Entry',
          farmerName: 'General Supplier',
          animalCount: 0,
          purchasePrice: parseFloat(pCost),
          amountPaid: parseFloat(pCost),
          dueAmount: 0,
        });
      }
      
      if (fCost && parseFloat(fCost) > 0) {
        addFeedCost({
          date: dateStr,
          feedType: 'Other',
          cost: parseFloat(fCost),
          quantity: 0,
        });
      }
      
      if (mCost && parseFloat(mCost) > 0) {
        addMedicineExpense({
          date: dateStr,
          shopName: 'Quick Pharma',
          costOfMedicines: parseFloat(mCost),
          totalAmountSpent: parseFloat(mCost),
          outstandingDues: 0,
        });
      }
      
      if (lCost && parseFloat(lCost) > 0) {
        addLaborCost({
          employeeName: 'Quick Staff',
          date: dateStr,
          wages: parseFloat(lCost),
          numberOfLaborers: 1,
          totalLaborCosts: parseFloat(lCost),
          amountPaid: parseFloat(lCost),
          pendingAmount: 0,
        });
      }

      toast({ title: "Ledger Synchronized", description: "All entered costs have been distributed to respective modules." });
      setIsQuickEntryOpen(false);
      setPCost(''); setFCost(''); setMCost(''); setLCost('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: 'Could not update master ledger.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = userRole === 'admin';

  // --- MOBILE MODEL (Phone) ---
  const MobileHome = (
    <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 dashboard-stack">
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Financial Summary</h2>
        <div className="space-y-4">
          <Link href="/dashboard/sales" className="block">
            <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-blue-500"><TrendingUp className="h-6 w-6" /></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Receivables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{totalReceivables.toLocaleString()}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/purchase" className="block">
            <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-[#f59e0b]"><TrendingDown className="h-6 w-6" /></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Payables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{totalPayables.toLocaleString()}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </Link>
          <Link href="/dashboard/monthly-ledger" className="block">
            <div className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-slate-800"><ReceiptIndianRupee className="h-6 w-6" /></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Total Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{totalExpenses.toLocaleString()}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 px-2">Operational Breakdown</h2>
        
        {/* QUICK LEDGER ENTRY CARD (MOBILE) */}
        <div className="mb-6 px-2">
          <div className="bg-emerald-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <IconFarmCost className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase leading-none">Farm Ledger</h3>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mt-1">Daily Cost Synchronization</p>
                </div>
              </div>
              <Button onClick={() => setIsQuickEntryOpen(true)} className="w-full h-14 rounded-xl bg-accent hover:bg-yellow-500 text-black font-black uppercase tracking-widest shadow-xl border-none gap-2">
                <Plus className="h-5 w-5" />
                ENTER DATA
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Feed', val: totalFeedCost, icon: Wheat, href: '/dashboard/feed' },
            { label: 'Labor', val: totalLaborCost, icon: Users, href: '/dashboard/labor' },
            { label: 'Medical', val: totalMedicineCost, icon: Heart, href: '/dashboard/medicine' },
            { label: 'Misc', val: totalFarmExpenses, icon: Wallet, href: '/dashboard/expenses' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 aspect-square justify-center active:scale-[0.98] transition-all">
              <div className="h-16 w-16 rounded-[1.5rem] bg-[#f59e0b] flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                <item.icon className="h-8 w-8" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}:</p>
              <p className="text-xl font-black tracking-tighter text-slate-900">₹{item.val.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="pt-4 pb-10">
        <Button onClick={() => router.push('/dashboard/expenses')} className="w-full h-16 rounded-2xl bg-[#f59e0b] hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 text-sm gap-3 border-none">
          <Plus className="h-6 w-6" /> RECORD EXPENSE
        </Button>
      </div>
    </div>
  );

  // --- WEB MODEL (Laptop) ---
  const HubCard = ({ item }: { item: any }) => {
    const isActionCard = item.onClick;
    const content = (
      <div className="w-full h-[240px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 shadow-xl hover:shadow-[0_20px_60px_rgba(6,78,59,0.15)] transition-all hover:-translate-y-1 border border-white relative overflow-hidden glass-sheen">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", item.color)} />
        <div className="relative w-20 h-20 transition-transform group-hover:scale-110 duration-700 z-10 text-primary group-hover:text-white flex items-center justify-center">
          <item.icon className="w-full h-full" />
        </div>
        <div className="text-center relative z-10">
          <h3 className="text-[15px] font-black text-slate-900 tracking-widest leading-none mb-1 uppercase group-hover:text-white transition-colors">{item.title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] group-hover:text-accent transition-colors">{item.subtitle}</p>
        </div>
      </div>
    );

    if (isActionCard) {
      return <button onClick={item.onClick} className="group transition-all active:scale-95 block text-left">{content}</button>;
    }

    return <Link href={item.href} className="group transition-all active:scale-95 block">{content}</Link>;
  };

  const hubItems = [
    { title: "OVERVIEW", subtitle: "ANALYTICS", icon: IconOverview, href: '/dashboard/overview', color: "from-emerald-950/40 to-emerald-900/40" },
    { title: "FARM LEDGER", subtitle: "QUICK SYNC", icon: IconFarmCost, onClick: () => setIsQuickEntryOpen(true), color: "from-amber-950/40 to-amber-900/40" },
    { title: "LEDGER", subtitle: "BALANCE SHEET", icon: IconLedger, href: '/dashboard/monthly-ledger', adminOnly: true, color: "from-emerald-900/40 to-emerald-800/40" },
    { title: "DEBT", subtitle: "PORTFOLIO", icon: IconLiabilities, href: '/dashboard/balance-sheet', adminOnly: true, color: "from-amber-900/40 to-amber-800/40" },
    { title: "FLOCK", subtitle: "LIVESTOCK", icon: IconFlock, href: '/dashboard/livestock', color: "from-emerald-800/40 to-emerald-700/40" },
    { title: "TRADE", subtitle: "BUY & SELL", icon: IconTrade, href: '/dashboard/sales', color: "from-emerald-700/40 to-emerald-600/40" },
    { title: "HEALTH", subtitle: "CLINICAL", icon: IconHealth, href: '/dashboard/medicine', color: "from-red-900/40 to-red-800/40" },
    { title: "FEED", subtitle: "INVENTORY", icon: IconFeed, href: '/dashboard/feed', color: "from-emerald-600/40 to-emerald-500/40" },
    { title: "LABOR", subtitle: "STAFF", icon: IconLabor, href: '/dashboard/labor', color: "from-slate-900/40 to-slate-800/40" },
    { title: "EXPENSES", subtitle: "OVERHEAD", icon: IconExpenses, href: '/dashboard/expenses', color: "from-slate-800/40 to-slate-700/40" },
  ];

  const WebDashboard = (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-10 mb-20">
        <HubSparkle className="h-24 w-24 shrink-0" />
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">MPR <span className="text-primary">SHEEP FARMS</span></h1>
          <p className="text-[11px] font-black text-primary/60 uppercase tracking-[0.5em]">High-Density Executive Hub</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {hubItems.map((item, idx) => (item.adminOnly && !isAdmin ? null : <HubCard key={idx} item={item} />))}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? MobileHome : WebDashboard}

      {/* QUICK COST ENTRY DIALOG */}
      <Dialog open={isQuickEntryOpen} onOpenChange={setIsQuickEntryOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
              <IconFarmCost className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Quick Cost Sync</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest relative z-10">
              Synchronize daily operational disbursements
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="form-label-tactical ml-2">Transaction Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="form-input-tactical w-full text-left justify-between bg-neutral-50 border-none font-bold">
                      {format(entryDate, "MMMM do, yyyy")}
                      <CalendarIcon className="h-4 w-4 opacity-20" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none bg-white shadow-2xl">
                    <Calendar mode="single" selected={entryDate} onSelect={(d) => d && setEntryDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Purchase Cost (₹)</Label>
                  <Input type="number" value={pCost} onChange={(e) => setPCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Feed Cost (₹)</Label>
                  <Input type="number" value={fCost} onChange={(e) => setFCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Medicine Cost (₹)</Label>
                  <Input type="number" value={mCost} onChange={(e) => setMCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg text-rose-600" />
                </div>
                <div className="space-y-2">
                  <Label className="form-label-tactical ml-2">Labor Cost (₹)</Label>
                  <Input type="number" value={lCost} onChange={(e) => setLCost(e.target.value)} placeholder="0" className="form-input-tactical bg-neutral-50 border-none font-black text-lg text-emerald-600" />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleQuickSync} 
              disabled={isSaving || (!pCost && !fCost && !mCost && !lCost)}
              className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <ShieldCheck className="mr-2 h-5 w-5 text-accent" />
                  Commit Sync
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
