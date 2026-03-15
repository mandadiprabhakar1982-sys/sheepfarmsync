
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFarm } from '@/context/FarmContext';
import { 
  HubSparkle,
  IconOverview,
  IconLedger,
  IconLiabilities,
  IconFlock,
  IconTrade,
  IconHealth,
  IconFeed,
  IconLabor,
  IconExpenses
} from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { 
    userRole, 
    isLoading
  } = useFarm();
  
  const isAdmin = userRole === 'admin';

  const groups = [
    {
      items: [
        { 
          title: "OVERVIEW", 
          subtitle: "ANALYTICS ENGINE", 
          icon: IconOverview, 
          imageId: "dash-analytics",
          href: '/dashboard/overview'
        },
        { 
          title: "MONTHLY LEDGER", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLedger, 
          imageId: "dash-ledger",
          href: '/dashboard/monthly-ledger',
          adminOnly: true
        },
        { 
          title: "LIABILITIES", 
          subtitle: "PRIVATE PROJECT", 
          icon: IconLiabilities, 
          imageId: "dash-liabilities",
          href: '/dashboard/balance-sheet',
          adminOnly: true
        },
        { 
          title: "FLOCK", 
          subtitle: "LIVESTOCK ASSETS", 
          icon: IconFlock, 
          imageId: "dash-flock",
          href: '/dashboard/livestock'
        },
        { 
          title: "TRADE LEDGER", 
          subtitle: "BUY & DISPOSAL", 
          icon: IconTrade, 
          imageId: "dash-sales",
          href: '/dashboard/sales'
        },
        { 
          title: "MEDICINES", 
          subtitle: "HEALTH & CLINICAL", 
          icon: IconHealth, 
          imageId: "dash-health",
          href: '/dashboard/medicine'
        },
        { 
          title: "FEED", 
          subtitle: "GRAIN INVENTORY", 
          icon: IconFeed, 
          imageId: "dash-feed",
          href: '/dashboard/feed'
        },
        { 
          title: "LABOR", 
          subtitle: "STAFF OPERATIONS", 
          icon: IconLabor, 
          imageId: "dash-labor",
          href: '/dashboard/labor'
        },
        { 
          title: "EXPENSES", 
          subtitle: "OVERHEAD AUDIT", 
          icon: IconExpenses, 
          imageId: "dash-expenses",
          href: '/dashboard/expenses'
        },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full border-t-primary animate-spin" />
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">SYNCING COMMAND HUB...</p>
        </div>
      </div>
    );
  }

  const HubCard = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const imageData = PlaceHolderImages.find(img => img.id === item.imageId);
    
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="hub-card w-full h-[240px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 border border-slate-100 hover:border-primary/40 hover:-translate-y-2 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden">
          {/* Background Hint Image */}
          {imageData && (
            <div className="absolute inset-0 z-0 opacity-[0.08] grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700">
              <Image 
                src={imageData.imageUrl} 
                alt={imageData.description}
                fill
                className="object-cover"
                data-ai-hint={imageData.imageHint}
              />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-primary/5 z-1" />
          
          <div className="p-5 rounded-[2rem] flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-500 shadow-inner bg-primary/10">
            <Icon className="h-14 w-14 text-primary" />
          </div>
          
          <div className="text-center relative z-10">
            <h3 className="text-[14px] font-black text-slate-900 tracking-wider leading-none mb-2 uppercase">{item.title}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-8 mb-16">
        <HubSparkle />
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            SYSTEM COMMAND HUB
          </h1>
          <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em]">
            SYNCHRONIZED OPERATIONAL ENVIRONMENT
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {groups[0].items.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-24 border-t border-slate-200 pt-10 opacity-40">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">SYNC PRO ENTERPRISE</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Tactical v4.5.0 Deployment</p>
          </div>
          <div className="h-8 w-8 rounded-full border-2 border-slate-200 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
