import { NextRequest } from 'next/server';

const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

export function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get('admin_session');
  if (!cookie || !cookie.value || !cookie.value.startsWith('admin_auth_')) {
    return false;
  }

  const timestampStr = cookie.value.replace('admin_auth_', '');
  const loginTime = parseInt(timestampStr, 10);

  if (isNaN(loginTime) || Date.now() - loginTime > SESSION_MAX_AGE_MS) {
    return false;
  }

  return true;
}
