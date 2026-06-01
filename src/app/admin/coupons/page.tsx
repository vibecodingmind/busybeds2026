'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/coupons?limit=50').then(r => r.json()).then(d => { setCoupons(d.data || []); setLoading(false); });
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Coupons</h1>
      <div className="space-y-2">
        {coupons.map(c => (
          <Card key={c.id} className="p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="font-mono">{c.code}</div>
              <div className="flex items-center gap-2">
                <Badge>{c.discountPercent}% OFF</Badge>
                <Badge className={c.status === 'active' ? 'bg-emerald text-emerald-foreground' : c.status === 'redeemed' ? 'bg-gold text-gold-foreground' : 'bg-muted'}>{c.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {coupons.length === 0 && !loading && <p className="text-muted-foreground text-center py-8">No coupons found</p>}
    </div>
  );
}
