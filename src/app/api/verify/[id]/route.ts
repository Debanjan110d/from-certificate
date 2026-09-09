import { NextRequest, NextResponse } from 'next/server';
import { getCertificateById } from '@/lib/certificate/cert-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const certRecord = getCertificateById(id);

  if (!certRecord) {
    return NextResponse.json(
      {
        valid: false,
        status: 'NOT_FOUND',
        message: `No certificate record found matching ID "${id}".`,
      },
      { status: 404 }
    );
  }

  // Mask email for privacy (e.g. d***n@example.com)
  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
  };

  return NextResponse.json({
    valid: true,
    status: 'VERIFIED_OFFICIAL',
    certificate: {
      id: certRecord.id,
      name: certRecord.name,
      maskedEmail: maskEmail(certRecord.email),
      course: certRecord.course,
      issueDate: certRecord.issueDate,
      issuedAt: certRecord.createdAt,
      extraFields: certRecord.extraFields,
    },
  });
}
