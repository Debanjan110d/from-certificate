import { PDFDocument, rgb, StandardFonts, PDFFont, RGB } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { FieldConfig, TemplateConfig } from '../types';

function parseHexColor(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

export interface GeneratePdfOptions {
  name: string;
  certificateId: string;
  issueDate: string;
  templateConfig: TemplateConfig;
  verifyBaseUrl?: string;
}

export async function generateCertificatePdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { name, certificateId, issueDate, templateConfig, verifyBaseUrl } = options;

  // 1. Locate and load PDF template
  let templatePdfBuffer: Buffer;
  const defaultPath = path.join(process.cwd(), 'public', 'templates', 'default_template.pdf');

  let fullPath = defaultPath;
  if (templateConfig.pdfPath) {
    fullPath = path.isAbsolute(templateConfig.pdfPath)
      ? templateConfig.pdfPath
      : path.join(process.cwd(), templateConfig.pdfPath);
  }

  if (fs.existsSync(fullPath)) {
    templatePdfBuffer = fs.readFileSync(fullPath);
  } else if (fs.existsSync(defaultPath)) {
    templatePdfBuffer = fs.readFileSync(defaultPath);
  } else {
    throw new Error(`Template PDF file could not be found.`);
  }

  // 2. Load Document and Page
  const pdfDoc = await PDFDocument.load(templatePdfBuffer);
  const pages = pdfDoc.getPages();
  const page = pages[0];

  // 3. Embed Standard Fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontTimesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const getFontByName = (fontName: string): PDFFont => {
    switch (fontName) {
      case 'TimesRoman':
        return fontTimesRoman;
      case 'TimesRomanBold':
        return fontTimesBold;
      case 'TimesItalic':
        return fontTimesItalic;
      case 'TimesBoldItalic':
        return fontTimesBoldItalic;
      case 'HelveticaBold':
        return fontHelveticaBold;
      case 'HelveticaOblique':
        return fontHelveticaOblique;
      case 'Courier':
        return fontCourier;
      case 'CourierBold':
        return fontCourierBold;
      case 'Helvetica':
      default:
        return fontHelvetica;
    }
  };

  // Helper to draw dynamic text based on FieldConfig
  const drawFieldText = (text: string, config: FieldConfig) => {
    const font = getFontByName(config.fontFamily);
    const textWidth = font.widthOfTextAtSize(text, config.fontSize);

    let drawX = config.x;
    if (config.alignment === 'center') {
      drawX = config.x - textWidth / 2;
    } else if (config.alignment === 'right') {
      drawX = config.x - textWidth;
    }

    page.drawText(text, {
      x: drawX,
      y: config.y,
      size: config.fontSize,
      font,
      color: parseHexColor(config.color),
    });
  };

  // 4. Overlay Student Name
  if (templateConfig.fields.name && name) {
    drawFieldText(name, templateConfig.fields.name);
  }

  // 5. Overlay Issue Date
  if (templateConfig.fields.date && issueDate) {
    drawFieldText(issueDate, templateConfig.fields.date);
  }

  // 6. Overlay Certificate ID
  if (templateConfig.fields.certificateId && certificateId) {
    drawFieldText(`ID: ${certificateId}`, templateConfig.fields.certificateId);
  }

  // 7. Overlay QR Code (points to verification page)
  if (templateConfig.fields.qrCode?.enabled && verifyBaseUrl && certificateId) {
    try {
      const qrConfig = templateConfig.fields.qrCode;
      const verifyUrl = `${verifyBaseUrl}/verify/${certificateId}`;

      // Generate PNG data URL for QR Code
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        color: {
          dark: '#10172A',
          light: '#FFFFFF',
        },
      });

      const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      const embeddedQrImage = await pdfDoc.embedPng(qrImageBytes);

      page.drawImage(embeddedQrImage, {
        x: qrConfig.x,
        y: qrConfig.y,
        width: qrConfig.size,
        height: qrConfig.size,
      });
    } catch (err) {
      console.error('Failed to embed QR code:', err);
    }
  }

  // 8. Save and Return Bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
