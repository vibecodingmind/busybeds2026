'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminKYCPage() {
  const [owners, setOwners] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/admin/hotels').then(r => r.json()).then(d => {
      setOwners((d.data || []).filter((h: any) => h.partnershipStatus === 'LISTING_ONLY'));
    });
  }, []);

  const approve = async (id: string) => {
    await fetch(`/api/admin/hotels/${id}/approve-kyc`, { method: 'POST' });
    toast.success('Approved!');
    setOwners(prev => prev.filter(o => o.id !== id));
  };
  const reject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await fetch(`/api/admin/hotels/${id}/reject-kyc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    toast.success('Rejected');
    setOwners(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">KYC Review</h1>
      <p className="text-muted-foreground mb-6">Hotels pending verification</p>
      {owners.length > 0 ? (
        <div className="space-y-3">
          {owners.map(hotel => (
            <Card key={hotel.id} className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{hotel.name}</p><p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p></div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald text-emerald-foreground" onClick={() => approve(hotel.id)}><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => reject(hotel.id)}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : <Card className="p-8 text-center"><Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">No pending KYC reviews</p></Card>}
    </div>
  );
}
