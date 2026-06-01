'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function InvoicesSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="h-5 w-5" /> Invoices</h2>
      <p className="text-muted-foreground">View and download your invoices.</p>
      <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">No invoices yet. Subscription payments will appear here.</div>
    </Card>
  );
}
