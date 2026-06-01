'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreePine, Waves, Landmark, Mountain, Building2, UtensilsCrossed, MapPin } from 'lucide-react';

const categories = [
  { icon: TreePine, name: 'Safari & Wildlife', count: 12, desc: 'Experience Africa\'s iconic wildlife with guided safari tours, game drives, and conservation experiences across the continent\'s most renowned national parks and reserves.' },
  { icon: Waves, name: 'Beach & Water Sports', count: 15, desc: 'From Zanzibar\'s turquoise waters to Diani\'s white sand beaches, enjoy snorkeling, diving, kitesurfing, and sunset dhow cruises along the Indian Ocean coast.' },
  { icon: Landmark, name: 'Cultural Tours', count: 8, desc: 'Immerse yourself in local traditions with visits to Maasai villages, Stone Town heritage walks, spice farm tours, and traditional cooking classes.' },
  { icon: Mountain, name: 'Adventure', count: 6, desc: 'Challenge yourself with Kilimanjaro treks, gorilla tracking in Uganda, white-water rafting on the Nile, and zip-lining through lush tropical forests.' },
  { icon: Building2, name: 'City Experiences', count: 10, desc: 'Discover vibrant urban life with Nairobi food tours, Dar es Salaam nightlife, Kigali art galleries, and Addis Ababa coffee ceremonies.' },
  { icon: UtensilsCrossed, name: 'Food & Drink', count: 9, desc: 'Taste Africa\'s diverse culinary landscape from Zanzibar spice markets to Ethiopian injera, Kenyan nyama choma, and Tanzanian street food adventures.' },
];

const activities = [
  { name: 'Serengeti Safari', location: 'Tanzania', category: 'Safari & Wildlife', desc: 'Witness the Great Migration and the Big Five in one of the world\'s most spectacular wildlife arenas' },
  { name: 'Zanzibar Beach Day', location: 'Zanzibar', category: 'Beach & Water Sports', desc: 'Relax on pristine white sand beaches with crystal-clear waters and vibrant coral reefs' },
  { name: 'Mount Kilimanjaro Trek', location: 'Tanzania', category: 'Adventure', desc: 'Conquer Africa\'s highest peak on a multi-day guided trek through five distinct climate zones' },
  { name: 'Stone Town Heritage Walk', location: 'Zanzibar', category: 'Cultural Tours', desc: 'Explore the UNESCO World Heritage Site with its winding alleys, carved doors, and rich history' },
  { name: 'Masai Mara Game Drive', location: 'Kenya', category: 'Safari & Wildlife', desc: 'Encounter lions, elephants, and the legendary wildebeest migration in Kenya\'s premier reserve' },
  { name: 'Diani Water Sports', location: 'Kenya', category: 'Beach & Water Sports', desc: 'Kitesurf, snorkel, or dive in the warm Indian Ocean waters of Diani Beach' },
  { name: 'Nairobi City Tour', location: 'Kenya', category: 'City Experiences', desc: 'Visit the Giraffe Centre, Karen Blixen Museum, and vibrant markets in East Africa\'s largest city' },
  { name: 'Arusha Coffee Tour', location: 'Tanzania', category: 'Food & Drink', desc: 'Walk through lush coffee plantations and learn the journey from bean to cup in Tanzania\'s highlands' },
];

const regions = ['All', 'Tanzania', 'Kenya', 'Zanzibar', 'Uganda'];

export default function ThingsToDoPage() {
  const [region, setRegion] = useState('All');

  const filtered = region === 'All' ? activities : activities.filter(a => a.location === region);

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#ea4d60]/10 via-background to-[#ea4d60]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Things to Do in Africa</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Discover unforgettable experiences, thrilling adventures, and cultural treasures near your hotel. Africa has something incredible for every traveler.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Experience Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(c => (
              <Card key={c.name} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-[#ea4d60]/10 flex items-center justify-center mb-4">
                  <c.icon className="h-7 w-7 text-[#ea4d60]" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{c.name}</h3>
                <Badge variant="outline" className="text-xs mb-3">{c.count} experiences</Badge>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Activities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Popular Activities</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {regions.map(r => (
              <Button key={r} variant={region === r ? 'default' : 'outline'} size="sm" onClick={() => setRegion(r)} className={region === r ? 'bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white' : ''}>
                {r}
              </Button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(a => (
              <Card key={a.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-28 bg-gradient-to-br from-[#ea4d60]/20 to-[#ea4d60]/5 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-[#ea4d60]/40" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{a.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">{a.location}</span>
                    <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
