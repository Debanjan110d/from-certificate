import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'swarupa2005dutta_chutiya';

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password. Access denied.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    
    // Set admin session cookie valid for 7 days
    response.cookies.set('admin_session', 'authenticated_admin_token_2026', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
