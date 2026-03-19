'use client';

import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useWindowDimensions } from '@/hooks/use-mobile';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval
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

  const isMobile = isHydrated ? width < 768 : false;

  /* ---------------- CURRENT MONTH INTERVAL ---------------- */
  const currentMonthInterval = useMemo(() => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  }, []);

  /* ---------------- MONTH EXPENSES (EXCLUDING SALES) ---------------- */
  const monthlyExpenses = useMemo(() => {
    if (!farmExpenses) return [];
    return farmExpenses.filter((item) => {
      try {
        return (
          item.date &&
          item.category !== 'Sale' &&
          isWithinInterval(parseISO(item.date), currentMonthInterval)
        );
      } catch {
        return false;
      }
    });
  }, [farmExpenses, currentMonthInterval]);

  /* ---------------- MONTH TOTAL SPEND ---------------- */
  const monthlySpend = useMemo(() => {
    return monthlyExpenses.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );
  }, [monthlyExpenses]);

  /* ---------------- CATEGORY BREAKDOWN ---------------- */
  const categoryTotals = useMemo(() => {
    return monthlyExpenses.reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.totalAmount || 0);
      return acc;
    }, {});
  }, [monthlyExpenses]);

  const totalCategoryAmount = useMemo(() => 
    Object.values(categoryTotals).reduce((a: any, b: any) => a + b, 0),
  [categoryTotals]);

  /* ---------------- CHRONOLOGICAL CHART DATA ---------------- */
  const chartData = useMemo(() => {
    if (!farmExpenses) return [];
    const grouped: Record<string, number> = {};

    farmExpenses.forEach((item) => {
      try {
        if (!item.date || item.category === 'Sale') return;
        const month = format(parseISO(item.date), 'MMM');
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

  const kpis = [
    { title: 'Live Sheep', value: totalSheep.toLocaleString(), icon: PieChart },
    { title: 'Month Spend', value: `₹${monthlySpend.toLocaleString()}`, icon: Banknote },
    { title: 'Revenue', value: `₹${totalSales.toLocaleString()}`, icon: DollarSign },
    { title: 'Mortality', value: `${totalDead} Head`, icon: Cloud }
  ];

  if (isMobile) {
    return (
      <MobileDashboard 
        kpis={kpis} 
        categoryTotals={categoryTotals} 
        totalCategoryAmount={totalCategoryAmount} 
      />
    );
  }

  return (
    <WebDashboard 
      kpis={kpis} 
      categoryTotals={categoryTotals} 
      totalCategoryAmount={totalCategoryAmount}
      chartData={chartData}
    />
  );
}
