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
  width: number; // e.g. 841.89
  height: number; // e.g. 595.28
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
}

export interface FormSubmissionPayload {
  name?: string;
  email?: string;
  [key: string]: any;
}
