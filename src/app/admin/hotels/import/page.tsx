'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Star, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function HotelImportPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [tier, setTier] = useState('standard');

  const handleSearch = async () => {
    if (!query || !city) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hotels/import-search?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
      const data = await res.json();
      setResults(data.data || []);
      if (!data.data?.length) toast.info('No hotels found. Try a different search.');
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedPlace) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/hotels/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: selectedPlace.placeId, tier, city, country: '' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${selectedPlace.name}!`);
        setSelectedPlace(null);
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/hotels">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Import Hotels</h1>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Search</Label>
            <Input placeholder="Hotel name or keywords" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div>
            <Label>City</Label>
            <Input placeholder="e.g. Dar es Salaam" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground w-full" onClick={handleSearch} disabled={loading || !query || !city}>
              <Search className="h-4 w-4 mr-2" /> Search Google
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="space-y-3">
          {results.map((place: any) => (
            <Card key={place.placeId} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{place.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {place.address}
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-[#C8932A] text-[#C8932A]" />
                      <span className="text-xs">{place.rating}</span>
                    </div>
                  )}
                </div>
                <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground shrink-0" onClick={() => setSelectedPlace(place)}>
                  <Download className="h-4 w-4 mr-1" /> Import
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Import Dialog */}
      <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Hotel</DialogTitle>
          </DialogHeader>
          {selectedPlace && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{selectedPlace.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
              </div>
              <div>
                <Label>Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlace(null)}>Cancel</Button>
            <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import Hotel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
