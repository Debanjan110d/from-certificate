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

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully. Session valid for 30 minutes.',
      expiresInMinutes: 30,
    });

    // Admin Session Expiry: 30 minutes (1800 seconds)
    const token = `admin_auth_${Date.now()}`;

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 30, // 30 minutes limit
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
