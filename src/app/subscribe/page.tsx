'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Check, Zap } from 'lucide-react';
import type { SubscriptionPackage } from '@/types';

const PLANS = [
  { name: 'Explorer', price: 0, annual: 0, coupons: '1 total', tiers: 'Standard', features: ['1 coupon ever', 'Standard hotels only', 'Basic support'] },
  { name: 'Starter', price: 9.99, annual: 99, coupons: '5/month', tiers: 'Standard + Premium', features: ['5 coupons/month', 'Premium hotel access (3/mo)', 'Email support', 'Loyalty points'] },
  { name: 'Pro', price: 19.99, annual: 199, coupons: '15/month', tiers: 'All including Luxury', features: ['15 coupons/month', 'All hotel tiers', 'Priority support', 'Double loyalty points', 'Flash deal alerts'], popular: true },
  { name: 'Premium', price: 34.99, annual: 349, coupons: 'Unlimited', tiers: 'All + Exclusive', features: ['Unlimited coupons', 'Exclusive hotel access', '24/7 concierge', 'Triple loyalty points', 'Early flash deals', 'Gift card discounts'] },
];

export default function SubscribePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetch('/api/subscriptions/packages').then(r => r.json()).then(d => setPackages(d.data || []));
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (!user) { router.push('/login'); return; }
    setSubscribing(true);
    const pkg = packages.find(p => p.name === planName);
    if (!pkg) { setSubscribing(false); return; }

    if (planName === 'Explorer') {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, billingCycle: 'monthly', paymentMethod: 'free' }),
      });
      const data = await res.json();
      if (data.success) router.push('/profile');
      else alert(data.error || 'Failed to subscribe');
    } else {
      router.push(`/subscribe?checkout=${planName}`);
    }
    setSubscribing(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">Unlock exclusive hotel discounts across Africa. Cancel anytime.</p>
        <div className="flex items-center justify-center gap-3">
          <Label htmlFor="billing" className={!annual ? 'font-semibold' : 'text-muted-foreground'}>Monthly</Label>
          <Switch id="billing" checked={annual} onCheckedChange={setAnnual} />
          <Label htmlFor="billing" className={annual ? 'font-semibold' : 'text-muted-foreground'}>
            Annual <Badge className="ml-1 bg-gold text-gold-foreground text-[10px]">Save 17%</Badge>
          </Label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <Card key={plan.name} className={`relative p-6 flex flex-col ${plan.popular ? 'ring-2 ring-emerald shadow-xl' : ''}`}>
            {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-emerald-foreground">Most Popular</Badge>}
            <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-emerald">
                {plan.price === 0 ? 'Free' : `$${annual ? (plan.annual / 12).toFixed(0) : plan.price}`}
              </span>
              {plan.price > 0 && <span className="text-sm text-muted-foreground">/{annual ? 'mo (billed yearly)' : 'mo'}</span>}
            </div>
            <div className="mb-4">
              <Badge variant="outline" className="text-xs"><Zap className="h-3 w-3 mr-1" /> {plan.coupons}</Badge>
            </div>
            <ul className="space-y-2 text-sm flex-1 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button
              className={`w-full ${plan.popular ? 'bg-emerald hover:bg-emerald/90 text-emerald-foreground' : ''}`}
              onClick={() => handleSubscribe(plan.name)}
              disabled={subscribing}
            >
              {plan.price === 0 ? 'Start Free' : `Subscribe ${annual ? 'Yearly' : 'Monthly'}`}
            </Button>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-3">Accepted payment methods</p>
        <div className="flex items-center justify-center gap-3">
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">💳 Stripe</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">📱 M-Pesa</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">📱 Tigo Pesa</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">📱 Airtel Money</span>
        </div>
      </div>
    </div>
  );
}
