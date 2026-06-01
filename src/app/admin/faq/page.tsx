'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, HelpCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FAQ { id: string; question: string; answer: string; category: string; sortOrder: number; isActive: boolean; }
const CATS = ['general', 'payments', 'subscription', 'coupons', 'referrals'];

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', sortOrder: 0, isActive: true });

  const fetchFAQs = () => { setLoading(true); fetch('/api/faq').then(r => r.json()).then(d => { setFaqs(d.data || d || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(fetchFAQs, []);

  const filtered = faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.question || !form.answer) { toast.error('Question and answer are required'); return; }
    const res = await fetch('/api/faq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { toast.success('FAQ created!'); setDialog(false); setForm({ question: '', answer: '', category: 'general', sortOrder: 0, isActive: true }); fetchFAQs(); }
    else toast.error('Failed to create FAQ');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    const res = await fetch(`/api/faq?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('FAQ deleted'); fetchFAQs(); } else toast.error('Failed to delete');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">FAQ Management</h1><Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2" onClick={() => setDialog(true)}><Plus className="h-4 w-4" /> Add FAQ</Button></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search FAQs..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(f => (
            <Card key={f.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1"><p className="font-semibold">{f.question}</p><p className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.answer}</p></div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{f.category}</Badge>
                  <Badge variant={f.isActive ? 'default' : 'secondary'} className="text-xs">{f.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No FAQs found</p></Card>}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent><DialogHeader><DialogTitle>Add FAQ</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Question</label><Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Answer</label><Textarea rows={4} value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Category</label><select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-sm font-medium mb-1 block">Sort Order</label><Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Active</label><select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white" onClick={handleCreate}>Create FAQ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
