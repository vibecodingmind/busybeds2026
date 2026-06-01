'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Download, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PrivacyPage() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/user/export-data');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `busybeds-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch { toast.error('Export failed'); }
    setExporting(false);
  };

  const handleDelete = async () => {
    if (confirmEmail !== user?.email) {
      toast.error('Email does not match');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/user/export-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Account deleted. Redirecting...');
        setTimeout(() => window.location.href = '/', 2000);
      } else toast.error(data.error || 'Failed to delete');
    } catch { toast.error('Failed to delete account'); }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-[#ea4d60]" /> Privacy & Data</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Export Your Data</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Download a copy of all your personal data stored on BusyBeds, including profile, subscriptions, transactions, coupons, favorites, and more. This is provided in accordance with GDPR data portability requirements.</p>
          <Button onClick={handleExport} disabled={exporting} variant="outline" className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export All Data (JSON)
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-800">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Delete Account</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data. This action is irreversible and cannot be undone. All your coupons, subscriptions, favorites, and personal information will be removed.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete My Account
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Type your email address to confirm: <strong>{user?.email}</strong>
              </p>
              <Input value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} placeholder="Confirm your email" />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete} disabled={deleting || confirmEmail !== user?.email} className="gap-2">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Permanently Delete
                </Button>
                <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setConfirmEmail(''); }}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
