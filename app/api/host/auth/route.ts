import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side only secrets — NEVER exposed in public customer HTML/JS
const SECURE_HOST_PASSCODE = process.env.HOST_ADMIN_PASSCODE || 'BTI2026';
const HOST_AUTH_SECRET = process.env.HOST_AUTH_SECRET || 'parkryze_secure_auth_secret_k8f9a2b4c6e1';
const SESSION_COOKIE_NAME = 'park_ryze_host_auth_session';

/**
 * Computes an HMAC-SHA256 signature for server-validated session tokens.
 */
function createSessionSignature(payload: string): string {
  return crypto.createHmac('sha256', HOST_AUTH_SECRET).update(payload).digest('hex');
}

function verifySessionToken(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expectedSignature = createSessionSignature(payload);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/host/auth
 * Validates the admin passcode server-side and issues a secure signed session cookie.
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

    // Verify passcode against server secret using constant-time comparison
    if (safeCompare(passcode.trim(), SECURE_HOST_PASSCODE.trim())) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin session authorized.',
      });

      const sessionPayload = `host_auth_${Date.now()}`;
      const sessionToken = `${sessionPayload}.${createSessionSignature(sessionPayload)}`;

      // Set secure HTTP-only cookie so client scripts cannot inspect or tamper with it
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
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
 * Checks if the current request has an active, cryptographically signed admin session cookie.
 */
export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  let isAuthenticated = false;
  if (match) {
    const token = match.substring(`${SESSION_COOKIE_NAME}=`.length);
    isAuthenticated = verifySessionToken(token);
  }

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
