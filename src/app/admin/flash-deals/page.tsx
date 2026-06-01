'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFlashDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hotelId: '', title: '', discountPercent: 20, startsAt: '', endsAt: '' });

  useEffect(() => { fetch('/api/flash-deals').then(r => r.json()).then(d => setDeals(d.data || [])); }, []);

  const create = async () => {
    const res = await fetch('/api/flash-deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { toast.success('Flash deal created!'); setShowForm(false); fetch('/api/flash-deals').then(r => r.json()).then(d => setDeals(d.data || [])); }
    else toast.error(data.error || 'Failed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Flash Deals</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> New Deal</Button>
      </div>
      {showForm && (
        <Card className="p-4 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Hotel ID</Label><Input value={form.hotelId} onChange={e => setForm(f => ({...f, hotelId: e.target.value}))} /></div>
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} /></div>
            <div><Label>Discount %</Label><Input type="number" value={form.discountPercent} onChange={e => setForm(f => ({...f, discountPercent: parseInt(e.target.value)}))} /></div>
            <div><Label>Starts</Label><Input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({...f, startsAt: e.target.value}))} /></div>
            <div><Label>Ends</Label><Input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({...f, endsAt: e.target.value}))} /></div>
          </div>
          <Button className="mt-4 bg-emerald text-emerald-foreground" onClick={create}>Create Flash Deal</Button>
        </Card>
      )}
      <div className="space-y-2">
        {deals.map(deal => (
          <Card key={deal.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-gold" /><span className="font-semibold text-sm">{deal.title}</span></div>
              <Badge className="bg-gold text-gold-foreground">{deal.discountPercent}% OFF</Badge>
            </div>
          </Card>
        ))}
        {deals.length === 0 && <p className="text-muted-foreground text-center py-8">No flash deals</p>}
      </div>
    </div>
  );
}
