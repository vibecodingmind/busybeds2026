'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Map, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface StayRequest { id: string; travelerId: string; checkIn: string; checkOut: string; nights: number; guests: number; status: string; depositAmount?: number; createdAt: string; traveler?: { fullName: string; email: string }; hotel?: { name: string; city: string }; roomType?: { name: string }; }

export default function AdminStayRequestsPage() {
  const [requests, setRequests] = useState<StayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/stay-requests').then(r => r.json()).then(d => { setRequests(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => (r.traveler?.fullName || '').toLowerCase().includes(search.toLowerCase()) || (r.hotel?.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleAction = async (id: string, action: string) => {
    const res = await fetch(`/api/stay-requests/${id}/${action}`, { method: 'PUT' });
    if (res.ok) { toast.success(`Stay request ${action}d`); setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'declined' } : r)); }
    else toast.error(`Failed to ${action}`);
  };

  const statusIcon = (s: string) => s === 'approved' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : s === 'declined' ? <XCircle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-yellow-500" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="h-6 w-6" /> Stay Requests</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by traveler or hotel..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><p className="font-semibold">{r.hotel?.name || 'Unknown Hotel'}</p>{statusIcon(r.status)}</div>
                  <p className="text-sm text-muted-foreground">{r.traveler?.fullName} · {r.roomType?.name || 'Room'} · {r.nights} nights · {r.guests} guests</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.checkIn).toLocaleDateString()} → {new Date(r.checkOut).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="capitalize">{r.status}</Badge>
                  {r.status === 'pending' && <><Button variant="ghost" size="sm" onClick={() => handleAction(r.id, 'approve')}><CheckCircle className="h-4 w-4 text-emerald-500" /></Button><Button variant="ghost" size="sm" onClick={() => handleAction(r.id, 'decline')}><XCircle className="h-4 w-4 text-destructive" /></Button></>}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><Map className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No stay requests found</p></Card>}
        </div>
      )}
    </div>
  );
}
