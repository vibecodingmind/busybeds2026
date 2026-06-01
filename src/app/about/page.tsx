'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Globe2, Shield, Eye, Users, Building2, Ticket, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    { icon: Eye, title: 'Transparency', desc: 'We believe in clear pricing, honest reviews, and no hidden fees. What you see is what you get — real discounts from real hotels across Africa, with every coupon backed by our verification system.' },
    { icon: Heart, title: 'Accessibility', desc: 'Premium travel should not be a luxury reserved for the few. BusyBeds makes world-class hotel stays accessible to everyone through our subscription model, offering up to 50% off at top-rated properties.' },
    { icon: Globe2, title: 'Local First', desc: 'We partner with locally-owned hotels, lodges, and resorts to support African communities. Every booking through BusyBeds contributes to local economies and helps preserve the authentic hospitality that makes Africa unique.' },
    { icon: Shield, title: 'Trust & Safety', desc: 'Every hotel on our platform is verified. Every coupon is validated. We use bank-grade encryption for payments and never share your personal data. Your trust is the foundation of everything we build.' },
  ];

  const stats = [
    { icon: Building2, value: '50+', label: 'Partner Hotels' },
    { icon: MapPin, value: '7+', label: 'Countries' },
    { icon: Users, value: '10,000+', label: 'Happy Travelers' },
    { icon: Ticket, value: '25,000+', label: 'Coupons Redeemed' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#ea4d60]/10 via-background to-[#ea4d60]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Making Premium Stays Accessible Across Africa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">BusyBeds was founded with a simple mission: to connect every traveler with the best hotel deals Africa has to offer, making luxury affordable and discovery effortless.</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">BusyBeds was born from a real frustration: finding affordable, quality hotel stays in Africa was harder than it needed to be. Travelers were either paying full price for luxury or settling for subpar accommodations, with no middle ground. Meanwhile, incredible hotels across Tanzania, Kenya, Zanzibar, and beyond were sitting with empty rooms they desperately wanted to fill.</p>
          <p className="text-muted-foreground leading-relaxed mb-4">We saw an opportunity to bridge this gap. By creating a subscription-based marketplace where hotels offer exclusive discounts to our members, everyone wins. Travelers access premium stays at a fraction of the cost, hotels fill their rooms and reach new audiences, and local economies benefit from increased tourism revenue.</p>
          <p className="text-muted-foreground leading-relaxed">Since launching in 2026, BusyBeds has grown from a small idea in Dar es Salaam to a platform serving thousands of travelers across East Africa and beyond. We are just getting started on our mission to make every trip to Africa unforgettable and affordable.</p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map(v => (
              <Card key={v.title} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                    <v.icon className="h-6 w-6 text-[#ea4d60]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#ea4d60]/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="h-7 w-7 text-[#ea4d60]" />
                </div>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#ea4d60] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save on Your Next Stay?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">Join thousands of smart travelers who save up to 50% on premium hotels across Africa with BusyBeds.</p>
          <Link href="/subscribe"><Button size="lg" className="bg-white text-[#ea4d60] hover:bg-white/90 font-semibold">Get Started</Button></Link>
        </div>
      </section>
    </div>
  );
}
