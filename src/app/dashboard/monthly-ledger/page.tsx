'use client';

import { Shell } from '@/components/shared/Shell';
import { PersonalFinanceModule } from '@/projects/private-admin/PersonalFinanceModule';

export default function PersonalFinancePage() {
  return (
    <Shell>
      <div className="container mx-auto py-8">
        <PersonalFinanceModule />
      </div>
    </Shell>
  );
}
