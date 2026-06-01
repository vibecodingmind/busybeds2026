'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { AppNotification } from '@/types';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetch('/api/notifications?limit=50').then(r => r.json()).then(d => setNotifications(d.data || []));
  }, [user, authLoading]);

  const markRead = async (ids: string[]) => {
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationIds: ids }) });
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={() => markRead(notifications.filter(n => !n.isRead).map(n => n.id))}>
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>
      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card key={n.id} className={`p-4 cursor-pointer transition-colors ${!n.isRead ? 'bg-emerald/5 border-emerald/20' : ''}`} onClick={() => { if (!n.isRead) markRead([n.id]); if (n.link) router.push(n.link); }}>
              <div className="flex items-start gap-3">
                <Bell className={`h-5 w-5 mt-0.5 ${!n.isRead ? 'text-emerald' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!n.isRead ? '' : 'text-muted-foreground'}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-emerald mt-2" />}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><h3 className="font-semibold">No notifications</h3></div>
      )}
    </div>
  );
}
