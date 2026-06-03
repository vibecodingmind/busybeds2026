'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Star, Heart, ChevronLeft, ChevronRight,
  Map, List, Navigation, Hotel, Castle, Palmtree,
  Home, Building2, Waves, TreePalm, Tent, Mountain, Landmark
} from 'lucide-react';
import type { Hotel as HotelType } from '@/types';
import { parseJsonField } from '@/lib/parse';

const TIERS = [
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
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
  { id: 'safari', label: 'Safari', icon: TreePalm },
  { id: 'camping', label: 'Camping', icon: Tent },
  { id: 'mountain', label: 'Mountain', icon: Mountain },
  { id: 'historic', label: 'Historic', icon: Landmark },
  { id: 'apartment', label: 'Apartment', icon: Home },
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

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff < -50 && currentImg < displayImages.length - 1) setCurrentImg(currentImg + 1);
    else if (diff > 50 && currentImg > 0) setCurrentImg(currentImg - 1);
    setTouchStart(null);
  };

  return (
    <div className="group cursor-pointer min-w-[260px] sm:min-w-[280px] lg:max-w-[300px] w-[85vw] sm:w-auto shrink-0 snap-start">
      <Link href={`/hotels/${hotel.slug}`}>
        <div
          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {displayImages.length > 0 ? (
            <img
              src={displayImages[currentImg] || hotel.coverImage}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0E5C3B]/5 to-[#C8932A]/5">
              <Hotel className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {hotel.discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-[#ea4d60] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {hotel.discountPercent}% OFF
            </div>
          )}

          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImages.map((_, idx) => (
                <div key={idx} className={`w-1 h-1 rounded-full transition-all duration-200 ${idx === currentImg ? 'bg-white w-3' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          {hasMultiple && currentImg > 0 && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.max(0, currentImg - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 hidden sm:flex">
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
          )}
          {hasMultiple && currentImg < displayImages.length - 1 && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.min(displayImages.length - 1, currentImg + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 hidden sm:flex">
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          )}

          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorited(!isFavorited); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all shadow-sm hover:bg-white">
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
      </Link>

      <div className="mt-2.5 px-0.5">
        <Link href={`/hotels/${hotel.slug}`}>
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-tight truncate hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">
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
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="min-w-[260px] sm:min-w-[280px] lg:max-w-[300px] w-[85vw] sm:w-auto shrink-0 snap-start">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function HotelSection({ title, hotels, loading }: { title: string; hotels: HotelType[]; loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-[1120px] mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-90 transition-all">
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <button onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-90 transition-all">
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
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
  const [activeTier, setActiveTier] = useState('all');
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'list' | 'map'>('list');
  const [nearbyHotels, setNearbyHotels] = useState<HotelType[]>([]);
  const [showNearMe, setShowNearMe] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch('/api/hotels?limit=50&sort=createdAt');
        if (res.ok) { const data = await res.json(); setAllHotels(data.data || []); }
      } catch {} finally { setLoading(false); }
    }
    fetchHotels();
  }, []);

  const filterByTier = (hotels: HotelType[]) => {
    if (activeTier === 'all') return hotels;
    return hotels.filter(h => h.tier?.toLowerCase() === activeTier);
  };

  const filterByPropertyType = (hotels: HotelType[]) => {
    if (!activePropertyType) return hotels;
    return hotels.filter(h => h.category?.toLowerCase() === activePropertyType);
  };

  const applyFilters = (hotels: HotelType[]) => filterByPropertyType(filterByTier(hotels));

  const getHotelsForCity = (city: string) => {
    return applyFilters(allHotels.filter(h =>
      h.city?.toLowerCase().includes(city.toLowerCase())
    )).slice(0, 8);
  };

  const sectionCities = CITY_SECTIONS.map(s => s.city.toLowerCase());
  const otherHotels = applyFilters(allHotels.filter(h =>
    !sectionCities.some(c => h.city?.toLowerCase().includes(c))
  )).slice(0, 8);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">
      {/* Filter Bar - Tiers + Categories + View Toggles */}
      <section className="bg-white dark:bg-[#1a1d27] border-b border-gray-100 dark:border-gray-800 sticky top-14 z-30">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-3">
          <div className="flex items-center gap-2">
            {/* Tiers */}
            {TIERS.map(tier => (
              <button key={tier.id} onClick={() => setActiveTier(tier.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTier === tier.id
                    ? 'bg-[#0E5C3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {tier.label}
              </button>
            ))}

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />

            {/* Left scroll arrow */}
            <button onClick={() => scrollCategories('left')}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {/* Scrollable categories */}
            <div ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-hide flex-1"
              style={{ scrollbarWidth: 'none' }}>
              {PROPERTY_TYPES.map(pt => (
                <button key={pt.id}
                  onClick={() => setActivePropertyType(activePropertyType === pt.id ? null : pt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all shrink-0 ${
                    activePropertyType === pt.id
                      ? 'bg-[#C8932A] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  <pt.icon className="h-4 w-4" /> {pt.label}
                </button>
              ))}
            </div>

            {/* Right scroll arrow */}
            <button onClick={() => scrollCategories('right')}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0" />

            {/* View toggles */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setActiveViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeViewMode === 'list'
                    ? 'text-white bg-[#0E5C3B]'
                    : 'text-gray-400 bg-gray-100 dark:bg-gray-800'
                }`}>
                <List className="h-3 w-3" /> List
              </button>
              <button onClick={() => setActiveViewMode('map')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeViewMode === 'map'
                    ? 'text-white bg-[#0E5C3B]'
                    : 'text-gray-400 bg-gray-100 dark:bg-gray-800'
                }`}>
                <Map className="h-3 w-3" /> Map
              </button>
              <button
                onClick={async () => {
                  if (showNearMe) { setShowNearMe(false); return; }
                  setGettingLocation(true);
                  navigator.geolocation?.getCurrentPosition(
                    async (pos) => {
                      try {
                        const res = await fetch(`/api/hotels/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=50&limit=12`);
                        const data = await res.json();
                        setNearbyHotels(data.data || []);
                        setShowNearMe(true);
                      } catch {} finally { setGettingLocation(false); }
                    },
                    () => { setGettingLocation(false); alert('Location access denied'); },
                    { enableHighAccuracy: false, timeout: 10000 }
                  );
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  showNearMe
                    ? 'text-white bg-[#0E5C3B]'
                    : 'text-gray-400 bg-gray-100 dark:bg-gray-800'
                }`}>
                <Navigation className="h-3 w-3" /> {gettingLocation ? 'Locating...' : 'Near Me'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Near Me Section */}
      {showNearMe && nearbyHotels.length > 0 && (
        <HotelSection title="Near You" hotels={applyFilters(nearbyHotels)} loading={false} />
      )}

      {/* Hotel Sections by City */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
        {CITY_SECTIONS.map(section => {
          const cityHotels = getHotelsForCity(section.city);
          if (!loading && cityHotels.length === 0) return null;
          return <HotelSection key={section.city} title={section.title} hotels={cityHotels} loading={loading} />;
        })}

        {(!loading && otherHotels.length > 0) && (
          <HotelSection title="More to explore" hotels={otherHotels} loading={loading} />
        )}

        {!loading && allHotels.length > 0 && CITY_SECTIONS.every(s => getHotelsForCity(s.city).length === 0) && (
          <HotelSection title="Available Hotels" hotels={applyFilters(allHotels).slice(0, 12)} loading={loading} />
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
