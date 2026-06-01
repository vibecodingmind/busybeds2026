'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CreditCard, Plus, Trash2, Star, Smartphone, Loader2 } from 'lucide-react';

interface PaymentMethodData {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  mobileNumber?: string;
  mobileProvider?: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '' });
  const [newMobile, setNewMobile] = useState({ phone: '', provider: 'mpesa' });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setMethods(data.data || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleAddCard = async () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc) {
      toast.error('Please fill in all card details');
      return;
    }
    setAdding(true);
    try {
      const [month, year] = newCard.expiry.split('/');
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'card',
          last4: newCard.number.slice(-4),
          brand: newCard.number.startsWith('4') ? 'Visa' : newCard.number.startsWith('5') ? 'Mastercard' : 'Card',
          expiryMonth: parseInt(month),
          expiryYear: parseInt('20' + year),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Card added successfully');
        setNewCard({ number: '', expiry: '', cvc: '' });
        fetchMethods();
      } else toast.error(data.error || 'Failed to add card');
    } catch { toast.error('Failed to add card'); }
    setAdding(false);
  };

  const handleAddMobile = async () => {
    if (!newMobile.phone) { toast.error('Please enter phone number'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mobile',
          mobileNumber: newMobile.phone,
          mobileProvider: newMobile.provider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Mobile payment added');
        setNewMobile({ phone: '', provider: 'mpesa' });
        fetchMethods();
      } else toast.error(data.error || 'Failed to add');
    } catch { toast.error('Failed to add'); }
    setAdding(false);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });
      toast.success('Default payment method updated');
      fetchMethods();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/payment-methods?id=${id}`, { method: 'DELETE' });
      toast.success('Payment method removed');
      fetchMethods();
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;

  const BRAND_LOGO: Record<string, string> = { Visa: '💳', Mastercard: '💳', Card: '💳' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-[#ea4d60]" /> Payment Methods</h1>

      {/* Existing methods */}
      {methods.length > 0 ? (
        <div className="space-y-3">
          {methods.map(m => (
            <Card key={m.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {m.type === 'card' ? <CreditCard className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {m.type === 'card' ? `${BRAND_LOGO[m.brand || 'Card'] || ''} •••• ${m.last4}` : `${m.mobileProvider?.toUpperCase()} ${m.mobileNumber}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.type === 'card' ? `Expires ${m.expiryMonth}/${m.expiryYear}` : 'Mobile Money'}
                    </p>
                  </div>
                  {m.isDefault && <Badge className="bg-[#ea4d60]/10 text-[#ea4d60] text-[10px]"><Star className="h-3 w-3 mr-0.5" /> Default</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {!m.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(m.id)} className="text-xs">Set Default</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-500">No payment methods saved</h3>
          <p className="text-sm text-gray-400 mt-1">Add a card or mobile money account below</p>
        </Card>
      )}

      {/* Add Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Card</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input placeholder="Card number" value={newCard.number} onChange={e => setNewCard(p => ({ ...p, number: e.target.value }))} /></div>
            <Input placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard(p => ({ ...p, expiry: e.target.value }))} />
            <Input placeholder="CVC" value={newCard.cvc} onChange={e => setNewCard(p => ({ ...p, cvc: e.target.value }))} />
          </div>
          <Button onClick={handleAddCard} disabled={adding} className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Card
          </Button>
        </CardContent>
      </Card>

      {/* Add Mobile Money */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Smartphone className="h-4 w-4" /> Add Mobile Money</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="+255 700 000 000" value={newMobile.phone} onChange={e => setNewMobile(p => ({ ...p, phone: e.target.value }))} />
            <div className="flex gap-2">
              {['mpesa', 'tigo', 'airtel'].map(p => (
                <Button key={p} variant={newMobile.provider === p ? 'default' : 'outline'} size="sm"
                  className={newMobile.provider === p ? 'bg-[#ea4d60] text-white' : ''}
                  onClick={() => setNewMobile(prev => ({ ...prev, provider: p }))}>
                  {p === 'mpesa' ? 'M-Pesa' : p === 'tigo' ? 'Tigo' : 'Airtel'}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={handleAddMobile} disabled={adding} className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Mobile Money
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
