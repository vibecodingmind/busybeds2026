'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Users, Building2, Ticket, DollarSign, CreditCard, BarChart3, Star, Zap, Shield, Bell, FileText, Gift, Globe, Settings, AlertTriangle, MessageSquare, Map, Briefcase, LogOut, Menu, X } from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/hotels', icon: Building2, label: 'Hotels' },
  { href: '/admin/kyc', icon: Shield, label: 'KYC Review' },
  { href: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
  { href: '/admin/flash-deals', icon: Zap, label: 'Flash Deals' },
  { href: '/admin/gift-cards', icon: Gift, label: 'Gift Cards' },
  { href: '/admin/referral-payouts', icon: Users, label: 'Referrals' },
  { href: '/admin/loyalty', icon: Star, label: 'Loyalty' },
  { href: '/admin/email-campaigns', icon: Bell, label: 'Emails' },
  { href: '/admin/sms', icon: MessageSquare, label: 'SMS' },
  { href: '/admin/blogs', icon: FileText, label: 'Blog' },
  { href: '/admin/faq', icon: FileText, label: 'FAQ' },
  { href: '/admin/fraud', icon: AlertTriangle, label: 'Fraud' },
  { href: '/admin/broadcast', icon: Bell, label: 'Broadcast' },
  { href: '/admin/corporate', icon: Briefcase, label: 'Corporate' },
  { href: '/admin/stay-requests', icon: Map, label: 'Stay Requests' },
  { href: '/admin/activities', icon: Globe, label: 'Activities' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/'); return; }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== 'admin') return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-border bg-card p-4 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-6 px-2">
          <span className="text-xl">🛏️</span>
          <span className="font-bold gradient-text">BusyBeds Admin</span>
        </div>
        <nav className="space-y-0.5 flex-1 overflow-y-auto">
          {ADMIN_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] font-semibold'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-4 mt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={async () => { await logout(); router.push('/login'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛏️</span>
                <span className="font-bold gradient-text">Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <nav className="space-y-0.5">
              {ADMIN_NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] font-semibold'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border p-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}><Menu className="h-5 w-5" /></Button>
          <span className="font-bold text-sm">🛏️ Admin</span>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">{user.fullName}</Badge>
          </div>
        </div>
        <div className="p-4 md:p-6 max-w-full overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
