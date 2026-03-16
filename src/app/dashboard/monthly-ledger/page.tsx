'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  Landmark,
  Home,
  User,
  LayoutGrid
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, isToday, isYesterday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

/**
 * @fileOverview Unified Financial Ledger
 * Features tactical tabs for Bank EMI, Credit Card, Personal, and Household audits.
 */
export default function FinancialLedgerPage() {
  const { 
    sales, purchases, feedCosts, laborCosts, medicineExpenses, 
    healthTasks, farmExpenses, monthlyIncomes, monthlyExpenses
  } = useFarm();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('master');

  const combinedData = useMemo(() => {
    // 1. Manual Private Incomes
    const manualInflows = (monthlyIncomes || []).map(i => ({
      id: i.id,
      date: i.date,
      source: i.source,
      amount: i.amount,
      type: 'income' as const,
      cat: 'Private'
    }));

    // 2. Trade Inflows (Sales)
    const saleInflows = (sales || []).map(s => ({ 
      id: s.id, 
      date: s.saleDate, 
      source: `Sale: ${s.buyerName}`, 
      amount: s.amountReceived, 
      type: 'income' as const, 
      cat: 'Trade' 
    }));
    
    // 3. Trade Outflows (Purchases)
    const purchaseOutflows = (purchases || []).map(p => ({ 
      id: p.id, 
      date: p.purchaseDate, 
      source: `Purchase: ${p.farmerName}`, 
      amount: p.amountPaid, 
      type: 'expense' as const, 
      cat: 'Trade' 
    }));

    // 4. Operational Feed Costs
    const feedOutflows = (feedCosts || []).map(f => ({ 
      id: f.id, 
      date: f.date, 
      source: `Feed: ${f.feedType}`, 
      amount: f.cost, 
      type: 'expense' as const, 
      cat: 'Feed' 
    }));

    // 5. Operational Labor Costs
    const laborOutflows = (laborCosts || []).map(l => ({ 
      id: l.id, 
      date: l.date, 
      source: `Staff: ${l.employeeName}`, 
      amount: l.amountPaid || 0, 
      type: 'expense' as const, 
      cat: 'Labor' 
    }));

    // 6. Operational Medicine Procurements
    const medicineOutflows = (medicineExpenses || []).map(m => ({ 
      id: m.id, 
      date: m.date, 
      source: `Pharma: ${m.shopName}`, 
      amount: m.totalAmountSpent, 
      type: 'expense' as const, 
      cat: 'Medicine' 
    }));

    // 7. Clinical Treatment Costs
    const clinicalOutflows = (healthTasks || []).map(h => ({ 
      id: h.id, 
      date: h.date, 
      source: `Treatment: ${h.medicineName}`, 
      amount: h.cost, 
      type: 'expense' as const, 
      cat: 'Health' 
    }));

    // 8. Misc Farm Expenses
    const miscOutflows = (farmExpenses || []).map(e => ({ 
      id: e.id, 
      date: e.expenseDate, 
      source: `Misc: ${e.description}`, 
      amount: e.amount, 
      type: 'expense' as const, 
      cat: 'Expense' 
    }));

    // 9. Categorized Private Expenses
    const privateOutflows = (monthlyExpenses || []).map(e => ({
      id: e.id,
      date: e.date,
      source: e.source,
      amount: e.amount,
      type: 'expense' as const,
      cat: e.category === 'loan' ? 'Bank EMI' : 
           e.category === 'card' ? 'Credit Card' : 
           e.category === 'private' ? 'Personal' : 'Household'
    }));

    const all = [
      ...manualInflows, ...saleInflows, ...purchaseOutflows, 
      ...feedOutflows, ...laborOutflows, ...medicineOutflows, 
      ...clinicalOutflows, ...miscOutflows, ...privateOutflows
    ].filter(item => {
      if (!item.date) return false;
      const d = parseISO(item.date);
      if (!isValid(d)) return false;
      
      const matchesMonth = format(d, 'MM') === selectedMonth;
      const matchesYear = selectedYear === 'ALL' || format(d, 'yyyy') === selectedYear;
      const matchesSearch = (item.source || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab Filtering
      let matchesTab = true;
      if (activeTab === 'bank_emi') matchesTab = item.cat === 'Bank EMI';
      else if (activeTab === 'card') matchesTab = item.cat === 'Credit Card';
      else if (activeTab === 'personal') matchesTab = item.cat === 'Personal';
      else if (activeTab === 'household') matchesTab = item.cat === 'Household';

      return matchesMonth && matchesYear && matchesSearch && matchesTab;
    });

    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases, feedCosts, laborCosts, medicineExpenses, healthTasks, farmExpenses, monthlyIncomes, monthlyExpenses, selectedMonth, selectedYear, searchTerm, activeTab]);

  const netCashFlow = useMemo(() => {
    return combinedData.reduce((acc, item) => {
      return item.type === 'income' ? acc + item.amount : acc - item.amount;
    }, 0);
  }, [combinedData]);

  const formatGroupDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return `TODAY - ${dateStr}`;
    if (isYesterday(d)) return `YESTERDAY - ${dateStr}`;
    return dateStr;
  };

  // Grouping for Mobile
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    combinedData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [combinedData]);

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto h-full flex flex-col relative bg-white md:bg-transparent">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-[#059669] text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h2 className="text-xl font-black tracking-tight uppercase leading-none">Financial Ledger</h2>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase opacity-60 leading-none mb-1">Net Period Flow</p>
          <p className="text-xl font-black">₹{netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="md:hidden h-16 shrink-0" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 shrink-0 px-4 md:px-0 mt-4 md:mt-0">
        <PageHeader title="Financial Ledger" description="UNIFIED OPERATIONAL & PRIVATE AUDIT" className="mb-0 hidden md:block" />

        <div className="hidden md:flex items-center gap-4">
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Balance</p>
              <p className="text-xl font-black tracking-tight text-white">₹{netCashFlow.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 min-h-0 flex flex-col px-4 md:px-0">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search Ledger Records..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="h-12 md:h-14 pl-12 pr-12 rounded-2xl md:rounded-full bg-neutral-100/50 md:bg-white border-none text-slate-900 font-bold shadow-sm" 
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate-300" /></button>}
          </div>
          
          <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-12 md:h-14 w-[120px] rounded-2xl md:rounded-full bg-white border-none font-bold shadow-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const m = (i + 1).toString().padStart(2, '0');
                  return <SelectItem key={m} value={m}>{format(new Date(2024, i), 'MMMM')}</SelectItem>
                })}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-12 md:h-14 w-[120px] rounded-2xl md:rounded-full bg-white border-none font-bold shadow-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL TIME</SelectItem>
                {['2023', '2024', '2025'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
          <div className="relative">
            <TabsList className="w-full h-14 md:h-16 bg-[#e7eddc] rounded-2xl p-1.5 flex justify-start md:justify-center overflow-x-auto no-scrollbar shadow-inner mb-8">
              <TabsTrigger value="master" className="tab-trigger-tactical"><LayoutGrid className="h-3.5 w-3.5 mr-2" /> MASTER</TabsTrigger>
              <TabsTrigger value="bank_emi" className="tab-trigger-tactical"><Landmark className="h-3.5 w-3.5 mr-2" /> BANK EMI</TabsTrigger>
              <TabsTrigger value="card" className="tab-trigger-tactical"><CreditCard className="h-3.5 w-3.5 mr-2" /> CARD</TabsTrigger>
              <TabsTrigger value="personal" className="tab-trigger-tactical"><User className="h-3.5 w-3.5 mr-2" /> PERSONAL</TabsTrigger>
              <TabsTrigger value="household" className="tab-trigger-tactical"><Home className="h-3.5 w-3.5 mr-2" /> HOUSEHOLD</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="flex-1 min-h-0 flex flex-col m-0">
            <div className="flex-1 min-h-0 flex flex-col md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white p-10 shrink-0 hidden md:block">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><ArrowRightLeft className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">{activeTab.replace('_', ' ')} Audit</CardTitle></div>
                    <CardDescription className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Transaction Flow Audit</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{netCashFlow.toLocaleString()}</p>
                </div>
              </CardHeader>

              {/* MOBILE VIEW */}
              <div className="block md:hidden flex-1 overflow-hidden bg-slate-50 -mx-4">
                <ScrollArea className="h-full px-4 pt-4">
                  {groupedData.length > 0 ? groupedData.map((group) => (
                    <div key={group.date} className="mb-8">
                      <div className="px-2 py-2 mb-3 bg-[#e7eddc] rounded-lg">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">{formatGroupDate(group.date)}</p>
                      </div>
                      <div className="space-y-4">
                        {group.items.map((item) => (
                          <div key={item.id} className="bg-white rounded-[1.25rem] p-5 flex items-center justify-between shadow-sm border border-white/60 active:scale-[0.98] transition-all">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={cn("border-none font-black text-[7px] uppercase px-1.5 py-0.5 tracking-widest", 
                                  item.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600")}>
                                  {item.cat}
                                </Badge>
                                <h3 className="text-lg font-black text-slate-900 truncate leading-none">{item.source}</h3>
                              </div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {item.type === 'income' ? 'Cash Inflow' : 'Disbursement'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={cn("text-xl font-black", item.type === 'income' ? "text-[#059669]" : "text-slate-900")}>
                                {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] mt-1">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">VERIFIED</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : <div className="py-20 text-center opacity-20 font-black uppercase text-xs">No records discovered for this category</div>}
                  <div className="h-32" />
                </ScrollArea>
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 pl-10 text-slate-400">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-slate-400">Origin Source</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-center text-slate-400">Category</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-8 text-right pr-10 text-slate-400">Value Intensity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell className="py-6 pl-10 text-[11px] font-black text-slate-400">{item.date}</TableCell>
                          <TableCell>
                            <div className="flex flex-col"><span className="text-[14px] font-black text-slate-900">{item.source}</span><span className="text-[9px] font-bold text-slate-400 uppercase">Ref ID: {item.id.slice(0,8)}</span></div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-neutral-100 text-neutral-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">{item.cat}</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <span className={cn("text-[18px] font-black", item.type === 'income' ? "text-emerald-600" : "text-slate-900")}>
                              {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                            </span>
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
    </div>
  );
}
