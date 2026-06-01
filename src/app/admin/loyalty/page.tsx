'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Search, Trophy } from 'lucide-react';

interface LoyaltyUser { id: string; userId: string; points: number; lifetime: number; user?: { fullName: string; email: string }; }

export default function AdminLoyaltyPage() {
  const [users, setUsers] = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/loyalty').then(r => r.json()).then(d => { setUsers(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => u.user?.fullName?.toLowerCase().includes(search.toLowerCase()) || u.user?.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" /> Loyalty Program</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    {i < 3 ? <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /> : <Trophy className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div><p className="font-semibold">{u.user?.fullName || 'Unknown'}</p><p className="text-sm text-muted-foreground">{u.user?.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="font-bold text-lg">{u.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">Current Points</p></div>
                  <div className="text-right"><p className="font-semibold">{u.lifetime.toLocaleString()}</p><p className="text-xs text-muted-foreground">Lifetime</p></div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><p className="text-muted-foreground">No loyalty data found</p></Card>}
        </div>
      )}
    </div>
  );
}
