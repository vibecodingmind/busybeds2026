import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, generateReferralCode, signToken } from '@/lib/auth'
import { sendEmail, generateVerifyEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  referralCode: z.string().optional(),
  role: z.enum(['traveler', 'owner']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { email, password, fullName, referralCode, role } = parsed.data

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const emailVerifyToken = uuidv4()
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const userReferralCode = generateReferralCode(fullName)

    let referrerId: string | null = null
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } })
      if (referrer) referrerId = referrer.id
    }

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: role || 'traveler',
        emailVerifyToken,
        emailVerifyExpiry,
        referralCode: userReferralCode,
      },
    })

    if (referrerId && referralCode) {
      await db.referral.create({
        data: { code: referralCode, referrerId, referredId: user.id },
      })
    }

    // Send verification email (non-blocking)
    const emailContent = generateVerifyEmail(fullName, emailVerifyToken)
    sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html })
      .catch((err) => console.error('Failed to send verification email:', err))

    // Auto-login: sign JWT and set cookie
    const token = await signToken({ userId: user.id, email: user.email, role: user.role })
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('busybeds-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
