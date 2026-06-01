'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Wifi, Car, Dumbbell, UtensilsCrossed, Waves, Phone, Globe, Heart, Share2, Clock, Ticket, Users, BedDouble, ArrowLeft, ChevronLeft, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { parseJsonField } from '@/lib/parse';
import GoogleMap from '@/components/GoogleMap';
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
  const [activeImg, setActiveImg] = useState(0);
  const [recommending, setRecommending] = useState(false);
  const [showRecommendDialog, setShowRecommendDialog] = useState(false);

  useEffect(() => {
    async function fetchHotel() {
      try {
        const res = await fetch(`/api/hotels/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setHotel(data.data);
        }
      } catch {} finally { setLoading(false); }
    }
    if (slug) fetchHotel();
  }, [slug]);

  const handleGenerateCoupon = async () => {
    if (!user) { router.push('/login'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: hotel?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponResult(data.data);
      } else {
        alert(data.error || 'Failed to generate coupon');
      }
    } catch { alert('Failed to generate coupon'); }
    finally { setGenerating(false); }
  };

  const handleRecommend = async () => {
    if (!user) { router.push('/login'); return; }
    setRecommending(true);
    try {
      const res = await fetch(`/api/hotels/${slug}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recommendation submitted! We\'ll reach out to this hotel.');
        setShowRecommendDialog(false);
      } else {
        toast.error(data.error || 'Failed to submit');
      }
    } catch { toast.error('Failed to submit recommendation'); }
    finally { setRecommending(false); }
  };

  if (loading) return (
    <div className="px-4 py-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-56 w-full mb-4 rounded-2xl" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );

  if (!hotel) return (
    <div className="px-4 py-16 text-center">
      <div className="text-5xl mb-4">🏨</div>
      <h2 className="text-xl font-bold mb-2">Hotel Not Found</h2>
      <p className="text-sm text-gray-500 mb-4">This hotel may no longer be available.</p>
      <Link href="/hotels">
        <Button className="bg-[#0E5C3B] hover:bg-[#0a4d31] text-white rounded-full">Browse Hotels</Button>
      </Link>
    </div>
  );

  const images = (() => {
    const imgs = parseJsonField<string[]>(hotel.images);
    return imgs.length > 0 ? imgs : [hotel.coverImage].filter(Boolean);
  })();

  const amenities = parseJsonField<string[]>(hotel.amenities);
  const vibeTags = parseJsonField<string[]>(hotel.vibeTags);

  return (
    <div className="page-enter pb-24">
      {/* Top bar - back + actions */}
      <div className="sticky top-14 z-40 bg-white/95 dark:bg-[#0F1117]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 active:scale-95 transition-all">
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
            <Share2 className="h-[18px] w-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
            <Heart className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>

      {/* Image Gallery - Full width, swipeable */}
      <div className="relative">
        <div className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {images.length > 0 ? (
            <img src={images[activeImg]} alt={hotel.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#0E5C3B]/10 to-[#C8932A]/10">🏨</div>
          )}
        </div>

        {/* Image navigation dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === activeImg ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Discount badge */}
        {hotel.discountPercent > 0 && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
            {hotel.discountPercent}% OFF
          </Badge>
        )}

        {/* Swipe arrows for images */}
        {images.length > 1 && (
          <>
            {activeImg > 0 && (
              <button
                onClick={() => setActiveImg(activeImg - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
            )}
            {activeImg < images.length - 1 && (
              <button
                onClick={() => setActiveImg(activeImg + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700 rotate-180" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Hotel Info */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{hotel.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {hotel.city}, {hotel.country}
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#C8932A] text-[#C8932A]" />
            ))}
          </div>
          <Badge className="text-[10px] px-1.5 py-0 bg-[#0E5C3B] dark:bg-[#10b981] text-white capitalize">{hotel.tier}</Badge>
          {hotel.category && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">{hotel.category}</Badge>
          )}
        </div>

        {/* Quick discount info - only for partner hotels */}
        {hotel.partnershipStatus === 'ACTIVE' && hotel.discountPercent > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-[#0E5C3B]/5 dark:bg-[#10b981]/10 rounded-xl">
            <Ticket className="h-5 w-5 text-[#0E5C3B] dark:text-[#10b981] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#0E5C3B] dark:text-[#10b981]">{hotel.discountPercent}% member discount</p>
              <p className="text-xs text-gray-500">Subscribe to unlock exclusive coupons</p>
            </div>
          </div>
        )}

        {/* Non-partner hotel notice */}
        {hotel.partnershipStatus !== 'ACTIVE' && (
          <div className="mt-3 p-3 bg-[#C8932A]/5 dark:bg-[#C8932A]/10 rounded-xl">
            <p className="text-sm font-semibold text-[#C8932A]">Listed Hotel</p>
            <p className="text-xs text-gray-500">This hotel is listed for discovery. Contact them directly or recommend they join BusyBeds for exclusive coupons.</p>
          </div>
        )}

        {/* Contact info for non-partner hotels */}
        {hotel.partnershipStatus !== 'ACTIVE' && (hotel.phone || hotel.address || hotel.websiteUrl) && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
            {hotel.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" /> {hotel.address}
              </div>
            )}
            {hotel.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" /> {hotel.phone}
              </div>
            )}
            {hotel.websiteUrl && (
              <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0E5C3B] dark:text-[#10b981] hover:underline">
                <Globe className="h-4 w-4 shrink-0" /> Visit website
              </a>
            )}
          </div>
        )}

        {/* Google Maps */}
        {hotel.geoLat && hotel.geoLng && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <iframe
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${hotel.geoLat},${hotel.geoLng}&zoom=14`}
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="rooms" className="flex-1">Rooms</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {hotel.descriptionLong || hotel.descriptionShort}
            </p>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity: string) => {
                    const Icon = AMENITY_ICONS[amenity] || Wifi;
                    return (
                      <div key={amenity} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                        <Icon className="h-3.5 w-3.5 text-[#0E5C3B] dark:text-[#10b981]" /> {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vibe Tags */}
            {vibeTags.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">Vibe</h3>
                <div className="flex flex-wrap gap-1.5">
                  {vibeTags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="px-2.5 py-1 text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {hotel.websiteUrl && (
              <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#0E5C3B] dark:text-[#10b981] hover:underline text-sm flex items-center gap-1">
                <Globe className="h-4 w-4" /> Visit hotel website
              </a>
            )}
          </TabsContent>

          <TabsContent value="rooms" className="mt-4">
            <h3 className="font-semibold text-sm mb-3">Room Types</h3>
            {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
              <div className="space-y-3">
                {hotel.roomTypes.map(room => (
                  <div key={room.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-sm">{room.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {room.bedType}</span>
                          {room.sizeSqm && <span>{room.sizeSqm} sqm</span>}
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Max {room.maxGuests}</span>
                        </div>
                        {room.description && <p className="text-xs text-gray-500 mt-1.5">{room.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-[#0E5C3B] dark:text-[#10b981]">{formatPrice(room.pricePerNight)}</p>
                        <p className="text-[10px] text-gray-500">per night</p>
                        {hotel.discountPercent > 0 && (
                          <p className="text-xs font-medium text-[#C8932A] mt-0.5">Save {formatPrice(room.pricePerNight * hotel.discountPercent / 100)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No room information available yet.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{hotel.avgRating?.toFixed(1) || 'N/A'}</p>
                <p className="text-xs text-gray-500">{hotel.reviewCount || 0} reviews</p>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2">{star}</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8932A] rounded-full" style={{ width: `${Math.random() * 80 + 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {hotel.reviews && hotel.reviews.length > 0 ? (
              <div className="space-y-3">
                {hotel.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />)}
                      </div>
                      <span className="font-semibold text-xs">{review.title}</span>
                      {review.isVerified && <Badge variant="secondary" className="text-[9px] px-1 py-0">Verified</Badge>}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{review.body}</p>
                    {review.ownerReply && (
                      <div className="mt-2 ml-3 pl-2.5 border-l-2 border-[#0E5C3B] dark:border-[#10b981]">
                        <p className="text-[10px] font-medium text-[#0E5C3B] dark:text-[#10b981] mb-0.5">Hotel Response</p>
                        <p className="text-xs text-gray-500">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review after your stay!</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Bottom CTA - Partner vs Non-Partner */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/60 px-4 py-3 safe-area-bottom">
        {hotel.partnershipStatus === 'ACTIVE' ? (
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1">
              {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500">Rooms from</p>
                  <p className="text-xl font-bold text-[#0E5C3B] dark:text-[#10b981]">
                    {formatPrice(Math.min(...hotel.roomTypes.map(r => r.pricePerNight)))}
                    <span className="text-xs font-normal text-gray-500">/night</span>
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Get Discount Coupon</p>
              )}
            </div>
            <Button
              className="bg-[#0E5C3B] hover:bg-[#0a4d31] dark:bg-[#10b981] dark:hover:bg-[#059669] text-white rounded-xl h-12 px-6 text-sm font-semibold active:scale-95 transition-all"
              onClick={handleGenerateCoupon}
              disabled={generating}
            >
              {generating ? 'Generating...' : <><Ticket className="mr-1.5 h-4 w-4" /> Get Coupon</>}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1">
              <p className="text-xs text-gray-500">This hotel is not a partner yet</p>
              <p className="text-sm font-semibold text-[#C8932A]">Recommend for BusyBeds Partner Program</p>
            </div>
            <Button
              className="bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-xl h-12 px-5 text-sm font-semibold active:scale-95 transition-all"
              onClick={() => { if (user) setShowRecommendDialog(true); else router.push('/login'); }}
            >
              <Heart className="mr-1.5 h-4 w-4" /> Recommend
            </Button>
          </div>
        )}
        {!user && hotel.partnershipStatus === 'ACTIVE' && <p className="text-[10px] text-gray-400 text-center mt-1">Login required to generate coupons</p>}
      </div>

      {/* Recommend Dialog */}
      {showRecommendDialog && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowRecommendDialog(false)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#C8932A]/10 flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-[#C8932A]" />
              </div>
              <p className="font-semibold text-lg mb-2">Recommend {hotel.name}</p>
              <p className="text-sm text-gray-500 mb-4">We&apos;ll reach out to this hotel and invite them to join BusyBeds as a partner, so they can offer exclusive discount coupons.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowRecommendDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-xl" onClick={handleRecommend} disabled={recommending}>
                  {recommending ? 'Sending...' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Result Modal */}
      {couponResult && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setCouponResult(null)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mx-auto mb-3">
                <Ticket className="h-6 w-6 text-[#0E5C3B] dark:text-[#10b981]" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Your Coupon Code</p>
              <p className="text-2xl font-mono font-bold text-[#0E5C3B] dark:text-[#10b981] mb-3">{couponResult.code}</p>
              {couponResult.qrDataUrl && <img src={couponResult.qrDataUrl} alt="QR Code" className="mx-auto w-28 h-28 mb-3" />}
              <Badge className="bg-[#C8932A] text-white mb-2">{couponResult.discountPercent}% OFF</Badge>
              <p className="text-xs text-gray-400 mt-1">Expires: {new Date(couponResult.expiresAt).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => navigator.clipboard?.writeText(couponResult.code)}
                >
                  Copy Code
                </Button>
                <Button
                  className="flex-1 bg-[#0E5C3B] hover:bg-[#0a4d31] dark:bg-[#10b981] dark:hover:bg-[#059669] text-white rounded-xl"
                  onClick={() => setCouponResult(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
