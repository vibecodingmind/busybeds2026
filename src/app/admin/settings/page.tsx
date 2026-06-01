'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminsettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 capitalize">settings</h1>
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Manage settings from this panel. Data is fetched from the API.</p>
      </Card>
    </div>
  );
}
