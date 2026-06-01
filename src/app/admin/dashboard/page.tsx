'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, Ticket, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import type { AdminAnalytics } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(d => { setStats(d.data); setLoading(false); });
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-emerald' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: CreditCard, color: 'text-blue-500' },
    { label: 'Hotels', value: stats?.totalHotels || 0, icon: Building2, color: 'text-gold' },
    { label: 'Total Coupons', value: stats?.totalCoupons || 0, icon: Ticket, color: 'text-purple-500' },
    { label: 'Redemptions', value: stats?.totalRedemptions || 0, icon: TrendingUp, color: 'text-pink-500' },
    { label: 'Monthly Revenue', value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />) :
          cards.map(card => (
            <Card key={card.label} className="p-4">
              <card.icon className={`h-6 w-6 ${card.color} mb-2`} />
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </Card>
          ))
        }
      </div>
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Today&apos;s Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">New Users</span><span className="font-semibold">{stats?.usersToday || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Coupons Generated</span><span className="font-semibold">{stats?.couponsToday || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Redemptions</span><span className="font-semibold">{stats?.redemptionsToday || 0}</span></div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <a href="/admin/broadcast" className="p-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors text-center">📢 Broadcast</a>
            <a href="/admin/flash-deals" className="p-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors text-center">⚡ Flash Deal</a>
            <a href="/admin/gift-cards" className="p-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors text-center">🎁 Gift Card</a>
            <a href="/admin/kyc" className="p-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors text-center">🛡️ KYC Queue</a>
          </div>
        </Card>
      </div>
    </div>
  );
}
