import { NextResponse } from 'next/server';

// Secure server-side credential — NEVER bundled in client-side HTML/JS!
const SECURE_HOST_PASSCODE = process.env.HOST_ADMIN_PASSCODE || 'BTI2026';
const SESSION_COOKIE_NAME = 'park_ryze_host_auth_session';
const SESSION_TOKEN = 'bti2026_host_authenticated_token';

/**
 * POST /api/host/auth
 * Validates the admin passcode server-side and issues a secure session cookie.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Admin passcode is required.' },
        { status: 400 }
      );
    }

    // Verify passcode against server secret
    if (passcode.trim() === SECURE_HOST_PASSCODE) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin session authorized.',
      });

      // Set secure HTTP-only cookie so client scripts cannot tamper with it
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: SESSION_TOKEN,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect passcode. Access denied.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an error.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/host/auth
 * Checks if the current request has an active valid admin session cookie.
 */
export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const isAuthenticated = cookieHeader.includes(`${SESSION_COOKIE_NAME}=${SESSION_TOKEN}`);

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

/**
 * DELETE /api/host/auth
 * Terminates the admin session and clears the cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin session terminated.',
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
