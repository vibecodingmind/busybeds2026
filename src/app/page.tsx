'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, ArrowRight, Check, Zap, Shield, Users, Globe, ChevronRight, Building2 } from 'lucide-react';
import type { Hotel, SubscriptionPackage, FAQ } from '@/types';

const PLAN_FEATURES = [
  { name: 'Explorer', price: 'Free', coupons: '1 total', tiers: 'Standard', highlight: false },
  { name: 'Starter', price: '$9.99/mo', coupons: '5/month', tiers: 'Standard + Premium', highlight: false },
  { name: 'Pro', price: '$19.99/mo', coupons: '15/month', tiers: 'All including Luxury', highlight: true },
  { name: 'Premium', price: '$34.99/mo', coupons: 'Unlimited', tiers: 'All + Exclusive', highlight: false },
];

const HOW_IT_WORKS = [
  { step: '1', icon: Search, title: 'Find Your Hotel', desc: 'Browse hundreds of partnered hotels across Africa and find your perfect stay.' },
  { step: '2', icon: Zap, title: 'Generate a Coupon', desc: 'Subscribe to a plan and instantly generate a QR-code discount coupon for your chosen hotel.' },
  { step: '3', icon: Shield, title: 'Save at Check-in', desc: 'Show your coupon at reception and enjoy exclusive member discounts on your stay.' },
];

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [hotelsRes, faqRes] = await Promise.all([
          fetch('/api/hotels?limit=6&sort=createdAt'),
          fetch('/api/faq'),
        ]);
        if (hotelsRes.ok) {
          const hData = await hotelsRes.json();
          setHotels(hData.data || []);
        }
        if (faqRes.ok) {
          const fData = await faqRes.json();
          setFaqs((fData.data || []).slice(0, 4));
        }
      } catch {} finally { setLoading(false); }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald via-emerald/90 to-emerald/80 text-emerald-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-gold/20 text-gold-foreground border-gold/30">🌍 Africa&apos;s #1 Hotel Discount Platform</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Save Up to <span className="text-gold">50%</span> on Hotels Across Africa
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Get exclusive discount coupons for premium hotels in Tanzania, Kenya, Zanzibar and more. One membership, unlimited savings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-foreground/50" />
                <Input
                  placeholder="Search hotels in Dar es Salaam..."
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/hotels?search=${encodeURIComponent(searchQuery)}`; }}
                />
              </div>
              <Link href={searchQuery ? `/hotels?search=${encodeURIComponent(searchQuery)}` : '/hotels'}>
                <Button size="lg" className="h-12 bg-gold hover:bg-gold/90 text-gold-foreground font-semibold px-8">
                  Search <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Building2, label: 'Hotels Listed', value: '200+' },
              { icon: Users, label: 'Happy Travelers', value: '10,000+' },
              { icon: Globe, label: 'Countries', value: '10+' },
              { icon: Zap, label: 'Coupons Generated', value: '50,000+' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="h-6 w-6 text-emerald mb-1" />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Three simple steps to start saving on your hotel stays across Africa.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-emerald" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Hotels</h2>
              <p className="text-muted-foreground">Top-rated hotels with the best discounts</p>
            </div>
            <Link href="/hotels" className="hidden sm:flex items-center text-emerald hover:underline text-sm font-medium">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent>
              </Card>
            )) : hotels.map(hotel => (
              <Link key={hotel.id} href={`/hotels/${hotel.slug}`}>
                <Card className="overflow-hidden hotel-card cursor-pointer group h-full">
                  <div className="relative h-48 bg-muted">
                    {hotel.coverImage ? (
                      <img src={hotel.coverImage} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🏨</div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-gold text-gold-foreground font-bold">
                      {hotel.discountPercent}% OFF
                    </Badge>
                    {hotel.isFeatured && (
                      <Badge className="absolute top-3 left-3 bg-emerald text-emerald-foreground">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald transition-colors">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" /> {hotel.city}, {hotel.country}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">{hotel.tier}</Badge>
                    </div>
                    {hotel.vibeTags && hotel.vibeTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hotel.vibeTags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-emerald/10 text-emerald rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/hotels"><Button variant="outline">View All Hotels</Button></Link>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">From free explorer to unlimited premium — find the perfect plan for your travel style.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {PLAN_FEATURES.map(plan => (
              <Card key={plan.name} className={`relative p-6 flex flex-col ${plan.highlight ? 'ring-2 ring-emerald shadow-lg' : ''}`}>
                {plan.highlight && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-emerald-foreground">Most Popular</Badge>}
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-2xl font-bold text-emerald mb-4">{plan.price}</p>
                <ul className="space-y-2 text-sm flex-1 mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald" /> {plan.coupons} coupons</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald" /> {plan.tiers} hotels</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald" /> QR code coupons</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald" /> Loyalty points</li>
                </ul>
                <Link href="/subscribe">
                  <Button className={`w-full ${plan.highlight ? 'bg-emerald hover:bg-emerald/90 text-emerald-foreground' : ''}`}>
                    Get Started
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map(faq => (
                <Card key={faq.id} className="p-5">
                  <h4 className="font-semibold mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/faq"><Button variant="outline">View All FAQs</Button></Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald to-emerald/80 text-emerald-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Saving?</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of travelers saving on hotels across Africa.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"><Button size="lg" className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold">Create Free Account</Button></Link>
            <Link href="/subscribe"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">View Plans</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
