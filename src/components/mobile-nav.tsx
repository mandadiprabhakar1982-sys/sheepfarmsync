'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, BarChart3, Heart, Scale } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'HUB', icon: LayoutDashboard },
    { href: '/sheep', label: 'FLOCK', icon: Users },
    { href: '/ledger', label: 'AUDIT', icon: BarChart3 },
    { href: '/health', label: 'HEALTH', icon: Heart },
    { href: '/weight', label: 'WEIGHT', icon: Scale },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#081122]/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-50 rounded-t-3xl safe-bottom">
      <div className="flex items-center justify-between w-full h-full px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href} className={cn("flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 flex-1 h-full relative", isActive ? "text-[#14d5c7]" : "text-white/30")}>
              <div className={cn("relative p-2 rounded-2xl transition-all", isActive ? "bg-[#14d5c7]/10" : "")}>
                <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn("text-[8px] font-black tracking-[0.15em] uppercase leading-none", isActive ? "opacity-100" : "opacity-40")}>{item.label}</span>
              {isActive && <div className="absolute bottom-2 w-6 h-0.5 bg-[#14d5c7] rounded-full shadow-[0_0_10px_#14d5c7]" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}