'use client';

import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isValid
} from 'date-fns';

import { 
  PieChart, 
  Banknote, 
  DollarSign, 
  Cloud 
} from 'lucide-react';

import { WebDashboard } from '@/components/web/WebDashboard';
import { MobileDashboard } from '@/components/mobile/MobileDashboard';

export function OverviewModule() {
  const { width, isHydrated } = useWindowDimensions();
  const {
    totalSheep,
    totalSales,
    totalDead,
    farmExpenses,
    isLoading
  } = useFarm();

  /* ---------------- HOOKS MUST BE AT THE TOP ---------------- */

  const currentMonthInterval = useMemo(() => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  }, []);

  const monthlyExpenses = useMemo(() => {
    if (!farmExpenses || !Array.isArray(farmExpenses)) return [];
    return farmExpenses.filter((item) => {
      try {
        if (!item.date || item.category === 'Sale') return false;
        const d = parseISO(item.date);
        if (!isValid(d)) return false;
        return isWithinInterval(d, currentMonthInterval);
      } catch {
        return false;
      }
    });
  }, [farmExpenses, currentMonthInterval]);

  const monthlySpend = useMemo(() => {
    if (!monthlyExpenses) return 0;
    return monthlyExpenses.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );
  }, [monthlyExpenses]);

  const categoryTotals = useMemo(() => {
    if (!monthlyExpenses) return {};
    return monthlyExpenses.reduce((acc: any, item) => {
      if (!item.category) return acc;
      acc[item.category] = (acc[item.category] || 0) + (item.totalAmount || 0);
      return acc;
    }, {});
  }, [monthlyExpenses]);

  const totalCategoryAmount = useMemo(() => {
    if (!categoryTotals) return 0;
    return Object.values(categoryTotals).reduce((a: any, b: any) => a + b, 0);
  }, [categoryTotals]);

  const chartData = useMemo(() => {
    if (!farmExpenses || !Array.isArray(farmExpenses)) return [];
    const grouped: Record<string, number> = {};

    farmExpenses.forEach((item) => {
      try {
        if (!item.date || item.category === 'Sale') return;
        const d = parseISO(item.date);
        if (!isValid(d)) return;
        const month = format(d, 'MMM');
        grouped[month] = (grouped[month] || 0) + (item.totalAmount || 0);
      } catch {}
    });

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return months
      .filter((m) => grouped[m] !== undefined)
      .map((m) => ({
        month: m,
        value: grouped[m]
      }));
  }, [farmExpenses]);

  const kpis = useMemo(() => [
    { title: 'Live Sheep', value: totalSheep.toLocaleString(), icon: PieChart },
    { title: 'Month Spend', value: `₹${monthlySpend.toLocaleString()}`, icon: Banknote },
    { title: 'Revenue', value: `₹${totalSales.toLocaleString()}`, icon: DollarSign },
    { title: 'Mortality', value: `${totalDead} Head`, icon: Cloud }
  ], [totalSheep, monthlySpend, totalSales, totalDead]);

  /* ---------------- CONDITIONAL RENDERING AT THE BOTTOM ---------------- */

  if (isLoading || !isHydrated) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-32 bg-white rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}
        </div>
        <div className="h-96 bg-white rounded-3xl" />
      </div>
    );
  }

  const isMobile = width < 768;

  return isMobile ? (
    <MobileDashboard 
      kpis={kpis} 
      categoryTotals={categoryTotals} 
      totalCategoryAmount={totalCategoryAmount} 
    />
  ) : (
    <WebDashboard 
      kpis={kpis} 
      categoryTotals={categoryTotals} 
      totalCategoryAmount={totalCategoryAmount}
      chartData={chartData}
    />
  );
}
