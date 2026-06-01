'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, FileText, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Blog { id: string; title: string; slug: string; excerpt: string; status: string; publishedAt?: string; authorId: string; }

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', status: 'draft' });

  const fetchBlogs = () => { setLoading(true); fetch('/api/blog').then(r => r.json()).then(d => { setBlogs(d.data || d || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(fetchBlogs, []);

  const filtered = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.slug.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const res = await fetch('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, slug }) });
    if (res.ok) { toast.success('Blog post created!'); setDialog(false); setForm({ title: '', excerpt: '', content: '', status: 'draft' }); fetchBlogs(); }
    else toast.error('Failed to create post');
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Post deleted'); fetchBlogs(); } else toast.error('Failed to delete');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2" onClick={() => setDialog(true)}><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search posts..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div> : (
        <div className="space-y-2">
          {filtered.map(b => (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0"><p className="font-semibold truncate">{b.title}</p><p className="text-sm text-muted-foreground">{b.slug}</p></div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={b.status === 'published' ? 'default' : 'secondary'} className="capitalize text-xs">{b.status}</Badge>
                  {b.publishedAt && <span className="text-xs text-muted-foreground">{new Date(b.publishedAt).toLocaleDateString()}</span>}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(b.slug)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="p-8 text-center"><FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" /><p className="text-muted-foreground">No blog posts found</p></Card>}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent><DialogHeader><DialogTitle>New Blog Post</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Excerpt</label><Input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Content (HTML)</label><Textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Status</label><select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white" onClick={handleCreate}>Create Post</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
