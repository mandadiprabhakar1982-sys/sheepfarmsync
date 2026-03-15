'use client';

import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { 
  SheepIcon, 
  HighFidelityHealth, 
  HighFidelityFeed, 
  HighFidelityLabor, 
  HighFidelityOverview,
  HighFidelityLedger,
  HighFidelityLiabilities
} from '@/components/logo';
import { TrendingUp, Skull, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const { userRole } = useFarm();
  const isAdmin = userRole === 'admin';

  const groups = [
    {
      label: "PUBLIC PROJECT ASSETS",
      items: [
        { 
          title: "FLOCK", 
          subtitle: "Livestock Tracking", 
          icon: SheepIcon, 
          color: "#2D5A27", 
          href: '/dashboard/livestock' 
        },
        { 
          title: "MEDICINE", 
          subtitle: "Expense Logs", 
          icon: HighFidelityHealth, 
          color: "#D32F2F", 
          href: '/dashboard/medicine' 
        },
        { 
          title: "FEED", 
          subtitle: "Inventory", 
          icon: HighFidelityFeed, 
          color: "#795548", 
          href: '/dashboard/feed' 
        },
        { 
          title: "LABOR", 
          subtitle: "Staff Management", 
          icon: HighFidelityLabor, 
          color: "#F57C00", 
          href: '/dashboard/labor' 
        },
        { 
          title: "SALES", 
          subtitle: "Market Data", 
          icon: TrendingUp, 
          color: "#1976D2", 
          href: '/dashboard/sales' 
        },
        { 
          title: "LOSS LOG", 
          subtitle: "Mortality Tracker", 
          icon: Skull, 
          color: "#455A64", 
          href: '/dashboard/mortality' 
        },
      ]
    },
    {
      label: "PRIVATE PROJECT ASSETS",
      adminOnly: true,
      items: [
        { 
          title: "LEDGER", 
          subtitle: "Private Assets", 
          icon: HighFidelityLedger, 
          color: "#15803d", 
          href: '/dashboard/monthly-ledger' 
        },
        { 
          title: "DEBT", 
          subtitle: "Liability Portfolio", 
          icon: HighFidelityLiabilities, 
          color: "#166534", 
          href: '/dashboard/balance-sheet' 
        },
      ]
    }
  ];

  const BentoCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    return (
      <Link href={item.href} className="group flex flex-col items-center w-full sm:w-[48%] lg:w-[31%] xl:w-[23%] gap-6">
        {/* The GIF Squircle Card */}
        <div 
          className="squircle-card"
          style={{ backgroundColor: `${item.color}15` }}
        >
          <div className="p-6 rounded-[32px] bg-white shadow-xl mb-2 transition-transform duration-500 group-hover:scale-110">
            <Icon className="h-16 w-16" style={{ color: item.color }} />
          </div>
          <h3 className="text-2xl font-black tracking-[0.1em] uppercase" style={{ color: item.color }}>
            {item.title}
          </h3>
        </div>
        
        {/* External Label Label */}
        <p className="text-[11px] font-black text-[#9E9E9E] uppercase tracking-[0.3em] text-center px-4">
          {item.subtitle}
        </p>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-full py-12 px-6 sm:px-12 animate-in fade-in duration-700">
      <div className="w-full max-w-[1600px] mx-auto space-y-20">
        {/* Header Section */}
        <div className="flex flex-col gap-2 pl-4 border-l-8 border-[#2D5A27]">
          <h1 className="text-4xl font-black text-[#2D5A27] tracking-tighter uppercase">
            SHEEPSYNC PRO
          </h1>
          <p className="text-[14px] font-bold text-[#9E9E9E] uppercase tracking-[0.4em] leading-none">
            Management Hub
          </p>
        </div>

        {/* Dynamic Groups */}
        {groups.map((group, gIdx) => {
          if (group.adminOnly && !isAdmin) return null;
          
          return (
            <div key={gIdx} className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-[#9E9E9E] whitespace-nowrap">
                  {group.label}
                </h2>
                <div className="h-px w-full bg-[#EDEDED]" />
              </div>
              
              <div className="flex flex-wrap gap-x-8 gap-y-16 justify-start items-start">
                {group.items.map((item, idx) => (
                  <BentoCard key={idx} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}