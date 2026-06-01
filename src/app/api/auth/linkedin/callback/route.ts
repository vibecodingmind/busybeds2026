import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || ''
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || ''
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const TOKEN_NAME = 'busybeds-token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(`${APP_URL}/login?error=linkedin_auth_failed`)
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=linkedin_token_failed`)
    }

    const tokenData = await tokenRes.json()
    const access_token = tokenData.access_token

    // Get user info from LinkedIn
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=linkedin_user_failed`)
    }

    const linkedinUser = await userRes.json()
    const { sub: linkedinId, email, name, picture } = linkedinUser

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`)
    }

    // Find or create user
    let user = await db.user.findFirst({
      where: {
        OR: [
          { linkedinId },
          { email },
        ],
      },
    })

    if (user) {
      if (!user.linkedinId) {
        user = await db.user.update({
          where: { id: user.id },
          data: { linkedinId, avatar: picture || user.avatar, emailVerified: true },
        })
      }
    } else {
      const referralCode = 'LI-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      user = await db.user.create({
        data: {
          email,
          fullName: name || 'LinkedIn User',
          linkedinId,
          avatar: picture || null,
          emailVerified: true,
          passwordHash: '',
          referralCode,
        },
      })
    }

    if (user.suspendedAt || user.isBanned) {
      return NextResponse.redirect(`${APP_URL}/login?error=account_suspended`)
    }

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
    console.error('LinkedIn OAuth callback error:', error)
    return NextResponse.redirect(`${APP_URL}/login?error=linkedin_callback_error`)
  }
}
