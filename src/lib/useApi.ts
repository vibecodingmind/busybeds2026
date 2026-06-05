import useSWR, { mutate } from 'swr';

// Generic fetcher — always bust browser/CDN cache
const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
    .then(r => r.json())
    .then(d => d.data ?? d);

// SWR global config defaults
export const SWR_CONFIG = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 2000,
};

// ─── Generic hook ───────────────────────────────────────────────
export function useApi<T = any>(url: string | null, opts?: Record<string, any>) {
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<T>(
    url,
    fetcher,
    { ...SWR_CONFIG, ...opts },
  );
  return { data: data ?? null, error, isLoading, isValidating, refresh: revalidate };
}

// ─── Pre-built hooks for common endpoints ──────────────────────

// Hotels
export function useHotels(params?: string) {
  const url = params ? `/api/hotels?${params}` : '/api/hotels?limit=50&sort=createdAt';
  return useApi<any[]>(url, { refreshInterval: 30000 });
}

export function useHotel(id: string | null) {
  return useApi<any>(id ? `/api/hotels/${id}` : null);
}

export function useNearbyHotels(lat: number | null, lng: number | null) {
  return useApi<any[]>(
    lat && lng ? `/api/hotels/nearby?lat=${lat}&lng=${lng}&limit=6` : null,
  );
}

// Coupons
export function useCoupons(limit = 100) {
  return useApi<any[]>(`/api/coupons?limit=${limit}`, { refreshInterval: 15000 });
}

// Host / Owner
export function useHostStats() {
  return useApi<any>('/api/host/stats', { refreshInterval: 30000 });
}

export function useHostHotels() {
  return useApi<any[]>('/api/hotels?mine=true', { refreshInterval: 30000 });
}

// Notifications
export function useNotifications(limit = 20) {
  return useApi<any[]>(`/api/notifications?limit=${limit}`, { refreshInterval: 10000 });
}

// Admin
export function useAdminAnalytics() {
  return useApi<any>('/api/admin/analytics', { refreshInterval: 30000 });
}

export function useAdminRevenue() {
  return useApi<any>('/api/admin/revenue', { refreshInterval: 30000 });
}

export function useFAQs() {
  return useApi<any[]>('/api/faq', { refreshInterval: 60000 });
}

export function useFlashDeals() {
  return useApi<any[]>('/api/flash-deals', { refreshInterval: 30000 });
}

export function useStayRequests() {
  return useApi<any[]>('/api/admin/stay-requests', { refreshInterval: 30000 });
}

// Hotel reviews
export function useHotelReviews(hotelId: string | null) {
  return useApi<any[]>(hotelId ? `/api/hotels/${hotelId}/reviews` : null);
}

// ─── Manual revalidation helpers ────────────────────────────────

// Call after any mutation (create, update, delete) to refresh the cache
export function refreshKey(key: string) {
  mutate(key);
}

// Refresh all hotel-related keys
export function refreshHotels() {
  mutate((k: string) => typeof k === 'string' && k.startsWith('/api/hotels'));
}

// Refresh all coupon-related keys
export function refreshCoupons() {
  mutate((k: string) => typeof k === 'string' && k.startsWith('/api/coupons'));
}

// Refresh all host/owner keys
export function refreshHostData() {
  mutate('/api/host/stats');
  mutate((k: string) => typeof k === 'string' && k.startsWith('/api/hotels'));
}

// Refresh everything
export function refreshAll() {
  mutate(() => true);
}
