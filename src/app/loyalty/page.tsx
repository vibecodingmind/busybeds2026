'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { PointTransaction } from '@/types';

const REWARDS = [
  { type: '1_week_basic', points: 500, label: '1 Free Week (Basic)' },
  { type: '1_month_basic', points: 1500, label: '1 Free Month (Basic)' },
  { type: '1_month_starter', points: 2000, label: '1 Free Month (Starter)' },
  { type: '1_month_pro', points: 5000, label: '1 Free Month (Pro)' },
];

export default function LoyaltyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ points: number; lifetime: number; transactions: PointTransaction[] } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetch('/api/loyalty').then(r => r.json()).then(d => setData(d.data));
  }, [user, authLoading]);

  const redeem = async (type: string) => {
    const res = await fetch('/api/loyalty/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rewardType: type }) });
    const d = await res.json();
    if (d.success) { alert('Reward redeemed!'); fetch('/api/loyalty').then(r => r.json()).then(d => setData(d.data)); }
    else alert(d.error || 'Failed to redeem');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Loyalty Points</h1>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-6"><Zap className="h-8 w-8 text-emerald mb-2" /><p className="text-3xl font-bold">{data?.points || 0}</p><p className="text-sm text-muted-foreground">Current Points</p></Card>
        <Card className="p-6"><Gift className="h-8 w-8 text-gold mb-2" /><p className="text-3xl font-bold">{data?.lifetime || 0}</p><p className="text-sm text-muted-foreground">Lifetime Points</p></Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Redeem Points</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {REWARDS.map(r => (
              <div key={r.type} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div><p className="font-medium text-sm">{r.label}</p><p className="text-xs text-muted-foreground">{r.points} points</p></div>
                <Button size="sm" variant="outline" disabled={(data?.points || 0) < r.points} onClick={() => redeem(r.type)}>Redeem</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Points History</CardTitle></CardHeader>
        <CardContent>
          {data?.transactions && data.transactions.length > 0 ? (
            <div className="space-y-2">
              {data.transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div><p className="text-sm">{t.description}</p><p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p></div>
                  <Badge className={t.points > 0 ? 'bg-emerald text-emerald-foreground' : 'bg-destructive text-white'}>+{t.points}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">No points history yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
