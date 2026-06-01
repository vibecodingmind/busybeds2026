'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ScrollText, Search, Download, ChevronLeft, ChevronRight, Loader2, User, Shield, Trash2, Edit, Plus } from 'lucide-react';

interface AuditEntry {
  id: string;
  userId?: string;
  action: string;
  target?: string;
  metadata?: string;
  ip?: string;
  createdAt: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  login: User,
  logout: User,
  admin: Shield,
};

function getActionIcon(action: string) {
  const key = Object.keys(ACTION_ICONS).find(k => action.toLowerCase().includes(k));
  return key ? ACTION_ICONS[key] : Shield;
}

function getActionColor(action: string) {
  const a = action.toLowerCase();
  if (a.includes('delete') || a.includes('remove')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (a.includes('create') || a.includes('add')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (a.includes('update') || a.includes('edit')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (a.includes('login')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (actionFilter !== 'all') params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit-log?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSearch = () => { setPage(1); fetchLogs(); };

  const exportCSV = () => {
    const header = 'Timestamp,User ID,Action,Target,IP\n';
    const rows = logs.map(l => `${new Date(l.createdAt).toISOString()},${l.userId || ''},${l.action},${l.target || ''},${l.ip || ''}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-[#ea4d60]" /> Audit Log
        </h1>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input placeholder="Search actions..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch} variant="outline"><Search className="h-4 w-4" /></Button>
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Action type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-gray-500">{total} entries found</p>

      {/* Log entries */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>
      ) : logs.length === 0 ? (
        <Card className="p-8 text-center">
          <ScrollText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No audit log entries found</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map(entry => {
            const Icon = getActionIcon(entry.action);
            return (
              <Card key={entry.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${getActionColor(entry.action)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{entry.action}</span>
                      {entry.target && <Badge variant="outline" className="text-[10px]">{entry.target}</Badge>}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.userId && ` · User: ${entry.userId.slice(0, 8)}...`}
                      {entry.ip && ` · IP: ${entry.ip}`}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
