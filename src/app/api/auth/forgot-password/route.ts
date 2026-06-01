import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendEmail, generateResetPasswordEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

const forgotPasswordSchema = z.object({
  email: z.email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Find user by email
    const user = await db.user.findUnique({ where: { email } })

    if (user) {
      // Generate reset token
      const resetToken = uuidv4()
      const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1h

      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiry,
        },
      })

      // Send reset email (non-blocking)
      const emailContent = generateResetPasswordEmail(user.fullName, resetToken)
      sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch((err) => console.error('Failed to send reset email:', err))
    }

    // Always return success to avoid revealing if email exists
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
