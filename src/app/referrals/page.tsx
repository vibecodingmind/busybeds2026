'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Copy, Gift, DollarSign, Loader2, Share2 } from 'lucide-react';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  confirmedEarnings: number;
  referrals: { id: string; code: string; usedAt?: string; createdAt: string }[];
  earnings: { id: string; amount: number; status: string; createdAt: string }[];
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referrals/dashboard').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    if (!data?.referralCode) return;
    const url = `${window.location.origin}/register?ref=${data.referralCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Referral link copied!');
  };

  const shareCode = async () => {
    if (!data?.referralCode) return;
    const url = `${window.location.origin}/register?ref=${data.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Join BusyBeds!', text: `Get hotel discounts with BusyBeds. Use my referral code: ${data.referralCode}`, url });
    } else copyCode();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Gift className="h-6 w-6 text-[#ea4d60]" /> Referral Program</h1>

      {/* Referral code card */}
      <Card className="bg-gradient-to-r from-[#ea4d60] to-[#d4344a] text-white">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-1">Your Referral Code</h2>
          <p className="text-white/80 text-sm mb-4">Share with friends — earn when they subscribe!</p>
          <div className="bg-white/20 rounded-lg p-4 flex items-center justify-between">
            <span className="text-2xl font-mono font-bold tracking-wider">{data?.referralCode || 'N/A'}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={copyCode} className="gap-1"><Copy className="h-3.5 w-3.5" /> Copy</Button>
              <Button variant="secondary" size="sm" onClick={shareCode} className="gap-1"><Share2 className="h-3.5 w-3.5" /> Share</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: data?.totalReferrals || 0, icon: Users },
          { label: 'Total Earnings', value: `$${(data?.totalEarnings || 0).toFixed(2)}`, icon: DollarSign },
          { label: 'Pending', value: `$${(data?.pendingEarnings || 0).toFixed(2)}`, icon: Gift },
          { label: 'Confirmed', value: `$${(data?.confirmedEarnings || 0).toFixed(2)}`, icon: DollarSign },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <s.icon className="h-5 w-5 mx-auto text-[#ea4d60] mb-1" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings list */}
      {data?.earnings && data.earnings.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Earnings History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.earnings.map(e => (
                <div key={e.id} className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium">${e.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge className={e.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
