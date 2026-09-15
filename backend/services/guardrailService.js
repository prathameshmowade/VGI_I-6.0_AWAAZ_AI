/**
 * Constitutional AI & Privacy Guardrail Service
 * High-performance regex and heuristic guardrails for PII redaction (DPDP Act 2023)
 * and abusive targeting filtering before data enters databases or vector indices.
 */

class GuardrailService {
  /**
   * Redact sensitive personal data (Aadhaar, Phone, Email, PAN) from civic text
   */
  sanitizePII(text) {
    if (!text || typeof text !== 'string') return '';

    return text
      // Indian Aadhaar numbers (e.g. 1234 5678 9012 or 1234-5678-9012)
      .replace(/\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED_AADHAAR]')
      // Indian Phone Numbers (+91 9876543210 or 10-digit mobile)
      .replace(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b/g, '[REDACTED_PHONE]')
      // Email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      // Indian Permanent Account Numbers (PAN: e.g. ABCDE1234F)
      .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, '[REDACTED_PAN]');
  }

  /**
   * Filter profane, abusive, or harmful targeting content
   */
  filterAbusiveContent(text) {
    if (!text || typeof text !== 'string') return { isClean: true, text: '' };

    const toxicKeywords = [
      'kill', 'bomb', 'murder', 'shoot', 'attack', 'terrorist', 'riot',
      'chutiya', 'harami', 'bhenchod', 'madarchod', 'gandu', 'kutta'
    ];

    const lower = text.toLowerCase();
    const flaggedWords = [];

    for (const word of toxicKeywords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lower)) {
        flaggedWords.push(word);
      }
    }

    if (flaggedWords.length > 0) {
      return {
        isClean: false,
        flaggedWords,
        reason: 'Violates civic code of conduct: Profanity or threatening language detected',
        text: this.sanitizePII(text)
      };
    }

    return {
      isClean: true,
      text: this.sanitizePII(text)
    };
  }

  /**
   * Complete sanitization pipeline for incoming grievance payload
   */
  processGrievancePayload(payload) {
    const titleClean = this.sanitizePII(payload.title || 'Civic Issue Report');
    const descCheck = this.filterAbusiveContent(payload.description || '');

    return {
      ...payload,
      title: titleClean,
      description: descCheck.text,
      isFlaggedForReview: !descCheck.isClean,
      flaggedReason: descCheck.reason || null
    };
  }
}

const guardrailService = new GuardrailService();

module.exports = guardrailService;
