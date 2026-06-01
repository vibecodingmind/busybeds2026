import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;
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

    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: LINKEDIN_CLIENT_ID || '',
        client_secret: LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_token`);
    }

    // Fetch user profile from LinkedIn
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const linkedinId = profile.sub;
    const email = profile.email;
    const fullName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn User';
    const avatar = profile.picture || null;

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`);
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { linkedinId } });

    if (!user) {
      user = await db.user.findUnique({ where: { email } });
      if (user) {
        user = await db.user.update({ where: { id: user.id }, data: { linkedinId, avatar: avatar || user.avatar } });
      } else {
        const passwordHash = await hashPassword(crypto.randomUUID());
        user = await db.user.create({
          data: {
            email,
            passwordHash,
            fullName,
            linkedinId,
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
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
