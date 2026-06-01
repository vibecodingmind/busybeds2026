'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';

interface Setting { key: string; value: string; }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => { setSettings(d.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, value: string) => {
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    if (res.ok) toast.success(`Saved ${key}`); else toast.error('Failed to save');
  };

  const handleAdd = async () => {
    if (!newKey) { toast.error('Key is required'); return; }
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: newKey, value: newVal }) });
    if (res.ok) { toast.success('Setting added'); setSettings(prev => [...prev, { key: newKey, value: newVal }]); setNewKey(''); setNewVal(''); }
    else toast.error('Failed to add');
  };

  const grouped = settings.reduce((acc: Record<string, Setting[]>, s) => {
    const prefix = s.key.includes('_') ? s.key.split('_')[0] : 'general';
    (acc[prefix] = acc[prefix] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Site Settings</h1>
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Add New Setting</h3>
        <div className="flex gap-3">
          <Input placeholder="Setting key (e.g. email_from)" className="flex-1" value={newKey} onChange={e => setNewKey(e.target.value)} />
          <Input placeholder="Value" className="flex-1" value={newVal} onChange={e => setNewVal(e.target.value)} />
          <Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white gap-2" onClick={handleAdd}><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </Card>
      {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div> : (
        Object.entries(grouped).map(([group, items]) => (
          <Card key={group} className="p-4">
            <h3 className="font-semibold mb-3 capitalize">{group}</h3>
            <div className="space-y-3">
              {items.map(s => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground w-48 shrink-0 truncate">{s.key}</span>
                  <Input className="flex-1" value={s.value} onChange={e => setSettings(prev => prev.map(p => p.key === s.key ? { ...p, value: e.target.value } : p))} />
                  <Button size="sm" variant="outline" onClick={() => handleSave(s.key, s.value)}><Save className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
