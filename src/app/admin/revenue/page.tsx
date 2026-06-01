'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, CreditCard, Smartphone, RotateCcw } from 'lucide-react';

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/revenue').then(r => r.json()).then(d => setData(d.data)); }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Revenue</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${(data?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
          { label: 'Stripe', value: `$${(data?.stripeRevenue || 0).toLocaleString()}`, icon: CreditCard },
          { label: 'Pesapal', value: `$${(data?.pesapalRevenue || 0).toLocaleString()}`, icon: Smartphone },
          { label: 'Refunds', value: data?.refunds || 0, icon: RotateCcw },
        ].map(card => (
          <Card key={card.label} className="p-4">
            <card.icon className="h-5 w-5 text-emerald mb-2" />
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6 mt-6">
        <p className="text-sm text-muted-foreground mb-1">Monthly Recurring Revenue (MRR)</p>
        <p className="text-3xl font-bold text-emerald">${(data?.mrr || 0).toLocaleString()}</p>
      </Card>
    </div>
  );
}
