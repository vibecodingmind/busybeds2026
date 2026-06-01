import { NextResponse } from 'next/server'

export async function POST() {
  // JWT is stateless — the client is responsible for clearing the token.
  // This endpoint exists for API consistency and future token blacklisting.
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}
