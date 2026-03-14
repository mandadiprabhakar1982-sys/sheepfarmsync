'use client';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { DashboardSparkleIcon } from '@/components/logo';

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      title: "OVERVIEW",
      subtitle: "ANALYTICS",
      iconId: 'dash-analytics',
      href: '/dashboard/overview',
      color: 'bg-blue-500',
      borderClass: 'card-analytics',
    },
    {
      title: "MONTHLY",
      subtitle: "LEDGER",
      iconId: 'dash-ledger',
      href: '/dashboard/monthly-ledger',
      color: 'bg-purple-500',
      adminOnly: true,
    },
    {
      title: "LIABILITY",
      subtitle: "PORTFOLIO",
      iconId: 'dash-liabilities',
      href: '/dashboard/balance-sheet',
      color: 'bg-slate-700',
      adminOnly: true,
    },
    {
      title: "FLOCK",
      subtitle: "REGISTRY",
      iconId: 'dash-flock',
      href: '/dashboard/livestock',
      color: 'bg-cyan-500',
    },
    {
      title: "TRADE",
      subtitle: "LEDGER",
      iconId: 'dash-sales',
      href: '/dashboard/sales',
      color: 'bg-green-500',
      borderClass: 'card-sales',
    },
    {
      title: "HEALTH",
      subtitle: "TRACK",
      iconId: 'dash-health',
      href: '/dashboard/medicine',
      color: 'bg-red-500',
      borderClass: 'card-health',
    },
    {
      title: "FEED",
      subtitle: "PROCUREMENT",
      iconId: 'dash-feed',
      href: '/dashboard/feed',
      color: 'bg-lime-500',
      borderClass: 'card-feed',
    },
    {
      title: "LABOR",
      subtitle: "DISBURSEMENTS",
      iconId: 'dash-labor',
      href: '/dashboard/labor',
      color: 'bg-orange-500',
    },
    {
      title: "EXPENSES",
      subtitle: "OVERHEADS",
      iconId: 'dash-expenses',
      href: '/dashboard/expenses',
      color: 'bg-slate-500',
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-6 lg:p-12">
      <div className="w-full max-w-7xl">
        {/* Header Block */}
        <div className="flex items-start gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <DashboardSparkleIcon className="bg-neutral-900" />
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">
              SYSTEM COMMAND HUB
            </h1>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em]">
              SYNCHRONIZED OPERATIONAL ENVIRONMENT
            </p>
          </div>
        </div>

        {/* 4-Column Tactical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {menuItems.map((item, index) => {
            if (item.adminOnly && !isAdmin) return null;
            const icon = PlaceHolderImages.find(img => img.id === item.iconId);
            
            return (
              <Link href={item.href} key={index} className="group">
                <div className={cn(
                  "glass-card h-[240px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden",
                  item.borderClass
                )}>
                  {/* Icon Container */}
                  <div className={cn(
                    "h-24 w-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-transform duration-500 group-hover:scale-110",
                    item.color
                  )}>
                    {icon && (
                      <Image 
                        src={icon.imageUrl} 
                        alt={item.title} 
                        width={56} 
                        height={56} 
                        className="drop-shadow-2xl object-contain invert brightness-0"
                        data-ai-hint={icon.imageHint}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-1 relative z-10 w-full">
                    <h3 className="card-title-precise text-neutral-900 uppercase">
                      {item.title}
                    </h3>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute bottom-6 left-8 text-[8px] font-black text-neutral-200 uppercase tracking-widest">
                    ...
                  </div>
                  <div className="absolute bottom-6 right-8 text-[8px] font-black text-neutral-200 uppercase tracking-widest">
                    109
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}