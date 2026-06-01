'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Gift, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [10, 25, 50, 100];

export default function GiftCardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [giftCards, setGiftCards] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetch('/api/gift-cards/my').then(r => r.json()).then(d => setGiftCards(d.data || []));
  }, [user, authLoading]);

  const purchase = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount < 5) { toast.error('Minimum amount is $5'); return; }
    const res = await fetch('/api/gift-cards/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: finalAmount, recipientEmail, recipientName, message }),
    });
    const data = await res.json();
    if (data.success) { toast.success('Gift card purchased!'); fetch('/api/gift-cards/my').then(r => r.json()).then(d => setGiftCards(d.data || [])); }
    else toast.error(data.error || 'Failed to purchase');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Gift Cards</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Buy a Gift Card</h2>
            <div className="mb-4">
              <Label className="mb-2 block">Amount</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_AMOUNTS.map(a => (
                  <Button key={a} variant={amount === a && !customAmount ? 'default' : 'outline'} size="sm" onClick={() => { setAmount(a); setCustomAmount(''); }}>
                    ${a}
                  </Button>
                ))}
              </div>
              <Input type="number" placeholder="Custom amount" className="mt-2" value={customAmount} onChange={e => setCustomAmount(e.target.value)} min="5" />
            </div>
            <div className="space-y-3">
              <div><Label>Recipient Name</Label><Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Jane Doe" /></div>
              <div><Label>Recipient Email</Label><Input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="jane@example.com" /></div>
              <div><Label>Personal Message (Optional)</Label><Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Happy travels!" /></div>
            </div>
            <Button className="w-full mt-4 bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={purchase}>
              <Gift className="h-4 w-4 mr-2" /> Purchase Gift Card
            </Button>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Gift Cards</h2>
          {giftCards.length > 0 ? (
            <div className="space-y-3">
              {giftCards.map(gc => (
                <Card key={gc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-semibold">${gc.amount} Gift Card</p><p className="text-sm text-muted-foreground font-mono">{gc.code}</p></div>
                    <Badge className={gc.isActive ? 'bg-emerald text-emerald-foreground' : 'bg-muted'}>{gc.isActive ? 'Active' : 'Used'}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">No gift cards yet.</p>}
        </div>
      </div>
    </div>
  );
}
