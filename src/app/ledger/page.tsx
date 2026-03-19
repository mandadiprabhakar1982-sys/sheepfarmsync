'use client';

import { Shell } from '@/components/shared/Shell';
import { LedgerModule } from '@/projects/public-app/LedgerModule';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function LedgerPage() {
  return (
    <Shell>
      <ErrorBoundary>
        <LedgerModule />
      </ErrorBoundary>
    </Shell>
  );
}
