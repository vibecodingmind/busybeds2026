'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState({ emailCoupons: true, emailExpiry: true, emailFlashDeals: true, emailMessages: true, smsCoupons: true, smsExpiry: false, pushAll: true });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetch('/api/notifications/preferences').then(r => r.json()).then(d => { if (d.data) setPrefs(d.data); });
  }, [user]);

  const save = async () => {
    const res = await fetch('/api/notifications/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) });
    if (res.ok) toast.success('Preferences saved!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Settings</Link>
      <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Bell className="h-5 w-5" /> Email Notifications</h3>
        {(['emailCoupons', 'emailExpiry', 'emailFlashDeals', 'emailMessages'] as const).map(key => (
          <div key={key} className="flex items-center justify-between">
            <Label>{key.replace('email', '').replace(/([A-Z])/g, ' $1').trim()}</Label>
            <Switch checked={prefs[key]} onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
        <h3 className="font-semibold pt-4">SMS Notifications</h3>
        {(['smsCoupons', 'smsExpiry'] as const).map(key => (
          <div key={key} className="flex items-center justify-between">
            <Label>{key.replace('sms', '').replace(/([A-Z])/g, ' $1').trim()}</Label>
            <Switch checked={prefs[key]} onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
        <div className="flex items-center justify-between pt-4">
          <Label>Push Notifications</Label>
          <Switch checked={prefs.pushAll} onCheckedChange={v => setPrefs(p => ({ ...p, pushAll: v }))} />
        </div>
        <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={save}>Save Preferences</Button>
      </Card>
    </div>
  );
}
