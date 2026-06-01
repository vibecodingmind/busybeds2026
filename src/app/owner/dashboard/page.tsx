'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket, Star, Clock, MessageSquare, BarChart3, Edit } from 'lucide-react';

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
        <Link href="/owner/edit"><Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground"><Edit className="h-4 w-4 mr-2" /> Edit Hotel</Button></Link>
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
        <Link href="/become-host">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Edit className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-semibold mb-1">Hotel Profile</h3>
            <p className="text-sm text-muted-foreground">Update your hotel details and photos</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
