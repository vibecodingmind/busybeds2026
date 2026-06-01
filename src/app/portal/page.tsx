'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ticket, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PortalPage() {
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/coupons/${code.trim()}`);
    const data = await res.json();
    if (data.success) setCoupon(data.data);
    else { toast.error('Coupon not found'); setCoupon(null); }
    setLoading(false);
  };

  const redeem = async () => {
    const res = await fetch(`/api/coupons/${code.trim()}/redeem`, { method: 'POST' });
    const data = await res.json();
    if (data.success) { toast.success('Coupon redeemed!'); setCoupon(data.data); }
    else toast.error(data.error || 'Failed to redeem');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🛏️</div>
          <h1 className="text-2xl font-bold gradient-text">BusyBeds</h1>
          <p className="text-sm text-muted-foreground">Hotel Redemption Portal</p>
        </div>

        <Card className="p-6">
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter coupon code" className="pl-10 font-mono text-lg" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === 'Enter') lookup(); }} />
            </div>
            <Button onClick={lookup} disabled={loading}>Lookup</Button>
          </div>

          {coupon && (
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg text-center">
                <Badge className="mb-2 bg-gold text-gold-foreground text-lg px-4 py-1">{coupon.discountPercent}% OFF</Badge>
                <p className="font-mono text-xl font-bold text-emerald mb-2">{coupon.code}</p>
                <p className="text-sm text-muted-foreground">Hotel: {coupon.hotel?.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Status: <Badge className={coupon.status === 'active' ? 'bg-emerald text-emerald-foreground' : 'bg-muted'}>{coupon.status}</Badge></p>
                {coupon.guestName && <p className="text-sm text-muted-foreground">Guest: {coupon.guestName}</p>}
                <p className="text-sm text-muted-foreground">Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
              </div>
              {coupon.status === 'active' && (
                <Button className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground h-12 text-lg" onClick={redeem}>
                  <CheckCircle className="h-5 w-5 mr-2" /> Mark as Redeemed
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
