'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/hotels?search=${search}`).then(r => r.json()).then(d => { setHotels(d.data || []); setLoading(false); });
  }, [search]);

  const approveKYC = async (id: string) => {
    const res = await fetch(`/api/admin/hotels/${id}/approve-kyc`, { method: 'POST' });
    if (res.ok) { toast.success('KYC approved!'); setHotels(prev => prev.map(h => h.id === id ? { ...h, partnershipStatus: 'ACTIVE' } : h)); }
  };

  const rejectKYC = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    const res = await fetch(`/api/admin/hotels/${id}/reject-kyc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    if (res.ok) toast.success('KYC rejected');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Hotel Management</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hotels..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : (
        <div className="space-y-2">
          {hotels.map(hotel => (
            <Card key={hotel.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{hotel.name}</p>
                  <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="capitalize">{hotel.tier}</Badge>
                  <Badge variant="outline">{hotel.partnershipStatus}</Badge>
                  {hotel.partnershipStatus !== 'ACTIVE' && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => approveKYC(hotel.id)}><CheckCircle className="h-4 w-4 text-emerald" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => rejectKYC(hotel.id)}><XCircle className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
