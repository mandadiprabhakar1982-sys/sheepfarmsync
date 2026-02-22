'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Calculator, Wheat, Leaf } from 'lucide-react';

export default function FeedCalculatorPage() {
  // Input states
  const [sheepCount, setSheepCount] = useState('80');
  const [weight, setWeight] = useState('15');
  const [feedPercent, setFeedPercent] = useState('4');
  
  // Cost states
  const [tmrCost, setTmrCost] = useState('21');
  const [groundnutCost, setGroundnutCost] = useState('10');

  // Mix percentage states
  const [tmrMix, setTmrMix] = useState('70');
  const [groundnutMix, setGroundnutMix] = useState('30');

  const [results, setResults] = useState({
    totalFeed: '',
    dailyTmrUsage: '',
    dailyGroundnutUsage: '',
    totalDailyCost: '',
    totalMonthlyCost: '',
  });

  const calculateFeed = () => {
    const numSheep = parseFloat(sheepCount);
    const avgWeight = parseFloat(weight);
    const percent = parseFloat(feedPercent);
    const tmrCostVal = parseFloat(tmrCost);
    const groundnutCostVal = parseFloat(groundnutCost);
    const tmrMixPercent = parseFloat(tmrMix);
    const groundnutMixPercent = parseFloat(groundnutMix);

    if (
      isNaN(numSheep) || isNaN(avgWeight) || isNaN(percent) ||
      isNaN(tmrCostVal) || isNaN(groundnutCostVal) ||
      isNaN(tmrMixPercent) || isNaN(groundnutMixPercent)
    ) {
      return;
    }

    if (tmrMixPercent + groundnutMixPercent !== 100) {
      setResults({
        totalFeed: 'Mix percentages must add up to 100%',
        dailyTmrUsage: '',
        dailyGroundnutUsage: '',
        totalDailyCost: '',
        totalMonthlyCost: '',
      });
      return;
    }

    const feedPerSheep = avgWeight * (percent / 100);
    const totalDailyFeed = feedPerSheep * numSheep;

    const dailyTmr = totalDailyFeed * (tmrMixPercent / 100);
    const dailyGroundnut = totalDailyFeed * (groundnutMixPercent / 100);

    const dailyTmrCost = dailyTmr * tmrCostVal;
    const dailyGroundnutCost = dailyGroundnut * groundnutCostVal;
    
    const totalDailyCost = dailyTmrCost + dailyGroundnutCost;
    const totalMonthlyCost = totalDailyCost * 30;

    setResults({
      totalFeed: `Total Daily Feed: ${totalDailyFeed.toFixed(2)} kg`,
      dailyTmrUsage: `Daily TMR usage: ${dailyTmr.toFixed(2)} kgs`,
      dailyGroundnutUsage: `🌿 Groundnut usage: ${dailyGroundnut.toFixed(2)} kgs`,
      totalDailyCost: `Total Daily Cost: ₹${totalDailyCost.toFixed(2)}`,
      totalMonthlyCost: `Total Monthly Cost: ₹${totalMonthlyCost.toFixed(2)}`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Weight Based Feed Calculator"
        description="Calculate feed requirements and costs based on sheep weight and feed mix."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
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
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Feed Mix & Cost</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tmrMix">TMR Mix (%)</Label>
                  <Input id="tmrMix" type="number" value={tmrMix} onChange={(e) => setTmrMix(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groundnutMix">Groundnut Mix (%)</Label>
                  <Input id="groundnutMix" type="number" value={groundnutMix} onChange={(e) => setGroundnutMix(e.target.value)} />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tmrCost">TMR Cost per kg (₹)</Label>
                    <Input id="tmrCost" type="number" value={tmrCost} onChange={(e) => setTmrCost(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groundnutCost">Groundnut Cost per kg (₹)</Label>
                    <Input id="groundnutCost" type="number" value={groundnutCost} onChange={(e) => setGroundnutCost(e.target.value)} />
                </div>
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
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>
                  Based on your inputs, here are the estimated feed requirements and costs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-lg">
                <div>
                  <h3 className="font-semibold text-xl mb-2">{results.totalFeed}</h3>
                  <div className="space-y-2 pl-4 border-l-2">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Wheat className="h-5 w-5 text-primary" />
                      <span>{results.dailyTmrUsage}</span>
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      <span>{results.dailyGroundnutUsage}</span>
                    </p>
                  </div>
                </div>
                 <div>
                  <h3 className="font-semibold text-xl mb-2">{results.totalDailyCost}</h3>
                   <div className="space-y-2 pl-4 border-l-2">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Monthly Total:</span> {results.totalMonthlyCost}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
