'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Users, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AffiliatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetch('/api/affiliates').then(r => r.json()).then(d => setData(d.data));
  }, [user, authLoading]);

  const copyLink = () => {
    const link = `${window.location.origin}/register?ref=${data?.referralCode}`;
    navigator.clipboard?.writeText(link);
    toast.success('Referral link copied!');
  };

  const shareWhatsApp = () => {
    const link = `${window.location.origin}/register?ref=${data?.referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Save on hotels with BusyBeds! Use my referral code ${data?.referralCode}: ${link}`)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Affiliate Program</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center"><Users className="h-6 w-6 text-emerald mx-auto mb-2" /><p className="text-2xl font-bold">{data?.totalReferrals || 0}</p><p className="text-xs text-muted-foreground">Total Referrals</p></Card>
        <Card className="p-4 text-center"><DollarSign className="h-6 w-6 text-gold mx-auto mb-2" /><p className="text-2xl font-bold">${data?.pendingEarnings?.toFixed(2) || '0.00'}</p><p className="text-xs text-muted-foreground">Pending Earnings</p></Card>
        <Card className="p-4 text-center"><DollarSign className="h-6 w-6 text-emerald mx-auto mb-2" /><p className="text-2xl font-bold">${data?.confirmedEarnings?.toFixed(2) || '0.00'}</p><p className="text-xs text-muted-foreground">Confirmed Earnings</p></Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle>Your Referral Link</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${data?.referralCode || ''}`} className="font-mono text-sm" />
            <Button onClick={copyLink}><Copy className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={shareWhatsApp}><Share2 className="h-4 w-4 mr-2" /> Share on WhatsApp</Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Code: <Badge className="font-mono">{data?.referralCode || '...'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3"><Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">1</Badge> Share your referral link with friends</li>
            <li className="flex gap-3"><Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">2</Badge> They sign up and subscribe to a plan</li>
            <li className="flex gap-3"><Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">3</Badge> You earn 100 loyalty points + cash commission</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
