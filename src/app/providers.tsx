'use client';

import React from 'react';
import { CloseProvider } from './close/CloseContext';
import AppShell from './components/AppShell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CloseProvider>
      <AppShell>{children}</AppShell>
    </CloseProvider>
  );
}
