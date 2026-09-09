import { NextRequest, NextResponse } from 'next/server';
import { getAllCertificatesAsync } from '@/lib/certificate/cert-store';

// Simple in-memory rate limiter for student email lookup
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_LOOKUP_ATTEMPTS = 20;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > MAX_LOOKUP_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    // 1. Rate limiting check
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many lookup attempts. Please wait 15 minutes before searching again.',
        },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Clean up input email (strip spaces, lowercase, fix .comy -> .com)
    let cleanEmail = email.trim().toLowerCase();
    cleanEmail = cleanEmail.replace(/\.com[a-z]+$/i, '.com');

    // 2. Fetch all certificates from Cloud KV / persistent store
    const allCerts = await getAllCertificatesAsync();

    // 3. Robust multi-field email matching:
    // Checks c.email AND any secondary email fields in c.extraFields
    const studentCerts = allCerts.filter((c) => {
      const primaryEmail = (c.email || '').trim().toLowerCase().replace(/\.com[a-z]+$/i, '.com');
      if (primaryEmail === cleanEmail) return true;

      // Check extraFields for secondary emails (e.g. Email address vs Email)
      if (c.extraFields && typeof c.extraFields === 'object') {
        for (const [key, val] of Object.entries(c.extraFields)) {
          if (typeof val === 'string' && val.includes('@')) {
            const extraEmail = val.trim().toLowerCase().replace(/\.com[a-z]+$/i, '.com');
            if (extraEmail === cleanEmail) return true;
          }
        }
      }

      return false;
    });

    if (studentCerts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No certificate found for email "${email.trim()}". Please check your email spelling or ensure you submitted the Google Form.`,
        },
        { status: 404 }
      );
    }

    const host = req.headers.get('host') || 'from-certificate.vercel.app';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    // 4. Return sanitized student certificate payload
    const sanitizedCertificates = studentCerts.map((cert) => ({
      id: cert.id,
      name: cert.name,
      course: cert.course,
      issueDate: cert.issueDate,
      downloadUrl: `${baseUrl}/api/download/${cert.id}`,
      verifyUrl: `${baseUrl}/verify/${cert.id}`,
    }));

    return NextResponse.json({
      success: true,
      count: studentCerts.length,
      studentName: studentCerts[0].name,
      certificates: sanitizedCertificates,
    });
  } catch (err: any) {
    console.error('Error claiming certificate:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve certificate' },
      { status: 500 }
    );
  }
}
