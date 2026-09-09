import fs from 'fs';
import path from 'path';
import { CertificateRecord } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CERTS_FILE = path.join(DATA_DIR, 'certificates.json');

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAllCertificates(): CertificateRecord[] {
  ensureDataDirExists();
  if (!fs.existsSync(CERTS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(CERTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading certificates.json:', err);
    return [];
  }
}

export function getCertificateById(id: string): CertificateRecord | null {
  const certs = getAllCertificates();
  const found = certs.find(c => c.id.toUpperCase() === id.toUpperCase());
  return found || null;
}

export function saveCertificate(record: CertificateRecord): CertificateRecord {
  ensureDataDirExists();
  const certs = getAllCertificates();
  // Check if ID already exists
  const existingIdx = certs.findIndex(c => c.id.toUpperCase() === record.id.toUpperCase());
  if (existingIdx >= 0) {
    certs[existingIdx] = record;
  } else {
    certs.unshift(record); // newest first
  }
  fs.writeFileSync(CERTS_FILE, JSON.stringify(certs, null, 2), 'utf-8');
  return record;
}

export function generateNextCertificateId(): string {
  const certs = getAllCertificates();
  const year = new Date().getFullYear();
  const nextNum = certs.length + 1;
  const padNum = String(nextNum).padStart(6, '0');
  return `CERT-${year}-${padNum}`;
}
