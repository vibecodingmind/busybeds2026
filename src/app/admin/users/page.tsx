'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Shield,
  Ban,
  Gift,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckSquare,
  Square,
  X,
  Trash,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'traveler' | 'owner' | 'admin' | 'corporate';
type UserStatus = 'active' | 'suspended' | 'banned';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  isBanned: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  emailVerified: boolean;
  avatar: string | null;
}

const ROLE_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Traveler', value: 'traveler' },
  { label: 'Owner', value: 'owner' },
  { label: 'Admin', value: 'admin' },
  { label: 'Corporate', value: 'corporate' },
];

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
];

function getUserStatus(user: User): UserStatus {
  if (user.isBanned) return 'banned';
  if (user.suspendedAt) return 'suspended';
  return 'active';
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    traveler: 'bg-emerald/15 text-emerald border-emerald/30',
    owner: 'bg-[#C8932A]/15 text-[#C8932A] border-[#C8932A]/30',
    admin: 'bg-red-500/15 text-red-600 border-red-500/30',
    corporate: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  };
  return (
    <Badge variant="outline" className={`capitalize ${styles[role]}`}>
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    active: 'bg-emerald/15 text-emerald border-emerald/30',
    suspended: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
    banned: 'bg-red-500/15 text-red-600 border-red-500/30',
  };
  const labels: Record<UserStatus, string> = {
    active: 'Active',
    suspended: 'Suspended',
    banned: 'Banned',
  };
  return (
    <Badge variant="outline" className={`capitalize ${styles[status]}`}>
      {labels[status]}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail dialog
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Suspend dialog
  const [suspendUser, setSuspendUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendLoading, setSuspendLoading] = useState(false);

  // Ban confirm dialog
  const [banUser, setBanUser] = useState<User | null>(null);
  const [banLoading, setBanLoading] = useState(false);

  // Comp dialog
  const [compUser, setCompUser] = useState<User | null>(null);
  const [compPackageId, setCompPackageId] = useState('');
  const [compLoading, setCompLoading] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'activate' | 'suspend' | 'ban' | 'delete' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set()); // Clear selection when filters change
  }, [debouncedSearch, roleFilter, statusFilter]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.data || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async () => {
    if (!suspendUser || !suspendReason.trim()) return;
    setSuspendLoading(true);
    await fetch(`/api/admin/users/${suspendUser.id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: suspendReason.trim() }),
    });
    setSuspendLoading(false);
    setSuspendUser(null);
    setSuspendReason('');
    fetchUsers();
  };

  const handleBan = async () => {
    if (!banUser) return;
    setBanLoading(true);
    await fetch(`/api/admin/users/${banUser.id}/ban`, { method: 'POST' });
    setBanLoading(false);
    setBanUser(null);
    fetchUsers();
  };

  const handleComp = async () => {
    if (!compUser || !compPackageId.trim()) return;
    setCompLoading(true);
    await fetch(`/api/admin/users/${compUser.id}/comp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: compPackageId.trim(), reason: 'Admin comp' }),
    });
    setCompLoading(false);
    setCompUser(null);
    setCompPackageId('');
  };

  /* ─── Bulk action helpers ─── */
  const toggleUserSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllUsers = () => {
    if (users.every(u => selectedIds.has(u.id))) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        users.forEach(u => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        users.forEach(u => next.add(u.id));
        return next;
      });
    }
  };

  const allVisibleSelected = users.length > 0 && users.every(u => selectedIds.has(u.id));

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const res = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: bulkAction, userIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Bulk action failed');
        return;
      }
      toast.success(data.message);
      setSelectedIds(new Set());
      setBulkAction(null);
      setBulkConfirmOpen(false);
      fetchUsers();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <Users className="inline h-4 w-4 mr-1 -mt-0.5" />
            {total.toLocaleString()} total users
          </p>
        </div>
      </div>

      {/* Search + Filter Row */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Role</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_TABS.map((tab) => (
                  <Button
                    key={tab.value}
                    variant={roleFilter === tab.value ? 'default' : 'outline'}
                    size="sm"
                    className={
                      roleFilter === tab.value
                        ? 'bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white'
                        : ''
                    }
                    onClick={() => setRoleFilter(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="sm:w-52">
              <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="border-emerald text-emerald hover:bg-emerald hover:text-white"
              onClick={() => { setBulkAction('activate'); setBulkConfirmOpen(true); }}
              disabled={bulkProcessing}
            >
              <Eye className="h-4 w-4 mr-1" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
              onClick={() => { setBulkAction('suspend'); setBulkConfirmOpen(true); }}
              disabled={bulkProcessing}
            >
              <Shield className="h-4 w-4 mr-1" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
              onClick={() => { setBulkAction('ban'); setBulkConfirmOpen(true); }}
              disabled={bulkProcessing}
            >
              <Ban className="h-4 w-4 mr-1" />
              Ban
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-white"
              onClick={() => { setBulkAction('delete'); setBulkConfirmOpen(true); }}
              disabled={bulkProcessing}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirm Dialog */}
      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'delete' ? 'Delete Selected Users' : bulkAction === 'activate' ? 'Activate Selected Users' : bulkAction === 'suspend' ? 'Suspend Selected Users' : 'Ban Selected Users'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'delete' ? (
                <>Are you sure you want to <strong>permanently delete</strong> {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone. All associated data including reviews, favorites, and coupons will be removed.</>
              ) : bulkAction === 'activate' ? (
                <>Are you sure you want to <strong>activate</strong> {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''}? They will regain full access to their accounts.</>
              ) : bulkAction === 'suspend' ? (
                <>Are you sure you want to <strong>suspend</strong> {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''}? They will not be able to access their accounts.</>
              ) : (
                <>Are you sure you want to <strong>ban</strong> {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''}? They will be permanently blocked from the platform.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                bulkAction === 'delete'
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : bulkAction === 'activate'
                  ? 'bg-emerald hover:bg-emerald/90 text-white'
                  : bulkAction === 'suspend'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }
              onClick={handleBulkAction}
              disabled={bulkProcessing}
            >
              {bulkProcessing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>
                  {bulkAction === 'delete' && <Trash className="h-4 w-4 mr-2" />}
                  {bulkAction === 'activate' && <Eye className="h-4 w-4 mr-2" />}
                  {bulkAction === 'suspend' && <Shield className="h-4 w-4 mr-2" />}
                  {bulkAction === 'ban' && <Ban className="h-4 w-4 mr-2" />}
                  {bulkAction === 'delete' ? 'Delete All' : bulkAction === 'activate' ? 'Activate All' : bulkAction === 'suspend' ? 'Suspend All' : 'Ban All'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Table */}
      <Card className="overflow-hidden">
        <div className="rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[40px_2fr_1fr_1fr_1fr_auto] gap-4 bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider items-center">
          <div>
            <button onClick={toggleSelectAllUsers} className="flex items-center transition-colors">
              {allVisibleSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="h-4 w-4 hover:text-gray-600" />
              )}
            </button>
          </div>
          <div>User</div>
          <div>Role</div>
          <div>Status</div>
          <div>Joined</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="divide-y">
            {users.map((user) => {
              const status = getUserStatus(user);
              const initial = user.fullName?.charAt(0)?.toUpperCase() || 'U';
              const isSelected = selectedIds.has(user.id);
              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-1 md:grid-cols-[40px_2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-center px-4 py-3 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  {/* Checkbox */}
                  <div className="hidden md:flex items-center">
                    <button
                      onClick={() => toggleUserSelect(user.id)}
                      className={`transition-colors ${
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile checkbox */}
                    <button
                      onClick={() => toggleUserSelect(user.id)}
                      className={`shrink-0 md:hidden transition-colors ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`}
                    >
                      {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#0E5C3B]/10 flex items-center justify-center text-sm font-bold text-[#0E5C3B] shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="hidden md:block">
                    <RoleBadge role={user.role} />
                  </div>

                  {/* Status */}
                  <div className="hidden md:block">
                    <StatusBadge status={status} />
                  </div>

                  {/* Joined */}
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <div className="md:hidden flex items-center gap-2 mr-2">
                      <RoleBadge role={user.role} />
                      <StatusBadge status={status} />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View Details"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setDetailUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {status !== 'suspended' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Suspend"
                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        onClick={() => setSuspendUser(user)}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}
                    {!user.isBanned && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ban"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setBanUser(user)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Comp Subscription"
                      className="text-[#C8932A] hover:text-[#C8932A]/80 hover:bg-[#C8932A]/10"
                      onClick={() => setCompUser(user)}
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full information for this user.</DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#0E5C3B]/10 flex items-center justify-center text-xl font-bold text-[#0E5C3B]">
                  {detailUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-lg">{detailUser.fullName}</p>
                  <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <RoleBadge role={detailUser.role} />
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={getUserStatus(detailUser)} />
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p>{formatDate(detailUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email Verified</p>
                  <p>{detailUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                {detailUser.suspendedAt && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Suspended At</p>
                      <p>{formatDate(detailUser.suspendedAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Suspend Reason</p>
                      <p>{detailUser.suspendedReason || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs break-all">{detailUser.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Suspend Dialog ─── */}
      <Dialog
        open={!!suspendUser}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendUser(null);
            setSuspendReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {suspendUser?.fullName}? They will not be able to access their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Reason for suspension</label>
            <Input
              placeholder="Enter reason..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSuspendUser(null); setSuspendReason(''); }}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={!suspendReason.trim() || suspendLoading}
              onClick={handleSuspend}
            >
              {suspendLoading ? 'Suspending...' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Ban Confirm Dialog ─── */}
      <Dialog
        open={!!banUser}
        onOpenChange={(open) => {
          if (!open) setBanUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {banUser?.fullName}? This is a severe action and the user will be permanently blocked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={banLoading} onClick={handleBan}>
              {banLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Comp Subscription Dialog ─── */}
      <Dialog
        open={!!compUser}
        onOpenChange={(open) => {
          if (!open) {
            setCompUser(null);
            setCompPackageId('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comp Subscription</DialogTitle>
            <DialogDescription>
              Grant a complimentary subscription to {compUser?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Subscription Package ID</label>
            <Input
              placeholder="Enter package ID..."
              value={compPackageId}
              onChange={(e) => setCompPackageId(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCompUser(null); setCompPackageId(''); }}>
              Cancel
            </Button>
            <Button
              className="bg-[#C8932A] hover:bg-[#C8932A]/90 text-white"
              disabled={!compPackageId.trim() || compLoading}
              onClick={handleComp}
            >
              {compLoading ? 'Applying...' : 'Comp Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
