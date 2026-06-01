'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function BillingSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Wallet className="h-5 w-5" /> Billing</h2>
      <p className="text-muted-foreground">Manage your billing settings, view payment history, and update billing information.</p>
      <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">No billing records yet. Subscribe to a plan to see billing details.</div>
    </Card>
  );
}
