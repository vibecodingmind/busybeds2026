import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await db.blogPost.findUnique({
      where: { slug: slug, status: 'published' },
    });

    if (!post) return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}
