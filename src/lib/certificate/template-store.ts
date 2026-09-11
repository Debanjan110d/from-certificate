import fs from 'fs';
import path from 'path';
import { TemplateConfig } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

const CLOUD_KV_BUCKET = process.env.CLOUD_KV_BUCKET || 'kvdb_student_cert_2026_v1';
const CLOUD_KV_URL = `https://kvdb.io/${CLOUD_KV_BUCKET}/templates`;

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  id: 'default',
  name: "Teacher's Day Participation Certificate",
  pdfPath: 'public/templates/default_template.pdf',
  width: 595,
  height: 842,
  fields: {
    name: {
      x: 297.5, // Center of 595 page width
      y: 390,   // Directly under "Certificate Of Participation Presented To:"
      fontSize: 34,
      fontFamily: 'TimesBoldItalic',
      color: '#0d233a',
      alignment: 'center',
    },
    date: {
      x: 297.5,
      y: 475,
      fontSize: 12,
      fontFamily: 'Helvetica',
      color: '#334155',
      alignment: 'center',
      enabled: false, // Pre-printed on template ("5th September, 2026")
    },
    certificateId: {
      x: 565,
      y: 815,
      fontSize: 8,
      fontFamily: 'Courier',
      color: '#64748b',
      alignment: 'right',
      enabled: true,
    },
    qrCode: {
      x: 505,
      y: 20,
      size: 65,
      enabled: true,
    },
  },
};

let templateCache: TemplateConfig[] | null = null;

function ensureDataDirExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Ignore read-only filesystem errors on Vercel
  }
}

export async function getTemplatesAsync(): Promise<TemplateConfig[]> {
  // 1. Try Cloud KV Store
  try {
    const res = await fetch(CLOUD_KV_URL, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        templateCache = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloud KV template read failed, falling back to local:', err);
  }

  // 2. Fallback to memory cache
  if (templateCache !== null) {
    return templateCache;
  }

  // 3. Fallback to local templates.json file
  ensureDataDirExists();
  if (fs.existsSync(TEMPLATES_FILE)) {
    try {
      const raw = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
      const templates = JSON.parse(raw);
      if (Array.isArray(templates) && templates.length > 0) {
        templateCache = templates;
        return templates;
      }
    } catch (err) {
      console.error('Error reading templates.json:', err);
    }
  }

  templateCache = [DEFAULT_TEMPLATE_CONFIG];
  return templateCache;
}

export function getTemplates(): TemplateConfig[] {
  if (templateCache !== null) return templateCache;

  ensureDataDirExists();
  if (fs.existsSync(TEMPLATES_FILE)) {
    try {
      const raw = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
      const templates = JSON.parse(raw);
      if (Array.isArray(templates) && templates.length > 0) {
        templateCache = templates;
        return templates;
      }
    } catch (err) {
      // fallback
    }
  }

  return [DEFAULT_TEMPLATE_CONFIG];
}

export async function getTemplateByIdAsync(id: string): Promise<TemplateConfig> {
  const templates = await getTemplatesAsync();
  const found = templates.find((t) => t.id === id);
  return found || DEFAULT_TEMPLATE_CONFIG;
}

export function getTemplateById(id: string): TemplateConfig {
  const templates = getTemplates();
  const found = templates.find((t) => t.id === id);
  return found || DEFAULT_TEMPLATE_CONFIG;
}

export async function saveTemplatesAsync(templates: TemplateConfig[]): Promise<void> {
  templateCache = templates;

  // 1. Sync to Cloud KV Store
  try {
    await fetch(CLOUD_KV_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templates),
    });
  } catch (err) {
    console.error('Failed to persist templates to Cloud KV:', err);
  }

  // 2. Sync to local file
  try {
    ensureDataDirExists();
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (err) {
    // Read-only on Vercel
  }
}

export function saveTemplates(templates: TemplateConfig[]): void {
  templateCache = templates;
  try {
    ensureDataDirExists();
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (err) {
    // Read-only on Vercel
  }
}

export async function updateTemplateConfigAsync(config: TemplateConfig): Promise<TemplateConfig> {
  const templates = await getTemplatesAsync();
  const idx = templates.findIndex((t) => t.id === config.id);
  if (idx >= 0) {
    templates[idx] = config;
  } else {
    templates.push(config);
  }
  await saveTemplatesAsync(templates);
  return config;
}

export function updateTemplateConfig(config: TemplateConfig): TemplateConfig {
  const templates = getTemplates();
  const idx = templates.findIndex((t) => t.id === config.id);
  if (idx >= 0) {
    templates[idx] = config;
  } else {
    templates.push(config);
  }
  saveTemplates(templates);
  return config;
}
