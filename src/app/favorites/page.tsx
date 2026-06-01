'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetch('/api/favorites').then(r => r.json()).then(d => setFavorites(d.data || []));
  }, [user, authLoading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      {favorites.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(fav => (
            <Link key={fav.id} href={`/hotels/${fav.hotel?.slug}`}>
              <Card className="overflow-hidden hotel-card cursor-pointer group">
                <div className="h-40 bg-muted relative">
                  {fav.hotel?.coverImage ? <img src={fav.hotel.coverImage} alt={fav.hotel.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🏨</div>}
                  <Badge className="absolute top-3 right-3 bg-gold text-gold-foreground">{fav.hotel?.discountPercent}% OFF</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{fav.hotel?.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {fav.hotel?.city}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><h3 className="font-semibold mb-2">No favorites yet</h3><p className="text-sm text-muted-foreground mb-4">Save hotels you love for easy access later.</p><Link href="/hotels"><Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground">Browse Hotels</Button></Link></div>
      )}
    </div>
  );
}
