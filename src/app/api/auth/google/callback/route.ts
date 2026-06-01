import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = request.cookies.get('oauth_state')?.value;

    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_invalid`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_token`);
    }

    // Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const googleId = profile.sub;
    const email = profile.email;
    const fullName = profile.name || profile.given_name || 'Google User';
    const avatar = profile.picture || null;

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`);
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { googleId } });

    if (!user) {
      // Check if email already exists
      user = await db.user.findUnique({ where: { email } });
      if (user) {
        // Link googleId to existing account
        user = await db.user.update({ where: { id: user.id }, data: { googleId, avatar: avatar || user.avatar } });
      } else {
        // Create new user
        const passwordHash = await hashPassword(crypto.randomUUID());
        user = await db.user.create({
          data: {
            email,
            passwordHash,
            fullName,
            googleId,
            avatar,
            emailVerified: true,
            role: 'traveler',
          },
        });
      }
    }

    // Sign JWT and set cookie
    const token = await signToken({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : (user.role === 'owner' || user.role === 'manager') ? '/owner/dashboard' : '/profile';

    const response = NextResponse.redirect(`${APP_URL}${redirectPath}`);
    response.cookies.set('busybeds-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
