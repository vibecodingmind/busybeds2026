'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Receipt, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description?: string;
  stripeInvoiceId?: string;
  pesapalRef?: string;
  paypalOrderId?: string;
  paidAt?: string;
  createdAt: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  billingCycle: string;
  startsAt: string;
  expiresAt: string;
  package: { name: string; priceMonthly: number; couponLimitPerPeriod: number };
}

const STATUS_MAP: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Completed' },
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pending' },
  failed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Failed' },
  refunded: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle, label: 'Refunded' },
};

const TYPE_MAP: Record<string, string> = {
  subscription: 'Subscription',
  gift_card_purchase: 'Gift Card',
  deposit: 'Deposit',
  upgrade: 'Upgrade',
  refund: 'Refund',
};

export default function BillingPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [managingStripe, setManagingStripe] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/billing/transactions').then(r => r.json()).then(d => d.data || []),
      fetch('/api/subscriptions/my').then(r => r.json()).then(d => d.data || null),
    ]).then(([txns, sub]) => {
      setTransactions(txns);
      setSubscription(sub);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const handleManageStripe = async () => {
    setManagingStripe(true);
    try {
      const res = await fetch('/api/payments/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error('Failed to open billing portal');
    } catch { toast.error('Failed to open billing portal'); }
    setManagingStripe(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6 text-[#ea4d60]" /> Billing & Transactions</h1>

      {/* Current subscription */}
      {subscription && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-lg">{subscription.package.name} Plan</h3>
                <p className="text-sm text-gray-500">
                  ${subscription.package.priceMonthly}/mo · {subscription.package.couponLimitPerPeriod} coupons/period
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {subscription.billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing · Renews {new Date(subscription.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                  {subscription.status === 'active' ? 'Active' : subscription.status}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleManageStripe} disabled={managingStripe} className="gap-1.5">
                  {managingStripe ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                  Manage Billing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="gift_card_purchase">Gift Card</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="upgrade">Upgrade</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions list */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-500">No transactions found</h3>
          <p className="text-sm text-gray-400 mt-1">Your billing history will appear here</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => {
            const st = STATUS_MAP[tx.status] || STATUS_MAP.pending;
            const Icon = st.icon;
            return (
              <Card key={tx.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${st.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description || TYPE_MAP[tx.type] || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()} · {tx.currency}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.status === 'refunded' ? 'text-blue-600' : ''}`}>
                      {tx.status === 'refunded' ? '-' : ''}${tx.amount.toFixed(2)}
                    </p>
                    <Badge variant="outline" className={`text-[10px] ${st.color} border-0`}>{st.label}</Badge>
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
