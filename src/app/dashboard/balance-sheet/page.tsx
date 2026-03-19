'use client';

import { Shell } from '@/components/shared/Shell';
import { BalanceSheetModule } from '@/projects/private-admin/BalanceSheetModule';

export default function BalanceSheetPage() {
  return (
    <Shell>
      <div className="container mx-auto py-8">
        <BalanceSheetModule />
      </div>
    </Shell>
  );
}
