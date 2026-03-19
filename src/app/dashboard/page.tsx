'use client';

import { Shell } from '@/components/shared/Shell';
import { WebDashboard } from '@/components/web/WebDashboard';
import { MobileDashboard } from '@/components/mobile/MobileDashboard';
import { useWindowDimensions } from '@/hooks/use-mobile';

export default function DashboardPage() {
  const { width, isHydrated } = useWindowDimensions();
  const isMobile = isHydrated ? width < 768 : false;

  return (
    <Shell>
      {isMobile ? <MobileDashboard /> : <WebDashboard />}
    </Shell>
  );
}