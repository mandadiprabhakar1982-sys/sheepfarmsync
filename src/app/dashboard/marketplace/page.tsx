'use client';

import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Scale, MessageSquare, Loader2, Trash2, User, Info } from 'lucide-react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MarketplacePage() {
  const { communitySales, deleteMarketplaceSale, isLoading } = useFarm();
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Community Marketplace"
        description="Real-time livestock data and sales from the regional community."
      />

      <Alert className="mb-8 border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs text-muted-foreground">
          This data is used to generate <strong>AI Market Intelligence</strong> reports. Share your sales to contribute to anonymized regional benchmarks.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communitySales && communitySales.length > 0 ? (
          communitySales.map((sale) => (
            <Card key={sale.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-[2rem] bg-white">
              <CardHeader className="bg-neutral-50 pb-6 border-b border-neutral-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-black tracking-tight">Sheep Listing</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Posted {sale.saleDate}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-3 py-1 font-bold">
                    {sale.animalCount} Head
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="bg-primary/5 rounded-2xl p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                     <User className="h-5 w-5" />
                   </div>
                   <div className="min-w-0">
                     <p className="text-sm font-black leading-none truncate">{sale.sellerName || 'Verified Farmer'}</p>
                     <p className="text-[10px] text-muted-foreground mt-1 font-bold truncate opacity-60">{sale.sellerEmail}</p>
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
                <Button className="flex-1 gap-2 rounded-xl font-bold h-11 shadow-sm" variant="default">
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </Button>
                
                {user?.uid === sale.sellerId && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl h-11 w-11 text-destructive hover:bg-destructive/10 border-none bg-white shadow-sm"
                    onClick={() => deleteMarketplaceSale(sale.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center space-y-6">
            <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
               <Globe className="h-10 w-10 text-primary opacity-20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Marketplace is quiet...</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium">No community sales yet. Be the first to contribute and unlock regional analytics!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}