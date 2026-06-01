'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlogPost } from '@/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/blog?limit=20').then(r => r.json()).then(d => { setPosts(d.data || []); setLoading(false); });
  }, []);
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">BusyBeds Blog</h1>
      {loading ? <div className="space-y-4">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-40" />)}</div> : (
        posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-muted-foreground text-sm">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</p>
                </Card>
              </Link>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>
      )}
    </div>
  );
}
