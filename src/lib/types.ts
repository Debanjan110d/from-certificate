export interface FieldConfig {
  x: number;
  y: number;
  fontSize: number;
  fontFamily:
    | 'TimesRomanBold'
    | 'TimesRoman'
    | 'TimesBoldItalic'
    | 'TimesItalic'
    | 'HelveticaBold'
    | 'Helvetica'
    | 'HelveticaOblique'
    | 'CourierBold'
    | 'Courier';
  color: string; // Hex e.g. "#10172a"
  alignment: 'center' | 'left' | 'right';
  enabled?: boolean; // Toggle field visibility on PDF
}

export interface QrCodeConfig {
  x: number;
  y: number;
  size: number;
  enabled: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  pdfPath: string; // Relative or absolute path to template PDF file
  pdfBase64?: string; // Optional persistent Base64 PDF string for Vercel cloud persistence
  width: number; // e.g. 841.89 or 595
  height: number; // e.g. 595.28 or 842
  fields: {
    name: FieldConfig;
    date?: FieldConfig;
    certificateId?: FieldConfig;
    course?: FieldConfig;
    qrCode?: QrCodeConfig;
  };
}

export interface ExtractedFormData {
  name: string;
  email: string;
  course?: string;
  issueDate?: string;
  extraFields: Record<string, string | number | boolean>;
}

export interface CertificateRecord {
  id: string;
  name: string;
  email: string;
  course: string;
  issueDate: string;
  templateId: string;
  extraFields: Record<string, string | number | boolean>;
  createdAt: string;
  downloaded?: number; // 1 = Yes (Downloaded), 0 = No (Not Downloaded)
  downloadCount?: number; // Total number of times downloaded
}

export interface FormSubmissionPayload {
  name?: string;
  email?: string;
  [key: string]: any;
}
