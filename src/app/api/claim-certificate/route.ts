import { NextRequest, NextResponse } from 'next/server';
import { getAllCertificates } from '@/lib/certificate/cert-store';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const allCerts = getAllCertificates();

    // Find all certificates matching student email
    const studentCerts = allCerts.filter(
      (c) => c.email.trim().toLowerCase() === cleanEmail
    );

    if (studentCerts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No certificate found for email "${cleanEmail}". Please ensure you submitted the Google Form with this exact email address.`,
        },
        { status: 404 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    const certificatesWithUrls = studentCerts.map((cert) => ({
      id: cert.id,
      name: cert.name,
      email: cert.email,
      course: cert.course,
      issueDate: cert.issueDate,
      downloadUrl: `${baseUrl}/api/download/${cert.id}`,
      verifyUrl: `${baseUrl}/verify/${cert.id}`,
    }));

    return NextResponse.json({
      success: true,
      count: studentCerts.length,
      studentName: studentCerts[0].name,
      certificates: certificatesWithUrls,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve certificate' },
      { status: 500 }
    );
  }
}
