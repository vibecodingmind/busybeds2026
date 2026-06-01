'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Shield, Ban, Gift, Eye } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users?search=${search}&page=${page}&limit=20`).then(r => r.json()).then(d => {
      setUsers(d.data || []); setTotal(d.total || 0); setLoading(false);
    });
  }, [search, page]);

  const suspend = async (id: string) => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;
    await fetch(`/api/admin/users/${id}/suspend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, suspendedAt: new Date() } : u));
  };

  const ban = async (id: string) => {
    if (!confirm('Ban this user?')) return;
    await fetch(`/api/admin/users/${id}/ban`, { method: 'POST' });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: true } : u));
  };

  const comp = async (id: string) => {
    const pkgId = prompt('Enter subscription package ID:');
    if (!pkgId) return;
    await fetch(`/api/admin/users/${id}/comp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: pkgId, reason: 'Admin comp' }) });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{total} total users</p>
      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div> : (
        <div className="space-y-2">
          {users.map(user => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-sm font-bold text-emerald shrink-0">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="capitalize">{user.role}</Badge>
                  {user.isBanned && <Badge className="bg-destructive text-white">Banned</Badge>}
                  {user.suspendedAt && <Badge className="bg-gold text-gold-foreground">Suspended</Badge>}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Suspend" onClick={() => suspend(user.id)}><Shield className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Ban" onClick={() => ban(user.id)}><Ban className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Comp" onClick={() => comp(user.id)}><Gift className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="outline" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
