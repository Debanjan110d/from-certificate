import { NextRequest, NextResponse } from 'next/server';

const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('admin_session');

  if (!cookie || !cookie.value || !cookie.value.startsWith('admin_auth_')) {
    return NextResponse.json({ authenticated: false, reason: 'No valid session token' });
  }

  const timestampStr = cookie.value.replace('admin_auth_', '');
  const loginTime = parseInt(timestampStr, 10);

  if (isNaN(loginTime) || Date.now() - loginTime > SESSION_MAX_AGE_MS) {
    // Session expired
    const response = NextResponse.json({ authenticated: false, reason: 'Session expired' });
    response.cookies.delete('admin_session');
    return response;
  }

  const remainingSeconds = Math.floor((SESSION_MAX_AGE_MS - (Date.now() - loginTime)) / 1000);

  return NextResponse.json({
    authenticated: true,
    remainingSeconds,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('admin_session');
  return response;
}
