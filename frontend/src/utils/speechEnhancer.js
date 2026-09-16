/**
 * Civic & Municipal Speech-to-Text Acoustic & Phonetic Correction Engine
 * 
 * Automatically cleans and refines raw Web Speech API transcripts:
 * 1. Corrects phonetic civic term misrecognitions (e.g., 'port hole' -> 'pothole', 'c which' -> 'sewage')
 * 2. Normalizes Hindi / Hinglish phonetics and municipal vocabulary
 * 3. Removes acoustic stuttering and filler tokens
 * 4. Applies proper casing, punctuation, and address formatting
 */

// Common acoustic misrecognitions mapped to standard municipal civic vocabulary
const PHONETIC_CORRECTIONS = [
  // Road & Infrastructure
  { regex: /\b(port\s*hole|pot\s*hole|put\s*hole|port\s*hall|bottle\s*in\s*road|post\s*hole)\b/gi, replacement: 'pothole' },
  { regex: /\b(ash\s*fault|ash\s*fall|as\s*fault)\b/gi, replacement: 'asphalt' },
  { regex: /\b(food\s*path|foot\s*bad|foot\s*pad)\b/gi, replacement: 'footpath' },
  { regex: /\b(fly\s*over|ply\s*over)\b/gi, replacement: 'flyover' },
  { regex: /\b(road\s*the\s*wider|the\s*wider\s*road)\b/gi, replacement: 'road divider' },
  { regex: /\b(speed\s*braker|speed\s*break|speed\s*breaker)\b/gi, replacement: 'speed breaker' },
  { regex: /\b(crater\s*on\s*road|road\s*creater)\b/gi, replacement: 'road crater' },
  { regex: /\b(zebra\s*cross|zebra\s*crossing)\b/gi, replacement: 'zebra crossing' },

  // Water & Sewerage
  { regex: /\b(c\s*which|see\s*which|sea\s*wage|c\s*wage|c\s*which\s*line|sewer\s*age)\b/gi, replacement: 'sewage' },
  { regex: /\b(rain\s*age|drain\s*edge|train\s*age)\b/gi, replacement: 'drainage' },
  { regex: /\b(pipe\s*lein|pipe\s*line\s*leak|water\s*pipe\s*leakage)\b/gi, replacement: 'pipeline leakage' },
  { regex: /\b(man\s*whole|man\s*hole\s*cover|main\s*hole)\b/gi, replacement: 'manhole' },
  { regex: /\b(water\s*logging|water\s*locking|water\s*logging\s*problem)\b/gi, replacement: 'waterlogging' },
  { regex: /\b(gutter\s*line|gutar|guttar)\b/gi, replacement: 'gutter line' },

  // Sanitation & Public Waste
  { regex: /\b(catch\s*ra|katchra|kuchra|kachda)\b/gi, replacement: 'kachra (garbage)' },
  { regex: /\b(does\s*bin|das\s*bin|dust\s*been|dust\s*pin)\b/gi, replacement: 'dustbin' },
  { regex: /\b(garbage\s*dam|garbage\s*dumping|garbage\s*heep)\b/gi, replacement: 'garbage dump' },
  { regex: /\b(sanity\s*station|sanitation\s*problem)\b/gi, replacement: 'sanitation' },
  { regex: /\b(safai\s*wala|safaikarmi|safai\s*karmi)\b/gi, replacement: 'safai karmi' },
  { regex: /\b(dead\s*animal\s*lying|carcass)\b/gi, replacement: 'animal carcass' },

  // Electrical & Smart Lighting
  { regex: /\b(straight\s*light|street\s*lite|straight\s*lamp|street\s*lamp\s*off)\b/gi, replacement: 'streetlight' },
  { regex: /\b(electric\s*pool|electric\s*poll|electricity\s*pole)\b/gi, replacement: 'electric pole' },
  { regex: /\b(transport\s*blast|transformer\s*spark|transformar)\b/gi, replacement: 'transformer spark' },
  { regex: /\b(loose\s*wire|open\s*wire|hanging\s*wire)\b/gi, replacement: 'hanging wire hazard' },
  { regex: /\b(black\s*out|bijli\s*chali\s*gayi|power\s*cut)\b/gi, replacement: 'power outage' },

  // Parks, Trees & Public Amenities
  { regex: /\b(tree\s*fall|fallen\s*tree\s*branch|tree\s*branch\s*fallen)\b/gi, replacement: 'fallen tree branch' },
  { regex: /\b(broken\s*bench|park\s*bench\s*damaged)\b/gi, replacement: 'damaged park bench' },

  // Municipal Administrative Structure
  { regex: /\b(nagar\s*nigam|nagarnigam|municipal\s*corporation)\b/gi, replacement: 'Nagar Nigam' },
  { regex: /\b(nagar\s*palika|nagarpalika)\b/gi, replacement: 'Nagar Palika' },
  { regex: /\b(ward\s*no\.?|ward\s*number|war\s*number|one\s*number)\s*([0-9]+)\b/gi, replacement: 'Ward $2' },
  { regex: /\b(zone\s*no\.?|zone\s*number)\s*([0-9]+)\b/gi, replacement: 'Zone $2' },
  { regex: /\b(parshad|councillor|councilor)\b/gi, replacement: 'Ward Councilor' }
];

// Filler words to remove for crisp, professional intake
const FILLER_WORDS = /\b(uh|um|er|ah|like you know|basically|you know|arre|haan|matlab ki|kya bolte)\b/gi;

/**
 * Enhances and normalizes raw speech recognition text.
 * @param {string} rawText - The raw transcript from Web Speech API
 * @param {string} language - Locale code ('en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'te-IN')
 * @returns {string} - Cleaned, punctuated, phonetically corrected text
 */
export function enhanceSpeechTranscript(rawText, language = 'en-IN') {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.trim();

  // 1. Remove duplicate adjacent stutter words (e.g., "pothole pothole" -> "pothole")
  text = text.replace(/\b(\w+)\s+\1\b/gi, '$1');

  // 2. Remove verbal filler tokens
  text = text.replace(FILLER_WORDS, '').replace(/\s{2,}/g, ' ');

  // 3. Apply civic phonetic corrections
  for (const item of PHONETIC_CORRECTIONS) {
    text = text.replace(item.regex, item.replacement);
  }

  // 4. Clean up spaces around punctuation
  text = text.replace(/\s+([,.:;?!।])/g, '$1');
  text = text.replace(/([,.:;?!।])([A-Za-z0-9\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F])/g, '$1 $2');

  // 5. Ensure first letter is capitalized
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // 6. Append sentence termination if missing
  if (text.length > 8 && !/[.!?।]$/.test(text)) {
    const useDevanagariStop = language.startsWith('hi') || language.startsWith('mr') || language.startsWith('ta') || language.startsWith('te');
    text += useDevanagariStop ? '।' : '.';
  }

  return text.trim();
}

/**
 * Generates an intelligent, structured civic summary from voice input.
 * @param {string} text - The transcribed speech text
 * @returns {{ title: string, description: string }}
 */
export function synthesizeCivicGrievance(text) {
  if (!text) return { title: '', description: '' };

  const cleaned = enhanceSpeechTranscript(text);
  
  // Extract Title (first phrase or up to 55 characters)
  const firstPunctuation = cleaned.search(/[,.:;?!।\n]/);
  let title = '';
  
  if (firstPunctuation > 8 && firstPunctuation < 65) {
    title = cleaned.substring(0, firstPunctuation).trim();
  } else if (cleaned.length > 60) {
    const spaceIndex = cleaned.lastIndexOf(' ', 55);
    title = (spaceIndex > 15 ? cleaned.substring(0, spaceIndex) : cleaned.substring(0, 55)) + '...';
  } else {
    title = cleaned.replace(/[.!?।]$/, '');
  }

  return {
    title,
    description: cleaned
  };
}
