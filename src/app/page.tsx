'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, MapPin, Star, Heart, ShoppingCart, ChevronLeft, ChevronRight,
  SlidersHorizontal, Map, List, Navigation, Hotel, Castle, Palmtree,
  Home, Building2, Waves, TreePalm, Tent, Mountain, Landmark
} from 'lucide-react';
import type { Hotel as HotelType } from '@/types';
import { parseJsonField } from '@/lib/parse';

// Category icons for the filter bar
const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'standard', label: 'Standard', icon: null },
  { id: 'premium', label: 'Premium', icon: null },
  { id: 'luxury', label: 'Luxury', icon: null },
];

const PROPERTY_TYPES = [
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'resort', label: 'Resort', icon: Palmtree },
  { id: 'apartments', label: 'Apartments', icon: Building2 },
  { id: 'villa', label: 'Villa', icon: Castle },
  { id: 'apartment', label: 'Apartment', icon: Home },
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
  { id: 'safari', label: 'Safari', icon: TreePalm },
  { id: 'camping', label: 'Camping', icon: Tent },
  { id: 'mountain', label: 'Mountain', icon: Mountain },
  { id: 'historic', label: 'Historic', icon: Landmark },
];

// Section grouping - cities to display as sections
const CITY_SECTIONS = [
  { title: 'Where to stay in Arusha', city: 'Arusha' },
  { title: 'Available in Dar es Salaam', city: 'Dar es Salaam' },
  { title: 'Popular stays in Zanzibar', city: 'Zanzibar' },
  { title: 'Discover in Dodoma', city: 'Dodoma' },
  { title: 'Top picks in Nairobi', city: 'Nairobi' },
  { title: 'Best in Mombasa', city: 'Mombasa' },
];

// Image carousel within a card
function HotelCard({ hotel }: { hotel: HotelType }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const images = parseJsonField<string[]>(hotel.images);
  const displayImages = images.length > 0 ? images : hotel.coverImage ? [hotel.coverImage] : [];
  const hasMultiple = displayImages.length > 1;

  return (
    <div className="group cursor-pointer min-w-[260px] max-w-[300px] w-full shrink-0 snap-start">
      {/* Image Container */}
      <Link href={`/hotels/${hotel.slug}`}>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
          {displayImages.length > 0 ? (
            <img
              src={displayImages[currentImg] || hotel.coverImage}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#0E5C3B]/10 to-[#C8932A]/10">
              🏨
            </div>
          )}

          {/* Discount Badge */}
          {hotel.discountPercent > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
              {hotel.discountPercent}% OFF
            </Badge>
          )}

          {/* Image carousel navigation */}
          {hasMultiple && (
            <>
              {currentImg > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.max(0, currentImg - 1)); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
              )}
              {currentImg < displayImages.length - 1 && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.min(displayImages.length - 1, currentImg + 1)); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              )}

              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {displayImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(idx); }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImg ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Heart & Cart Icons */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorited(!isFavorited); }}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition"
            >
              <ShoppingCart className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <Link href={`/hotels/${hotel.slug}`}>
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-tight truncate hover:text-[#0E5C3B] transition-colors">
            {hotel.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{hotel.city}, {hotel.country}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />
            ))}
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
            {hotel.tier}
          </Badge>
        </div>
        <Link href={`/hotels/${hotel.slug}`}>
          <Button
            variant="outline"
            className="mt-2.5 w-full text-sm font-medium text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-[#0E5C3B] hover:text-white hover:border-[#0E5C3B] rounded-lg transition-colors"
          >
            👍 Request coupons
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Loading skeleton for a card
function CardSkeleton() {
  return (
    <div className="min-w-[260px] max-w-[300px] w-full shrink-0">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="mt-2.5 space-y-2 px-0.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Horizontal scrollable section
function HotelSection({ title, hotels, loading }: { title: string; hotels: HotelType[]; loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-6">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : hotels.length > 0 ? (
            hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)
          ) : (
            <div className="text-sm text-gray-400 py-8">No hotels available in this area yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [allHotels, setAllHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch('/api/hotels?limit=50&sort=createdAt');
        if (res.ok) {
          const data = await res.json();
          setAllHotels(data.data || []);
        }
      } catch {} finally { setLoading(false); }
    }
    fetchHotels();
  }, []);

  // Filter hotels by category (tier)
  const filterByCategory = (hotels: HotelType[]) => {
    if (activeCategory === 'all') return hotels;
    return hotels.filter(h => h.tier?.toLowerCase() === activeCategory);
  };

  // Filter by search query
  const filterBySearch = (hotels: HotelType[]) => {
    if (!searchQuery.trim()) return hotels;
    const q = searchQuery.toLowerCase();
    return hotels.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q)
    );
  };

  const applyFilters = (hotels: HotelType[]) => filterBySearch(filterByCategory(hotels));

  // Group hotels by city sections
  const getHotelsForCity = (city: string) => {
    return applyFilters(allHotels.filter(h =>
      h.city?.toLowerCase().includes(city.toLowerCase())
    )).slice(0, 8);
  };

  // Get any remaining hotels not in the city sections for a "More to explore" section
  const sectionCities = CITY_SECTIONS.map(s => s.city.toLowerCase());
  const otherHotels = applyFilters(allHotels.filter(h =>
    !sectionCities.some(c => h.city?.toLowerCase().includes(c))
  )).slice(0, 8);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/hotels?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">
      {/* Search Bar Section */}
      <section className="bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
          {/* Search Input */}
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by hotel name, city..."
                className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-[#0E5C3B] focus:border-[#0E5C3B]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSearch}
              className="h-11 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
            >
              <Search className="h-4 w-4 mr-1.5" /> Search
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            {PROPERTY_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => setActivePropertyType(activePropertyType === pt.id ? null : pt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activePropertyType === pt.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <pt.icon className="h-4 w-4" />
                {pt.label}
              </button>
            ))}
          </div>

          {/* View options */}
          <div className="flex items-center justify-between mt-3">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0E5C3B] transition-colors">
              <Navigation className="h-3.5 w-3.5" /> Near Me
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Map className="h-3.5 w-3.5" /> Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Sections by City */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {CITY_SECTIONS.map(section => {
          const cityHotels = getHotelsForCity(section.city);
          if (!loading && cityHotels.length === 0) return null;
          return (
            <HotelSection
              key={section.city}
              title={section.title}
              hotels={cityHotels}
              loading={loading}
            />
          );
        })}

        {/* More to explore section */}
        {(!loading && otherHotels.length > 0) && (
          <HotelSection
            title="More to explore"
            hotels={otherHotels}
            loading={loading}
          />
        )}

        {/* If no city-specific hotels, show all as one section */}
        {!loading && allHotels.length > 0 && CITY_SECTIONS.every(s => getHotelsForCity(s.city).length === 0) && (
          <HotelSection
            title="Available Hotels"
            hotels={applyFilters(allHotels).slice(0, 12)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
