'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSMSPage() {
  const [form, setForm] = useState({ message: '', target: 'all' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.message) { toast.error('Message is required'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/admin/sms/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('SMS broadcast queued!'); setForm({ message: '', target: 'all' }); }
      else toast.error('Failed to send SMS');
    } catch { toast.error('Network error'); }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6" /> SMS Broadcast</h1>
      <Card className="p-6 max-w-2xl">
        <h2 className="font-semibold text-lg mb-4">Send SMS Broadcast</h2>
        <div className="space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Target</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
              <option value="all">All Users with Phone</option><option value="traveler">Travelers</option><option value="owner">Hotel Owners</option>
            </select>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Message (max 160 chars)</label>
            <Textarea rows={3} maxLength={160} placeholder="Type your SMS message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{form.message.length}/160 characters</p>
          </div>
          <Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2" onClick={handleSend} disabled={sending}><Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send SMS'}</Button>
        </div>
      </Card>
    </div>
  );
}
