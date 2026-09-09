import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createDefaultTemplate() {
  // A4 Landscape: 841.89 x 595.28 points
  const width = 841.89;
  const height = 595.28;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Background tint (warm off-white/cream)
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.98, 0.96),
  });

  // Outer Border (Navy)
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.06, 0.09, 0.16), // #10172a
    borderWidth: 4,
  });

  // Inner Border (Gold)
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.85, 0.65, 0.13), // Gold #d9a023
    borderWidth: 1.5,
  });

  // Header Title
  const title = 'CERTIFICATE OF ACHIEVEMENT';
  const titleWidth = fontTimesBold.widthOfTextAtSize(title, 28);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 100,
    size: 28,
    font: fontTimesBold,
    color: rgb(0.06, 0.09, 0.16),
  });

  // Decorative Subtitle Ribbon / Line
  page.drawLine({
    start: { x: (width - 300) / 2, y: height - 115 },
    end: { x: (width + 300) / 2, y: height - 115 },
    thickness: 2,
    color: rgb(0.85, 0.65, 0.13),
  });

  // Subtitle
  const subtitle = 'THIS IS PROUDLY PRESENTED TO';
  const subtitleWidth = fontHelvetica.widthOfTextAtSize(subtitle, 12);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 145,
    size: 12,
    font: fontHelvetica,
    color: rgb(0.35, 0.4, 0.45),
  });

  // Decorative line under name placeholder space
  page.drawLine({
    start: { x: 180, y: 310 },
    end: { x: width - 180, y: 310 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Description / Citation Text
  const descLine1 = 'for successfully completing the course requirements and demonstrating exceptional skill';
  const descLine1Width = fontHelvetica.widthOfTextAtSize(descLine1, 13);
  page.drawText(descLine1, {
    x: (width - descLine1Width) / 2,
    y: 260,
    size: 13,
    font: fontHelvetica,
    color: rgb(0.2, 0.25, 0.3),
  });

  const descLine2 = 'and dedicated effort in the certified training program.';
  const descLine2Width = fontHelvetica.widthOfTextAtSize(descLine2, 13);
  page.drawText(descLine2, {
    x: (width - descLine2Width) / 2,
    y: 240,
    size: 13,
    font: fontHelvetica,
    color: rgb(0.2, 0.25, 0.3),
  });

  // Gold Seal Graphic (Circle with text)
  const sealX = width / 2;
  const sealY = 150;
  page.drawCircle({
    x: sealX,
    y: sealY,
    size: 32,
    color: rgb(0.85, 0.65, 0.13),
  });
  page.drawCircle({
    x: sealX,
    y: sealY,
    size: 28,
    borderColor: rgb(1, 1, 1),
    borderWidth: 1.5,
  });
  const sealText = 'OFFICIAL';
  const sealTextWidth = fontHelveticaBold.widthOfTextAtSize(sealText, 8);
  page.drawText(sealText, {
    x: sealX - sealTextWidth / 2,
    y: sealY + 2,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });
  const sealSubText = 'VERIFIED';
  const sealSubWidth = fontHelveticaBold.widthOfTextAtSize(sealSubText, 7);
  page.drawText(sealSubText, {
    x: sealX - sealSubWidth / 2,
    y: sealY - 8,
    size: 7,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  // Left Signature Line
  page.drawLine({
    start: { x: 90, y: 120 },
    end: { x: 250, y: 120 },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText('Program Coordinator', {
    x: 120,
    y: 100,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.25, 0.3),
  });

  // Right Signature Line
  page.drawLine({
    start: { x: width - 250, y: 120 },
    end: { x: width - 90, y: 120 },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText('Issuing Director', {
    x: width - 210,
    y: 100,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.25, 0.3),
  });

  // Ensure public/templates directory exists
  const outputDir = path.join(process.cwd(), 'public', 'templates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(outputDir, 'default_template.pdf');
  fs.writeFileSync(filePath, pdfBytes);
  console.log(`Default template generated at ${filePath}`);
}

createDefaultTemplate().catch(console.error);
