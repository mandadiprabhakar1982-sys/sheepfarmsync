'use client';

import { useState } from 'react';
import { analyzeFarmCosts, type AnalyzeFarmCostsOutput } from '@/ai/flows/analyze-farm-costs';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { mockFeedCosts, mockLaborCosts, mockLivestockPurchases, mockMedicineExpenses } from '@/lib/data';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalyzeFarmCostsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const input = {
        livestockPurchases: mockLivestockPurchases,
        medicineExpenses: mockMedicineExpenses,
        feedCosts: mockFeedCosts,
        laborCosts: mockLaborCosts,
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
    <div className="container mx-auto py-8">
      <PageHeader
        title="AI-Powered Reports & Analysis"
        description="Get actionable insights to improve your farm's financial health."
      />
      <div className="flex flex-col items-center">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Start Your Analysis</CardTitle>
            <CardDescription>
              Click the button below to analyze your farm's cost data using mock data.
              The AI will provide a summary, identify high-expenditure areas, and suggest optimizations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={handleAnalysis}
              disabled={isLoading}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Farm Costs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-4xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-8 w-full max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High Expenditure Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {analysis.highExpenditureAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actionable Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {analysis.actionableInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
