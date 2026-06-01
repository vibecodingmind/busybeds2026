'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Send, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({ title: '', body: '', target: 'all' });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{ title: string; target: string; sentAt: string }[]>([]);

  const handleSend = async () => {
    if (!form.title || !form.body) { toast.error('Title and message are required'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/admin/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Broadcast sent!'); setHistory(prev => [{ title: form.title, target: form.target, sentAt: new Date().toISOString() }, ...prev]); setForm({ title: '', body: '', target: 'all' }); }
      else toast.error('Failed to send broadcast');
    } catch { toast.error('Network error'); }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6" /> Broadcast Notifications</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Send Broadcast</h2>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title</label><Input placeholder="Notification title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Message</label><Textarea rows={4} placeholder="Write your broadcast message..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Target Audience</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
                <option value="all">All Users</option><option value="traveler">Travelers</option><option value="owner">Hotel Owners</option><option value="admin">Admins</option>
              </select>
            </div>
            <Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white w-full gap-2" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : <><Send className="h-4 w-4" /> Send Broadcast</>}
            </Button>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Broadcasts</h2>
          {history.length === 0 ? <p className="text-muted-foreground text-sm">No broadcasts sent yet in this session.</p> : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between"><p className="font-medium text-sm">{h.title}</p><Badge variant="outline" className="text-[10px]">{h.target}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(h.sentAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
