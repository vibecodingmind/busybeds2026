'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Users, Building2, Ticket, CreditCard, Loader2, Activity } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  mrrGrowth: number;
  churnRate: number;
  activeSubscriptions: number;
  totalUsers: number;
  totalHotels: number;
  totalCoupons: number;
  totalRedemptions: number;
  totalTransactions: number;
  revenueByMethod: { stripe: number; paypal: number; pesapal: number };
  subDistribution: { packageId: string; count: number }[];
  recentTransactions: { id: string; amount: number; currency: string; type: string; description?: string; createdAt: string; user?: { fullName: string } }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
    }).catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Failed to load analytics</div>;

  const stats = [
    { label: 'Total Revenue', value: `$${data.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'MRR', value: `$${data.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', sub: `${data.mrrGrowth >= 0 ? '+' : ''}${data.mrrGrowth}%` },
    { label: 'Churn Rate', value: `${data.churnRate}%`, icon: TrendingDown, color: data.churnRate > 5 ? 'text-red-600' : 'text-green-600' },
    { label: 'Active Subs', value: data.activeSubscriptions.toString(), icon: CreditCard, color: 'text-purple-600' },
    { label: 'Total Users', value: data.totalUsers.toString(), icon: Users, color: 'text-amber-600' },
    { label: 'Hotels', value: data.totalHotels.toString(), icon: Building2, color: 'text-teal-600' },
    { label: 'Coupons', value: data.totalCoupons.toString(), icon: Ticket, color: 'text-pink-600' },
    { label: 'Redemptions', value: data.totalRedemptions.toString(), icon: Activity, color: 'text-indigo-600' },
  ];

  const methodTotal = data.revenueByMethod.stripe + data.revenueByMethod.paypal + data.revenueByMethod.pesapal || 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="h-6 w-6 text-[#ea4d60]" /> Advanced Analytics</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} /> {s.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">{s.value}</span>
                {s.sub && <span className={`text-xs ${s.sub.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{s.sub}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by Payment Method */}
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Stripe', amount: data.revenueByMethod.stripe, color: 'bg-blue-500' },
              { label: 'PayPal', amount: data.revenueByMethod.paypal, color: 'bg-amber-500' },
              { label: 'Pesapal', amount: data.revenueByMethod.pesapal, color: 'bg-green-500' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{m.label}</span>
                  <span className="font-medium">${m.amount.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full`} style={{ width: `${(m.amount / methodTotal * 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Active Subscriptions by Package</CardTitle></CardHeader>
          <CardContent>
            {data.subDistribution.length > 0 ? (
              <div className="space-y-2">
                {data.subDistribution.map((s, i) => (
                  <div key={s.packageId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">{s.packageId.replace('pkg-', '').replace(/^\w/, c => c.toUpperCase())}</span>
                    <Badge>{s.count} active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No active subscriptions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {data.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {data.recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{tx.user?.fullName || 'Unknown'} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+${tx.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
