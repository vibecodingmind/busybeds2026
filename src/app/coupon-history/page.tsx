'use client';

import { useEffect, useState } from 'react';
import { useCoupons } from '@/lib/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket } from 'lucide-react';
import type { Coupon } from '@/types';

export default function CouponHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: swrCoupons, isLoading } = useCoupons(100);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (swrCoupons) setCoupons(swrCoupons);
  }, [swrCoupons]);

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="w-8 h-8 border-3 border-[#0E5C3B]/30 border-t-[#0E5C3B] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Coupon History</h1>
      {coupons.length > 0 ? (
        <div className="space-y-2">
          {coupons.map(c => (
            <Card key={c.id} className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="font-mono">{c.code}</div>
                <div className="flex items-center gap-2">
                  <Badge>{c.discountPercent}% OFF</Badge>
                  <Badge className={c.status === 'active' ? 'bg-emerald text-emerald-foreground' : c.status === 'redeemed' ? 'bg-gold text-gold-foreground' : 'bg-muted'}>{c.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No coupons yet</p>
      )}
    </div>
  );
}
