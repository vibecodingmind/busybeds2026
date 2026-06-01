'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Star, MapPin, ArrowLeft, Phone, Globe, CheckCircle2, AlertCircle, Image as ImageIcon, Filter } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const REGIONS = [
  'All Regions', 'Dar es Salaam', 'Zanzibar', 'Arusha', 'Mombasa', 'Nairobi',
  'Dodoma', 'Mwanza', 'Kilimanjaro', 'Stone Town', 'Nungwi', 'Kendwa',
  'Paje', 'Diani', 'Kampala', 'Kigali', 'Entebbe', 'Nakuru', 'Kisumu',
  'Jinja', 'Lushoto', 'Mikumi', 'Narok', 'Bagamoyo', 'Tanga', 'Iringa',
];

export default function HotelImportPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All Regions');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [tier, setTier] = useState('standard');
  const [partnershipStatus, setPartnershipStatus] = useState('LISTING_ONLY');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [existingSlugs, setExistingSlugs] = useState<Set<string>>(new Set());
  const [importedPlaceIds, setImportedPlaceIds] = useState<Set<string>>(new Set());

  // Fetch existing hotel slugs and googlePlaceIds to check what's already imported
  useEffect(() => {
    fetch('/api/admin/hotels').then(r => r.json()).then(d => {
      if (d.success && d.data) {
        const slugs = new Set<string>();
        const placeIds = new Set<string>();
        d.data.forEach((h: any) => {
          if (h.slug) slugs.add(h.slug);
          if (h.googlePlaceId) placeIds.add(h.googlePlaceId);
        });
        setExistingSlugs(slugs);
        setImportedPlaceIds(placeIds);
      }
    }).catch(() => {});
  }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const cityParam = region === 'All Regions' ? '' : region;
      const res = await fetch(`/api/admin/hotels/import-search?query=${encodeURIComponent(query)}&city=${encodeURIComponent(cityParam)}&region=${encodeURIComponent(region)}`);
      const data = await res.json();
      setResults(data.data || []);
      if (!data.data?.length) toast.info('No hotels found. Try different keywords or region.');
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
        body: JSON.stringify({
          placeId: selectedPlace.placeId,
          tier,
          partnershipStatus,
          discountPercent: partnershipStatus === 'ACTIVE' ? parseInt(discountPercent) : 0,
          city: region === 'All Regions' ? '' : region,
          country: '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${selectedPlace.name}!`);
        setImportedPlaceIds(prev => new Set([...prev, selectedPlace.placeId]));
        setExistingSlugs(prev => new Set([...prev, generateSlug(selectedPlace.name)]));
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

  const isAlreadyImported = (place: any) => {
    if (place.placeId && importedPlaceIds.has(place.placeId)) return true;
    if (place.name && existingSlugs.has(generateSlug(place.name))) return true;
    return false;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/hotels">
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Import Hotels</h1>
          <p className="text-sm text-gray-500">Search Google Maps to import hotels by region</p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="rounded-xl border-0 shadow-sm p-5 mb-6">
        <div className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <Label className="text-xs text-gray-500 mb-1">Keywords</Label>
            <Input placeholder="Hotel name, lodge, resort..." value={query} onChange={e => setQuery(e.target.value)} className="h-10 rounded-lg" />
          </div>
          <div className="sm:col-span-4">
            <Label className="text-xs text-gray-500 mb-1">Region / Location</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-4 flex items-end">
            <Button className="w-full h-10 bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg" onClick={handleSearch} disabled={loading || !query}>
              <Search className="h-4 w-4 mr-2" /> Search Google Maps
            </Button>
          </div>
        </div>

        {/* Quick search tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Hotel in Dar es Salaam', 'Resort in Zanzibar', 'Lodge in Arusha', 'Hotel in Nairobi', 'Beach hotel Mombasa'].map(tag => (
            <button key={tag} onClick={() => { setQuery(tag.split(' ').slice(0, -2).join(' ') || tag); setRegion(tag.split(' ').pop() || 'All Regions'); }}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#ea4d60]/10 hover:text-[#ea4d60] transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">{results.length} hotels found</p>
            <Badge variant="outline" className="text-xs">{region}</Badge>
          </div>
          {results.map((place: any) => {
            const imported = isAlreadyImported(place);
            return (
              <Card key={place.placeId} className={`rounded-xl border-0 shadow-sm overflow-hidden ${imported ? 'opacity-75' : ''}`}>
                <div className="flex gap-4 p-4">
                  {/* Photo thumbnail */}
                  <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                    {place.photoUrl ? (
                      <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{place.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 shrink-0" /> {place.address}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {place.rating && (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />
                              <span className="text-xs font-medium">{place.rating}</span>
                            </div>
                          )}
                          {place.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone className="h-3 w-3" /> {place.phone}
                            </div>
                          )}
                          {place.website && (
                            <div className="flex items-center gap-1 text-xs text-blue-500">
                              <Globe className="h-3 w-3" /> Website
                            </div>
                          )}
                        </div>
                      </div>

                      {imported ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Imported
                        </Badge>
                      ) : (
                        <Button size="sm" className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg shrink-0" onClick={() => setSelectedPlace(place)}>
                          <Download className="h-3.5 w-3.5 mr-1" /> Import
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : query && !loading ? (
        <div className="text-center py-16">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Search for hotels to import</p>
          <p className="text-xs text-gray-400 mt-1">Try keywords like &quot;hotel&quot;, &quot;resort&quot;, &quot;lodge&quot; with a region</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Search Google Maps to find hotels</p>
          <p className="text-xs text-gray-400 mt-1">Import hotels by name, keywords, or region</p>
        </div>
      )}

      {/* Import Dialog */}
      <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Hotel</DialogTitle>
          </DialogHeader>
          {selectedPlace && (
            <div className="space-y-4">
              {/* Hotel preview */}
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {selectedPlace.photoUrl ? (
                    <img src={selectedPlace.photoUrl} alt={selectedPlace.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-gray-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{selectedPlace.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedPlace.address}</p>
                  {selectedPlace.rating && (
                    <div className="flex items-center gap-1 mt-1"><Star className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" /><span className="text-xs">{selectedPlace.rating}</span></div>
                  )}
                </div>
              </div>

              {/* Contact info preview */}
              {(selectedPlace.phone || selectedPlace.website) && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1.5">
                  {selectedPlace.phone && <div className="flex items-center gap-2 text-xs text-gray-600"><Phone className="h-3 w-3" /> {selectedPlace.phone}</div>}
                  {selectedPlace.website && <div className="flex items-center gap-2 text-xs text-blue-500"><Globe className="h-3 w-3" /> {selectedPlace.website}</div>}
                </div>
              )}

              {/* Tier */}
              <div>
                <Label className="text-xs">Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (3 star)</SelectItem>
                    <SelectItem value="premium">Premium (4 star)</SelectItem>
                    <SelectItem value="luxury">Luxury (5 star)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Partnership Status */}
              <div>
                <Label className="text-xs">Partnership Status</Label>
                <Select value={partnershipStatus} onValueChange={setPartnershipStatus}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LISTING_ONLY">Listing Only (No Coupons)</SelectItem>
                    <SelectItem value="ACTIVE">Partner (Can Generate Coupons)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Warning for listing only */}
              {partnershipStatus === 'LISTING_ONLY' && (
                <div className="p-3 bg-[#C8932A]/10 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[#C8932A] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#C8932A]">This hotel will be listed but <strong>cannot generate coupons</strong> until marked as a partner in admin and a discount % is set.</p>
                </div>
              )}

              {/* Discount % for partners */}
              {partnershipStatus === 'ACTIVE' && (
                <div>
                  <Label className="text-xs">Discount %</Label>
                  <Input type="number" min="5" max="50" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="h-9 mt-1" placeholder="e.g. 15" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlace(null)} className="rounded-lg">Cancel</Button>
            <Button className="bg-[#ea4d60] hover:bg-[#d4424f] text-white rounded-lg" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import Hotel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
