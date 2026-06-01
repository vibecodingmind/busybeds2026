'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubscriptionSettingsPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscriptions?status=active').then(r => r.json()).then(d => {
      setSubscription(d.data || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription</h2>
      {loading ? <p className="text-muted-foreground">Loading...</p> : subscription ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald text-emerald-foreground">Active</Badge>
            <span className="font-semibold">{subscription.package?.name || 'Plan'}</span>
          </div>
          <p className="text-sm text-muted-foreground">Expires: {new Date(subscription.expiresAt).toLocaleDateString()}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground">You don&apos;t have an active subscription.</p>
          <Link href="/subscribe"><Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground">Choose a Plan</Button></Link>
        </div>
      )}
    </Card>
  );
}
