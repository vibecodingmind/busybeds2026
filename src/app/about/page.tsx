'use client';
import { Card, CardContent } from '@/components/ui/card';

export default function aboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 capitalize">about</h1>
      <Card className="p-8"><CardContent><p className="text-muted-foreground">Content for about page.</p></CardContent></Card>
    </div>
  );
}
