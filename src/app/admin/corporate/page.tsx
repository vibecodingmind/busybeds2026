'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Briefcase, Building2 } from 'lucide-react';

interface CorpAccount { id: string; name: string; adminUserId: string; plan: string; maxMembers: number; createdAt: string; adminUser?: { fullName: string; email: string }; }

export default function AdminCorporatePage() {
  const [accounts, setAccounts] = useState<CorpAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/corporate').then(r => r.json()).then(d => { setAccounts(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6" /> Corporate Accounts</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search accounts..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-500" /></div>
                  <div><p className="font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{a.adminUser?.email || a.adminUserId}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{a.plan}</Badge>
                  <span className="text-sm text-muted-foreground">Up to {a.maxMembers} members</span>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No corporate accounts found</p></Card>}
        </div>
      )}
    </div>
  );
}
