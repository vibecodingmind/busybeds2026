'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket, Heart, Star, Clock, MessageSquare, Zap, Award, Users, Settings, ChevronRight } from 'lucide-react';
import type { Coupon, StayRequest } from '@/types';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stayRequests, setStayRequests] = useState<StayRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      Promise.all([
        fetch('/api/coupons?limit=10').then(r => r.json()),
        fetch('/api/stay-requests?limit=5').then(r => r.json()),
      ]).then(([couponData, stayData]) => {
        setCoupons(couponData.data || []);
        setStayRequests(stayData.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 w-full" /></div>;

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const redeemedCoupons = coupons.filter(c => c.status === 'redeemed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-emerald">
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="font-semibold text-lg">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-2 capitalize">{user.role}</Badge>
            </div>
            <nav className="space-y-1 mt-4">
              {[
                { href: '/profile', icon: Ticket, label: 'Dashboard' },
                { href: '/favorites', icon: Heart, label: 'Favorites' },
                { href: '/loyalty', icon: Zap, label: 'Loyalty Points' },
                { href: '/affiliates', icon: Users, label: 'Affiliates' },
                { href: '/messages', icon: MessageSquare, label: 'Messages' },
                { href: '/badges', icon: Award, label: 'Badges' },
                { href: '/settings', icon: Settings, label: 'Settings' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors">
                  <item.icon className="h-4 w-4 text-muted-foreground" /> {item.label}
                </Link>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Coupons', value: activeCoupons.length, icon: Ticket, color: 'text-emerald' },
              { label: 'Redeemed', value: redeemedCoupons.length, icon: Star, color: 'text-gold' },
              { label: 'Stay Requests', value: stayRequests.length, icon: Clock, color: 'text-blue-500' },
              { label: 'Points', value: 0, icon: Zap, color: 'text-purple-500' },
            ].map(stat => (
              <Card key={stat.label} className="p-4">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="coupons">
            <TabsList>
              <TabsTrigger value="coupons">My Coupons</TabsTrigger>
              <TabsTrigger value="stays">Stay Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="coupons" className="mt-6">
              {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div> : (
                activeCoupons.length > 0 || redeemedCoupons.length > 0 ? (
                  <div className="space-y-3">
                    {[...activeCoupons, ...redeemedCoupons].map(coupon => (
                      <Card key={coupon.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                              <Ticket className="h-5 w-5 text-gold" />
                            </div>
                            <div>
                              <p className="font-semibold">{coupon.hotel?.name || 'Hotel'}</p>
                              <p className="text-sm text-muted-foreground font-mono">{coupon.code}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={coupon.status === 'active' ? 'bg-emerald text-emerald-foreground' : 'bg-muted text-muted-foreground'}>
                              {coupon.status}
                            </Badge>
                            <p className="text-lg font-bold text-emerald mt-1">{coupon.discountPercent}% OFF</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">No coupons yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Subscribe to a plan and generate your first discount coupon!</p>
                    <Link href="/hotels"><Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground">Browse Hotels</Button></Link>
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="stays" className="mt-6">
              {stayRequests.length > 0 ? (
                <div className="space-y-3">
                  {stayRequests.map(sr => (
                    <Card key={sr.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Stay Request</p>
                          <p className="text-sm text-muted-foreground">{new Date(sr.checkIn).toLocaleDateString()} - {new Date(sr.checkOut).toLocaleDateString()}</p>
                        </div>
                        <Badge className={sr.status === 'approved' ? 'bg-emerald text-emerald-foreground' : sr.status === 'declined' ? 'bg-destructive text-white' : 'bg-gold text-gold-foreground'}>
                          {sr.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No stay requests</h3>
                  <p className="text-sm text-muted-foreground">Submit a stay request for any hotel.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
