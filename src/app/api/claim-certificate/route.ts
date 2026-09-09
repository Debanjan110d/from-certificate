import { NextRequest, NextResponse } from 'next/server';
import { getAllCertificates } from '@/lib/certificate/cert-store';

// Simple in-memory rate limiter for student email lookup
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_LOOKUP_ATTEMPTS = 10;
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

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const allCerts = getAllCertificates();

    // 2. Find matching student certificates
    const studentCerts = allCerts.filter(
      (c) => c.email.trim().toLowerCase() === cleanEmail
    );

    if (studentCerts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No certificate found for email "${cleanEmail}". Please check your email spelling or ensure you submitted the Google Form.`,
        },
        { status: 404 }
      );
    }

    const host = req.headers.get('host') || 'from-certificate.vercel.app';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    // 3. Return sanitized student certificate payload
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
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve certificate' },
      { status: 500 }
    );
  }
}
