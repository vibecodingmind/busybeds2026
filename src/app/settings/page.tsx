'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Lock, Bell, Shield, CreditCard, Globe, HelpCircle, Download } from 'lucide-react';
import Link from 'next/link';

const SETTINGS_NAV = [
  { href: '/settings', icon: User, label: 'Profile' },
  { href: '/settings/security', icon: Lock, label: 'Security' },
  { href: '/settings/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings/privacy', icon: Shield, label: 'Privacy' },
  { href: '/settings/subscription', icon: CreditCard, label: 'Subscription' },
  { href: '/settings/preferences', icon: Globe, label: 'Preferences' },
  { href: '/settings/help', icon: HelpCircle, label: 'Help' },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', bio: '', phone: '', location: '', websiteUrl: '' });

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) setForm({ fullName: user.fullName || '', bio: '', phone: '', location: '', websiteUrl: '' });
  }, [user, authLoading]);

  const saveProfile = async () => {
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) toast.success('Profile updated!');
    else toast.error(data.error || 'Failed to update');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid md:grid-cols-4 gap-8">
        <nav className="space-y-1">
          {SETTINGS_NAV.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors">
              <item.icon className="h-4 w-4 text-muted-foreground" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:col-span-3">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
              <div><Label>Bio</Label><Input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+255 700 000 000" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Dar es Salaam, Tanzania" /></div>
              <div><Label>Website</Label><Input value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} placeholder="https://..." /></div>
              <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={saveProfile}>Save Changes</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
