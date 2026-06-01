'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Search } from 'lucide-react';

interface Hotel { id: string; name: string; slug: string; city: string; country: string; starRating: number; discountPercent: number; tier: string; geoLat?: number; geoLng?: number; coverImage?: string; }

export default function MapPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Hotel | null>(null);
  const [mapSrc, setMapSrc] = useState('');

  useEffect(() => {
    fetch('/api/hotels?limit=100').then(r => r.json()).then(d => {
      const list = d.data || d || [];
      setHotels(list);
      setFiltered(list);
    });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(hotels.filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q)));
  }, [search, hotels]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (selected?.geoLat && selected?.geoLng) {
      setMapSrc(`https://www.google.com/maps/embed/v1/place?key=${key}&q=${selected.geoLat},${selected.geoLng}&zoom=14`);
    } else if (selected) {
      setMapSrc(`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(selected.name + ' ' + selected.city)}&zoom=14`);
    } else {
      setMapSrc(`https://www.google.com/maps/embed/v1/view?key=${key}&center=-3,37&zoom=5`);
    }
  }, [selected]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Hotel Map</h1>
          <p className="text-sm text-muted-foreground">Explore hotels across Africa on the map</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-80 border-r border-border flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search hotels..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map(h => (
              <div key={h.id} onClick={() => setSelected(h)} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selected?.id === h.id ? 'border-[#ea4d60] bg-[#ea4d60]/5' : 'hover:bg-muted'}`}>
                <p className="font-medium text-sm truncate">{h.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{h.city}, {h.country}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{Array.from({ length: h.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                  {h.discountPercent > 0 && <Badge className="text-[10px] bg-[#ea4d60]/10 text-[#ea4d60] border-0">{h.discountPercent}% off</Badge>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No hotels found</p>}
          </div>
        </div>
        {/* Map */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          {mapSrc ? (
            <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0, minHeight: '500px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">Loading map...</div>
          )}
        </div>
      </div>
    </div>
  );
}
