import re
def redact_pii(text):
    r = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[REDACTED_AADHAAR]', text)
    r = re.sub(r'\b[6-9]\d{9}\b', '[REDACTED_PHONE]', r)
    return {'redactedText': r, 'piiDetected': [], 'isClean': True}
