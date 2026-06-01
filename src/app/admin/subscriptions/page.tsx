'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/subscriptions').then(r => r.json()).then(d => setSubs(d.data || [])); }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>
      <div className="space-y-2">
        {subs.map(s => (
          <Card key={s.id} className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div><span className="font-mono text-xs">{s.userId?.slice(0,8)}...</span></div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{s.billingCycle}</Badge>
                <Badge className={s.status === 'active' ? 'bg-emerald text-emerald-foreground' : 'bg-muted'}>{s.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
