'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Shield, AlertTriangle, UserX } from 'lucide-react';

interface FlaggedUser { id: string; fullName: string; email: string; role: string; isFlagged: boolean; spamScore: number; isBanned: boolean; suspendedAt?: string; }

export default function AdminFraudPage() {
  const [users, setUsers] = useState<FlaggedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/fraud').then(r => r.json()).then(d => { setUsers(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Fraud & Security</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search flagged users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Card key={u.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><UserX className="h-5 w-5 text-destructive" /></div>
                  <div><p className="font-semibold">{u.fullName}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{u.role}</Badge>
                  <Badge variant="destructive" className="text-xs">Spam: {u.spamScore}</Badge>
                  {u.isBanned && <Badge variant="destructive" className="text-xs">Banned</Badge>}
                  {u.suspendedAt && <Badge variant="secondary" className="text-xs">Suspended</Badge>}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No flagged users found</p></Card>}
        </div>
      )}
    </div>
  );
}
