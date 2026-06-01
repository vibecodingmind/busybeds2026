'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function PreferencesSettingsPage() {
  const { user } = useAuth();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Globe className="h-5 w-5" /> Preferences</h2>
      <div className="space-y-4">
        <div>
          <Label>Language</Label>
          <p className="text-sm text-muted-foreground">English (default)</p>
        </div>
        <div>
          <Label>Timezone</Label>
          <p className="text-sm text-muted-foreground">Africa/Dar_es_Salaam (EAT)</p>
        </div>
        <div>
          <Label>Display Currency</Label>
          <p className="text-sm text-muted-foreground">{user?.displayCurrency || 'USD'}</p>
        </div>
        <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => toast.success('Preferences saved!')}>Save Preferences</Button>
      </div>
    </Card>
  );
}
