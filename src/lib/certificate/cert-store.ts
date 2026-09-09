import fs from 'fs';
import path from 'path';
import { CertificateRecord } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CERTS_FILE = path.join(DATA_DIR, 'certificates.json');

// Persistent Cloud KV Store Bucket ID (Works on Vercel serverless read-only filesystem!)
const CLOUD_KV_BUCKET = process.env.CLOUD_KV_BUCKET || 'kvdb_student_cert_2026_v1';
const CLOUD_KV_URL = `https://kvdb.io/${CLOUD_KV_BUCKET}/certificates`;

function ensureDataDirExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Ignore read-only filesystem errors on Vercel
  }
}

// Memory cache fallback for fast in-instance lookups
let memoryCache: CertificateRecord[] | null = null;

export async function getAllCertificatesAsync(): Promise<CertificateRecord[]> {
  // 1. Try Cloud KV Store (Persistent across Vercel serverless instances)
  try {
    const res = await fetch(CLOUD_KV_URL, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        memoryCache = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloud KV read failed, falling back to local storage:', err);
  }

  // 2. Fallback to local memory cache or certificates.json
  if (memoryCache !== null) {
    return memoryCache;
  }

  ensureDataDirExists();
  if (fs.existsSync(CERTS_FILE)) {
    try {
      const raw = fs.readFileSync(CERTS_FILE, 'utf-8');
      const certs = JSON.parse(raw);
      if (Array.isArray(certs)) {
        memoryCache = certs;
        return certs;
      }
    } catch (err) {
      console.error('Error reading certificates.json:', err);
    }
  }

  return [];
}

export function getAllCertificatesSync(): CertificateRecord[] {
  if (memoryCache !== null) return memoryCache;
  ensureDataDirExists();
  if (fs.existsSync(CERTS_FILE)) {
    try {
      const raw = fs.readFileSync(CERTS_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      return [];
    }
  }
  return [];
}

export async function getCertificateByIdAsync(id: string): Promise<CertificateRecord | null> {
  const certs = await getAllCertificatesAsync();
  const found = certs.find((c) => c.id.toUpperCase() === id.toUpperCase());
  return found || null;
}

export async function saveCertificateAsync(record: CertificateRecord): Promise<CertificateRecord> {
  const certs = await getAllCertificatesAsync();
  const existingIdx = certs.findIndex((c) => c.id.toUpperCase() === record.id.toUpperCase());

  if (existingIdx >= 0) {
    certs[existingIdx] = record;
  } else {
    certs.unshift(record); // newest first
  }

  memoryCache = certs;

  // 1. Sync to Cloud KV Store
  try {
    await fetch(CLOUD_KV_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certs),
    });
  } catch (err) {
    console.error('Failed to persist to Cloud KV Store:', err);
  }

  // 2. Sync to local file if environment allows
  try {
    ensureDataDirExists();
    fs.writeFileSync(CERTS_FILE, JSON.stringify(certs, null, 2), 'utf-8');
  } catch (err) {
    // Read-only on Vercel
  }

  return record;
}

export async function generateNextCertificateIdAsync(): Promise<string> {
  const certs = await getAllCertificatesAsync();
  const year = new Date().getFullYear();
  const nextNum = certs.length + 1;
  const padNum = String(nextNum).padStart(6, '0');
  return `CERT-${year}-${padNum}`;
}

export async function clearAllCertificatesAsync(): Promise<void> {
  memoryCache = [];
  try {
    await fetch(CLOUD_KV_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    });
  } catch (err) {
    console.error('Failed to clear Cloud KV Store:', err);
  }

  try {
    ensureDataDirExists();
    fs.writeFileSync(CERTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only on Vercel
  }
}
