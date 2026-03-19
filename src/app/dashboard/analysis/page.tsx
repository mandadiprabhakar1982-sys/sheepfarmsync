'use client';

import { Shell } from '@/components/shared/Shell';
import { AnalysisModule } from '@/projects/private-admin/AnalysisModule';

export default function AnalysisPage() {
  return (
    <Shell>
      <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl">
        <AnalysisModule />
      </div>
    </Shell>
  );
}
