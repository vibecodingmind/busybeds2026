'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Ticket, Clock, Shield, ArrowRight, Hotel, MapPin, Star, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  status: string;
  expiresAt: string;
  hotel?: { name: string; city: string; slug: string; coverImage?: string };
}

export default function CouponsPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch('/api/coupons');
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.data || data.coupons || []);
        }
      } catch {} finally { setLoading(false); }
    }
    if (user) fetchCoupons();
    else setLoading(false);
  }, [user]);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0E5C3B] to-[#0a4d31] dark:from-[#1a1d27] dark:to-[#0F1117]">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 pt-12 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Coupons</h1>
              <p className="text-white/60 text-sm">Your exclusive hotel discount coupons</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-8">
        {!user ? (
          /* Not logged in state */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
              <Ticket className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign in to view your coupons</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Log in or create a free account to generate and manage exclusive hotel discount coupons.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login">
                <Button variant="outline" className="rounded-xl h-11 px-6">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#0E5C3B] hover:bg-[#0a4d31] dark:bg-[#10b981] dark:hover:bg-[#059669] text-white rounded-xl h-11 px-6">Sign up free</Button>
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          /* No coupons yet */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mx-auto mb-5">
              <Ticket className="h-10 w-10 text-[#0E5C3B] dark:text-[#10b981]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No coupons yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Browse our partner hotels and generate exclusive discount coupons to save up to 50% on your next stay.</p>
            <Link href="/hotels">
              <Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-xl h-11 px-6 gap-2">
                Browse Hotels <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Coupons list */
          <div className="grid md:grid-cols-2 gap-6">
            {coupons.map(coupon => (
              <div key={coupon.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d27] overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="flex">
                  {/* Left: Discount */}
                  <div className="w-24 shrink-0 bg-gradient-to-br from-[#ea4d60] to-[#d4424f] flex flex-col items-center justify-center text-white p-3">
                    <span className="text-2xl font-bold">{coupon.discountPercent}%</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">OFF</span>
                  </div>
                  {/* Right: Details */}
                  <div className="flex-1 p-4">
                    {coupon.hotel && (
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{coupon.hotel.name}</h4>
                    )}
                    {coupon.hotel?.city && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{coupon.hotel.city}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[#ea4d60] font-semibold">{coupon.code}</code>
                      <button onClick={() => copyCode(coupon.code, coupon.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {copiedId === coupon.id ? <Check className="h-4 w-4 text-[#0E5C3B]" /> : <Copy className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Exp: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 ${
                        coupon.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        coupon.status === 'REDEEMED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {coupon.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {coupon.hotel?.slug && (
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <Link href={`/hotels/${coupon.hotel.slug}`} className="flex items-center justify-center gap-1.5 text-xs text-[#0E5C3B] dark:text-[#10b981] font-medium py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      View Hotel <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
