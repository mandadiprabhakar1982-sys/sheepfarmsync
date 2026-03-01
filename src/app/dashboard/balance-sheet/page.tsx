
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, CreditCard, Banknote, Landmark, Trash2, Pencil, Save, X } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function BalanceSheetPage() {
  const { toast } = useToast();
  const { 
    bankLoans, addBankLoan, updateBankLoan, deleteBankLoan,
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    privateDebts, addPrivateDebt, updatePrivateDebt, deletePrivateDebt,
    totalLoanBalance, totalCreditCardDebt, totalPrivateDebt
  } = useFarm();

  const [activeTab, setActiveTab] = useState('loans');

  // Form states
  const [bankName, setBankName] = useState('');
  const [totalLoan, setTotalLoan] = useState('');
  const [balanceLoan, setBalanceLoan] = useState('');
  const [totalTenure, setTotalTenure] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [pendingTenure, setPendingTenure] = useState('');
  const [interest, setInterest] = useState('');
  
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');

  const resetForms = () => {
    setBankName('');
    setTotalLoan('');
    setBalanceLoan('');
    setTotalTenure('');
    setMonthlyEmi('');
    setPendingTenure('');
    setInterest('');
    setPersonName('');
    setAmount('');
  };

  const handleAdd = () => {
    if (activeTab === 'loans') {
      if (!bankName || !totalLoan || !balanceLoan) return;
      addBankLoan({ 
        bankName, 
        totalLoan: parseFloat(totalLoan), 
        balanceLoan: parseFloat(balanceLoan),
        totalTenure,
        monthlyEmi: parseFloat(monthlyEmi || '0'),
        pendingTenure,
        interest: parseFloat(interest || '0')
      });
      toast({ title: "Loan Recorded", description: "Bank loan entry added successfully." });
    } else if (activeTab === 'cards') {
      if (!bankName || !amount) return;
      addCreditCard({ bankName, amount: parseFloat(amount) });
      toast({ title: "Card Recorded", description: "Credit card entry added successfully." });
    } else if (activeTab === 'private') {
      if (!personName || !amount) return;
      addPrivateDebt({ personName, amount: parseFloat(amount) });
      toast({ title: "Debt Recorded", description: "Private debt entry added successfully." });
    }
    resetForms();
  };

  const SummaryCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl text-white", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-2xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Financial Balance Sheet"
        description="Comprehensive audit of loans, credit cards, and private debts."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Bank Loan Balance" value={totalLoanBalance} icon={Landmark} color="bg-blue-600" />
        <SummaryCard title="Credit Card Debt" value={totalCreditCardDebt} icon={CreditCard} color="bg-indigo-600" />
        <SummaryCard title="Private Debts" value={totalPrivateDebt} icon={Banknote} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-4">
          <Card className="border-primary/20 bg-accent/5 sticky top-24 rounded-[2rem] shadow-xl overflow-hidden">
            <CardHeader className="bg-primary p-8">
              <CardTitle className="text-white text-xl font-black tracking-tight">Record Entry</CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Add to your active ledger</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {activeTab === 'loans' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Axis Bank HOME LOAN" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Loan (₹)</Label>
                      <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Balance (₹)</Label>
                      <Input type="number" value={balanceLoan} onChange={(e) => setBalanceLoan(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-destructive" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Tenure</Label>
                      <Input value={totalTenure} onChange={(e) => setTotalTenure(e.target.value)} placeholder="e.g. 5 Years" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly EMI (₹)</Label>
                      <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Pending Tenure</Label>
                      <Input value={pendingTenure} onChange={(e) => setPendingTenure(e.target.value)} placeholder="e.g. 24 Months" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Interest (%)</Label>
                      <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="0.0" step="0.1" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'cards' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Card Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. AXIS Cash Back" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Outstanding (₹)</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                  </div>
                </>
              )}

              {activeTab === 'private' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Person Name</Label>
                    <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="e.g. Kalyan" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Amount (₹)</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                  </div>
                </>
              )}

              <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Entry
              </Button>

              <div className="pt-6 border-t border-primary/10">
                <div className="p-4 rounded-2xl text-center bg-destructive/5 text-destructive">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Total Active Liability</p>
                  <p className="text-2xl font-black tracking-tighter">₹{(totalLoanBalance + totalCreditCardDebt + totalPrivateDebt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Views */}
        <div className="lg:col-span-8 overflow-hidden">
          <Tabs defaultValue="loans" onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 p-1 bg-muted/50 rounded-2xl grid grid-cols-3">
              <TabsTrigger value="loans" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Bank Loans</TabsTrigger>
              <TabsTrigger value="cards" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Credit Cards</TabsTrigger>
              <TabsTrigger value="private" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Private Debts</TabsTrigger>
            </TabsList>

            <TabsContent value="loans">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-blue-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black tracking-tight">Bank Loan Ledger</CardTitle>
                    <p className="text-lg font-black">₹{totalLoanBalance.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase">SNO</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Bank Name</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Total Loan</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Total Tenure</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Balance</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">EMI</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Pending</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Interest</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankLoans?.map((loan, idx) => (
                        <TableRow key={loan.id} className="group">
                          <TableCell className="text-[10px] font-bold text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="text-xs font-bold whitespace-nowrap">{loan.bankName}</TableCell>
                          <TableCell className="text-xs font-medium text-right">₹{loan.totalLoan.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-right text-muted-foreground">{loan.totalTenure || 'N/A'}</TableCell>
                          <TableCell className="text-xs font-black text-right text-destructive">₹{loan.balanceLoan.toLocaleString()}</TableCell>
                          <TableCell className="text-xs font-bold text-right text-primary">₹{(loan.monthlyEmi || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-right text-orange-600 font-bold">{loan.pendingTenure || 'N/A'}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{loan.interest ? `${loan.interest}%` : 'N/A'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteBankLoan(loan.id, loan._path)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!bankLoans?.length && <TableRow><TableCell colSpan={9} className="text-center py-10 opacity-20 italic">No bank loans recorded</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-indigo-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black tracking-tight">Credit Card Ledger</CardTitle>
                    <p className="text-lg font-black">₹{totalCreditCardDebt.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase">Bank Name</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-right">Outstanding</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditCards?.map((card) => (
                        <TableRow key={card.id} className="group">
                          <TableCell className="text-xs font-bold">{card.bankName}</TableCell>
                          <TableCell className="text-xs font-black text-right text-destructive">₹{card.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteCreditCard(card.id, card._path)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!creditCards?.length && <TableRow><TableCell colSpan={3} className="text-center py-10 opacity-20 italic">No credit cards recorded</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="private">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-rose-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black tracking-tight">Private Debt Ledger</CardTitle>
                    <p className="text-lg font-black">₹{totalPrivateDebt.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase">Person</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {privateDebts?.map((debt) => (
                        <TableRow key={debt.id} className="group">
                          <TableCell className="text-xs font-bold">{debt.personName}</TableCell>
                          <TableCell className="text-xs font-black text-right text-destructive">₹{debt.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deletePrivateDebt(debt.id, debt._path)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!privateDebts?.length && <TableRow><TableCell colSpan={3} className="text-center py-10 opacity-20 italic">No private debts recorded</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
