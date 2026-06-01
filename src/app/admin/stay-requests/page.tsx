'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Adminstay requestsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 capitalize">stay requests</h1>
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Manage stay requests from this panel. Data is fetched from the API.</p>
      </Card>
    </div>
  );
}
