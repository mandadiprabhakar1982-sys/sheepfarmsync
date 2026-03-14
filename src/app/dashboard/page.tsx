'use client';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      title: "OVERVIEW ANALYTICS",
      iconId: 'dash-analytics',
      href: '/dashboard/overview',
      color: 'bg-blue-500/40',
      glow: 'neon-glow-blue',
      lineColor: 'bg-blue-400',
    },
    {
      title: "MONTHLY LEDGER",
      iconId: 'dash-ledger',
      href: '/dashboard/monthly-ledger',
      color: 'bg-purple-500/40',
      glow: 'neon-glow-purple',
      lineColor: 'bg-purple-400',
      adminOnly: true,
    },
    {
      title: "LIABILITIES",
      iconId: 'dash-liabilities',
      href: '/dashboard/balance-sheet',
      color: 'bg-slate-700/40',
      glow: 'neon-glow-red',
      lineColor: 'bg-red-500',
      adminOnly: true,
    },
    {
      title: "FLOCK",
      iconId: 'dash-flock',
      href: '/dashboard/livestock',
      color: 'bg-cyan-500/40',
      glow: 'neon-glow-cyan',
      lineColor: 'bg-cyan-400',
    },
    {
      title: "PURCHASES & SALES",
      iconId: 'dash-sales',
      href: '/dashboard/sales',
      color: 'bg-green-500/40',
      glow: 'neon-glow-green',
      lineColor: 'bg-green-400',
    },
    {
      title: "HEALTH",
      iconId: 'dash-health',
      href: '/dashboard/medicine',
      color: 'bg-red-500/40',
      glow: 'neon-glow-red',
      lineColor: 'bg-red-400',
    },
    {
      title: "FEED",
      iconId: 'dash-feed',
      href: '/dashboard/feed',
      color: 'bg-lime-500/40',
      glow: 'neon-glow-lime',
      lineColor: 'bg-lime-400',
    },
    {
      title: "LABOR",
      iconId: 'dash-labor',
      href: '/dashboard/labor',
      color: 'bg-orange-500/40',
      glow: 'neon-glow-orange',
      lineColor: 'bg-orange-400',
    },
    {
      title: "EXPENSES",
      iconId: 'dash-expenses',
      href: '/dashboard/expenses',
      color: 'bg-slate-500/40',
      glow: 'neon-glow-steel',
      lineColor: 'bg-slate-400',
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-10">
      <div className="glass-panel w-full max-w-7xl rounded-[3rem] p-10 lg:p-16 relative overflow-hidden">
        {/* Header Block */}
        <div className="flex items-start gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center shadow-2xl border border-white/10 shrink-0">
            <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15 8L22 9L17 14L18 21L12 17L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor"/></svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              SYSTEM COMMAND HUB
            </h1>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
              SYNCHRONIZED OPERATIONAL ENVIRONMENT
            </p>
          </div>
        </div>

        {/* 5-Column Tactical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {menuItems.map((item, index) => {
            if (item.adminOnly && !isAdmin) return null;
            const icon = PlaceHolderImages.find(img => img.id === item.iconId);
            
            return (
              <Link href={item.href} key={index} className="group">
                <div className={cn(
                  "glass-card h-[220px] rounded-[2rem] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden",
                  item.glow
                )}>
                  {/* Glowing Icon Container */}
                  <div className={cn(
                    "h-20 w-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110",
                    item.color
                  )}>
                    {icon && (
                      <Image 
                        src={icon.imageUrl} 
                        alt={item.title} 
                        width={60} 
                        height={60} 
                        className="drop-shadow-2xl object-contain"
                        data-ai-hint={icon.imageHint}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-3 relative z-10 w-full">
                    <h3 className="card-title-precise text-white text-[11px]">
                      {item.title}
                    </h3>
                    <div className={cn("h-0.5 w-12 mx-auto rounded-full", item.lineColor)} />
                  </div>

                  {/* Decorative ID Elements */}
                  <div className="absolute bottom-4 left-6 text-[8px] font-black text-white/20 uppercase tracking-widest">
                    ...
                  </div>
                  <div className="absolute bottom-4 right-6 text-[8px] font-black text-white/20 uppercase tracking-widest">
                    109
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tech decorative line */}
        <div className="absolute top-1/2 right-0 w-32 h-[1px] bg-gradient-to-l from-white/20 to-transparent rotate-[-45deg] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-48 h-[1px] bg-gradient-to-r from-white/20 to-transparent rotate-[30deg] pointer-events-none" />
      </div>
    </div>
  );
}