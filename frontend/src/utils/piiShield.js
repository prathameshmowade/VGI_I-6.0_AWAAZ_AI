/**
 * DPDP Act 2023 Privacy Shield Utility
 * Automated Text PII Redaction & Detection Engine
 * 
 * Protects:
 * 1. Indian Aadhaar Numbers (12 digits with spaces, dashes, or contiguous)
 * 2. Mobile Phone Numbers (+91 prefixed, 10-digit Indian standard, with separators)
 * 3. Email addresses
 */

// 12-digit Aadhaar with optional spaces or dashes
const AADHAAR_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;

// Indian phone numbers: +91 with space/dash or 10-digit starting with 6-9
const PHONE_REGEX = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b/g;

// General 10-digit phone number fallback
const GENERIC_PHONE_REGEX = /\b\d{10}\b/g;

// Email addresses
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/**
 * Redacts all personal identifiable information from text.
 * @param {string} text - The raw text input
 * @returns {string} - Cleaned text with PII replaced by safe redaction tokens
 */
export function redactPII(text) {
  if (!text || typeof text !== 'string') return text || '';

  return text
    .replace(AADHAAR_REGEX, '[REDACTED_AADHAAR]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(GENERIC_PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
}

/**
 * Detects presence of PII in text and provides metadata for live UI indicators.
 * @param {string} text - The raw text input
 * @returns {object} - Detection details and masked preview
 */
export function detectPII(text) {
  if (!text || typeof text !== 'string') {
    return {
      hasPII: false,
      aadhaarDetected: false,
      phoneDetected: false,
      emailDetected: false,
      detectedTypes: [],
      redactedPreview: ''
    };
  }

  const aadhaarDetected = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(text);
  const phoneDetected = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b|\b\d{10}\b/.test(text);
  const emailDetected = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text);

  const detectedTypes = [];
  if (aadhaarDetected) detectedTypes.push('Aadhaar Number');
  if (phoneDetected) detectedTypes.push('Phone Number');
  if (emailDetected) detectedTypes.push('Email Address');

  return {
    hasPII: detectedTypes.length > 0,
    aadhaarDetected,
    phoneDetected,
    emailDetected,
    detectedTypes,
    redactedPreview: redactPII(text)
  };
}
