'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    emailCoupons: true,
    emailExpiry: true,
    emailFlashDeals: true,
    emailMessages: true,
    smsCoupons: false,
    smsExpiry: false,
    pushAll: true,
  });

  if (!user) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Email Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'emailCoupons', label: 'Coupon alerts' },
              { key: 'emailExpiry', label: 'Expiry reminders' },
              { key: 'emailFlashDeals', label: 'Flash deals' },
              { key: 'emailMessages', label: 'Messages' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <Label>{item.label}</Label>
                <Switch checked={prefs[item.key as keyof typeof prefs]} onCheckedChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-3">SMS Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'smsCoupons', label: 'Coupon alerts' },
              { key: 'smsExpiry', label: 'Expiry reminders' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <Label>{item.label}</Label>
                <Switch checked={prefs[item.key as keyof typeof prefs]} onCheckedChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-3">Push Notifications</h3>
          <div className="flex items-center justify-between">
            <Label>Enable push notifications</Label>
            <Switch checked={prefs.pushAll} onCheckedChange={v => setPrefs(p => ({ ...p, pushAll: v }))} />
          </div>
        </div>
        <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</Button>
      </div>
    </Card>
  );
}
