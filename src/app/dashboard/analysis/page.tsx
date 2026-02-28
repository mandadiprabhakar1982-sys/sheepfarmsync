'use client';

import { useState } from 'react';
import { analyzeFarmCosts, type AnalyzeFarmCostsOutput } from '@/ai/flows/analyze-farm-costs';
import { Loader2, Sparkles, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalyzeFarmCostsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    purchases, 
    medicineExpenses, 
    feedCosts, 
    laborCosts, 
    farmExpenses, 
    communitySales,
    isLoading: isFarmDataLoading 
  } = useFarm();

  const calculateCommunityAverages = () => {
    if (!communitySales || communitySales.length === 0) return undefined;
    
    const totalSalesPrice = communitySales.reduce((sum, s) => sum + s.askingPrice, 0);
    const totalAnimals = communitySales.reduce((sum, s) => sum + s.animalCount, 0);
    
    return {
      avgSalePricePerAnimal: Math.round(totalSalesPrice / totalAnimals),
      avgPurchasePricePerAnimal: Math.round(totalSalesPrice / totalAnimals * 0.85), // Heuristic estimate
      totalMarketVolume: totalAnimals,
    };
  };

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const communityAverages = calculateCommunityAverages();
      
      const input = {
        livestockPurchases: (purchases || []).map(p => ({
          ...p,
          purchaseDate: p.purchaseDate,
        })),
        medicineExpenses: medicineExpenses || [],
        feedCosts: feedCosts || [],
        laborCosts: laborCosts || [],
        farmExpenses: farmExpenses || [],
        communityAverages,
      };
      
      const result = await analyzeFarmCosts(input);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="AI Intelligence Reports"
        description="Deep analysis of your farm data compared with community benchmarks."
      />
      
      <div className="flex flex-col items-center">
        <Card className="w-full max-w-4xl border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Community-Enhanced Analysis</CardTitle>
            </div>
            <CardDescription className="text-foreground/70">
              Our AI now integrates **anonymized community data** from the marketplace. 
              See how your purchase prices and operational costs stack up against other farmers in your region.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={handleAnalysis}
              disabled={isLoading || isFarmDataLoading}
              size="lg"
              className="w-full sm:w-auto font-bold h-12 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Market Intelligence...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Run Competitive Report
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
               <Users className="h-3 w-3" />
               Benchmarking against {communitySales?.length || 0} local listings
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-4xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-8 w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-accent/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Market Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-foreground">{analysis.communityBenchmarking}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">High Expenditure Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.highExpenditureAreas.map((area, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      <span className="text-muted-foreground">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Strategic Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {analysis.actionableInsights.map((insight, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold shrink-0">{index + 1}</div>
                      <p className="text-sm font-medium text-foreground self-center">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}