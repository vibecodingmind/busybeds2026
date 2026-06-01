'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: '', bio: '', phone: '', location: '', websiteUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({
      fullName: user.fullName || '',
      bio: (user as any).bio || '',
      phone: user.phone || '',
      location: user.location || '',
      websiteUrl: (user as any).websiteUrl || '',
    });
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) toast.success('Profile updated!');
      else toast.error(data.error || 'Failed to update');
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
      <div className="space-y-4">
        <div><Label>Full Name</Label><Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
        <div><Label>Bio</Label><Input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself" /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+255 700 000 000" /></div>
        <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Dar es Salaam, Tanzania" /></div>
        <div><Label>Website</Label><Input value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} placeholder="https://..." /></div>
        <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}
