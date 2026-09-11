import { NextRequest, NextResponse } from 'next/server';
import { getCertificateByIdAsync, saveCertificateAsync } from '@/lib/certificate/cert-store';
import { getTemplateByIdAsync } from '@/lib/certificate/template-store';
import { generateCertificatePdf } from '@/lib/certificate/generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const certRecord = await getCertificateByIdAsync(id);

  if (!certRecord) {
    return NextResponse.json(
      { success: false, error: `Certificate with ID "${id}" was not found.` },
      { status: 404 }
    );
  }

  // Track download status (1 = Downloaded / Yes, 0 = Not Downloaded / No)
  certRecord.downloaded = 1;
  certRecord.downloadCount = (certRecord.downloadCount || 0) + 1;
  await saveCertificateAsync(certRecord);

  const templateConfig = await getTemplateByIdAsync(certRecord.templateId || 'default');
  const host = req.headers.get('host') || 'from-certificate.vercel.app';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const verifyBaseUrl = `${protocol}://${host}`;

  const pdfBuffer = await generateCertificatePdf({
    name: certRecord.name,
    certificateId: certRecord.id,
    issueDate: certRecord.issueDate,
    templateConfig,
    verifyBaseUrl,
  });

  const sanitizedName = certRecord.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  return new NextResponse(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${sanitizedName}_Certificate_${certRecord.id}.pdf"`,
      'Content-Length': pdfBuffer.byteLength.toString(),
    },
  });
}
