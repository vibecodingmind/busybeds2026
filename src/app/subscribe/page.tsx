'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Check, Zap, CreditCard, Smartphone, Wallet, Loader2, ArrowLeft, Shield } from 'lucide-react';
import type { SubscriptionPackage } from '@/types';

const PLANS = [
  { name: 'Explorer', price: 0, annual: 0, coupons: '1 total', tiers: 'Standard', features: ['1 coupon ever', 'Standard hotels only', 'Basic support'] },
  { name: 'Starter', price: 9.99, annual: 99, coupons: '5/month', tiers: 'Standard + Premium', features: ['5 coupons/month', 'Premium hotel access (3/mo)', 'Email support', 'Loyalty points'] },
  { name: 'Pro', price: 19.99, annual: 199, coupons: '15/month', tiers: 'All including Luxury', features: ['15 coupons/month', 'All hotel tiers', 'Priority support', 'Double loyalty points', 'Flash deal alerts'], popular: true },
  { name: 'Premium', price: 34.99, annual: 349, coupons: 'Unlimited', tiers: 'All + Exclusive', features: ['Unlimited coupons', 'Exclusive hotel access', '24/7 concierge', 'Triple loyalty points', 'Early flash deals', 'Gift card discounts'] },
];

export default function SubscribePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-[#ea4d60]" /></div>}>
      <SubscribePage />
    </Suspense>
  );
}

function SubscribePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutPlan = searchParams.get('checkout');
  const [annual, setAnnual] = useState(false);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'pesapal'>('stripe');
  const [processing, setProcessing] = useState(false);
  const [pesapalPhone, setPesapalPhone] = useState('');

  useEffect(() => {
    fetch('/api/subscriptions/packages').then(r => r.json()).then(d => setPackages(d.data || []));
  }, []);

  const selectedPlan = checkoutPlan ? PLANS.find(p => p.name === checkoutPlan) : null;
  const selectedPkg = checkoutPlan ? packages.find(p => p.name === checkoutPlan) : null;

  const handleFreeSubscribe = async () => {
    if (!user) { router.push('/login'); return; }
    setSubscribing('Explorer');
    const pkg = packages.find(p => p.name === 'Explorer');
    if (!pkg) { setSubscribing(null); return; }
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, billingCycle: 'monthly', paymentMethod: 'stripe' }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Welcome to BusyBeds!'); router.push('/profile'); }
      else toast.error(data.error || 'Failed to subscribe');
    } catch { toast.error('Something went wrong'); }
    setSubscribing(null);
  };

  const handlePaidSubscribe = async () => {
    if (!user) { router.push('/login'); return; }
    if (!selectedPkg) return;
    if (paymentMethod === 'pesapal' && !pesapalPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          billingCycle: annual ? 'annual' : 'monthly',
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success && data.orderId && paymentMethod === 'paypal') {
        // PayPal - redirect to approve URL
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
        else toast.error('PayPal checkout failed. Please try another method.');
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch { toast.error('Payment failed. Please try again.'); }
    setProcessing(false);
  };

  // Checkout view
  if (selectedPlan && selectedPkg && selectedPlan.price > 0) {
    const price = annual ? (selectedPlan.annual / 12).toFixed(2) : selectedPlan.price.toFixed(2);
    const total = annual ? selectedPlan.annual : selectedPlan.price;

    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button onClick={() => router.push('/subscribe')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </button>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Plan summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                <Badge className="bg-[#ea4d60]/10 text-[#ea4d60]">{selectedPlan.coupons}</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${price}</span>
                <span className="text-sm text-gray-500">/{annual ? 'mo (billed yearly)' : 'mo'}</span>
              </div>
              {annual && <p className="text-sm text-green-600 mt-1">Total: ${total}/year — Save 17%</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500">Billing cycle</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${!annual ? 'font-semibold' : 'text-gray-400'}`}>Monthly</span>
                  <Switch checked={annual} onCheckedChange={setAnnual} />
                  <span className={`text-xs ${annual ? 'font-semibold' : 'text-gray-400'}`}>Annual</span>
                </div>
              </div>
            </div>

            {/* Payment method tabs */}
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'stripe' | 'paypal' | 'pesapal')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stripe" className="gap-1.5 text-xs">
                  <CreditCard className="h-3.5 w-3.5" /> Card
                </TabsTrigger>
                <TabsTrigger value="paypal" className="gap-1.5 text-xs">
                  <Wallet className="h-3.5 w-3.5" /> PayPal
                </TabsTrigger>
                <TabsTrigger value="pesapal" className="gap-1.5 text-xs">
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stripe" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Pay securely with your credit or debit card via Stripe.</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="h-3.5 w-3.5" /> 256-bit SSL encrypted payment
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium">Visa</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium">Mastercard</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium">Amex</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paypal" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Pay with your PayPal account. You will be redirected to PayPal to complete the purchase.</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
                    You&apos;ll be redirected to PayPal to approve the payment.
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pesapal" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Pay via M-Pesa, Tigo Pesa, Airtel Money or bank transfer through Pesapal.</p>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+255 700 000 000"
                      value={pesapalPhone}
                      onChange={(e) => setPesapalPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-[10px] font-medium text-green-700">M-Pesa</span>
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px] font-medium text-blue-700">Tigo Pesa</span>
                    <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded text-[10px] font-medium text-red-700">Airtel Money</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Pay button */}
            <Button
              onClick={handlePaidSubscribe}
              disabled={processing}
              className="w-full bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white h-12 text-base gap-2"
            >
              {processing ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              ) : (
                <>Pay ${total.toFixed(2)} {annual ? '/year' : '/month'}</>
              )}
            </Button>

            <p className="text-[11px] text-gray-400 text-center">
              By subscribing, you agree to our Terms of Service. Cancel anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default pricing view
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">Unlock exclusive hotel discounts across Africa. Cancel anytime.</p>
        <div className="flex items-center justify-center gap-3">
          <Label htmlFor="billing" className={!annual ? 'font-semibold' : 'text-muted-foreground'}>Monthly</Label>
          <Switch id="billing" checked={annual} onCheckedChange={setAnnual} />
          <Label htmlFor="billing" className={annual ? 'font-semibold' : 'text-muted-foreground'}>
            Annual <Badge className="ml-1 bg-amber-100 text-amber-700 text-[10px]">Save 17%</Badge>
          </Label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {PLANS.map(plan => (
          <Card key={plan.name} className={`relative p-6 flex flex-col ${plan.popular ? 'ring-2 ring-[#ea4d60] shadow-xl' : ''}`}>
            {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ea4d60] text-white">Most Popular</Badge>}
            <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-[#ea4d60]">
                {plan.price === 0 ? 'Free' : `$${annual ? (plan.annual / 12).toFixed(0) : plan.price}`}
              </span>
              {plan.price > 0 && <span className="text-sm text-muted-foreground">/{annual ? 'mo (billed yearly)' : 'mo'}</span>}
            </div>
            <div className="mb-4">
              <Badge variant="outline" className="text-xs"><Zap className="h-3 w-3 mr-1" /> {plan.coupons}</Badge>
            </div>
            <ul className="space-y-2 text-sm flex-1 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ea4d60] shrink-0" /> {f}</li>
              ))}
            </ul>
            <Button
              className={`w-full ${plan.popular ? 'bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white' : ''}`}
              onClick={() => {
                if (plan.price === 0) handleFreeSubscribe();
                else router.push(`/subscribe?checkout=${plan.name}`);
              }}
              disabled={subscribing === plan.name}
            >
              {subscribing === plan.name ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.price === 0 ? 'Start Free' : `Subscribe ${annual ? 'Yearly' : 'Monthly'}`}
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-3">Accepted payment methods</p>
        <div className="flex items-center justify-center gap-3">
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">💳 Stripe</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">🅿️ PayPal</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">📱 M-Pesa</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">📱 Tigo Pesa</span>
          <span className="px-3 py-1 bg-card border border-border rounded text-xs font-medium">📱 Airtel Money</span>
        </div>
      </div>
    </div>
  );
}
