import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { clearAllCertificatesAsync } from '@/lib/certificate/cert-store';

export async function POST(req: NextRequest) {
  try {
    // Verify Admin authentication cookie
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required or session expired.' },
        { status: 401 }
      );
    }

    // Clear Cloud KV and local certificates store
    await clearAllCertificatesAsync();

    return NextResponse.json({
      success: true,
      message: 'All issued certificates have been cleared from Cloud KV. System is now on a clean slate!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear database' },
      { status: 500 }
    );
  }
}
