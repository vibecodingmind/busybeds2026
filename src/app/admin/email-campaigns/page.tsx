'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminEmailCampaignsPage() {
  const [form, setForm] = useState({ subject: '', body: '', target: 'all' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.subject || !form.body) { toast.error('Subject and body are required'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/admin/email-campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Email campaign queued!'); setForm({ subject: '', body: '', target: 'all' }); }
      else toast.error('Failed to send campaign');
    } catch { toast.error('Network error'); }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6" /> Email Campaigns</h1>
      <Card className="p-6 max-w-2xl">
        <h2 className="font-semibold text-lg mb-4">Compose Email</h2>
        <div className="space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Subject</label><Input placeholder="Email subject line" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="text-sm font-medium mb-1 block">Target</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
              <option value="all">All Users</option><option value="traveler">Travelers</option><option value="owner">Hotel Owners</option><option value="subscribers">Active Subscribers</option>
            </select>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Email Body</label><Textarea rows={8} placeholder="Write your email content here..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
          <Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2" onClick={handleSend} disabled={sending}><Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Campaign'}</Button>
        </div>
      </Card>
    </div>
  );
}
