import { NextRequest, NextResponse } from 'next/server'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || ''
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  if (!LINKEDIN_CLIENT_ID) {
    return NextResponse.json({ error: 'LinkedIn OAuth not configured' }, { status: 500 })
  }

  const rootUrl = 'https://www.linkedin.com/oauth/v2/authorization'
  const options = new URLSearchParams({
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
  })
  return NextResponse.redirect(`${rootUrl}?${options.toString()}`)
}
