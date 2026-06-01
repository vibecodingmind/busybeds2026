import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Find user by email
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Compare password
    const isValid = comparePassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if suspended
    if (user.suspendedAt && !user.suspendedReason) {
      // Suspended without reason - treat as suspended
    }
    if (user.suspendedAt) {
      return NextResponse.json(
        { success: false, error: `Account suspended: ${user.suspendedReason || 'Contact support'}` },
        { status: 403 }
      )
    }

    // Check if banned
    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: 'Account has been banned' },
        { status: 403 }
      )
    }

    // Sign JWT token
    const token = await signToken({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
