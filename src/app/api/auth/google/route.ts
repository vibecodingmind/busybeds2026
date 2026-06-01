import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || ''

export async function GET(request: NextRequest) {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })
  return NextResponse.redirect(`${rootUrl}?${options.toString()}`)
}
