
'use client';

import { useFarm } from '@/context/FarmContext';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Scale, MessageSquare, Loader2, Trash2, User } from 'lucide-react';
import { useUser } from '@/firebase';

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
        description="Browse sheep for sale from other farmers in the region."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communitySales && communitySales.length > 0 ? (
          communitySales.map((sale) => (
            <Card key={sale.id} className="overflow-hidden border-primary/10 hover:shadow-md transition-shadow">
              <CardHeader className="bg-accent/10 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Sheep for Sale</CardTitle>
                    <CardDescription>Listed on {sale.saleDate}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                    {sale.animalCount} Animals
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                   <div className="bg-primary/10 rounded-full p-1.5">
                     <User className="h-4 w-4 text-primary" />
                   </div>
                   <div>
                     <p className="text-sm font-bold leading-none">{sale.sellerName || 'Farmer'}</p>
                     <p className="text-[10px] text-muted-foreground">{sale.sellerEmail}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{sale.village}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Scale className="h-4 w-4 text-primary" />
                    <span>{sale.totalWeight} Total kg</span>
                  </div>
                </div>

                <div className="text-2xl font-bold text-foreground">
                  ₹{sale.askingPrice.toLocaleString()}
                </div>

                {sale.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    "{sale.notes}"
                  </p>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex justify-between items-center">
                <Button className="w-full gap-2" variant="outline">
                  <MessageSquare className="h-4 w-4" />
                  Contact Seller
                </Button>
                
                {user?.uid === sale.sellerId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMarketplaceSale(sale.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
            <h3 className="text-xl font-medium">Marketplace is quiet...</h3>
            <p className="text-muted-foreground">No shared sales yet. Be the first to post from your Sales screen!</p>
          </div>
        )}
      </div>
    </div>
  );
}
