'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Star, Wifi, Car, Dumbbell, UtensilsCrossed, Waves,
  Phone, Globe, Heart, Share2, Ticket, Users, BedDouble,
  ChevronLeft, ChevronRight, Send, X, Grid3X3, Image as ImageIcon,
  Check, Shield, CalendarDays, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { parseJsonField } from '@/lib/parse';
import { toast } from 'sonner';
import type { Hotel, RoomType, Review } from '@/types';

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': Wifi, 'Parking': Car, 'Gym': Dumbbell, 'Restaurant': UtensilsCrossed,
  'Pool': Waves, 'Phone': Phone, 'Website': Globe,
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [couponResult, setCouponResult] = useState<any>(null);
  const [recommending, setRecommending] = useState(false);
  const [showRecommendDialog, setShowRecommendDialog] = useState(false);

  // Photo tour state
  const [showPhotoTour, setShowPhotoTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  useEffect(() => {
    async function fetchHotel() {
      try {
        const res = await fetch(`/api/hotels/${slug}`);
        if (res.ok) { const data = await res.json(); setHotel(data.data); }
      } catch {} finally { setLoading(false); }
    }
    if (slug) fetchHotel();
  }, [slug]);

  const handleGenerateCoupon = async () => {
    if (!user) { router.push('/login'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelId: hotel?.id }) });
      const data = await res.json();
      if (data.success) { setCouponResult(data.data); } else { alert(data.error || 'Failed to generate coupon'); }
    } catch { alert('Failed to generate coupon'); }
    finally { setGenerating(false); }
  };

  const handleRecommend = async () => {
    if (!user) { router.push('/login'); return; }
    setRecommending(true);
    try {
      const res = await fetch(`/api/hotels/${slug}/recommend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '' }) });
      const data = await res.json();
      if (data.success) { toast.success('Recommendation submitted!'); setShowRecommendDialog(false); }
      else { toast.error(data.error || 'Failed to submit'); }
    } catch { toast.error('Failed to submit'); }
    finally { setRecommending(false); }
  };

  if (loading) return (
    <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-8">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-[400px] w-full mb-8 rounded-xl" />
      <Skeleton className="h-8 w-3/4 mb-3" />
      <Skeleton className="h-5 w-1/2 mb-6" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );

  if (!hotel) return (
    <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-24 text-center">
      <div className="text-6xl mb-5">🏨</div>
      <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Hotel Not Found</h2>
      <p className="text-gray-500 mb-6">The hotel you're looking for doesn't exist or has been removed.</p>
      <Link href="/hotels">
        <Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg px-6 py-3">Browse Hotels</Button>
      </Link>
    </div>
  );

  const images = (() => {
    const imgs = parseJsonField<string[]>(hotel.images);
    return imgs.length > 0 ? imgs : (hotel.coverImage ? [hotel.coverImage] : []);
  })();
  const amenities = parseJsonField<string[]>(hotel.amenities);
  const vibeTags = parseJsonField<string[]>(hotel.vibeTags);
  const isPartner = hotel.partnershipStatus === 'ACTIVE';

  const openPhotoTour = (idx: number) => { setTourIndex(idx); setShowPhotoTour(true); };

  return (
    <div className="pb-8 md:pb-12">
      {/* ===== TOP NAVIGATION BAR (Airbnb-style thin bar) ===== */}
      <div className="sticky top-14 z-40 bg-white/95 dark:bg-[#0F1117]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 h-12 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /><span>Back</span>
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-gray-700 rounded-full">
              <Share2 className="h-[18px] w-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-gray-700 rounded-full">
              <Heart className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>
      </div>

      {/* ===== AIRBNB-STYLE PHOTO GALLERY ===== */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 mt-6">
        {images.length >= 5 ? (
          /* 5-image grid layout like Airbnb */
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden" style={{ maxHeight: '420px' }}>
            <div className="col-span-2 row-span-2 cursor-pointer" onClick={() => openPhotoTour(0)}>
              <img src={images[0]} alt={hotel.name} className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200" />
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="cursor-pointer relative" onClick={() => openPhotoTour(i)}>
                <img src={images[i]} alt={`${hotel.name} photo ${i + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200" />
                {i === 4 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                    <span className="text-white font-semibold text-sm">+{images.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : images.length >= 2 ? (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden" style={{ maxHeight: '400px' }}>
            {images.slice(0, 2).map((img, i) => (
              <div key={i} className="cursor-pointer" onClick={() => openPhotoTour(i)}>
                <img src={img} alt={hotel.name} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity duration-200" />
              </div>
            ))}
          </div>
        ) : images.length === 1 ? (
          <div className="rounded-xl overflow-hidden cursor-pointer" onClick={() => openPhotoTour(0)}>
            <img src={images[0]} alt={hotel.name} className="w-full h-[400px] object-cover hover:opacity-90 transition-opacity duration-200" />
          </div>
        ) : (
          <div className="h-[280px] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Show all photos button */}
        {images.length > 1 && (
          <div className="flex justify-end -mt-14 mr-3 relative z-10 pb-4">
            <button onClick={() => openPhotoTour(0)} className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600">
              <Grid3X3 className="h-3.5 w-3.5" /> Show all photos
            </button>
          </div>
        )}
      </div>

      {/* ===== MAIN CONTENT: TWO-COLUMN LAYOUT (Airbnb-style) ===== */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">

          {/* ===== LEFT COLUMN: Hotel Info ===== */}
          <div className="min-w-0">
            {/* Title & Location */}
            <div className="pt-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl md:text-[26px] font-bold text-gray-900 dark:text-white leading-tight mb-2">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#C8932A] text-[#C8932A]" />
                  ))}
                </div>
                {hotel.category && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-md font-normal">{hotel.category}</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Partner Badge */}
            {isPartner && (
              <div className="py-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-[#ea4d60]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">BusyBeds Partner Hotel</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{hotel.discountPercent}% exclusive member discount available</p>
                </div>
              </div>
            )}

            {/* Non-partner notice */}
            {!isPartner && (
              <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/60 dark:border-amber-700/40">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Listed Hotel — No Coupons Available</p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/70 mt-1">This hotel is listed for discovery only. Coupons are available for partner hotels. You can recommend this hotel to join BusyBeds.</p>
                </div>
              </div>
            )}

            {/* ===== ABOUT SECTION (Airbnb-style) ===== */}
            <section className="py-8 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About this hotel</h2>
              <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {hotel.descriptionLong || hotel.descriptionShort || 'No description available for this hotel.'}
              </p>
            </section>

            {/* ===== AMENITIES SECTION (Airbnb-style grid) ===== */}
            {amenities.length > 0 && (
              <section className="py-8 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">What this hotel offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((amenity: string) => {
                    const Icon = AMENITY_ICONS[amenity] || Wifi;
                    return (
                      <div key={amenity} className="flex items-center gap-4 py-2">
                        <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400 shrink-0" />
                        <span className="text-[15px] text-gray-700 dark:text-gray-300">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ===== VIBE TAGS ===== */}
            {vibeTags.length > 0 && (
              <section className="py-8 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">The vibe</h2>
                <div className="flex flex-wrap gap-2">
                  {vibeTags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ===== ROOM TYPES SECTION ===== */}
            <section className="py-8 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Rooms available</h2>
              {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {hotel.roomTypes.map(room => (
                    <div key={room.id} className="flex items-start justify-between gap-4 p-5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white">{room.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                          <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {room.bedType}</span>
                          {room.sizeSqm && <span>{room.sizeSqm} sqm</span>}
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Max {room.maxGuests}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-4">
                        <p className="text-lg font-bold text-[#ea4d60]">{formatPrice(room.pricePerNight)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">per night</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No room information available yet.</p>
              )}
            </section>

            {/* ===== REVIEWS SECTION ===== */}
            <section className="py-8 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Reviews</h2>
              {hotel.reviews && hotel.reviews.length > 0 ? (
                <div className="space-y-5">
                  {hotel.reviews.slice(0, 6).map(review => (
                    <div key={review.id} className="pb-5 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-[#C8932A] text-[#C8932A]" />
                          ))}
                        </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{review.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No reviews yet. Be the first to share your experience!</p>
              )}
            </section>

            {/* ===== CONTACT & LOCATION SECTION ===== */}
            <section className="py-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Location & Contact</h2>

              {/* Map */}
              {hotel.geoLat && hotel.geoLng && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-5">
                  <iframe
                    width="100%" height="240" style={{ border: 0 }} loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${hotel.geoLat},${hotel.geoLng}&zoom=14`}
                    allowFullScreen
                  />
                </div>
              )}

              {/* Contact details */}
              <div className="space-y-3">
                {hotel.address && (
                  <div className="flex items-center gap-3 text-[15px] text-gray-600 dark:text-gray-400">
                    <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
                    <span>{hotel.address}</span>
                  </div>
                )}
                {hotel.phone && (
                  <div className="flex items-center gap-3 text-[15px]">
                    <Phone className="h-5 w-5 shrink-0 text-gray-400" />
                    <a href={`tel:${hotel.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-[#ea4d60] transition-colors">{hotel.phone}</a>
                  </div>
                )}
                {hotel.websiteUrl && (
                  <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[15px] text-gray-600 dark:text-gray-400 hover:text-[#ea4d60] transition-colors">
                    <Globe className="h-5 w-5 shrink-0 text-gray-400" />
                    Visit website
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* ===== RIGHT COLUMN: Booking Card (Airbnb-style sticky sidebar) ===== */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
                {isPartner ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-[#ea4d60]">{hotel.discountPercent}%</span>
                      <span className="text-sm text-gray-500">member discount</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Subscribe to unlock exclusive coupons for this hotel</p>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
                      <div className="grid grid-cols-2">
                        <div className="p-3 border-r border-b border-gray-200 dark:border-gray-700">
                          <label className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Check-in</label>
                          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Add date</span>
                          </div>
                        </div>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <label className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Check-out</label>
                          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Add date</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <label className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Guests</label>
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>1 guest</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg h-12 text-base font-semibold active:scale-[0.98] transition-all"
                      onClick={handleGenerateCoupon}
                      disabled={generating}
                    >
                      {generating ? 'Generating...' : (
                        <span className="flex items-center justify-center gap-2">
                          <Ticket className="h-5 w-5" /> Get Coupon
                        </span>
                      )}
                    </Button>

                    <p className="text-center text-xs text-gray-400 mt-3">You won't be charged yet</p>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-start gap-2">
                      <Shield className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Your coupon is backed by the BusyBeds guarantee. Cancel anytime before check-in.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">No coupons yet</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This hotel isn't a partner yet. Recommend them and help them join BusyBeds!</p>

                    <Button
                      className="w-full bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-lg h-12 text-base font-semibold active:scale-[0.98] transition-all"
                      onClick={() => { if (user) setShowRecommendDialog(true); else router.push('/login'); }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-5 w-5" /> Recommend Hotel
                      </span>
                    </Button>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        When this hotel joins BusyBeds, you'll be the first to get exclusive discount coupons.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE STICKY CTA (only visible on small screens) ===== */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/60 px-6 py-3 lg:hidden safe-area-bottom">
        {isPartner ? (
          <div className="flex items-center gap-4 max-w-lg mx-auto">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{hotel.discountPercent}% Discount</p>
              <p className="text-xs text-gray-500">Get your exclusive coupon</p>
            </div>
            <Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg h-11 px-5 text-sm font-semibold active:scale-95 transition-all" onClick={handleGenerateCoupon} disabled={generating}>
              {generating ? 'Generating...' : <><Ticket className="mr-1.5 h-4 w-4" /> Get Coupon</>}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 max-w-lg mx-auto">
            <div className="flex-1">
              <p className="text-xs text-gray-500">No coupons available</p>
              <p className="text-sm font-semibold text-[#C8932A]">Recommend for Partner Program</p>
            </div>
            <Button className="bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-lg h-11 px-4 text-sm font-semibold active:scale-95 transition-all"
              onClick={() => { if (user) setShowRecommendDialog(true); else router.push('/login'); }}>
              <Heart className="mr-1.5 h-4 w-4" /> Recommend
            </Button>
          </div>
        )}
      </div>

      {/* ===== PHOTO TOUR MODAL (Airbnb-style) ===== */}
      {showPhotoTour && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 text-white">
            <button onClick={() => setShowPhotoTour(false)} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
              <X className="h-5 w-5" /><span className="text-sm">Close</span>
            </button>
            <span className="text-sm text-gray-300">{tourIndex + 1} / {images.length}</span>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 relative">
            <img src={images[tourIndex]} alt={`${hotel.name} photo ${tourIndex + 1}`} className="max-h-[70vh] max-w-full object-contain rounded-lg" />

            {tourIndex > 0 && (
              <button onClick={() => setTourIndex(tourIndex - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition">
                <ChevronLeft className="h-5 w-5 text-gray-800" />
              </button>
            )}
            {tourIndex < images.length - 1 && (
              <button onClick={() => setTourIndex(tourIndex + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition">
                <ChevronRight className="h-5 w-5 text-gray-800" />
              </button>
            )}
          </div>

          <div className="px-6 py-5 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {images.map((img, i) => (
                <button key={i} onClick={() => setTourIndex(i)} className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === tourIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75'}`}>
                  <img src={img} alt="" className="h-14 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== RECOMMEND DIALOG ===== */}
      {showRecommendDialog && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowRecommendDialog(false)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#C8932A]/10 flex items-center justify-center mx-auto mb-4">
                <Send className="h-7 w-7 text-[#C8932A]" />
              </div>
              <p className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Recommend {hotel.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">We'll invite this hotel to join BusyBeds as a partner so they can offer exclusive coupons.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-lg h-11" onClick={() => setShowRecommendDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-lg h-11" onClick={handleRecommend} disabled={recommending}>{recommending ? 'Sending...' : 'Submit'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== COUPON RESULT MODAL ===== */}
      {couponResult && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setCouponResult(null)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#ea4d60]/10 flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-7 w-7 text-[#ea4d60]" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Your Coupon Code</p>
              <p className="text-2xl font-mono font-bold text-[#ea4d60] mb-3">{couponResult.code}</p>
              {couponResult.qrDataUrl && <img src={couponResult.qrDataUrl} alt="QR Code" className="mx-auto w-28 h-28 mb-3" />}
              <Badge className="bg-[#ea4d60] text-white mb-2">{couponResult.discountPercent}% OFF</Badge>
              <p className="text-xs text-gray-400 mt-1">Expires: {new Date(couponResult.expiresAt).toLocaleDateString()}</p>
              <div className="flex gap-3 mt-5">
                <Button variant="outline" className="flex-1 rounded-lg h-11" onClick={() => navigator.clipboard?.writeText(couponResult.code)}>Copy Code</Button>
                <Button className="flex-1 bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg h-11" onClick={() => setCouponResult(null)}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
