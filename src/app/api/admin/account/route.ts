import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hashPassword, comparePassword } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  location: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  displayCurrency: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        language: true,
        timezone: true,
        displayCurrency: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Get admin account error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'change-password') {
      // Handle password change
      const result = passwordSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error.issues[0]?.message || 'Validation error',
        }, { status: 400 })
      }

      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { passwordHash: true },
      })

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const isValid = await comparePassword(result.data.currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
      }

      const newHash = await hashPassword(result.data.newPassword)
      await db.user.update({
        where: { id: session.userId },
        data: { passwordHash: newHash },
      })

      return NextResponse.json({ success: true, message: 'Password updated successfully' })
    }

    // Handle profile update
    const result = profileSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues[0]?.message || 'Validation error',
      }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: result.data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        language: true,
        timezone: true,
        displayCurrency: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Update admin account error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
