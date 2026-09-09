import { NextResponse } from 'next/server';
import { getAllCertificatesAsync } from '@/lib/certificate/cert-store';

export async function GET() {
  const certs = await getAllCertificatesAsync();
  return NextResponse.json({ success: true, count: certs.length, certificates: certs });
}
