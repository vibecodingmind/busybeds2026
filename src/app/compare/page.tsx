'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Search, X, Plus, MapPin, Building2 } from 'lucide-react';

interface Hotel { id: string; name: string; city: string; country: string; starRating: number; discountPercent: number; tier: string; amenities?: string[]; category: string; partnershipStatus: string; }

export default function ComparePage() {
  const [selected, setSelected] = useState<Hotel[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hotel[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearching(true);
      fetch(`/api/hotels?search=${encodeURIComponent(query)}&limit=8`).then(r => r.json()).then(d => {
        setResults(d.data || d || []);
        setSearching(false);
      }).catch(() => setSearching(false));
    }, 300);
  }, [query]);

  const addHotel = (hotel: Hotel) => {
    if (selected.length >= 3) return;
    if (selected.find(h => h.id === hotel.id)) return;
    setSelected(prev => [...prev, hotel]);
    setQuery('');
    setResults([]);
    setActiveSlot(null);
  };

  const removeHotel = (id: string) => setSelected(prev => prev.filter(h => h.id !== id));

  const comparisonFields: { label: string; render: (h: Hotel) => React.ReactNode }[] = [
    { label: 'Star Rating', render: h => <div className="flex">{Array.from({ length: h.starRating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div> },
    { label: 'Location', render: h => <span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{h.city}, {h.country}</span> },
    { label: 'Discount', render: h => <Badge className="bg-[#ea4d60]/10 text-[#ea4d60] border-0">{h.discountPercent}% off</Badge> },
    { label: 'Category', render: h => <Badge variant="outline">{h.category}</Badge> },
    { label: 'Tier', render: h => <Badge variant="outline" className="capitalize">{h.tier}</Badge> },
    { label: 'Status', render: h => <Badge variant={h.partnershipStatus === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">{h.partnershipStatus === 'ACTIVE' ? 'Partner' : 'Listing'}</Badge> },
    { label: 'Amenities', render: h => <div className="flex flex-wrap gap-1">{(h.amenities || []).slice(0, 4).map((a: string) => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}</div> },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#ea4d60]/10 via-background to-[#ea4d60]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Compare Hotels Side by Side</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Select up to 3 hotels to compare ratings, discounts, amenities, and more in one convenient view.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Selection Area */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map(slot => {
              const hotel = selected[slot];
              return (
                <Card key={slot} className={`p-4 min-h-[120px] flex items-center justify-center ${!hotel && activeSlot === slot ? 'border-[#ea4d60]' : ''}`}>
                  {hotel ? (
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-[#ea4d60]" />
                        <p className="font-semibold truncate">{hotel.name}</p>
                        <button onClick={() => removeHotel(hotel.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                      </div>
                      <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
                      <div className="flex justify-center mt-1">{Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setActiveSlot(slot)} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Hotel
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Search (shown when a slot is active) */}
          {activeSlot !== null && selected.length < 3 && (
            <Card className="p-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search hotels by name or city..." className="pl-10" value={query} onChange={e => setQuery(e.target.value)} autoFocus />
              </div>
              {results.length > 0 && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {results.map(h => (
                    <div key={h.id} onClick={() => addHotel(h)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.city}, {h.country}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{h.discountPercent}% off</Badge>
                    </div>
                  ))}
                </div>
              )}
              {searching && <p className="text-sm text-muted-foreground mt-2">Searching...</p>}
            </Card>
          )}

          {/* Comparison Table */}
          {selected.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-36">Feature</th>
                    {selected.map(h => <th key={h.id} className="text-center py-3 px-4 text-sm font-semibold">{h.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFields.map(field => (
                    <tr key={field.label} className="border-b">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{field.label}</td>
                      {selected.map(h => <td key={h.id} className="py-3 px-4 text-center">{field.render(h)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">Select Hotels to Compare</h3>
              <p className="text-muted-foreground">Click "Add Hotel" above to search and select up to 3 hotels for a side-by-side comparison.</p>
            </Card>
          )}

          {selected.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => { setSelected([]); setActiveSlot(null); }}>Clear All</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
