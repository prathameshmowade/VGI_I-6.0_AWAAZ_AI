const env = require('../config/env');
const { classifyComplaintLocally } = require('./aiService');

/**
 * IVR greeting messages in multiple languages.
 */
const IVR_GREETINGS = {
  en: 'Welcome to Awaaz A.I. Municipal Grievance Helpline. Please describe your complaint after the beep. You can speak in English, Hindi, or Marathi. Your complaint will be automatically registered and you will receive an SMS confirmation.',
  hi: 'आवाज़ ए.आई. नगर निगम शिकायत हेल्पलाइन में आपका स्वागत है। कृपया बीप के बाद अपनी शिकायत बताएं। आप हिंदी, अंग्रेज़ी या मराठी में बोल सकते हैं। आपकी शिकायत स्वतः दर्ज होगी और एसएमएस से पुष्टि भेजी जाएगी।',
  mr: 'आवाज ए.आय. नगरपालिका तक्रार हेल्पलाइनवर आपले स्वागत आहे। कृपया बीप नंतर आपली तक्रार सांगा.'
};

/**
 * Language selection menu TwiML.
 */
const LANGUAGE_MENU = {
  en: 'Press 1 for English. Press 2 for Hindi. Press 3 for Marathi.',
  hi: 'अंग्रेज़ी के लिए 1 दबाएं। हिंदी के लिए 2 दबाएं। मराठी के लिए 3 दबाएं।'
};

/**
 * Map DTMF digit to language code.
 */
const dtmfToLanguage = (digit) => {
  const map = { '1': 'en', '2': 'hi', '3': 'mr' };
  return map[digit] || 'en';
};

/**
 * Map language code to Twilio voice language.
 */
const languageToTwilioVoice = (lang) => {
  const map = {
    'en': { language: 'en-IN', voice: 'Polly.Aditi' },
    'hi': { language: 'hi-IN', voice: 'Polly.Aditi' },
    'mr': { language: 'mr-IN', voice: 'Polly.Aditi' }
  };
  return map[lang] || map['en'];
};

/**
 * Generate TwiML for the initial incoming call — language selection + recording.
 */
const generateIncomingCallTwiml = (webhookBaseUrl) => {
  const baseUrl = webhookBaseUrl || env.TWILIO_WEBHOOK_BASE_URL || 'https://localhost:5000';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">Welcome to Awaaz A.I. Municipal Grievance Helpline.</Say>
  <Pause length="1"/>
  <Say language="hi-IN" voice="Polly.Aditi">आवाज़ ए.आई. नगर निगम शिकायत हेल्पलाइन में आपका स्वागत है।</Say>
  <Pause length="1"/>
  <Say language="en-IN" voice="Polly.Aditi">Please describe your complaint after the beep. Speak clearly in English, Hindi, or Marathi.</Say>
  <Pause length="1"/>
  <Say language="hi-IN" voice="Polly.Aditi">कृपया बीप के बाद अपनी शिकायत बताएं।</Say>
  <Pause length="1"/>
  <Record maxLength="120" transcribe="true" transcribeCallback="${baseUrl}/api/call/transcription" action="${baseUrl}/api/call/recording" playBeep="true" timeout="5" />
  <Say language="en-IN" voice="Polly.Aditi">We did not receive a recording. Please call again. Thank you.</Say>
</Response>`;
};

/**
 * Generate TwiML for the recording completion — confirm to caller.
 */
const generateRecordingCompleteTwiml = (complaintId) => {
  const id = complaintId || 'PENDING';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">Thank you. Your complaint has been recorded successfully.</Say>
  <Pause length="1"/>
  <Say language="en-IN" voice="Polly.Aditi">Your tracking ID is ${id.split('').join(' ')}.</Say>
  <Pause length="1"/>
  <Say language="hi-IN" voice="Polly.Aditi">धन्यवाद। आपकी शिकायत सफलतापूर्वक दर्ज की गई है।</Say>
  <Pause length="1"/>
  <Say language="en-IN" voice="Polly.Aditi">You will receive an SMS confirmation shortly. Goodbye.</Say>
</Response>`;
};

/**
 * Process a call transcription into a complaint.
 * @param {string} transcription - The transcribed text from the call
 * @param {string} callerNumber - Caller's phone number
 * @returns {object} - Classified complaint data
 */
const processCallTranscription = (transcription, callerNumber) => {
  const trimmedText = (transcription || '').trim();
  if (!trimmedText) {
    return {
      error: true,
      message: 'Empty transcription received'
    };
  }

  // Extract title
  const firstSentenceEnd = trimmedText.search(/[.!?।]/);
  const title = firstSentenceEnd > 0 && firstSentenceEnd < 60
    ? trimmedText.substring(0, firstSentenceEnd + 1)
    : trimmedText.substring(0, 60) + (trimmedText.length > 60 ? '...' : '');

  // AI classification
  const aiResult = classifyComplaintLocally({
    title,
    description: trimmedText,
    category: null,
    customCategory: null
  });

  return {
    error: false,
    title,
    description: trimmedText,
    category: aiResult.category,
    department: aiResult.department,
    departmentCode: aiResult.departmentCode,
    urgency: aiResult.urgency,
    confidenceScore: aiResult.confidenceScore,
    isAutoClassified: true,
    xaiReasoning: aiResult.xaiReasoning,
    source: 'call',
    citizenPhone: callerNumber,
    language: detectCallLanguage(trimmedText)
  };
};

/**
 * Simple language detection for call transcriptions.
 */
const detectCallLanguage = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return 'en';
};

module.exports = {
  IVR_GREETINGS,
  LANGUAGE_MENU,
  dtmfToLanguage,
  languageToTwilioVoice,
  generateIncomingCallTwiml,
  generateRecordingCompleteTwiml,
  processCallTranscription,
  detectCallLanguage
};
