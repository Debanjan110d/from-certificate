import fs from 'fs';
import path from 'path';
import { TemplateConfig } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  id: 'default',
  name: 'Classic Achievement Certificate',
  pdfPath: 'public/templates/default_template.pdf',
  width: 841.89,
  height: 595.28,
  fields: {
    name: {
      x: 420.94, // Center of 841.89 page
      y: 335,
      fontSize: 34,
      fontFamily: 'TimesRomanBold',
      color: '#10172a',
      alignment: 'center',
    },
    date: {
      x: 170,
      y: 140,
      fontSize: 11,
      fontFamily: 'Helvetica',
      color: '#334155',
      alignment: 'center',
    },
    certificateId: {
      x: 770,
      y: 565,
      fontSize: 9,
      fontFamily: 'Courier',
      color: '#64748b',
      alignment: 'right',
    },
    qrCode: {
      x: 685,
      y: 45,
      size: 70,
      enabled: true,
    },
  },
};

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getTemplates(): TemplateConfig[] {
  ensureDataDirExists();
  if (!fs.existsSync(TEMPLATES_FILE)) {
    saveTemplates([DEFAULT_TEMPLATE_CONFIG]);
    return [DEFAULT_TEMPLATE_CONFIG];
  }

  try {
    const raw = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
    const templates = JSON.parse(raw);
    if (!Array.isArray(templates) || templates.length === 0) {
      return [DEFAULT_TEMPLATE_CONFIG];
    }
    return templates;
  } catch (err) {
    console.error('Error reading templates.json, falling back to default:', err);
    return [DEFAULT_TEMPLATE_CONFIG];
  }
}

export function getTemplateById(id: string): TemplateConfig {
  const templates = getTemplates();
  const found = templates.find(t => t.id === id);
  return found || DEFAULT_TEMPLATE_CONFIG;
}

export function saveTemplates(templates: TemplateConfig[]): void {
  ensureDataDirExists();
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
}

export function updateTemplateConfig(config: TemplateConfig): TemplateConfig {
  const templates = getTemplates();
  const idx = templates.findIndex(t => t.id === config.id);
  if (idx >= 0) {
    templates[idx] = config;
  } else {
    templates.push(config);
  }
  saveTemplates(templates);
  return config;
}
