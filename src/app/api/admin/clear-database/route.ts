import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const CERTS_FILE = path.join(DATA_DIR, 'certificates.json');

export async function POST(req: NextRequest) {
  try {
    // Verify Admin authentication cookie
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required or session expired.' },
        { status: 401 }
      );
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Overwrite certificates.json with empty array (clean slate)
    fs.writeFileSync(CERTS_FILE, JSON.stringify([], null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'All issued certificates have been cleared. System is now on a clean slate!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear database' },
      { status: 500 }
    );
  }
}
