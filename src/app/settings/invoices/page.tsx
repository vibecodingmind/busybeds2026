'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Download, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface InvoiceData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  subscriptionId?: string;
}

const STATUS_MAP: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  paid: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Paid' },
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pending' },
  overdue: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle, label: 'Overdue' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices').then(r => r.json()).then(d => {
      setInvoices(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDownload = (invoice: InvoiceData) => {
    // Generate a simple text invoice for download
    const content = [
      `BUSYBEDS INVOICE`,
      `==================`,
      ``,
      `Invoice ID: ${invoice.id}`,
      `Date: ${new Date(invoice.issuedAt).toLocaleDateString()}`,
      `${invoice.dueAt ? `Due Date: ${new Date(invoice.dueAt).toLocaleDateString()}` : ''}`,
      `${invoice.paidAt ? `Paid Date: ${new Date(invoice.paidAt).toLocaleDateString()}` : ''}`,
      ``,
      `Amount: ${invoice.currency} ${invoice.amount.toFixed(2)}`,
      `Status: ${invoice.status.toUpperCase()}`,
      ``,
      `Thank you for your business!`,
      `BusyBeds - Hotel Discount Platform`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id.slice(-8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-[#ea4d60]" /> Invoices</h1>

      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-500">No invoices yet</h3>
          <p className="text-sm text-gray-400 mt-1">Invoices will appear when you make a purchase</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => {
            const st = STATUS_MAP[inv.status] || STATUS_MAP.pending;
            const Icon = st.icon;
            return (
              <Card key={inv.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${st.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Invoice #{inv.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">
                        Issued {new Date(inv.issuedAt).toLocaleDateString()}
                        {inv.paidAt && ` · Paid ${new Date(inv.paidAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{inv.currency} {inv.amount.toFixed(2)}</p>
                      <Badge variant="outline" className={`text-[10px] ${st.color} border-0`}>{st.label}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(inv)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
