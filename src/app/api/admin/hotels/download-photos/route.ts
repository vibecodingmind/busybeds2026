import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Download a photo from a URL and save it to the server's public/uploads/hotels directory
 * Returns the local path that can be used as the image URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { photoUrl, hotelId, index } = await request.json();
    if (!photoUrl) {
      return NextResponse.json({ success: false, error: 'photoUrl is required' }, { status: 400 });
    }

    // Download the image
    const res = await fetch(photoUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'BusyBeds/1.0' },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Failed to download photo: ${res.status}` }, { status: 500 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const buffer = Buffer.from(await res.arrayBuffer());

    // Generate filename
    const filename = `${hotelId || 'import'}-${index || 0}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'hotels');

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/hotels/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Photo download error:', error);
    return NextResponse.json({ success: false, error: 'Failed to download photo' }, { status: 500 });
  }
}
