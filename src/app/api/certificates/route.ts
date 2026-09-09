import { NextResponse } from 'next/server';
import { getAllCertificates } from '@/lib/certificate/cert-store';

export async function GET() {
  const certs = getAllCertificates();
  return NextResponse.json({ success: true, count: certs.length, certificates: certs });
}
