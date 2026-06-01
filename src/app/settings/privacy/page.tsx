'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Shield, Download, Trash2 } from 'lucide-react';

export default function PrivacySettingsPage() {
  const { user } = useAuth();

  const exportData = async () => {
    const res = await fetch('/api/settings/export');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'busybeds-data.json'; a.click();
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    await fetch('/api/settings/delete-account', { method: 'POST' });
    toast.success('Account deletion requested');
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy & Data</h2>
        <h3 className="font-medium mb-3">Export Your Data</h3>
        <p className="text-sm text-muted-foreground mb-4">Download all your data in JSON format.</p>
        <Button variant="outline" onClick={exportData}><Download className="h-4 w-4 mr-2" />Export Data</Button>
      </Card>
      <Card className="p-6 border-destructive/30">
        <h3 className="font-semibold text-destructive mb-3">Delete Account</h3>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all data.</p>
        <Button variant="destructive" onClick={deleteAccount}><Trash2 className="h-4 w-4 mr-2" />Delete Account</Button>
      </Card>
    </div>
  );
}
