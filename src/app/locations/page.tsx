'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const countries = [
  { name: 'Tanzania', flag: '🇹🇿', hotels: 25, cities: ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Mwanza', 'Dodoma'], desc: 'Home to the Serengeti, Mount Kilimanjaro, and the spice island of Zanzibar. Tanzania offers some of Africa\'s most iconic travel experiences with world-class lodges and beachfront resorts.' },
  { name: 'Kenya', flag: '🇰🇪', hotels: 18, cities: ['Nairobi', 'Mombasa', 'Diani', 'Nakuru', 'Masai Mara'], desc: 'From the wildlife-rich Masai Mara to the white sand beaches of Diani and the vibrant capital Nairobi, Kenya delivers unforgettable adventures and comfortable stays.' },
  { name: 'Zanzibar', flag: '🇹🇿', hotels: 12, cities: ['Stone Town', 'Nungwi', 'Kendwa', 'Paje', 'Bwejuu'], desc: 'A tropical archipelago off Tanzania\'s coast, Zanzibar combines pristine beaches, historic Stone Town, and a vibrant spice trade heritage with luxury beachfront accommodation.' },
  { name: 'Uganda', flag: '🇺🇬', hotels: 8, cities: ['Kampala', 'Entebbe', 'Jinja'], desc: 'The Pearl of Africa offers gorilla trekking in Bwindi, the source of the Nile at Jinja, and the bustling energy of Kampala with warm hospitality and growing hotel scene.' },
  { name: 'Rwanda', flag: '🇷🇼', hotels: 5, cities: ['Kigali'], desc: 'Known as the Land of a Thousand Hills, Rwanda impresses with clean streets, progressive governance, and Kigali\'s emerging luxury hotel market, plus rare mountain gorilla encounters.' },
  { name: 'Ethiopia', flag: '🇪🇹', hotels: 4, cities: ['Addis Ababa'], desc: 'A land of ancient history, unique cuisine, and the bustling capital Addis Ababa. Ethiopia\'s growing hospitality sector blends traditional charm with modern comfort.' },
  { name: 'South Africa', flag: '🇿🇦', hotels: 6, cities: ['Cape Town', 'Johannesburg', 'Durban'], desc: 'From Table Mountain to the Winelands, South Africa offers diverse landscapes, world-class hotels, and vibrant cities with a rich cultural tapestry and renowned culinary scene.' },
];

const destinations = [
  { name: 'Dar es Salaam', country: 'Tanzania', desc: 'East Africa\'s busiest port city with vibrant nightlife and coastal resorts' },
  { name: 'Zanzibar City', country: 'Zanzibar', desc: 'Historic Stone Town meets turquoise waters and luxury beach resorts' },
  { name: 'Arusha', country: 'Tanzania', desc: 'Gateway to the Serengeti and Kilimanjaro with safari lodges and adventure camps' },
  { name: 'Nairobi', country: 'Kenya', desc: 'A modern metropolis with premium hotels, dining, and the famous Nairobi National Park' },
  { name: 'Mombasa', country: 'Kenya', desc: 'Coastal gem with coral reefs, historic Old Town, and beachfront resorts' },
  { name: 'Kampala', country: 'Uganda', desc: 'Uganda\'s vibrant capital on Lake Victoria with growing hospitality options' },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#ea4d60]/10 via-background to-[#ea4d60]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Africa with BusyBeds</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Discover premium hotels at exclusive discount prices across East Africa and beyond. From safari lodges to beachfront resorts, your next adventure starts here.</p>
        </div>
      </section>

      {/* Countries */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Countries We Cover</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map(c => (
              <Card key={c.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{c.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">{c.hotels} hotels available</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.cities.map(city => (
                      <Badge key={city} variant="outline" className="text-xs">{city}</Badge>
                    ))}
                  </div>
                  <Link href={`/hotels?search=${encodeURIComponent(c.name)}`}>
                    <Button variant="outline" size="sm" className="w-full">Explore Hotels in {c.name} <ArrowRight className="h-4 w-4 ml-1" /></Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Destinations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(d => (
              <Link key={d.name} href={`/hotels?search=${encodeURIComponent(d.name)}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="h-32 bg-gradient-to-br from-[#ea4d60]/20 to-[#ea4d60]/5 flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-[#ea4d60]/40 group-hover:text-[#ea4d60]/70 transition-colors" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{d.name}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{d.country}</p>
                    <p className="text-sm text-muted-foreground">{d.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
