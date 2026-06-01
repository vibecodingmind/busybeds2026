'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Ticket, DollarSign, CreditCard, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/analytics').then(r => r.json()).then(d => setStats(d.data)); }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
          { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: CreditCard },
          { label: 'Hotels', value: stats?.totalHotels || 0, icon: Building2 },
          { label: 'Coupons', value: stats?.totalCoupons || 0, icon: Ticket },
          { label: 'Redemptions', value: stats?.totalRedemptions || 0, icon: TrendingUp },
          { label: 'Revenue', value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign },
        ].map(card => (
          <Card key={card.label} className="p-4">
            <card.icon className="h-5 w-5 text-emerald mb-2" />
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
