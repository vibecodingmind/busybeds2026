'use client';

import { useLayout } from '@/context/LayoutContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomTabBar } from '@/components/BottomTabBar';

/**
 * LayoutContentWrapper — Conditionally renders the public AppHeader
 * and navigation based on the current route.
 * - Admin and owner routes: clean layout without public chrome.
 * - Mobile: AppHeader + BottomTabBar (with pb-20 padding)
 * - Desktop (lg+): AppHeader only (no middle nav row; nav items in avatar dropdown)
 */
export function LayoutContentWrapper({ children }: { children: React.ReactNode }) {
  const { hideChrome } = useLayout();

  if (hideChrome) {
    // Admin/owner routes: no public header, no navigation
    return <main className="flex-1">{children}</main>;
  }

  // Public routes: show header + bottom tab bar (mobile only)
  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <BottomTabBar />
    </>
  );
}
