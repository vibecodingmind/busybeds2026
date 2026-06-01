'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Payout { id: string; userId: string; amount: number; status: string; reference?: string; createdAt: string; paidAt?: string; user?: { fullName: string; email: string }; }

export default function AdminReferralPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/referral-payouts').then(r => r.json()).then(d => { setPayouts(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = payouts.filter(p => p.user?.fullName?.toLowerCase().includes(search.toLowerCase()) || p.user?.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> Referral Payouts</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by user..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(p => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{p.user?.fullName || 'Unknown'}</p><p className="text-sm text-muted-foreground">{p.user?.email}</p></div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-lg">${p.amount.toFixed(2)}</p>
                  <Badge variant={p.status === 'paid' ? 'default' : 'outline'} className="capitalize">{p.status}</Badge>
                  {p.reference && <span className="text-xs text-muted-foreground">Ref: {p.reference}</span>}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No referral payouts found</p></Card>}
        </div>
      )}
    </div>
  );
}
