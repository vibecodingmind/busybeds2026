'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin, Star, Heart, ChevronLeft, ChevronRight,
  Hotel, Castle, Palmtree,
  Home, Building2, Waves, TreePalm, Tent, Mountain, Landmark,
  Search, LayoutGrid, List, MapIcon,
} from 'lucide-react';
import type { Hotel as HotelType } from '@/types';
import { parseJsonField } from '@/lib/parse';

const PROPERTY_TYPES = [
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'resort', label: 'Resort', icon: Palmtree },
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
  { id: 'villa', label: 'Villa', icon: Castle },
  { id: 'safari', label: 'Safari', icon: TreePalm },
  { id: 'apartments', label: 'Apartments', icon: Building2 },
  { id: 'camping', label: 'Camping', icon: Tent },
  { id: 'mountain', label: 'Mountain', icon: Mountain },
  { id: 'historic', label: 'Historic', icon: Landmark },
  { id: 'apartment', label: 'Apartment', icon: Home },
];

const TIERS = [
  { id: 'all', label: 'All' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
  { id: 'luxury', label: 'Luxury' },
];

/* --- Airbnb-style small card --- */
function HotelCard({ hotel }: { hotel: HotelType }) {
  const { formatPrice } = useCurrency();
  const [currentImg, setCurrentImg] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const images = parseJsonField<string[]>((hotel as any).images);
  const coverImg = (hotel as any).coverImage;
  const displayImages = images.length > 0 ? images : coverImg ? [hotel.coverImage] : [];
  const hasMultiple = displayImages.length > 1;

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff < -40 && currentImg < displayImages.length - 1) setCurrentImg(currentImg + 1);
    else if (diff > 40 && currentImg > 0) setCurrentImg(currentImg - 1);
    setTouchStart(null);
  };

  return (
    <div className="group cursor-pointer w-full">
      <Link href={`/hotels/${hotel.slug}`}>
        <div
          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {displayImages.length > 0 ? (
            <img
              src={displayImages[currentImg] || (hotel as any).coverImage}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0E5C3B]/5 to-[#C8932A]/5">
              <Hotel className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {/* Discount badge */}
          {hotel.discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-[#ea4d60] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm leading-tight">
              {hotel.discountPercent}% OFF
            </div>
          )}

          {/* Dots indicator */}
          {hasMultiple && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
              {displayImages.slice(0, 5).map((_, idx) => (
                <div key={idx} className={`w-1 h-1 rounded-full transition-all ${idx === currentImg ? 'bg-white w-2' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          {/* Carousel arrows - desktop only */}
          {hasMultiple && currentImg > 0 && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.max(0, currentImg - 1)); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 hidden sm:flex">
              <ChevronLeft className="h-3 w-3 text-gray-700" />
            </button>
          )}
          {hasMultiple && currentImg < displayImages.length - 1 && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(Math.min(displayImages.length - 1, currentImg + 1)); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100 hidden sm:flex">
              <ChevronRight className="h-3 w-3 text-gray-700" />
            </button>
          )}

          {/* Heart button */}
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorited(!isFavorited); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all shadow-sm hover:bg-white">
            <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
        </div>
      </Link>

      {/* Card info */}
      <div className="mt-1.5 px-0.5">
        <Link href={`/hotels/${hotel.slug}`}>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-[13px] text-gray-900 dark:text-gray-100 leading-tight truncate hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">
              {hotel.name}
            </h3>
            {hotel.starRating > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Star className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{hotel.starRating}</span>
              </div>
            )}
          </div>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            <MapPin className="h-3 w-3 inline -mt-0.5 mr-0.5" />{hotel.city}, {hotel.country}
          </p>
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                {hotel.tier}
              </Badge>
              {hotel.discountPercent > 0 && (
                <span className="text-[10px] font-semibold text-[#ea4d60]">-{hotel.discountPercent}%</span>
              )}
            </div>
            {(hotel as any).priceFrom != null && (
              <span className="text-[12px] font-bold text-gray-900 dark:text-white">
                <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">from </span>
                {formatPrice((hotel as any).priceFrom)}
                <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500">/night</span>
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

/* --- Skeleton card --- */
function CardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="mt-1.5 space-y-1 px-0.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

/* --- Near You floating section --- */
function NearYouSection() {
  const [nearbyHotels, setNearbyHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/hotels/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&limit=6`);
          if (res.ok) {
            const data = await res.json();
            setNearbyHotels(data.data || []);
          }
        } catch { } finally { setLoading(false); }
      },
      () => { setLoading(false); }
    );
  }, []);

  if (!loading && nearbyHotels.length === 0) return null;

  return (
    <section className="py-4">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-[#0E5C3B] dark:text-[#10b981]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Near You</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {nearbyHotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        )}
      </div>
    </section>
  );
}

/* --- Home Page Content (uses useSearchParams, must be in Suspense) --- */
function HomePageContent() {
  const searchParams = useSearchParams();
  const isNearby = searchParams.get('nearby') === 'true';

  const [allHotels, setAllHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showToast, setShowToast] = useState(false);
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
  const filteredHotels = applyFilters(allHotels);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const handleViewMode = (mode: 'grid' | 'list' | 'map') => {
    if (mode === 'grid') {
      setViewMode('grid');
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117] pb-20 lg:pb-0">

      {/* --- Toast notification --- */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          Coming soon!
        </div>
      )}

      {/* --- Category filter bar --- */}
      <section className="bg-white dark:bg-[#1a1d27] border-b border-gray-100 dark:border-gray-800 sticky top-14 z-30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-2.5">
          <div className="flex items-center gap-2">

            {/* Tier pills */}
            {TIERS.map(tier => (
              <button key={tier.id} onClick={() => setActiveTier(tier.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTier === tier.id
                    ? 'bg-[#0E5C3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {tier.label}
              </button>
            ))}

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 shrink-0" />

            {/* Left scroll arrow */}
            <button onClick={() => scrollCategories('left')}
              className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <ChevronLeft className="h-3 w-3 text-gray-400" />
            </button>

            {/* Scrollable category pills */}
            <div ref={categoryScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto scroll-smooth flex-1"
              style={{ scrollbarWidth: 'none' }}>
              {PROPERTY_TYPES.map(pt => (
                <button key={pt.id}
                  onClick={() => setActivePropertyType(activePropertyType === pt.id ? null : pt.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0 ${
                    activePropertyType === pt.id
                      ? 'bg-[#C8932A] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  <pt.icon className="h-3.5 w-3.5" /> {pt.label}
                </button>
              ))}
            </div>

            {/* Right scroll arrow */}
            <button onClick={() => scrollCategories('right')}
              className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </button>

            {/* View mode toggle */}
            <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shrink-0 ml-1">
              <button
                onClick={() => handleViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#0E5C3B] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#0E5C3B] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleViewMode('map')}
                className={`p-1.5 transition-colors ${viewMode === 'map' ? 'bg-[#0E5C3B] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Map view"
              >
                <MapIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Near You section (shown when ?nearby=true) --- */}
      {isNearby && <NearYouSection />}

      {/* --- Hotel grid --- */}
      <section className="py-5">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">

          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Searching...' : `${filteredHotels.length} hotel${filteredHotels.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Airbnb-style grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {loading ? (
              Array.from({ length: 14 }).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredHotels.length > 0 ? (
              filteredHotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)
            ) : (
              <div className="col-span-full text-center py-16">
                <Hotel className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No hotels match your filters.</p>
                <button onClick={() => { setActivePropertyType(null); setActiveTier('all'); }}
                  className="mt-2 text-[#0E5C3B] dark:text-[#10b981] text-sm font-medium hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom spacing for mobile tab bar */}
      <div className="h-6 lg:h-0" />
    </div>
  );
}

/* --- Page export with Suspense boundary for useSearchParams --- */
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0F1117] pb-20 lg:pb-0">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {Array.from({ length: 14 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
