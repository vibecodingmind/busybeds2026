'use client';

import { useState, useEffect, useCallback } from 'react';
import { Hotel } from '@/types';

interface HotelFilters {
  search?: string;
  city?: string;
  country?: string;
  category?: string;
  tier?: string;
  starRating?: number;
  page?: number;
  limit?: number;
}

export function useHotels(initialFilters?: HotelFilters) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters?.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HotelFilters>(initialFilters || {});

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.set(key, String(value));
      });
      params.set('page', String(page));
      params.set('limit', String(filters.limit || 12));
      const res = await fetch(`/api/hotels?${params}`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  return { hotels, total, page, totalPages, loading, setPage, setFilters, refetch: fetchHotels };
}
