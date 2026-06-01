import { NextResponse } from 'next/server';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;

export async function GET() {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/login?error=linkedin_not_configured', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  const state = crypto.randomUUID();
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', state);

  const response = NextResponse.redirect(url.toString());
  response.cookies.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
  return response;
}
