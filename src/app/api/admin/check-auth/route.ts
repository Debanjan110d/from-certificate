import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('admin_session');
  const isAuthenticated = cookie?.value === 'authenticated_admin_token_2026';

  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('admin_session');
  return response;
}
