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

  // 1. Find Name (matches Name, Student Name, Full Name, Participant Name, Candidate Name)
  const nameEntry =
    normalizedEntries.find(
      (e) =>
        e.normKey === 'name' ||
        e.normKey === 'fullname' ||
        e.normKey === 'studentname' ||
        e.normKey === 'participantname' ||
        e.normKey === 'candidatename'
    ) || normalizedEntries.find((e) => e.normKey.includes('name'));

  // 2. Find Email - Priority Order:
  //    a) Exact form field named "Email" or "Student Email"
  //    b) Google Form automatic column "Email Address"
  //    c) Any key containing "email"
  //    d) Value-based fallback (any field value containing "@" and ".")
  const exactEmailEntry = normalizedEntries.find(
    (e) => e.normKey === 'email' || e.normKey === 'studentemail'
  );
  const colEmailAddressEntry = normalizedEntries.find(
    (e) => e.normKey === 'emailaddress'
  );
  const fallbackEmailEntry = normalizedEntries.find((e) => e.normKey.includes('email'));
  const valueEmailEntry = normalizedEntries.find(
    (e) => typeof e.value === 'string' && e.value.includes('@') && e.value.includes('.')
  );

  const emailEntry = exactEmailEntry || colEmailAddressEntry || fallbackEmailEntry || valueEmailEntry;

  // 3. Find Course (Optional)
  const courseEntry = normalizedEntries.find(
    (e) =>
      e.normKey === 'course' ||
      e.normKey === 'program' ||
      e.normKey === 'event' ||
      e.normKey === 'department'
  );

  // 4. Find Date (Optional)
  const dateEntry = normalizedEntries.find(
    (e) =>
      e.normKey === 'date' ||
      e.normKey === 'issuedate' ||
      e.normKey === 'timestamp' ||
      e.normKey === 'dateofissue'
  );

  const name = nameEntry ? String(nameEntry.value).trim() : '';

  // Clean email value (fix common typos like .comy -> .com)
  let rawEmail = emailEntry ? String(emailEntry.value).trim() : '';
  rawEmail = rawEmail.replace(/\.com[a-z]+$/i, '.com'); // fix .comy, .coms -> .com

  const extraFields: Record<string, string | number | boolean> = {};

  // Store all other entries in extraFields, including secondary emails
  for (const entry of normalizedEntries) {
    if (
      entry.originalKey !== nameEntry?.originalKey &&
      entry.originalKey !== courseEntry?.originalKey &&
      entry.originalKey !== dateEntry?.originalKey
    ) {
      let cleanVal = entry.value;
      if (typeof cleanVal === 'string' && cleanVal.includes('@')) {
        cleanVal = cleanVal.replace(/\.com[a-z]+$/i, '.com');
      }
      extraFields[entry.originalKey] = cleanVal;
    }
  }

  // Validation
  if (!name) {
    throw new Error('Validation failed: Required field "Name" is missing or empty.');
  }

  if (!rawEmail) {
    throw new Error('Validation failed: Required field "Email" is missing or empty.');
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    name,
    email: rawEmail,
    course: courseEntry ? String(courseEntry.value).trim() : 'Certificate of Completion',
    issueDate: dateEntry ? String(dateEntry.value).trim() : todayStr,
    extraFields,
  };
}
