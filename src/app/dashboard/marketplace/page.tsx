'use client';

import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Scale, MessageSquare, Loader2, Trash2, User, Info, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MarketplacePage() {
  const { communitySales, deleteMarketplaceSale, isLoading } = useFarm();
  const { user } = useUser();

  const mySales = communitySales?.filter(s => s.sellerId === user?.uid) || [];
  const othersSales = communitySales?.filter(s => s.sellerId !== user?.uid) || [];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SaleCard = ({ sale, isOwner }: { sale: any, isOwner: boolean }) => (
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
        {!isOwner ? (
          <Button className="flex-1 gap-2 rounded-xl font-bold h-11 shadow-sm" variant="default">
            <MessageSquare className="h-4 w-4" />
            Contact Seller
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex-1 gap-2 rounded-xl font-bold h-11 text-destructive hover:bg-destructive/10"
            onClick={() => deleteMarketplaceSale(sale.id)}
          >
            <Trash2 className="h-4 w-4" />
            Remove My Listing
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Community Marketplace"
        description="View and share real-time livestock data."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-none shadow-xl rounded-[2rem] bg-primary text-white sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
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
            <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg font-bold">All Listings</TabsTrigger>
              <TabsTrigger value="mine" className="rounded-lg font-bold">My Listings ({mySales.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communitySales && communitySales.length > 0 ? (
                communitySales.map((sale) => (
                  <SaleCard key={sale.id} sale={sale} isOwner={user?.uid === sale.sellerId} />
                ))
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="mine" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySales.length > 0 ? (
                mySales.map((sale) => (
                  <SaleCard key={sale.id} sale={sale} isOwner={true} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground text-sm">You haven't posted any sales to the community yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-24 text-center space-y-6">
      <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
         <Globe className="h-10 w-10 text-primary opacity-20" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black tracking-tight">Marketplace is quiet...</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium">No community sales yet. Be the first to contribute and unlock regional analytics!</p>
      </div>
    </div>
  );
}