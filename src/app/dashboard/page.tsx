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
    const imageData = PlaceHolderImages.find(img => img.id === item.imageId);
    
    return (
      <Link href={item.href} className="group transition-all active:scale-95">
        <div className="w-full h-[280px] bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-2 border border-white relative">
          
          {/* Illustration Container */}
          <div className="relative w-32 h-32 mb-2 transition-transform group-hover:scale-110 duration-500">
            {imageData && (
              <Image 
                src={imageData.imageUrl} 
                alt={imageData.description}
                fill
                className="object-contain"
                data-ai-hint={imageData.imageHint}
              />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-[15px] font-black text-slate-900 tracking-wider leading-none mb-2 uppercase">{item.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{item.subtitle}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-6 mb-16">
        <HubSparkle />
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
            MPR SHEEP FARMS
          </h1>
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em]">
            SYNCHRONIZED OPERATIONAL ENVIRONMENT
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {groups[0].items.map((item, idx) => {
          if (item.adminOnly && !isAdmin) return null;
          return <HubCard key={idx} item={item} />;
        })}
      </div>
      
      <div className="mt-24 border-t border-slate-200/60 pt-10 opacity-30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">SYNC PRO ENTERPRISE</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Tactical v4.5.0 Deployment</p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
             <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
