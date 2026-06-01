'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Building2, Ticket, DollarSign, CreditCard, BarChart3, Star, Zap, Shield, Bell, FileText, Gift, Globe, Settings, AlertTriangle, MessageSquare, Map, Briefcase } from 'lucide-react';

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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/'); return; }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== 'admin') return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-4 hidden lg:block overflow-y-auto">
        <div className="flex items-center gap-2 mb-6 px-2">
          <span className="text-xl">🛏️</span>
          <span className="font-bold gradient-text">BusyBeds Admin</span>
        </div>
        <nav className="space-y-1">
          {ADMIN_NAV.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors">
              <item.icon className="h-4 w-4 text-muted-foreground" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile header + content */}
      <div className="flex-1">
        <div className="lg:hidden border-b border-border p-3 flex items-center gap-3 overflow-x-auto">
          <span className="font-bold text-sm shrink-0">🛏️ Admin</span>
          <div className="flex gap-1 overflow-x-auto">
            {ADMIN_NAV.slice(0, 8).map(item => (
              <Link key={item.href} href={item.href} className="shrink-0">
                <Badge variant="outline" className="text-xs">{item.label}</Badge>
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
