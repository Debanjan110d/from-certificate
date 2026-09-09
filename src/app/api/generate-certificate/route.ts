import { NextRequest, NextResponse } from 'next/server';
import { extractFormData } from '@/lib/certificate/field-mapper';
import { generateNextCertificateIdAsync, saveCertificateAsync } from '@/lib/certificate/cert-store';
import { getTemplateById } from '@/lib/certificate/template-store';
import { generateCertificatePdf } from '@/lib/certificate/generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Decoupled extraction of required & optional fields
    const formData = extractFormData(body);

    // 2. Generate unique Certificate ID
    const certificateId = await generateNextCertificateIdAsync();

    // 3. Save certificate record (Persisted to Cloud KV for Vercel 24/7 access!)
    const certRecord = {
      id: certificateId,
      name: formData.name,
      email: formData.email,
      course: formData.course || 'Certificate of Completion',
      issueDate: formData.issueDate || new Date().toLocaleDateString(),
      templateId: 'default',
      extraFields: formData.extraFields,
      createdAt: new Date().toISOString(),
    };
    await saveCertificateAsync(certRecord);

    // 4. Retrieve template configuration
    const templateConfig = getTemplateById('default');

    // 5. Calculate base URL for verification link & QR code
    const host = req.headers.get('host') || 'from-certificate.vercel.app';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const verifyBaseUrl = `${protocol}://${host}`;

    // 6. Generate PDF Certificate Buffer
    const pdfBuffer = await generateCertificatePdf({
      name: formData.name,
      certificateId,
      issueDate: certRecord.issueDate,
      templateConfig,
      verifyBaseUrl,
    });

    // 7. Check if client wants direct PDF stream or JSON response
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format');
    const acceptHeader = req.headers.get('accept') || '';

    if (format === 'pdf' || acceptHeader.includes('application/pdf')) {
      const sanitizedName = formData.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${sanitizedName}_Certificate.pdf"`,
          'Content-Length': pdfBuffer.byteLength.toString(),
        },
      });
    }

    // Default JSON Response for Webhooks & Google Apps Script
    return NextResponse.json({
      success: true,
      message: 'Certificate successfully generated and persisted',
      certificateId,
      student: {
        name: formData.name,
        email: formData.email,
      },
      issueDate: certRecord.issueDate,
      course: certRecord.course,
      downloadUrl: `${verifyBaseUrl}/api/download/${certificateId}`,
      verifyUrl: `${verifyBaseUrl}/verify/${certificateId}`,
      extraFieldsReceived: Object.keys(formData.extraFields),
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during certificate generation.',
      },
      { status: 400 }
    );
  }
}
