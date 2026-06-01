'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coupon } from '@/types';

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/coupons${params}`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const generateCoupon = async (hotelId: string, checkIn?: string, checkOut?: string, guestName?: string, guestEmail?: string) => {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId, checkIn, checkOut, guestName, guestEmail }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchCoupons();
    }
    return data;
  };

  return { coupons, loading, refetch: fetchCoupons, generateCoupon };
}
