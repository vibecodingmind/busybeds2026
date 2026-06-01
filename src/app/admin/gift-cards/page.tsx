'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Gift, Plus, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface GiftCardData { id: string; code: string; amount: number; balance: number; recipientEmail?: string; recipientName?: string; isActive: boolean; expiresAt?: string; purchasedAt: string; }

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ amount: 50, recipientEmail: '', recipientName: '', message: '' });

  const fetchCards = () => { setLoading(true); fetch('/api/admin/gift-cards').then(r => r.json()).then(d => { setCards(d.data || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(fetchCards, []);

  const filtered = cards.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || (c.recipientEmail || '').toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.amount || form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
    const res = await fetch('/api/admin/gift-cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { toast.success('Gift card created!'); setDialog(false); setForm({ amount: 50, recipientEmail: '', recipientName: '', message: '' }); fetchCards(); }
    else toast.error('Failed to create gift card');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold flex items-center gap-2"><Gift className="h-6 w-6" /> Gift Cards</h1><Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2" onClick={() => setDialog(true)}><Plus className="h-4 w-4" /> Create Gift Card</Button></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by code or email..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center shrink-0"><Gift className="h-5 w-5 text-[#ea4d60]" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><p className="font-mono font-semibold">{c.code}</p><button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Code copied!'); }} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button></div>
                    <p className="text-sm text-muted-foreground">{c.recipientEmail || 'No recipient'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right"><p className="font-bold">${c.amount}</p><p className="text-xs text-muted-foreground">Balance: ${c.balance}</p></div>
                  <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-xs">{c.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No gift cards found</p></Card>}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent><DialogHeader><DialogTitle>Create Gift Card</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Amount ($)</label><Input type="number" min={1} value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Recipient Email</label><Input type="email" value={form.recipientEmail} onChange={e => setForm({ ...form, recipientEmail: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Recipient Name</label><Input value={form.recipientName} onChange={e => setForm({ ...form, recipientName: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Message</label><Input value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white" onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
