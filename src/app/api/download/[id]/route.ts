import { NextRequest, NextResponse } from 'next/server';
import { getCertificateById } from '@/lib/certificate/cert-store';
import { getTemplateById } from '@/lib/certificate/template-store';
import { generateCertificatePdf } from '@/lib/certificate/generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const certRecord = getCertificateById(id);

  if (!certRecord) {
    return NextResponse.json(
      { success: false, error: `Certificate with ID "${id}" was not found.` },
      { status: 404 }
    );
  }

  const templateConfig = getTemplateById(certRecord.templateId || 'default');
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
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
