'use client';

import { useEffect, useState } from 'react';
import { refreshHotels } from '@/lib/useApi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, Heart, Hotel as HotelIcon, SlidersHorizontal, ChevronLeft, ChevronRight, Ticket, ArrowRight } from 'lucide-react';
import type { Hotel } from '@/types';
import { parseJsonField } from '@/lib/parse';
import { HOTEL_TYPES } from '@/lib/locations';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: '', city: '', country: '', category: '', tier: '' });

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');
        Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
        const res = await fetch(`/api/hotels?${params}`);
        if (res.ok) {
          const data = await res.json();
          setHotels(data.data || []);
          setTotal(data.total || 0);
        }
      } catch {} finally { setLoading(false); }
    }
    // Auto-refresh every 30s
    const interval = setInterval(() => fetchHotels(), 30000);
    return () => clearInterval(interval);
    fetchHotels();
  }, [filters, page]);

  const clearFilters = () => {
    setFilters({ search: '', city: '', country: '', category: '', tier: '' });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0F1117] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 pt-10 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore Hotels</h1>
          <p className="text-gray-500 dark:text-gray-400">Discover partnered hotels with exclusive member discounts across Africa</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#0F1117]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hotels, cities..."
                className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                value={filters.search}
                onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              />
            </div>
            <Button
              variant="outline"
              className={`h-11 px-4 rounded-xl border-gray-200 dark:border-gray-700 gap-2 shrink-0 ${showFilters ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-[#0E5C3B] text-white text-[10px] flex items-center justify-center">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </Button>
          </div>

          {/* Expandable Filter Row */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Select value={filters.country} onValueChange={v => { setFilters(f => ({ ...f, country: v === 'all' ? '' : v })); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-44 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Zanzibar">Zanzibar</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.tier} onValueChange={v => { setFilters(f => ({ ...f, tier: v === 'all' ? '' : v })); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-36 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={v => { setFilters(f => ({ ...f, category: v === 'all' ? '' : v })); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {HOTEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="text-[#ea4d60] hover:text-[#d4424f] h-10" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <Skeleton className="h-56 w-full rounded-xl" />
                <div className="pt-3 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
              <HotelIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hotels found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">We couldn&apos;t find any hotels matching your criteria. Try adjusting your filters or search terms.</p>
            <Button variant="outline" className="rounded-xl" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span> hotel{total !== 1 ? 's' : ''} found
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="text-[#ea4d60] hover:text-[#d4424f]" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(hotel => {
                const tags = parseJsonField<string[]>(hotel.vibeTags);
                const isPartner = hotel.partnershipStatus === 'ACTIVE';
                return (
                  <Link key={hotel.id} href={`/hotels/${hotel.slug}`} className="group">
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 bg-white dark:bg-[#1a1d27]">
                      <div className="relative h-56 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        {hotel.coverImage ? (
                          <img src={hotel.coverImage} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0E5C3B]/5 to-[#C8932A]/5">
                            <HotelIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}

                        {/* Discount badge */}
                        {hotel.discountPercent > 0 && (
                          <div className="absolute top-3 left-3 bg-[#ea4d60] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            {hotel.discountPercent}% OFF
                          </div>
                        )}

                        {/* Partner badge */}
                        {isPartner && (
                          <div className="absolute top-3 right-12 bg-[#0E5C3B] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            Partner
                          </div>
                        )}

                        {/* Heart/favorite */}
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* Bottom gradient for better text readability */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-1.5 group-hover:text-[#0E5C3B] dark:group-hover:text-[#10b981] transition-colors truncate">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {hotel.city}, {hotel.country}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: hotel.starRating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-[#C8932A] text-[#C8932A]" />
                            ))}
                          </div>
                          <Badge className={`text-[10px] px-2 py-0 h-5 capitalize font-medium ${
                            hotel.tier === 'luxury' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0' :
                            hotel.tier === 'premium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0'
                          }`}>
                            {hotel.tier}
                          </Badge>
                          {hotel.category && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                              {hotel.category}
                            </Badge>
                          )}
                        </div>

                        {/* Vibe tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-[11px] px-2.5 py-1 bg-[#0E5C3B]/5 dark:bg-[#10b981]/10 text-[#0E5C3B] dark:text-[#10b981] rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* CTA row */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                          {isPartner && hotel.discountPercent > 0 ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Ticket className="h-4 w-4 text-[#ea4d60]" />
                              <span className="font-semibold text-[#ea4d60]">{hotel.discountPercent}% off</span>
                              <span className="text-gray-400">with coupon</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">View details</span>
                          )}
                          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#0E5C3B] dark:group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl gap-2">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <Button variant="outline" disabled={hotels.length < 12} onClick={() => setPage(p => p + 1)} className="rounded-xl gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
