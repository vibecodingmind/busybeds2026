'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  Compass, Ticket, User, Heart,
} from 'lucide-react';

const TABS = [
  { href: '/', label: 'Explore', icon: Compass, matchExact: true },
  { href: '/coupon-history', label: 'Coupons', icon: Ticket, matchExact: false },
  { href: '/favorites', label: 'Saved', icon: Heart, matchExact: false },
  { href: '/profile', label: 'Profile', icon: User, matchExact: false },
];

/**
 * BottomTabBar — App-style bottom navigation for mobile only.
 * Tabs: Explore | Coupons | Saved | Profile
 * Hidden on lg+ screens (desktop uses DesktopNavBar).
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const isActive = (tab: typeof TABS[number]) => {
    if (tab.matchExact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  };

  const getHref = (tab: typeof TABS[number]) => {
    if (tab.href === '/coupon-history' && !user) return '/subscribe';
    if (tab.href === '/favorites' && !user) return '/login';
    if (tab.href === '/profile' && !user) return '/login';
    return tab.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/60 safe-area-bottom lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map(tab => {
          const active = isActive(tab);
          const href = getHref(tab);
          const isProfile = tab.href === '/profile';

          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 px-2 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-[#0E5C3B] dark:text-[#10b981]'
                  : 'text-gray-400 dark:text-gray-500 active:scale-95'
              }`}
            >
              <div className="relative">
                <tab.icon
                  className={`h-5 w-5 transition-all duration-200 ${active ? 'scale-110' : ''}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {isProfile && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
