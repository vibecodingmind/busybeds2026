'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, QrCode, CheckCircle2, XCircle, Loader2, Search, Building2, Tag, Calendar, User } from 'lucide-react';

interface CouponInfo {
  code: string;
  status: string;
  discountPercent: number;
  guestName?: string;
  hotelName: string;
  hotelCity: string;
  hotelImage?: string;
  expiresAt: string;
  redeemedAt?: string;
}

export default function ScanPage() {
  const [manualCode, setManualCode] = useState('');
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      toast.error('Camera not available. Use manual code entry.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const validateCoupon = async (code: string) => {
    if (!code.trim()) { toast.error('Please enter a coupon code'); return; }
    setLoading(true);
    setError('');
    setCoupon(null);
    setRedeemed(false);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success) setCoupon(data.data);
      else setError(data.error || 'Invalid coupon');
    } catch { setError('Failed to validate coupon'); }
    setLoading(false);
  };

  const redeemCoupon = async () => {
    if (!coupon) return;
    setRedeeming(true);
    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.code }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon redeemed successfully!');
        setRedeemed(true);
        setCoupon(prev => prev ? { ...prev, status: 'redeemed', redeemedAt: new Date().toISOString() } : null);
      } else toast.error(data.error || 'Failed to redeem');
    } catch { toast.error('Redemption failed'); }
    setRedeeming(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117]">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#ea4d60] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Scan Coupon</h1>
          <p className="text-sm text-gray-500 mt-1">Validate and redeem BusyBeds discount coupons</p>
        </div>

        {/* Camera / Scanner */}
        <Card className="mb-4 overflow-hidden">
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white/50">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Camera preview</p>
              </div>
            )}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-[#ea4d60] rounded-xl" />
              </div>
            )}
          </div>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              {!cameraActive ? (
                <Button onClick={startCamera} className="flex-1 bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2">
                  <Camera className="h-4 w-4" /> Open Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1 gap-2">
                  <XCircle className="h-4 w-4" /> Close Camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual code entry */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 mb-3">Or enter coupon code manually:</p>
            <div className="flex gap-2">
              <Input
                placeholder="BB-XXXX-XXXX"
                value={manualCode}
                onChange={e => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && validateCoupon(manualCode)}
                className="font-mono"
              />
              <Button onClick={() => validateCoupon(manualCode)} disabled={loading} className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Coupon details */}
        {coupon && (
          <Card className={`mb-4 ${redeemed ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : ''}`}>
            <CardContent className="pt-4 space-y-3">
              {redeemed && (
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                  <CheckCircle2 className="h-5 w-5" /> Coupon Redeemed Successfully!
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                  <Tag className="h-6 w-6 text-[#ea4d60]" />
                </div>
                <div>
                  <p className="font-mono font-bold text-lg">{coupon.code}</p>
                  <Badge className={coupon.status === 'active' ? 'bg-green-100 text-green-700' : coupon.status === 'redeemed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}>
                    {coupon.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-[#ea4d60]">{coupon.discountPercent}% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{coupon.hotelName}</span>
                </div>
                {coupon.guestName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{coupon.guestName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Exp: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

              {coupon.status === 'active' && !redeemed && (
                <Button onClick={redeemCoupon} disabled={redeeming} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11">
                  {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Redeem Coupon
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
