'use client';

import { Shell } from '@/components/shared/Shell';
import { OverviewModule } from '@/projects/public-app/OverviewModule';

export default function DashboardPage() {
  return (
    <Shell>
      <div className="container mx-auto py-8">
        <OverviewModule />
      </div>
    </Shell>
  );
}
