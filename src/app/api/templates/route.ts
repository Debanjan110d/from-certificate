import { NextRequest, NextResponse } from 'next/server';
import { getTemplatesAsync, updateTemplateConfigAsync } from '@/lib/certificate/template-store';

export async function GET() {
  const templates = await getTemplatesAsync();
  return NextResponse.json({ success: true, templates });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid template config: "id" is required.' },
        { status: 400 }
      );
    }
    const updated = await updateTemplateConfigAsync(body);
    return NextResponse.json({ success: true, template: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}
