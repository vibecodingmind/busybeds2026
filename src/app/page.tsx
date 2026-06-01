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

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
  { id: 'luxury', label: 'Luxury' },
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

const CITY_SECTIONS = [
  { title: 'Where to stay in Arusha', city: 'Arusha' },
  { title: 'Available in Dar es Salaam', city: 'Dar es Salaam' },
  { title: 'Popular stays in Zanzibar', city: 'Zanzibar' },
  { title: 'Discover in Dodoma', city: 'Dodoma' },
  { title: 'Top picks in Nairobi', city: 'Nairobi' },
  { title: 'Best in Mombasa', city: 'Mombasa' },
];

function HotelCard({ hotel }: { hotel: HotelType }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const images = parseJsonField<string[]>(hotel.images);
  const displayImages = images.length > 0 ? images : hotel.coverImage ? [hotel.coverImage] : [];
  const hasMultiple = displayImages.length > 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff < -50 && currentImg < displayImages.length - 1) {
      setCurrentImg(currentImg + 1);
    } else if (diff > 50 && currentImg > 0) {
      setCurrentImg(currentImg - 1);
    }
    setTouchStart(null);
  };

  return (
    <div className="group cursor-pointer min-w-[240px] sm:min-w-[260px] lg:max-w-[300px] w-[85vw] sm:w-auto shrink-0 snap-start press-effect">
      <Link href={`/hotels/${hotel.slug}`}>
        <div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {displayImages.length > 0 ? (
            <img
              src={displayImages[currentImg] || hotel.coverImage}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#0E5C3B]/10 to-[#C8932A]/10">
              🏨
            </div>
          )}

          {hotel.discountPercent > 0 && (
            <Badge className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-lg">
              {hotel.discountPercent}% OFF
            </Badge>
          )}

          {/* Image dots indicator */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full transition-all duration-200 ${
                    idx === currentImg ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Desktop carousel arrows */}
          {hasMultiple && currentImg > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.max(0, currentImg - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 hidden sm:flex"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
          )}
          {hasMultiple && currentImg < displayImages.length - 1 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.min(displayImages.length - 1, currentImg + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 hidden sm:flex"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          )}

          {/* Heart & Cart Icons */}
          <div className="absolute top-2.5 right-2.5 flex gap-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorited(!isFavorited); }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all shadow-sm"
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all shadow-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-2 px-0.5">
        <Link href={`/hotels/${hotel.slug}`}>
          <h3 className="font-semibold text-sm sm:text-[15px] text-gray-900 dark:text-gray-100 leading-tight truncate">
            {hotel.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{hotel.city}, {hotel.country}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-[#C8932A] text-[#C8932A]" />
            ))}
          </div>
          <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 h-3.5 sm:h-4 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
            {hotel.tier}
          </Badge>
        </div>
        <Link href={`/hotels/${hotel.slug}`}>
          <Button
            variant="outline"
            className="mt-2 w-full text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-[#0E5C3B] hover:text-white hover:border-[#0E5C3B] rounded-lg active:scale-[0.98] transition-all"
          >
            👍 Request coupons
          </Button>
        </Link>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="min-w-[240px] sm:min-w-[260px] lg:max-w-[300px] w-[85vw] sm:w-auto shrink-0 snap-start">
      <Skeleton className="aspect-[4/3] rounded-2xl" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </div>
  );
}

function HotelSection({ title, hotels, loading }: { title: string; hotels: HotelType[]; loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-4 sm:py-6">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
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
  const [showFilters, setShowFilters] = useState(false);

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

  const filterByCategory = (hotels: HotelType[]) => {
    if (activeCategory === 'all') return hotels;
    return hotels.filter(h => h.tier?.toLowerCase() === activeCategory);
  };

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

  const getHotelsForCity = (city: string) => {
    return applyFilters(allHotels.filter(h =>
      h.city?.toLowerCase().includes(city.toLowerCase())
    )).slice(0, 8);
  };

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
    <div className="min-h-screen bg-white dark:bg-[#0F1117] page-enter">
      {/* Search & Filters - App Style */}
      <section className="bg-white dark:bg-[#1a1d27] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 py-3">
          {/* Search Bar - Pill shaped, app-like */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hotels, cities..."
                className="pl-9 h-10 sm:h-11 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-[#0E5C3B]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 active:scale-95 transition-all"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSearch}
              className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-[#0E5C3B] hover:bg-[#0a4d31] active:scale-95 text-white text-sm font-semibold transition-all"
            >
              <Search className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>

          {/* Category Chips - scrollable horizontal */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-[#0E5C3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
            {PROPERTY_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => setActivePropertyType(activePropertyType === pt.id ? null : pt.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 ${
                  activePropertyType === pt.id
                    ? 'bg-[#0E5C3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200'
                }`}
              >
                <pt.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {pt.label}
              </button>
            ))}
          </div>

          {/* Near Me & View toggle */}
          <div className="flex items-center justify-between mt-2.5">
            <button className="flex items-center gap-1 text-xs text-gray-500 active:text-[#0E5C3B] transition-colors press-effect">
              <Navigation className="h-3 w-3" /> Near Me
            </button>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 active:scale-95 transition-all">
                <List className="h-3 w-3" /> List
              </button>
              <button className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-white bg-[#0E5C3B] active:scale-95 transition-all">
                <Map className="h-3 w-3" /> Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Sections by City */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
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

        {(!loading && otherHotels.length > 0) && (
          <HotelSection title="More to explore" hotels={otherHotels} loading={loading} />
        )}

        {!loading && allHotels.length > 0 && CITY_SECTIONS.every(s => getHotelsForCity(s.city).length === 0) && (
          <HotelSection title="Available Hotels" hotels={applyFilters(allHotels).slice(0, 12)} loading={loading} />
        )}

        {/* Bottom spacing for mobile tab bar */}
        <div className="h-4 lg:h-0" />
      </div>
    </div>
  );
}
