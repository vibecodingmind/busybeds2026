'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function PaymentMethodsSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Methods</h2>
      <p className="text-muted-foreground">Manage your payment methods for subscriptions.</p>
      <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">No payment methods saved yet. Add a card when subscribing to a plan.</div>
    </Card>
  );
}
