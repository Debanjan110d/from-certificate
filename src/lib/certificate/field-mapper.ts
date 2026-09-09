import { ExtractedFormData, FormSubmissionPayload } from '../types';

/**
 * Robustly extracts required fields (Name, Email) and optional fields (Course, Date)
 * from arbitrary form submissions regardless of field count or ordering.
 */
export function extractFormData(payload: FormSubmissionPayload): ExtractedFormData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: expected an object containing form data.');
  }

  // Normalize all incoming keys for fuzzy matching
  const normalizedEntries: Array<{ originalKey: string; normKey: string; value: any }> = [];

  for (const [key, val] of Object.entries(payload)) {
    if (val === undefined || val === null) continue;
    const normKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    normalizedEntries.push({
      originalKey: key,
      normKey,
      value: typeof val === 'string' ? val.trim() : String(val),
    });
  }

  // 1. Find Name
  const nameEntry = normalizedEntries.find(e => 
    e.normKey === 'name' || 
    e.normKey === 'studentname' || 
    e.normKey === 'fullname' || 
    e.normKey === 'candidate' ||
    e.normKey.includes('name')
  );
  
  // 2. Find Email
  const emailEntry = normalizedEntries.find(e => 
    e.normKey === 'email' || 
    e.normKey === 'emailaddress' || 
    e.normKey === 'studentemail' ||
    e.normKey.includes('email')
  );

  // 3. Find Course (Optional)
  const courseEntry = normalizedEntries.find(e => 
    e.normKey === 'course' || 
    e.normKey === 'program' || 
    e.normKey === 'event' || 
    e.normKey === 'department'
  );

  // 4. Find Date (Optional)
  const dateEntry = normalizedEntries.find(e => 
    e.normKey === 'date' || 
    e.normKey === 'issuedate' || 
    e.normKey === 'timestamp' || 
    e.normKey === 'dateofissue'
  );

  const name = nameEntry ? String(nameEntry.value).trim() : '';
  const email = emailEntry ? String(emailEntry.value).trim() : '';

  // Extract extra fields (all fields except the ones mapped to name/email/course/date)
  const usedKeys = new Set([
    nameEntry?.originalKey,
    emailEntry?.originalKey,
    courseEntry?.originalKey,
    dateEntry?.originalKey,
  ].filter(Boolean));

  const extraFields: Record<string, string | number | boolean> = {};
  for (const entry of normalizedEntries) {
    if (!usedKeys.has(entry.originalKey)) {
      extraFields[entry.originalKey] = entry.value;
    }
  }

  // Validation
  if (!name) {
    throw new Error('Validation failed: Required field "Name" is missing or empty.');
  }

  if (!email) {
    throw new Error('Validation failed: Required field "Email" is missing or empty.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Validation failed: Invalid email format "${email}".`);
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    name,
    email,
    course: courseEntry ? String(courseEntry.value).trim() : 'Certificate of Completion',
    issueDate: dateEntry ? String(dateEntry.value).trim() : todayStr,
    extraFields,
  };
}
