'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Globe, MapPin } from 'lucide-react';

interface Activity { id: string; title: string; description: string; city: string; country: string; price?: number; duration?: string; isApproved: boolean; submittedById: string; }

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/activities').then(r => r.json()).then(d => { setActivities(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6" /> Activities</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search activities..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{a.city}, {a.country}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.price && <Badge variant="outline" className="text-xs">${a.price}</Badge>}
                  {a.duration && <Badge variant="outline" className="text-xs">{a.duration}</Badge>}
                  <Badge variant={a.isApproved ? 'default' : 'secondary'} className="text-xs">{a.isApproved ? 'Approved' : 'Pending'}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No activities submitted yet</p></Card>}
        </div>
      )}
    </div>
  );
}
