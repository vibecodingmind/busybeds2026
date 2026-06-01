'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Wifi, Car, Dumbbell, UtensilsCrossed, Waves, Phone, Globe, Heart, Share2, Clock, Ticket, Users, BedDouble, ArrowLeft, ChevronLeft, ChevronRight, Send, X, Grid3X3, Image as ImageIcon } from 'lucide-react';
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

  if (loading) return <div className="px-4 py-6"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-56 w-full mb-4 rounded-2xl" /><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></div>;

  if (!hotel) return (
    <div className="px-4 py-16 text-center">
      <div className="text-5xl mb-4">🏨</div>
      <h2 className="text-xl font-bold mb-2">Hotel Not Found</h2>
      <Link href="/hotels"><Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-full">Browse Hotels</Button></Link>
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
    <div className="page-enter pb-24">
      {/* Top bar */}
      <div className="sticky top-14 z-40 bg-white/95 dark:bg-[#0F1117]/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 active:scale-95">
          <ChevronLeft className="h-5 w-5" /><span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500"><Share2 className="h-[18px] w-[18px]" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500"><Heart className="h-[18px] w-[18px]" /></Button>
        </div>
      </div>

      {/* ===== AIRBNB-STYLE PHOTO GALLERY ===== */}
      {images.length >= 5 ? (
        /* 5-image grid layout like Airbnb */
        <div className="grid grid-cols-4 grid-rows-2 gap-2 max-h-[420px] overflow-hidden rounded-b-xl">
          <div className="col-span-2 row-span-2 cursor-pointer" onClick={() => openPhotoTour(0)}>
            <img src={images[0]} alt={hotel.name} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
          </div>
          {[1,2,3,4].map(i => (
            <div key={i} className={`cursor-pointer relative ${i === 4 ? '' : ''}`} onClick={() => openPhotoTour(i)}>
              <img src={images[i]} alt={`${hotel.name} photo ${i+1}`} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
              {i === 4 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+{images.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : images.length >= 2 ? (
        /* 2-image layout */
        <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-hidden rounded-b-xl">
          {images.slice(0, 2).map((img, i) => (
            <div key={i} className="cursor-pointer" onClick={() => openPhotoTour(i)}>
              <img src={img} alt={hotel.name} className="w-full h-[360px] object-cover hover:opacity-95 transition-opacity" />
            </div>
          ))}
        </div>
      ) : images.length === 1 ? (
        <div className="max-h-[400px] overflow-hidden rounded-b-xl cursor-pointer" onClick={() => openPhotoTour(0)}>
          <img src={images[0]} alt={hotel.name} className="w-full h-[400px] object-cover hover:opacity-95 transition-opacity" />
        </div>
      ) : (
        <div className="h-[240px] bg-gradient-to-br from-[#ea4d60]/10 to-[#C8932A]/10 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-gray-300" />
        </div>
      )}

      {/* Show all photos button */}
      {images.length > 1 && (
        <div className="relative -mt-12 mr-4 mb-4 flex justify-end z-10">
          <button onClick={() => openPhotoTour(0)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
            <Grid3X3 className="h-3.5 w-3.5" /> Show all photos
          </button>
        </div>
      )}

      {/* ===== PHOTO TOUR MODAL (Airbnb-style) ===== */}
      {showPhotoTour && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button onClick={() => setShowPhotoTour(false)} className="flex items-center gap-2 text-white hover:text-gray-300">
              <X className="h-5 w-5" /><span className="text-sm">Close</span>
            </button>
            <span className="text-sm text-gray-300">{tourIndex + 1} / {images.length}</span>
          </div>

          {/* Main photo */}
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <img src={images[tourIndex]} alt={`${hotel.name} photo ${tourIndex + 1}`} className="max-h-[70vh] max-w-full object-contain rounded-lg" />

            {/* Nav arrows */}
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

          {/* Thumbnail strip */}
          <div className="px-4 py-4 overflow-x-auto">
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

      {/* Hotel Info */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{hotel.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5 shrink-0" /> {hotel.city}, {hotel.country}</div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#C8932A] text-[#C8932A]" />)}
          </div>
          <Badge className="text-[10px] px-1.5 py-0 capitalize" style={{background: isPartner ? '#ea4d60' : '#6b7280', color: '#fff'}}>{isPartner ? 'Partner' : 'Listed'}</Badge>
          {hotel.category && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{hotel.category}</Badge>}
        </div>

        {/* Partner discount info */}
        {isPartner && hotel.discountPercent > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-[#ea4d60]/5 rounded-xl">
            <Ticket className="h-5 w-5 text-[#ea4d60] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#ea4d60]">{hotel.discountPercent}% member discount</p>
              <p className="text-xs text-gray-500">Subscribe to unlock exclusive coupons</p>
            </div>
          </div>
        )}

        {/* Non-partner notice */}
        {!isPartner && (
          <div className="mt-3 p-3 bg-[#C8932A]/5 rounded-xl border border-[#C8932A]/20">
            <p className="text-sm font-semibold text-[#C8932A]">Listed Hotel - No Coupons Available</p>
            <p className="text-xs text-gray-500 mt-0.5">This hotel is listed for discovery only. Coupons are available for partner hotels. You can recommend this hotel to join BusyBeds.</p>
          </div>
        )}

        {/* Contact info for all hotels */}
        {(hotel.phone || hotel.address || hotel.websiteUrl) && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Information</p>
            {hotel.address && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MapPin className="h-4 w-4 shrink-0 text-gray-400" /> {hotel.address}</div>}
            {hotel.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 shrink-0 text-gray-400" /> <a href={`tel:${hotel.phone}`} className="text-[#ea4d60] hover:underline">{hotel.phone}</a></div>}
            {hotel.websiteUrl && <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#ea4d60] hover:underline"><Globe className="h-4 w-4 shrink-0" /> Visit website</a>}
          </div>
        )}

        {/* Google Maps */}
        {hotel.geoLat && hotel.geoLng && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <iframe width="100%" height="200" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${hotel.geoLat},${hotel.geoLng}&zoom=14`} allowFullScreen />
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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{hotel.descriptionLong || hotel.descriptionShort}</p>
            {amenities.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity: string) => { const Icon = AMENITY_ICONS[amenity] || Wifi; return (<div key={amenity} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs"><Icon className="h-3.5 w-3.5 text-[#ea4d60]" /> {amenity}</div>); })}
                </div>
              </div>
            )}
            {vibeTags.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">Vibe</h3>
                <div className="flex flex-wrap gap-1.5">{vibeTags.map((tag: string) => <Badge key={tag} variant="secondary" className="px-2.5 py-1 text-xs">{tag}</Badge>)}</div>
              </div>
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
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {room.bedType}</span>
                          {room.sizeSqm && <span>{room.sizeSqm} sqm</span>}
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Max {room.maxGuests}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-[#ea4d60]">{formatPrice(room.pricePerNight)}</p>
                        <p className="text-[10px] text-gray-500">per night</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">No room information available.</p>}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            {hotel.reviews && hotel.reviews.length > 0 ? (
              <div className="space-y-3">
                {hotel.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex items-center gap-0.5">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />)}</div>
                      <span className="font-semibold text-xs">{review.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">No reviews yet.</p>}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/60 px-4 py-3 safe-area-bottom">
        {isPartner ? (
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1">
              <p className="text-sm font-semibold">{hotel.discountPercent}% Discount</p>
              <p className="text-xs text-gray-500">Get your exclusive coupon</p>
            </div>
            <Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-xl h-12 px-6 text-sm font-semibold active:scale-95" onClick={handleGenerateCoupon} disabled={generating}>
              {generating ? 'Generating...' : <><Ticket className="mr-1.5 h-4 w-4" /> Get Coupon</>}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1">
              <p className="text-xs text-gray-500">No coupons available</p>
              <p className="text-sm font-semibold text-[#C8932A]">Recommend for Partner Program</p>
            </div>
            <Button className="bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-xl h-12 px-5 text-sm font-semibold active:scale-95"
              onClick={() => { if (user) setShowRecommendDialog(true); else router.push('/login'); }}>
              <Heart className="mr-1.5 h-4 w-4" /> Recommend
            </Button>
          </div>
        )}
      </div>

      {/* Recommend Dialog */}
      {showRecommendDialog && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowRecommendDialog(false)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#C8932A]/10 flex items-center justify-center mx-auto mb-3"><Send className="h-6 w-6 text-[#C8932A]" /></div>
              <p className="font-semibold text-lg mb-2">Recommend {hotel.name}</p>
              <p className="text-sm text-gray-500 mb-4">We&apos;ll invite this hotel to join BusyBeds as a partner so they can offer exclusive coupons.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowRecommendDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-[#C8932A] hover:bg-[#b8841f] text-white rounded-xl" onClick={handleRecommend} disabled={recommending}>{recommending ? 'Sending...' : 'Submit'}</Button>
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
              <div className="w-12 h-12 rounded-full bg-[#ea4d60]/10 flex items-center justify-center mx-auto mb-3"><Ticket className="h-6 w-6 text-[#ea4d60]" /></div>
              <p className="text-sm text-gray-500 mb-1">Your Coupon Code</p>
              <p className="text-2xl font-mono font-bold text-[#ea4d60] mb-3">{couponResult.code}</p>
              {couponResult.qrDataUrl && <img src={couponResult.qrDataUrl} alt="QR Code" className="mx-auto w-28 h-28 mb-3" />}
              <Badge className="bg-[#ea4d60] text-white mb-2">{couponResult.discountPercent}% OFF</Badge>
              <p className="text-xs text-gray-400 mt-1">Expires: {new Date(couponResult.expiresAt).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigator.clipboard?.writeText(couponResult.code)}>Copy Code</Button>
                <Button className="flex-1 bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-xl" onClick={() => setCouponResult(null)}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
