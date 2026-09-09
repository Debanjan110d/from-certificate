import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getTemplateById, updateTemplateConfig } from '@/lib/certificate/template-store';

export async function POST(req: NextRequest) {
  try {
    // 1. Check Admin Auth
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin login required.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No PDF template file provided.' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Please upload a valid PDF (.pdf) file.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/templates/custom_template.pdf
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const fileName = `template_${Date.now()}.pdf`;
    const filePath = path.join(templatesDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const relativePath = `public/templates/${fileName}`;

    // Update active template configuration
    const currentConfig = getTemplateById('default');
    currentConfig.pdfPath = relativePath;
    updateTemplateConfig(currentConfig);

    return NextResponse.json({
      success: true,
      message: 'Certificate PDF template uploaded and set as default successfully!',
      pdfPath: relativePath,
    });
  } catch (err: any) {
    console.error('Error uploading template PDF:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload template PDF' },
      { status: 500 }
    );
  }
}
