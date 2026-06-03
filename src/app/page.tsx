'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Star, Heart, ChevronLeft, ChevronRight,
  Hotel, Castle, Palmtree,
  Building2, Waves, TreePalm, Tent, Mountain, Landmark,
  Home, ArrowRight, Shield, Ticket, Sparkles, Users, Globe2, TrendingUp
} from 'lucide-react';
import type { Hotel as HotelType } from '@/types';
import { parseJsonField } from '@/lib/parse';

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
  { title: 'Where to stay in Arusha', city: 'Arusha', emoji: '🏔️' },
  { title: 'Available in Dar es Salaam', city: 'Dar es Salaam', emoji: '🌆' },
  { title: 'Popular stays in Zanzibar', city: 'Zanzibar', emoji: '🏝️' },
  { title: 'Discover in Dodoma', city: 'Dodoma', emoji: '🏛️' },
  { title: 'Top picks in Nairobi', city: 'Nairobi', emoji: '🏙️' },
  { title: 'Best in Mombasa', city: 'Mombasa', emoji: '🌊' },
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
    <section className="py-10 sm:py-14">
      <div className="max-w-[1120px] mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center mb-6">
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
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
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

  const filterByPropertyType = (hotels: HotelType[]) => {
    if (!activePropertyType) return hotels;
    return hotels.filter(h => h.category?.toLowerCase() === activePropertyType);
  };

  const getHotelsForCity = (city: string) => {
    return filterByPropertyType(allHotels.filter(h =>
      h.city?.toLowerCase().includes(city.toLowerCase())
    )).slice(0, 8);
  };

  const sectionCities = CITY_SECTIONS.map(s => s.city.toLowerCase());
  const otherHotels = filterByPropertyType(allHotels.filter(h =>
    !sectionCities.some(c => h.city?.toLowerCase().includes(c))
  )).slice(0, 8);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">

      {/* HERO SECTION - Full-width Airbnb-style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80"
            alt="Beautiful hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        <div className="relative max-w-[1120px] mx-auto px-6 md:px-10 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-[#C8932A]" />
              <span className="text-sm font-medium text-white/90">Exclusive Member Discounts</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[60px] font-bold text-white leading-[1.1] mb-5">
              Save up to <span className="text-[#C8932A]">50%</span> on Africa&apos;s best hotels
            </h1>
            <p className="text-lg md:text-xl text-white/75 mb-10 leading-relaxed">
              Unlock exclusive discount coupons for premium hotels across Tanzania, Kenya, Zanzibar, and more. Subscribe and start saving today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/hotels">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl px-8 h-12 text-base font-semibold shadow-xl w-full sm:w-auto transition-all hover:shadow-2xl">
                  Explore Hotels <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/subscribe">
                <Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-xl px-8 h-12 text-base font-semibold shadow-xl w-full sm:w-auto transition-all hover:shadow-2xl">
                  <Ticket className="mr-2 h-4 w-4" /> Get Coupons
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-white/15 max-w-md">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">{allHotels.length || '20'}+</p>
              <p className="text-sm text-white/50 mt-1">Hotels</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">50%</p>
              <p className="text-sm text-white/50 mt-1">Max Savings</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">5+</p>
              <p className="text-sm text-white/50 mt-1">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white dark:bg-[#0F1117] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-5">
          <div className="flex items-center justify-center gap-10 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0E5C3B]/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[#0E5C3B] dark:text-[#10b981]" />
              </div>
              <span>Verified Hotels</span>
            </div>
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ea4d60]/10 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-[#ea4d60]" />
              </div>
              <span>Instant Coupons</span>
            </div>
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C8932A]/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-[#C8932A]" />
              </div>
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white dark:bg-[#0F1117]">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-14 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">How BusyBeds Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Three simple steps to unlock massive savings on premium African hotels</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Globe2 className="h-8 w-8 text-[#0E5C3B] dark:text-[#10b981]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Browse Hotels</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Explore our curated collection of verified hotels across Africa, from beachfront resorts to safari lodges.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#ea4d60]/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Ticket className="h-8 w-8 text-[#ea4d60]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Get Coupons</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Subscribe and instantly generate exclusive discount coupons for partner hotels. Save up to 50% on your stay.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#C8932A]/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-[#C8932A]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Save Big</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Present your coupon at check-in and enjoy premium stays at fraction of the price. It is that simple.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      <section className="bg-white dark:bg-[#0F1117] border-b border-gray-100 dark:border-gray-800 sticky top-14 z-30">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => scrollCategories('left')}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <div ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-hide flex-1"
              style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setActivePropertyType(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  !activePropertyType
                    ? 'bg-[#0E5C3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                All
              </button>
              {PROPERTY_TYPES.map(pt => (
                <button key={pt.id}
                  onClick={() => setActivePropertyType(activePropertyType === pt.id ? null : pt.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all shrink-0 ${
                    activePropertyType === pt.id
                      ? 'bg-[#0E5C3B] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  <pt.icon className="h-4 w-4" /> {pt.label}
                </button>
              ))}
            </div>
            <button onClick={() => scrollCategories('right')}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </section>

      {/* HOTEL SECTIONS BY CITY */}
      <div>
        {CITY_SECTIONS.map(section => {
          const cityHotels = getHotelsForCity(section.city);
          if (!loading && cityHotels.length === 0) return null;
          return <HotelSection key={section.city} title={section.title} hotels={cityHotels} loading={loading} />;
        })}

        {(!loading && otherHotels.length > 0) && (
          <HotelSection title="More to explore" hotels={otherHotels} loading={loading} />
        )}

        {!loading && allHotels.length > 0 && CITY_SECTIONS.every(s => getHotelsForCity(s.city).length === 0) && (
          <HotelSection title="Available Hotels" hotels={filterByPropertyType(allHotels).slice(0, 12)} loading={loading} />
        )}

        {/* CTA SECTION */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1120px] mx-auto px-6 md:px-10">
            <div className="relative bg-gradient-to-br from-[#0E5C3B] to-[#0a4d31] dark:from-[#1a1d27] dark:to-[#0F1117] rounded-2xl p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8932A]/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ea4d60]/10 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to save on your next stay?</h2>
                <p className="text-white/60 mb-8 max-w-lg mx-auto text-lg">Subscribe to BusyBeds and get exclusive discount coupons for premium hotels across Africa.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/subscribe">
                    <Button className="bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-xl px-8 h-12 text-base font-semibold shadow-lg transition-all hover:shadow-xl">
                      <Ticket className="mr-2 h-4 w-4" /> Subscribe Now
                    </Button>
                  </Link>
                  <Link href="/hotels">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 h-12 text-base font-semibold">
                      Browse All Hotels
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
