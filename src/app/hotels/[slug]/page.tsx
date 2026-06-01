'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Wifi, Car, Dumbbell, UtensilsCrossed, Waves, Phone, Globe, Heart, Share2, Clock, Ticket, Users, BedDouble, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import type { Hotel, RoomType, Review } from '@/types';

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': Wifi, 'Parking': Car, 'Gym': Dumbbell, 'Restaurant': UtensilsCrossed,
  'Pool': Waves, 'Phone': Phone, 'Website': Globe,
};

export default function HotelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [couponResult, setCouponResult] = useState<any>(null);

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
    if (!user) { window.location.href = '/login'; return; }
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

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-64 w-full mb-6" />
      <Skeleton className="h-6 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );

  if (!hotel) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Hotel Not Found</h2>
      <Link href="/hotels"><Button>Back to Hotels</Button></Link>
    </div>
  );

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.coverImage].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/hotels" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Hotels
      </Link>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden">
        <div className="md:col-span-2 md:row-span-2 h-64 md:h-[400px] bg-muted">
          {images[0] ? <img src={images[0]} alt={hotel.name} className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🏨</div>
          )}
        </div>
        {images.slice(1, 5).map((img, i) => (
          <div key={i} className="h-32 md:h-[196px] bg-muted">
            {img ? <img src={img} alt={`${hotel.name} ${i+2}`} className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🏨</div>
            )}
          </div>
        ))}
        {images.length < 5 && Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
          <div key={`placeholder-${i}`} className="h-32 md:h-[196px] bg-muted flex items-center justify-center text-3xl">🏨</div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {hotel.city}, {hotel.country}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                  </div>
                  <Badge className="capitalize">{hotel.tier}</Badge>
                  <Badge variant="outline">{hotel.category}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon"><Heart className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <p className="text-muted-foreground mb-6 leading-relaxed">{hotel.descriptionLong || hotel.descriptionShort}</p>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotel.amenities.map((amenity: string) => {
                      const Icon = AMENITY_ICONS[amenity] || Wifi;
                      return (
                        <div key={amenity} className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-emerald" /> {amenity}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vibe Tags */}
              {hotel.vibeTags && hotel.vibeTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Vibe</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotel.vibeTags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {hotel.websiteUrl && (
                <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-emerald hover:underline text-sm flex items-center gap-1">
                  <Globe className="h-4 w-4" /> Visit hotel website
                </a>
              )}
            </TabsContent>

            <TabsContent value="rooms" className="mt-6">
              <h3 className="font-semibold text-lg mb-4">Room Types</h3>
              {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {hotel.roomTypes.map(room => (
                    <Card key={room.id} className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <h4 className="font-semibold">{room.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {room.bedType}</span>
                            {room.sizeSqm && <span>{room.sizeSqm} sqm</span>}
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Max {room.maxGuests}</span>
                          </div>
                          {room.description && <p className="text-sm text-muted-foreground mt-2">{room.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald">{formatPrice(room.pricePerNight)}</p>
                          <p className="text-xs text-muted-foreground">per night</p>
                          <p className="text-sm font-medium text-gold mt-1">Save {formatPrice(room.pricePerNight * hotel.discountPercent / 100)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No room information available yet.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{hotel.avgRating?.toFixed(1) || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{hotel.reviewCount || 0} reviews</p>
                </div>
                <div className="flex-1">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span>{star}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${Math.random() * 80 + 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="mb-6" />
              {hotel.reviews && hotel.reviews.length > 0 ? (
                <div className="space-y-4">
                  {hotel.reviews.map(review => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
                        </div>
                        <span className="font-semibold text-sm">{review.title}</span>
                        {review.isVerified && <Badge variant="secondary" className="text-[10px]">Verified</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.body}</p>
                      {review.ownerReply && (
                        <div className="mt-3 ml-4 pl-3 border-l-2 border-emerald">
                          <p className="text-xs font-medium text-emerald mb-1">Hotel Response</p>
                          <p className="text-sm text-muted-foreground">{review.ownerReply}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review after your stay!</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card className="p-6">
              <div className="text-center mb-4">
                <Badge className="bg-gold text-gold-foreground text-lg px-4 py-1 mb-2">{hotel.discountPercent}% OFF</Badge>
                <p className="text-sm text-muted-foreground">Member Exclusive Discount</p>
              </div>
              {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Rooms from</p>
                  <p className="text-2xl font-bold text-emerald">{formatPrice(Math.min(...hotel.roomTypes.map(r => r.pricePerNight)))}</p>
                  <p className="text-sm text-gold">You save {formatPrice(Math.min(...hotel.roomTypes.map(r => r.pricePerNight)) * hotel.discountPercent / 100)}/night</p>
                </div>
              )}
              <Button
                className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground h-12 text-lg font-semibold"
                onClick={handleGenerateCoupon}
                disabled={generating}
              >
                {generating ? 'Generating...' : <><Ticket className="mr-2 h-5 w-5" /> Get Discount Coupon</>}
              </Button>
              {!user && <p className="text-xs text-muted-foreground text-center mt-2">Login required to generate coupons</p>}
            </Card>

            {/* Coupon Result */}
            {couponResult && (
              <Card className="p-6 coupon-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Coupon Code</p>
                  <p className="text-2xl font-mono font-bold text-emerald mb-3">{couponResult.code}</p>
                  {couponResult.qrDataUrl && <img src={couponResult.qrDataUrl} alt="QR Code" className="mx-auto w-32 h-32 mb-3" />}
                  <Badge className="bg-gold text-gold-foreground">{couponResult.discountPercent}% OFF</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Expires: {new Date(couponResult.expiresAt).toLocaleDateString()}</p>
                  <Button variant="outline" className="w-full mt-3" onClick={() => navigator.clipboard?.writeText(couponResult.code)}>
                    Copy Code
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">How to Use</h4>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Generate your discount coupon above</li>
                <li>2. Show the QR code or coupon code at check-in</li>
                <li>3. Enjoy your exclusive member discount!</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
