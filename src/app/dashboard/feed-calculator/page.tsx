'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Calculator } from 'lucide-react';

export default function FeedCalculatorPage() {
  const [sheepCount, setSheepCount] = useState('80');
  const [weight, setWeight] = useState('15');
  const [feedPercent, setFeedPercent] = useState('4');
  const [tmrCost, setTmrCost] = useState('21');
  const [groundnutCost, setGroundnutCost] = useState('10');

  const [results, setResults] = useState({
    perSheepFeed: '',
    totalFeed: '',
    dailyCost: '',
    monthlyCost: '',
  });

  const calculateFeed = () => {
    const numSheep = parseFloat(sheepCount);
    const avgWeight = parseFloat(weight);
    const percent = parseFloat(feedPercent);
    const tmr = parseFloat(tmrCost);
    const groundnut = parseFloat(groundnutCost);

    if (isNaN(numSheep) || isNaN(avgWeight) || isNaN(percent) || isNaN(tmr) || isNaN(groundnut)) {
      return;
    }
    
    const feedPerSheep = avgWeight * (percent / 100);
    const totalDailyFeed = feedPerSheep * numSheep;
    const totalDailyCost = totalDailyFeed * tmr; // Using TMR cost for calculation
    const totalMonthlyCost = totalDailyCost * 30;

    setResults({
      perSheepFeed: `Feed per Sheep: ${feedPerSheep.toFixed(2)} kg/day`,
      totalFeed: `Total Daily Feed: ${totalDailyFeed.toFixed(2)} kg/day`,
      dailyCost: `Total Daily Cost (TMR): ₹${totalDailyCost.toFixed(2)}`,
      monthlyCost: `Total Monthly Cost (TMR): ₹${totalMonthlyCost.toFixed(2)}`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Weight Based Feed Calculator"
        description="Calculate feed requirements and costs based on sheep weight."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Enter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheepCount">Total Sheep</Label>
                <Input id="sheepCount" type="number" value={sheepCount} onChange={(e) => setSheepCount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Average Sheep Weight (kg)</Label>
                <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedPercent">Feeding % of Body Weight</Label>
                <Input id="feedPercent" type="number" value={feedPercent} onChange={(e) => setFeedPercent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tmrCost">TMR Cost per kg (₹)</Label>
                <Input id="tmrCost" type="number" value={tmrCost} onChange={(e) => setTmrCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groundnutCost">Groundnut Cost per kg (₹)</Label>
                <Input id="groundnutCost" type="number" value={groundnutCost} onChange={(e) => setGroundnutCost(e.target.value)} />
              </div>
              <Button onClick={calculateFeed} className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          {results.totalFeed && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <p className="text-muted-foreground">{results.perSheepFeed}</p>
                <p className="text-muted-foreground">{results.totalFeed}</p>
                <p className="text-muted-foreground">{results.dailyCost}</p>
                <p className="text-muted-foreground">{results.monthlyCost}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
