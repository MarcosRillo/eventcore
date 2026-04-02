import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Refresh token not found',
        errors: { refresh_token: ['The refresh token field is required.'] },
      },
      { status: 401 }
    )
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
      body: JSON.stringify({}),
    })

    const body = await backendResponse.json()
    const response = NextResponse.json(body, { status: backendResponse.status })

    // Forward ALL Set-Cookie headers from backend.
    // CRITICAL: Use getSetCookie() which returns an array.
    // headers.get('set-cookie') collapses multiple Set-Cookie headers into one
    // comma-separated string, which corrupts cookie attributes.
    const setCookies = backendResponse.headers.getSetCookie()
    for (const cookie of setCookies) {
      response.headers.append('Set-Cookie', cookie)
    }

    return response
  } catch {
    return NextResponse.json(
      { success: false, message: 'Token refresh service unavailable' },
      { status: 502 }
    )
  }
}
