'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  LayoutGrid, 
  ArrowRightLeft, 
  Receipt, 
  Menu 
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * @fileOverview Native-style bottom navigation for mobile devices.
 * Designed to provide an "App Store" feel on iOS and Android.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const links = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/livestock', label: 'Flock', icon: LayoutGrid },
    { href: '/dashboard/sales', label: 'Trade', icon: ArrowRightLeft },
    { href: '/dashboard/expenses', label: 'Costs', icon: Receipt },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2">
      {/* Container for links with safe area handling */}
      <div className="flex items-center justify-between h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all active:scale-90 h-full",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-colors",
                isActive ? "bg-primary/5" : "bg-transparent"
              )}>
                <link.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tight leading-none",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
        
        {/* Toggle full sidebar menu */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleSidebar();
          }}
          className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 active:scale-90 h-full"
        >
          <div className="p-1 rounded-xl bg-transparent">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight leading-none opacity-60">More</span>
        </button>
      </div>
      
      {/* Bottom spacer for iOS Home Indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}