import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, generateReferralCode } from '@/lib/auth'
import { sendEmail, generateVerifyEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  referralCode: z.string().optional(),
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

    const { email, password, fullName, referralCode } = parsed.data

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate email verification token
    const emailVerifyToken = uuidv4()
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // Generate referral code for this user
    const userReferralCode = generateReferralCode(fullName)

    // Handle referral
    let referrerId: string | null = null
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } })
      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        emailVerifyToken,
        emailVerifyExpiry,
        referralCode: userReferralCode,
      },
    })

    // Create referral record if applicable
    if (referrerId && referralCode) {
      await db.referral.create({
        data: {
          code: referralCode,
          referrerId,
          referredId: user.id,
        },
      })
    }

    // Send verification email (non-blocking)
    const emailContent = generateVerifyEmail(fullName, emailVerifyToken)
    sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    }).catch((err) => console.error('Failed to send verification email:', err))

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Check your email to verify.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
