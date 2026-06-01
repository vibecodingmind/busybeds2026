'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Search, CheckCircle2, XCircle, Loader2, Tag, Building2, Calendar, User, Shield } from 'lucide-react';

interface CouponInfo {
  code: string;
  status: string;
  discountPercent: number;
  guestName?: string;
  hotelName: string;
  hotelCity: string;
  expiresAt: string;
  redeemedAt?: string;
}

export default function AdminQRValidatePage() {
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [overrideRedeeming, setOverrideRedeeming] = useState(false);

  const validateCoupon = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setCoupon(null);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success) setCoupon(data.data);
      else toast.error(data.error || 'Invalid coupon');
    } catch { toast.error('Failed to validate'); }
    setLoading(false);
  };

  const redeemCoupon = async (override = false) => {
    if (!coupon) return;
    const setter = override ? setOverrideRedeeming : setRedeeming;
    setter(true);
    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.code, adminOverride: override }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon redeemed');
        setCoupon(prev => prev ? { ...prev, status: 'redeemed', redeemedAt: new Date().toISOString() } : null);
      } else toast.error(data.error || 'Failed');
    } catch { toast.error('Failed'); }
    setter(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><QrCode className="h-6 w-6 text-[#ea4d60]" /> QR Validate (Admin)</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Enter coupon code (BB-XXXX-XXXX)" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && validateCoupon()} className="font-mono" />
            <Button onClick={validateCoupon} disabled={loading} className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {coupon && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                <Tag className="h-7 w-7 text-[#ea4d60]" />
              </div>
              <div>
                <p className="font-mono font-bold text-xl">{coupon.code}</p>
                <Badge className={coupon.status === 'active' ? 'bg-green-100 text-green-700' : coupon.status === 'redeemed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}>
                  {coupon.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-gray-400" /><span className="font-semibold text-[#ea4d60]">{coupon.discountPercent}% OFF</span></div>
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" /><span>{coupon.hotelName}, {coupon.hotelCity}</span></div>
              {coupon.guestName && <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span>{coupon.guestName}</span></div>}
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>Exp: {new Date(coupon.expiresAt).toLocaleDateString()}</span></div>
            </div>

            {coupon.status === 'active' && (
              <div className="flex gap-2">
                <Button onClick={() => redeemCoupon(false)} disabled={redeeming} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                  {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Redeem
                </Button>
              </div>
            )}

            {coupon.status !== 'redeemed' && (
              <div className="border-t pt-3">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Shield className="h-3 w-3" /> Admin override options:</p>
                <Button variant="outline" size="sm" onClick={() => redeemCoupon(true)} disabled={overrideRedeeming} className="text-amber-600 border-amber-300 hover:bg-amber-50">
                  {overrideRedeeming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />} Force Redeem (even if expired)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
