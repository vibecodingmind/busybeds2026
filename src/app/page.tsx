'use client';

import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
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
  Search, LayoutGrid, List, MapIcon, Ticket,
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

/* --- Airbnb-style small card for Grid --- */
function HotelCard({ hotel }: { hotel: HotelType }) {
  const { formatPrice } = useCurrency();
  const [currentImg, setCurrentImg] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const images = parseJsonField<string[]>((hotel as any).images);
  const coverImg = (hotel as any).coverImage;
  const displayImages = images.length > 0 ? images : coverImg ? [coverImg] : [];
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

          {hotel.discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-[#ea4d60] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm leading-tight">
              {hotel.discountPercent}% OFF
            </div>
          )}

          {hasMultiple && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
              {displayImages.slice(0, 5).map((_, idx) => (
                <div key={idx} className={`w-1 h-1 rounded-full transition-all ${idx === currentImg ? 'bg-white w-2' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

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

          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorited(!isFavorited); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all shadow-sm hover:bg-white">
            <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
        </div>
      </Link>

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

/* --- List view row --- */
function HotelListRow({ hotel }: { hotel: HotelType }) {
  const { formatPrice } = useCurrency();
  const [isFavorited, setIsFavorited] = useState(false);
  const images = parseJsonField<string[]>((hotel as any).images);
  const coverImg = (hotel as any).coverImage;
  const displayImage = images.length > 0 ? images[0] : coverImg || '';

  return (
    <div className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
      <Link href={`/hotels/${hotel.slug}`} className="shrink-0">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {displayImage ? (
            <img src={displayImage} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" draggable={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0E5C3B]/5 to-[#C8932A]/5">
              <Hotel className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
          )}
          {hotel.discountPercent > 0 && (
            <div className="absolute top-1.5 left-1.5 bg-[#ea4d60] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
              {hotel.discountPercent}% OFF
            </div>
          )}
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorited(!isFavorited); }}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-all shadow-sm hover:bg-white">
            <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
        </div>
      </Link>
      <Link href={`/hotels/${hotel.slug}`} className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 leading-tight hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3.5 w-3.5 fill-[#C8932A] text-[#C8932A]" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{hotel.starRating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />{hotel.city}, {hotel.country}
        </p>
        {(hotel as any).descriptionShort && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{(hotel as any).descriptionShort}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
            {hotel.tier}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
            {hotel.category}
          </Badge>
          {hotel.discountPercent > 0 && (
            <Badge className="text-[10px] px-1.5 py-0.5 bg-[#ea4d60]/10 text-[#ea4d60] border-0">
              <Ticket className="h-3 w-3 mr-0.5" />{hotel.discountPercent}% off
            </Badge>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {(hotel as any).priceFrom != null ? (
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatPrice((hotel as any).priceFrom)}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400"> /night</span>
            </span>
          ) : (
            <span className="text-sm text-gray-400">Price on request</span>
          )}
        </div>
      </Link>
    </div>
  );
}

/* --- Map view --- */
function HotelMapView({ hotels }: { hotels: HotelType[] }) {
  const [selected, setSelected] = useState<HotelType | null>(null);
  const [mapSrc, setMapSrc] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (selected && (selected as any).geoLat && (selected as any).geoLng) {
      setMapSrc(`https://www.google.com/maps/embed/v1/place?key=${key}&q=${(selected as any).geoLat},${(selected as any).geoLng}&zoom=14`);
    } else if (selected) {
      setMapSrc(`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(selected.name + ' ' + selected.city)}&zoom=14`);
    } else {
      setMapSrc(`https://www.google.com/maps/embed/v1/view?key=${key}&center=-3,37&zoom=5`);
    }
  }, [selected]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)] min-h-[500px]">
      {/* Hotel list sidebar */}
      <div className="w-full lg:w-80 shrink-0 overflow-y-auto space-y-1 pr-1">
        {hotels.map(h => (
          <button key={h.id}
            onClick={() => setSelected(h)}
            className={`w-full text-left p-2.5 rounded-lg border transition-all ${
              selected?.id === h.id
                ? 'border-[#0E5C3B] dark:border-[#10b981] bg-[#0E5C3B]/5 dark:bg-[#10b981]/5'
                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className="flex gap-2.5">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                {(h as any).coverImage || parseJsonField<string[]>((h as any).images).length > 0 ? (
                  <img src={(h as any).coverImage || parseJsonField<string[]>((h as any).images)[0]} alt={h.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Hotel className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{h.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5 mt-0.5">
                  <MapPin className="h-3 w-3" />{h.city}, {h.country}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />
                    <span className="text-[11px] font-medium">{h.starRating}</span>
                  </div>
                  {h.discountPercent > 0 && (
                    <span className="text-[10px] font-semibold text-[#ea4d60]">-{h.discountPercent}%</span>
                  )}
                  {(h as any).priceFrom != null && (
                    <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">
                      {formatPrice((h as any).priceFrom)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
        {hotels.length === 0 && (
          <div className="text-center py-12">
            <Hotel className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hotels found</p>
          </div>
        )}
      </div>

      {/* Map area */}
      <div className="flex-1 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[300px]">
        {mapSrc ? (
          <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <MapIcon className="h-12 w-12" />
          </div>
        )}
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
    if (!navigator.geolocation) { setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/hotels/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&limit=6`);
          if (res.ok) { const data = await res.json(); setNearbyHotels(data.data || []); }
        } catch {} finally { setLoading(false); }
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

/* --- Home Page Content --- */
function HomePageContent() {
  const searchParams = useSearchParams();
  const isNearby = searchParams.get('nearby') === 'true';

  const [allHotels, setAllHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117] pb-20 lg:pb-0">

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
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#0E5C3B] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#0E5C3B] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
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

      {/* --- Results count --- */}
      <section className="pt-5 pb-2">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Searching...' : `${filteredHotels.length} hotel${filteredHotels.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </section>

      {/* --- Hotel content by view mode --- */}
      {viewMode === 'map' ? (
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-[1440px] mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Loading map...</p>
                </div>
              </div>
            ) : (
              <HotelMapView hotels={filteredHotels} />
            )}
          </div>
        </section>
      ) : viewMode === 'list' ? (
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-[1440px] mx-auto">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-3">
                    <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHotels.length > 0 ? (
              <div className="space-y-1">
                {filteredHotels.map(hotel => <HotelListRow key={hotel.id} hotel={hotel} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <Hotel className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No hotels match your filters.</p>
                <button onClick={() => { setActivePropertyType(null); setActiveTier('all'); }}
                  className="mt-2 text-[#0E5C3B] dark:text-[#10b981] text-sm font-medium hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Grid view (default) */
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-[1440px] mx-auto">
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
      )}

      {/* Bottom spacing for mobile tab bar */}
      <div className="h-6 lg:h-0" />
    </div>
  );
}

/* --- Page export with Suspense boundary --- */
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
