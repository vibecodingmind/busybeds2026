import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const TOKEN_NAME = 'busybeds-token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(`${APP_URL}/login?error=google_auth_failed`)
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${APP_URL}/login?error=google_token_failed`)
    }

    const tokenData = await tokenRes.json()
    const { access_token, id_token } = tokenData

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=google_user_failed`)
    }

    const googleUser = await userRes.json()
    const { sub: googleId, email, name, picture } = googleUser

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`)
    }

    // Find or create user
    let user = await db.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    })

    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user = await db.user.update({
          where: { id: user.id },
          data: { googleId, avatar: picture || user.avatar, emailVerified: true },
        })
      }
    } else {
      // Create new user from Google
      const referralCode = 'G-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      user = await db.user.create({
        data: {
          email,
          fullName: name || 'Google User',
          googleId,
          avatar: picture || null,
          emailVerified: true,
          passwordHash: '', // No password for OAuth users
          referralCode,
        },
      })
    }

    // Check if suspended or banned
    if (user.suspendedAt || user.isBanned) {
      return NextResponse.redirect(`${APP_URL}/login?error=account_suspended`)
    }

    // Sign JWT and set cookie
    const token = await signToken({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    })

    const response = NextResponse.redirect(`${APP_URL}/profile`)
    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${APP_URL}/login?error=google_callback_error`)
  }
}
