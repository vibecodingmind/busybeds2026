'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Star, CheckCircle2, XCircle, Eye, Loader2, MessageSquare } from 'lucide-react';

interface ReviewData {
  id: string;
  hotelId: string;
  userId?: string;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  isApproved: boolean;
  ownerReply?: string;
  source: string;
  createdAt: string;
  hotel?: { name: string; city: string };
  user?: { fullName: string; avatar?: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: true }),
      });
      if (res.ok) { toast.success('Review approved'); fetchReviews(); }
      else toast.error('Failed to approve');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: false }),
      });
      if (res.ok) { toast.success('Review rejected'); fetchReviews(); }
      else toast.error('Failed');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="h-6 w-6 text-[#ea4d60]" /> Reviews</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[10px]">{review.source}</Badge>
                    {!review.isApproved && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>}
                    {review.isApproved && <Badge className="bg-green-100 text-green-700 text-[10px]">Approved</Badge>}
                    {review.isVerified && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Verified</Badge>}
                  </div>
                  <h3 className="font-medium text-sm">{review.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{review.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{review.hotel?.name || 'Unknown Hotel'}</span>
                    <span>·</span>
                    <span>{review.user?.fullName || 'Anonymous'}</span>
                    <span>·</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.ownerReply && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <p className="text-xs font-medium text-blue-600 mb-1">Owner Reply:</p>
                      {review.ownerReply}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleApprove(review.id)} className="text-green-600 hover:text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleReject(review.id)} className="text-red-500 hover:text-red-700">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
