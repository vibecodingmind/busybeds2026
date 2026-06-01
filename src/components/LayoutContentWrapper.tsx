'use client';

import { useLayout } from '@/context/LayoutContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomTabBar } from '@/components/BottomTabBar';

/**
 * LayoutContentWrapper — Conditionally renders the public AppHeader
 * and BottomTabBar based on the current route.
 * Admin and owner routes get a clean layout without public chrome.
 */
export function LayoutContentWrapper({ children }: { children: React.ReactNode }) {
  const { hideChrome } = useLayout();

  if (hideChrome) {
    // Admin/owner routes: no public header, no bottom tab bar
    return <main className="flex-1">{children}</main>;
  }

  // Public routes: show header + bottom bar + bottom padding
  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-20">{children}</main>
      <BottomTabBar />
    </>
  );
}
