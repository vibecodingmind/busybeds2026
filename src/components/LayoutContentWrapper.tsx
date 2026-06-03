'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Compass, Ticket, Heart, User, Building2 } from 'lucide-react';

const DESKTOP_NAV_ITEMS = [
  { href: '/', label: 'Explore', icon: Compass, matchExact: true },
  { href: '/coupon-history', label: 'Coupons', icon: Ticket, matchExact: false },
  { href: '/favorites', label: 'Saved', icon: Heart, matchExact: false },
  { href: '/profile', label: 'Profile', icon: User, matchExact: false },
  { href: '/owner/register', label: 'Become a Host', icon: Building2, matchExact: false, highlight: true },
];

/**
 * DesktopNavBar — Horizontal nav bar shown below the header on lg+ screens.
 * Replaces the mobile bottom tab bar on desktop.
 */
function DesktopNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (item: typeof DESKTOP_NAV_ITEMS[number]) => {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const getHref = (item: typeof DESKTOP_NAV_ITEMS[number]) => {
    if (item.href === '/coupon-history' && !user) return '/subscribe';
    if (item.href === '/favorites' && !user) return '/login';
    if (item.href === '/profile' && !user) return '/login';
    return item.href;
  };

  return (
    <nav className="hidden lg:block bg-white dark:bg-[#1a1d27] border-b border-gray-100 dark:border-gray-800 sticky top-14 z-40">
      <div className="max-w-[1440px] mx-auto px-8 py-2 flex items-center justify-center gap-6">
        {DESKTOP_NAV_ITEMS.map(item => {
          const active = isActive(item);
          const href = getHref(item);

          return (
            <Link
              key={item.label}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                item.highlight
                  ? 'text-[#C8932A] hover:bg-[#C8932A]/10 dark:text-[#C8932A]'
                  : active
                    ? 'text-[#0E5C3B] dark:text-[#10b981] bg-[#0E5C3B]/5 dark:bg-[#10b981]/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#0E5C3B] dark:hover:text-[#10b981] hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * LayoutContentWrapper — Conditionally renders the public AppHeader
 * and navigation based on the current route.
 * - Admin and owner routes: clean layout without public chrome.
 * - Mobile: AppHeader + BottomTabBar (with pb-20 padding)
 * - Desktop (lg+): AppHeader + DesktopNavBar (no bottom tab bar, no extra padding)
 */
export function LayoutContentWrapper({ children }: { children: React.ReactNode }) {
  const { hideChrome } = useLayout();

  if (hideChrome) {
    // Admin/owner routes: no public header, no navigation
    return <main className="flex-1">{children}</main>;
  }

  // Public routes: show header + desktop nav + bottom tab bar (mobile only)
  return (
    <>
      <AppHeader />
      <DesktopNavBar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <BottomTabBar />
    </>
  );
}
