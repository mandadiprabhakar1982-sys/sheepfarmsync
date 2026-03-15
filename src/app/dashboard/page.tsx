'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const cards = [
    { 
      title: "FLOCK", 
      subtitle: "Livestock Tracking", 
      icon: "🐑", 
      color: "#2D5A27", 
      href: '/dashboard/livestock' 
    },
    { 
      title: "MEDICINE", 
      subtitle: "Expense Logs", 
      icon: "💊", 
      color: "#D32F2F", 
      href: '/dashboard/medicine' 
    },
    { 
      title: "FEED", 
      subtitle: "Inventory", 
      icon: "🌾", 
      color: "#795548", 
      href: '/dashboard/feed' 
    },
    { 
      title: "LABOR", 
      subtitle: "Staff Management", 
      icon: "👨‍🌾", 
      color: "#F57C00", 
      href: '/dashboard/labor' 
    },
    { 
      title: "SALES", 
      subtitle: "Market Data", 
      icon: "📈", 
      color: "#1976D2", 
      href: '/dashboard/sales' 
    },
    { 
      title: "LOSS LOG", 
      subtitle: "Mortality Tracker", 
      icon: "📉", 
      color: "#455A64", 
      href: '/dashboard/mortality' 
    },
    { 
      title: "LEDGER", 
      subtitle: "Private Assets", 
      icon: "📒", 
      color: "#15803d", 
      href: '/dashboard/monthly-ledger', 
      adminOnly: true 
    },
    { 
      title: "DEBT", 
      subtitle: "Liability Portfolio", 
      icon: "🏦", 
      color: "#166534", 
      href: '/dashboard/balance-sheet', 
      adminOnly: true 
    },
  ];

  const BentoCard = ({ item }: { item: any }) => {
    if (item.adminOnly && !isAdmin) return null;

    return (
      <Link href={item.href} className="group block w-full sm:w-[48%] lg:w-[31%] xl:w-[23%]">
        <div className="bento-card">
          <div 
            className="icon-blob" 
            style={{ backgroundColor: `${item.color}15` }}
          >
            <span className="text-3xl">{item.icon}</span>
          </div>
          
          <div className="space-y-1 mb-2">
            <h3 className="text-sm font-black text-[#1A1A1A] tracking-tight uppercase">
              {item.title}
            </h3>
            <p className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-wide">
              {item.subtitle}
            </p>
          </div>

          <div 
            className="card-indicator" 
            style={{ backgroundColor: item.color }} 
          />
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-full py-8 px-4 sm:px-8 animate-in fade-in duration-700">
      <div className="w-full max-w-[1400px] mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col gap-1 pl-2">
          <h1 className="text-2xl font-black text-[#2D5A27] tracking-wider uppercase">
            SHEEPSYNC PRO
          </h1>
          <p className="text-[12px] font-bold text-[#9E9E9E] uppercase tracking-widest leading-none">
            Management Hub
          </p>
        </div>

        {/* Bento Grid */}
        <div className="flex flex-wrap gap-6 justify-start items-stretch">
          {cards.map((item, idx) => (
            <BentoCard key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}