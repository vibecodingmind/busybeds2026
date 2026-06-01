'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const changePassword = async () => {
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    const res = await fetch('/api/settings/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
    const data = await res.json();
    if (data.success) { toast.success('Password changed!'); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    else toast.error(data.error || 'Failed to change password');
  };

  if (!user) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</h2>
      <div className="space-y-4">
        <div><Label>Current Password</Label><Input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} /></div>
        <div><Label>New Password</Label><Input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
        <div><Label>Confirm New Password</Label><Input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} /></div>
        <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={changePassword}>Update Password</Button>
      </div>
    </Card>
  );
}
