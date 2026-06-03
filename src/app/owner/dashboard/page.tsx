'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket, Star, Clock, MessageSquare, BarChart3, Edit, Plus, Building2, Hotel } from 'lucide-react';

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || !['owner', 'manager'].includes(user.role))) { router.push('/'); return; }
    if (user) fetch('/api/host/stats').then(r => r.json()).then(d => setStats(d.data));
  }, [user, authLoading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
          <p className="text-muted-foreground">Manage your hotel, coupons, and reviews</p>
        </div>
        <div className="flex gap-2">
          <Link href="/owner/onboard">
            <Button className="bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Hotel
            </Button>
          </Link>
          <Link href="/owner/edit">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Edit Hotel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Coupons', value: stats?.totalCoupons || 0, icon: Ticket, color: 'text-emerald' },
          { label: 'Active Coupons', value: stats?.activeCoupons || 0, icon: Clock, color: 'text-blue-500' },
          { label: 'Redemptions', value: stats?.totalRedemptions || 0, icon: Star, color: 'text-gold' },
          { label: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: MessageSquare, color: 'text-purple-500' },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/owner/reviews">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <MessageSquare className="h-8 w-8 text-emerald mb-3" />
            <h3 className="font-semibold mb-1">Reviews</h3>
            <p className="text-sm text-muted-foreground">View and reply to guest reviews</p>
          </Card>
        </Link>
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <BarChart3 className="h-8 w-8 text-gold mb-3" />
          <h3 className="font-semibold mb-1">Analytics</h3>
          <p className="text-sm text-muted-foreground">View coupon and redemption trends</p>
        </Card>
        <Link href="/owner/onboard">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-[#0E5C3B]/30 dark:border-[#10b981]/30">
            <Plus className="h-8 w-8 text-[#0E5C3B] dark:text-[#10b981] mb-3" />
            <h3 className="font-semibold mb-1">Add Another Hotel</h3>
            <p className="text-sm text-muted-foreground">List a new property on BusyBeds</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
