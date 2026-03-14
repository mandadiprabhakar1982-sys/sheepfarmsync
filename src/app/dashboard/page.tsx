'use client';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { DashboardSparkleIcon } from '@/components/logo';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const { userRole, isLoadingProfile } = useFarm();
  const isAdmin = userRole === 'admin';

  const menuItems = [
    {
      title: "OVERVIEW ANALYTICS",
      iconId: 'dash-analytics',
      href: '/dashboard/overview',
      borderColor: 'border-blue-200',
      activeColor: 'text-blue-500',
    },
    {
      title: "MONTHLY LEDGER",
      iconId: 'dash-ledger',
      href: '/dashboard/monthly-ledger',
      borderColor: 'border-purple-200',
      activeColor: 'text-purple-500',
      adminOnly: true,
    },
    {
      title: "LIABILITIES",
      iconId: 'dash-liabilities',
      href: '/dashboard/balance-sheet',
      borderColor: 'border-neutral-200',
      activeColor: 'text-neutral-500',
      adminOnly: true,
    },
    {
      title: "FLOCK",
      iconId: 'dash-flock',
      href: '/dashboard/livestock',
      borderColor: 'border-emerald-200',
      activeColor: 'text-emerald-500',
    },
    {
      title: "PURCHASES & SALES",
      iconId: 'dash-sales',
      href: '/dashboard/sales',
      borderColor: 'border-green-200',
      activeColor: 'text-green-500',
    },
    {
      title: "HEALTH",
      iconId: 'dash-health',
      href: '/dashboard/medicine',
      borderColor: 'border-red-200',
      activeColor: 'text-red-500',
    },
    {
      title: "FEED",
      iconId: 'dash-feed',
      href: '/dashboard/feed',
      borderColor: 'border-green-200',
      activeColor: 'text-green-500',
    },
    {
      title: "LABOR",
      iconId: 'dash-labor',
      href: '/dashboard/labor',
      borderColor: 'border-orange-200',
      activeColor: 'text-orange-500',
    },
    {
      title: "EXPENSES",
      iconId: 'dash-expenses',
      href: '/dashboard/expenses',
      borderColor: 'border-blue-200',
      activeColor: 'text-blue-500',
    },
  ];

  if (isLoadingProfile) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <div className="w-full max-w-6xl glass-panel rounded-[2rem] p-10 lg:p-12 relative overflow-hidden">
        {/* Header Block */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-start gap-6">
            <DashboardSparkleIcon className="bg-neutral-900 h-14 w-14 rounded-2xl" />
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
                SYSTEM COMMAND HUB
              </h1>
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                SYNCHRONIZED OPERATIONAL ENVIRONMENT
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black text-neutral-900 tracking-tighter">100</div>
            <Select defaultValue="identity">
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white border-neutral-100 shadow-sm font-bold text-xs">
                <SelectValue placeholder="Identity (Select)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="identity">Identity (Select)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tactical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {menuItems.map((item, index) => {
            if (item.adminOnly && !isAdmin) return null;
            const icon = PlaceHolderImages.find(img => img.id === item.iconId);
            
            return (
              <Link href={item.href} key={index} className="group">
                <div className={cn(
                  "glass-card aspect-[1.1] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden border-1.5",
                  item.borderColor
                )}>
                  {/* Icon Container */}
                  <div className="h-20 w-20 flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110">
                    {icon && (
                      <Image 
                        src={icon.imageUrl} 
                        alt={item.title} 
                        width={64} 
                        height={64} 
                        className="object-contain"
                        data-ai-hint={icon.imageHint}
                      />
                    )}
                  </div>
                  
                  <h3 className="card-title-precise uppercase px-2 leading-tight">
                    {item.title}
                  </h3>

                  {/* Decorative Elements */}
                  <div className="absolute bottom-3 left-4 text-[8px] font-black text-neutral-300 uppercase tracking-widest">
                    ...
                  </div>
                  <div className="absolute bottom-3 right-4 text-[8px] font-black text-neutral-300 uppercase tracking-widest">
                    ...
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