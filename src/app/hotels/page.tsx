'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, SlidersHorizontal, Grid3X3 } from 'lucide-react';
import type { Hotel } from '@/types';
import { parseJsonField } from '@/lib/parse';
import { CITIES, VIBE_TAGS, HOTEL_TYPES } from '@/lib/locations';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
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
    fetchHotels();
  }, [filters, page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Hotels</h1>
        <p className="text-muted-foreground">Discover partnered hotels with exclusive member discounts across Africa</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels..."
            className="pl-10"
            value={filters.search}
            onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
          />
        </div>
        <Select value={filters.country} onValueChange={v => { setFilters(f => ({ ...f, country: v === 'all' ? '' : v })); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="Tanzania">Tanzania</SelectItem>
            <SelectItem value="Kenya">Kenya</SelectItem>
            <SelectItem value="Uganda">Uganda</SelectItem>
            <SelectItem value="Zanzibar">Zanzibar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.tier} onValueChange={v => { setFilters(f => ({ ...f, tier: v === 'all' ? '' : v })); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.category} onValueChange={v => { setFilters(f => ({ ...f, category: v === 'all' ? '' : v })); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {HOTEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{total} hotel{total !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent>
          </Card>
        )) : hotels.map(hotel => (
          <Link key={hotel.id} href={`/hotels/${hotel.slug}`}>
            <Card className="overflow-hidden hotel-card cursor-pointer group h-full">
              <div className="relative h-48 bg-muted">
                {hotel.coverImage ? (
                  <img src={hotel.coverImage} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🏨</div>
                )}
                <Badge className="absolute top-3 right-3 bg-gold text-gold-foreground font-bold">{hotel.discountPercent}% OFF</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald transition-colors">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" /> {hotel.city}, {hotel.country}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{hotel.tier}</Badge>
                  <Badge variant="outline" className="text-xs">{hotel.category}</Badge>
                </div>
                {(() => {
                  const tags = parseJsonField<string[]>(hotel.vibeTags);
                  return tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-emerald/10 text-emerald rounded-full">{tag}</span>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" disabled={hotels.length < 12} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
