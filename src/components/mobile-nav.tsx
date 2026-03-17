
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Users, 
  BarChart3,
  LayoutGrid
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/overview', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/livestock', label: 'Sheep', icon: Users },
    { href: '/dashboard/farm-ledger', label: 'Reports', icon: BarChart3 },
    { href: '/dashboard', label: 'Menu', icon: LayoutGrid },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#020617]/80 backdrop-blur-2xl border-t border-white/5 px-2">
      <div className="flex items-center justify-between h-20 max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          // Exact match for the Hub, prefix match for sub-pages
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={index} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1.5 transition-all active:scale-90 h-full",
                isActive ? "text-cyan-400" : "text-white/30"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive ? "bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : ""
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-black tracking-widest uppercase leading-none",
                isActive ? "text-cyan-400 opacity-100" : "text-white/30 opacity-60"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
