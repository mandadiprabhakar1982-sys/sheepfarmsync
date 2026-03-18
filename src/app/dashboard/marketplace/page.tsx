'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Globe, MapPin, Scale, MessageSquare, Loader2, Trash2, User, CheckCircle2, Pencil, Save, X } from 'lucide-react';
import { useUser } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import type { PublicSale } from '@/lib/types';

const editSaleSchema = z.object({
  animalCount: z.coerce.number().int().positive('Must be positive'),
  totalWeight: z.coerce.number().positive('Must be positive'),
  askingPrice: z.coerce.number().positive('Must be positive'),
  notes: z.string().optional(),
});

type EditSaleFormData = z.infer<typeof editSaleSchema>;

export default function MarketplacePage() {
  const { communitySales, deleteMarketplaceSale, updateMarketplaceSale, isLoading, userRole } = useFarm();
  const { user } = useUser();
  const { toast } = useToast();

  const [editingSale, setEditingSale] = useState<PublicSale | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const editForm = useForm<EditSaleFormData>({
    resolver: zodResolver(editSaleSchema),
  });

  const mySales = communitySales?.filter(s => s.sellerId === user?.uid) || [];

  const handleEditClick = (sale: PublicSale) => {
    setEditingSale(sale);
    editForm.reset({
      animalCount: sale.animalCount,
      totalWeight: sale.totalWeight,
      askingPrice: sale.askingPrice,
      notes: sale.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit: SubmitHandler<EditSaleFormData> = (data) => {
    if (!editingSale) return;
    updateMarketplaceSale(editingSale.id, data, editingSale._path);
    setIsEditDialogOpen(false);
    toast({ title: 'Success!', description: 'Marketplace listing updated.' });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  const SaleCard = ({ sale, isOwner }: { sale: any, isOwner: boolean }) => {
    const isCollaborator = userRole === 'collaborator';
    const canManage = isOwner || isCollaborator;

    return (
      <Card key={sale.id} className={`overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-[2rem] bg-white ${isOwner ? 'ring-2 ring-primary/20' : ''}`}>
        <CardHeader className="bg-neutral-50 pb-6 border-b border-neutral-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black tracking-tight">Sheep Listing</CardTitle>
                {isOwner && <Badge className="bg-primary text-white text-[8px] uppercase font-black">Your Listing</Badge>}
              </div>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Posted {sale.saleDate}</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-3 py-1 font-bold">
              {sale.animalCount} Head
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="flex items-center gap-3">
             <div className={`rounded-2xl p-3 shadow-inner transition-colors ${isOwner ? 'bg-primary text-white' : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'}`}>
               <User className="h-5 w-5" />
             </div>
             <div className="min-w-0">
               <p className="text-sm font-black leading-none truncate">{isOwner ? 'You (Verified)' : (sale.sellerName || 'Verified Farmer')}</p>
               <p className="text-[10px] text-muted-foreground mt-1 font-bold truncate opacity-60">{isOwner ? user?.email : 'Identity Hidden'}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50/50">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-muted-foreground truncate">{sale.village}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50/50">
              <Scale className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-muted-foreground truncate">{sale.totalWeight}kg Wt.</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 mb-1">Asking Price</p>
            <div className="text-3xl font-black tracking-tighter text-foreground">
              ₹{sale.askingPrice.toLocaleString()}
            </div>
          </div>

          {sale.notes && (
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 italic">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                "{sale.notes}"
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-neutral-50/50 p-6 flex gap-3">
          {!canManage ? (
            <Button className="flex-1 gap-2 rounded-xl font-bold h-11 shadow-sm" variant="default">
              <MessageSquare className="h-4 w-4" />
              Contact Seller
            </Button>
          ) : (
            <div className="flex w-full gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-xl font-bold h-11 border-primary/20 hover:bg-primary/5"
                onClick={() => handleEditClick(sale)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-xl font-bold h-11 text-destructive hover:bg-destructive/10"
                onClick={() => deleteMarketplaceSale(sale.id, sale._path)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-700">
      <PageHeader
        title="Community Marketplace"
        description="View and share real-time livestock data."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-none shadow-xl rounded-[2rem] bg-[#365314] text-white sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 uppercase">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Community Trust
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs opacity-80 leading-relaxed font-medium">
                Data shared here is used to calculate anonymized regional benchmarks for your AI Analysis reports.
              </p>
              <div className="pt-4 border-t border-white/20">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Market Stats</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Total Listings</span>
                    <span className="font-bold">{communitySales?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Your Contributions</span>
                    <span className="font-bold">{mySales.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-12 p-1 bg-[#e7eddc] rounded-2xl flex justify-start items-center h-16 w-fit shadow-inner">
              <TabsTrigger value="all" className="tab-inactive tab-active h-14 px-8 font-bold">All Listings</TabsTrigger>
              <TabsTrigger value="mine" className="tab-inactive tab-active h-14 px-8 font-bold">My Listings ({mySales.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-500">
              {communitySales && communitySales.length > 0 ? (
                communitySales.map((sale) => (
                  <SaleCard key={sale.id} sale={sale} isOwner={user?.uid === sale.sellerId} />
                ))
              ) : (
                <div className="col-span-full py-24 text-center border-4 border-dashed rounded-[3rem] border-neutral-100 bg-white/40"><Globe className="h-10 w-10 mx-auto text-primary opacity-20 mb-4" /><p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-40">No community sales discovered</p></div>
              )}
            </TabsContent>

            <TabsContent value="mine" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-500">
              {mySales.length > 0 ? (
                mySales.map((sale) => (
                  <SaleCard key={sale.id} sale={sale} isOwner={true} />
                ))
              ) : (
                <div className="col-span-full py-24 text-center border-4 border-dashed rounded-[3rem] border-neutral-100 bg-white/40">
                  <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-40">No active contributions logged</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-visible border-none shadow-2xl h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <DialogTitle className="text-xl font-black uppercase">Edit Listing</DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update your marketplace post details.</DialogDescription>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="dialog-body space-y-6">
                <div className="min-h-[500px] space-y-6">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField control={editForm.control} name="animalCount" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Count</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={editForm.control} name="totalWeight" render={({ field }) => (
                      <FormItem><Label className="form-label-tactical">Weight (kg)</Label><FormControl><Input type="number" step="0.1" className="form-input-tactical" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  <FormField control={editForm.control} name="askingPrice" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Price (₹)</Label><FormControl><Input type="number" className="form-input-tactical" {...field} /></FormControl></FormItem>)} />
                  <FormField control={editForm.control} name="notes" render={({ field }) => (
                    <FormItem><Label className="form-label-tactical">Notes</Label><FormControl><Textarea className="rounded-xl bg-neutral-50 border-none font-bold" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </div>
              <div className="p-6 shrink-0 border-t">
                <Button type="submit" className="w-full h-16 rounded-2xl bg-neutral-900 hover:bg-black text-white font-black uppercase shadow-xl">
                  <Save className="mr-2 h-4 w-4 text-emerald-400" />
                  Update Listing
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
