import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const TRANSLATIONS = {
  en: {
    // Brand & Header
    brand_name: 'awaaz.ai',
    brand_slogan: 'Every Voice Heard. Every Issue Resolved.',
    nav_overview: 'Overview',
    nav_citizen: 'Resident Intake',
    nav_officer: 'Officer Dashboard',
    nav_digital_twin: 'Digital Twin',
    nav_analytics: 'Analytics',
    nav_login: 'Sign In',
    nav_logout: 'Logout',
    nav_track: 'Track Status',
    auth_signin: 'Sign In',
    auth_logout: 'Logout',
    
    // Landing Page Hero
    hero_badge: 'awaaz.ai • Every Voice Heard. Every Issue Resolved.',
    hero_title: 'awaaz.ai — AI-Powered Civic Grievance Triage',
    hero_sub: 'Har Awaaz Suni Jayegi, Har Samasya Suljhayi Jayegi. Empowering citizens and city authorities with multi-language voice intake, Explainable AI triage, 60s agentic dispatch, Google Maps telemetry, and 3-citizen verification.',
    hero_btn_submit: 'Submit Grievance',
    hero_btn_officer: 'Officer Dashboard',
    system_status: 'System Status',
    operational: 'Operational',
    avg_sla: 'Avg SLA Resolution:',
    avg_sla_val: '4.2 Hours',
    ai_conf_score: 'AI Confidence Score:',
    blockchain_blocks: 'Blockchain Blocks:',
    blockchain_blocks_val: '1,420 Verifications',
    
    // Architectural Pillars
    pillars_heading: 'Core System Architecture',
    pillars_sub: 'Built on 4 pillars of civic artificial intelligence',
    pillar1_title: 'Multi-Modal Voice & Text Intention AI',
    pillar1_desc: 'Native Speech-to-Text in English, Hindi, and Marathi with localized dialect intent mapping.',
    pillar2_title: 'Explainable AI (XAI) & Community Score',
    pillar2_desc: 'Transparent priority confidence scoring based on proximity to schools, hospitals, and high-traffic zones.',
    pillar3_title: '60s Agentic Resolution Copilot',
    pillar3_desc: 'Autonomous contractor directory lookup, auto work order generation, and photo CLIP verification.',
    pillar4_title: 'AI City Digital Twin Simulation',
    pillar4_desc: 'Real-time municipal telemetry map predicting infrastructure failure hotspots before citizens complain.',
    
    // Workflow Section
    workflow_heading: 'How Awaaz AI Resolves Grievances in 7 Steps',
    workflow_sub: 'From citizen voice recording to cryptographic closure without red-tape delays',
    
    // Telemetry Map Section
    telemetry_heading: 'Live Google Maps City Telemetry Layer',
    telemetry_sub: 'Pinpointing active grievances and municipal infrastructure risk scores',
    explore_digital_twin: 'Explore Full Digital Twin →',
    
    // Citizen Portal
    citizen_portal_badge: 'RESIDENT INTAKE PORTAL • PRIVACY SHIELD PROTECTED',
    citizen_title: 'Submit a Civic Grievance',
    citizen_desc: 'Report road damage, water leakages, sanitation, streetlights, or safety hazards using voice speech, live geo-tag camera, or text in your preferred language.',
    citizen_voice_step: '1. Voice Speech-to-Text (Hindi / Marathi / English)',
    citizen_loc_step: '2. Location Pinpoint & Live Geo-Tag Camera Evidence',
    citizen_form_step: '3. Grievance Submission Form',
    citizen_submit_btn: 'Submit Grievance with AI Triage',
    citizen_submitting: 'Submitting with AI Triage...',
    
    // Voice Input
    voice_start: 'Start Voice Recording',
    voice_listening: 'Listening... Speak in English, Hindi, or Marathi',
    voice_stop: 'Stop Recording',
    voice_presets: 'Demo Voice Presets:',
    
    // Location Picker
    loc_title: 'Google Maps Location Pinpoint',
    loc_sub: 'Click anywhere on the map or drag the marker to pin exact grievance coordinates.',
    loc_auto_gps: 'Auto GPS',
    loc_detecting: 'Locating...',
    loc_current: 'Selected Location:',
    
    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'Live Geo-Tag Camera & Evidence Capture',
    geotag_cam_sub: 'Take a live photo with automatic GPS coordinates, timestamp, and Indore Municipal watermark burned directly onto the image.',
    geotag_open_btn: '📸 Open Live Geo-Tag Camera',
    geotag_snap_btn: 'Snap Geo-Tagged Photo',
    geotag_retake_btn: 'Retake Photo',
    geotag_use_btn: 'Use Geo-Tagged Photo',
    geotag_presets: 'Or Choose Verified Geo-Tagged Presets:',
    img_title: 'Evidence Photo Upload (YOLOv8 Shield Protected)',
    img_sub: 'Drop or select site photo. Faces and vehicle number plates are automatically blurred before submission.',
    img_drag_drop: 'Drag and drop grievance photo here, or browse files',
    img_formats: 'PNG, JPG or WEBP up to 10MB',
    img_select_sample: 'Or select verified sample photo:',
    
    // Privacy Shield
    privacy_badge: 'PRIVACY-BY-DESIGN SHIELD',
    privacy_title: 'Constitutional AI Safety Shield Active',
    privacy_pii: 'PII Masking',
    privacy_pii_sub: 'Aadhaar & Phone Auto Redacted',
    privacy_yolo: 'YOLO Blur AI',
    privacy_yolo_sub: 'Faces & License Plates Blurred',
    privacy_doxxing: 'Doxxing Shield',
    privacy_doxxing_sub: 'Targeting Info Blocked',
    privacy_dpdp: 'DPDP Compliance',
    privacy_dpdp_sub: 'Digital Personal Data Act 2023',
    
    // Form Fields
    form_title: 'Grievance Title',
    form_title_placeholder: 'Brief summary of the issue (e.g. Severe pothole on main road)',
    form_desc: 'Detailed Description (Auto-populated from voice)',
    form_desc_placeholder: 'Provide complete details about the grievance...',
    form_category: 'Category',
    form_location: 'Location / Address Entry',
    form_live_gps: 'Use Live GPS',
    form_impact_weight: 'AI Community Impact Weight',
    
    // Categories
    cat_road: 'Road Damage / Potholes',
    cat_water: 'Water Supply & Pipeline Leak',
    cat_sanitation: 'Sanitation & Garbage Accumulation',
    cat_electrical: 'Electrical & Streetlight Outage',
    cat_parks: 'Parks & Public Amenities',
    cat_other: 'Other / Miscellaneous',
    
    // Officer Dashboard
    officer_title: 'Officer Triage & Work Order Dashboard',
    officer_zone: 'INDORE MUNICIPAL CORPORATION • ZONE 12',
    officer_dept_filter: 'Department Bifurcation:',
    officer_all_depts: 'All Departments (Municipal Overview)',
    officer_start_btn: 'Start',
    officer_mark_solved: 'Mark Solved',
    officer_grievances_in_view: 'Grievances in View',
    officer_logged_in_as: 'Logged in as',
    
    // Kanban Columns
    col_new: 'New',
    col_assigned: 'Assigned',
    col_in_progress: 'In Progress',
    col_pending_verif: 'Pending Verification',
    col_resolved: 'Resolved',
    
    // SLA Countdown
    sla_timer_title: 'SLA Countdown Timer',
    sla_remaining: 'remaining (48h SLA)',
    
    // Verification & Copilot
    verif_active: '⏳ 7-Day Verification Window Active',
    verif_desc: 'Locked in Pending Verification for 7 days until 3 citizens audit & verify photo proof.',
    copilot_title: '60s Agentic Resolution Copilot & Work Order Generator',
    copilot_sub: 'Autonomous AI dispatching municipal contractors and generating equipment requisitions',
    copilot_btn: '⚡ Generate Autonomous Work Order Dispatch',
    
    // Login & Register
    login_title: 'Registered Sign In',
    register_title: 'New Citizen Register',
    resident_citizen: '👤 Resident Citizen',
    municipal_officer: '👮 Municipal Officer',
    full_legal_name: 'Full Legal Name',
    mobile_label: '10-Digit Mobile Number (SMS OTP)',
    send_otp_btn: '📱 Send OTP',
    verify_otp_btn: 'Verify OTP',
    phone_verified_badge: '✓ Mobile Number Verified via SMS OTP!',
    address_label: 'Residential Address / Landmark',
    complete_reg_btn: 'Complete Citizen Registration',
    quick_demo_signin: '1-Click Quick Demo Sign-In:',
    
    // Footer
    footer_desc: 'A next-generation municipal redressal and predictive infrastructure governance platform developed for Innovik Hackathon 6.0 by Team Pragati 2.0.',
    footer_nav: 'Useful Navigation',
    footer_transparency: 'System Transparency',
    footer_rights: 'All municipal rights reserved. Compliant with Digital Personal Data Protection (DPDP) Act 2023.',

    // SMS & Call Complaint
    nav_sms_complaint: 'SMS Complaint',
    nav_call_complaint: 'Call Complaint',
    sms_page_title: 'File Complaint via Text SMS',
    sms_page_desc: 'No app, no internet needed — simply send a text message to register your municipal complaint.',
    call_page_title: 'File Complaint via Phone Call',
    call_page_desc: 'Just make a phone call and speak your complaint. The IVR system records your voice and creates a ticket.'
  },
  hi: {
    // Brand & Header
    brand_name: 'awaaz.ai',
    brand_slogan: 'हर आवाज़ सुनी जाएगी। हर समस्या हल होगी।',
    nav_overview: 'अवलोकन',
    nav_citizen: 'नागरिक पोर्टल',
    nav_officer: 'अधिकारी डैशबोर्ड',
    nav_digital_twin: 'डिजिटल ट्विन',
    nav_analytics: 'एनालिटिक्स',
    nav_login: 'साइन इन',
    nav_logout: 'लॉगआउट',
    nav_track: 'स्थिति ट्रैक करें',
    auth_signin: 'साइन इन',
    auth_logout: 'लॉगआउट',
    
    // Landing Page Hero
    hero_badge: 'awaaz.ai • हर आवाज़ सुनी जाएगी। हर समस्या हल होगी।',
    hero_title: 'awaaz.ai — एआई-संचालित नागरिक शिकायत समाधान प्रणाली',
    hero_sub: 'हर आवाज़ सुनी जाएगी, हर समस्या सुलझाई जाएगी। नागरिकों और नगर निगम अधिकारियों को बहुभाषी आवाज़ रिकॉर्डिंग, पारदर्शी व्याख्यात्मक AI ट्राइएज, 60-सेकंड स्वचालित वर्क ऑर्डर और 3-नागरिक सत्यापन के साथ सशक्त बनाना।',
    hero_btn_submit: 'शिकायत दर्ज करें',
    hero_btn_officer: 'अधिकारी डैशबोर्ड',
    system_status: 'सिस्टम स्थिति',
    operational: 'सक्रिय एवं चालू',
    avg_sla: 'औसत समाधान समय:',
    avg_sla_val: '4.2 घंटे',
    ai_conf_score: 'एआई सटीकता स्कोर:',
    blockchain_blocks: 'ब्लॉकचेन रिकॉर्ड:',
    blockchain_blocks_val: '1,420 सत्यापन',
    
    // Architectural Pillars
    pillars_heading: 'कोर सिस्टम आर्किटेक्चर',
    pillars_sub: 'नागरिक कृत्रिम बुद्धिमत्ता (Civic AI) के 4 मुख्य स्तंभों पर निर्मित',
    pillar1_title: 'बहुभाषी आवाज़ व टेक्स्ट विश्लेषण एआई',
    pillar1_desc: 'हिंदी, मराठी और अंग्रेजी में स्थानीय बोलियों के साथ त्वरित वॉयस-टू-टेक्स्ट ट्रांसक्रिप्शन।',
    pillar2_title: 'व्याख्यात्मक एआई (XAI) व जनहित स्कोर',
    pillar2_desc: 'स्कूलों, अस्पतालों और व्यस्त चौराहों की निकटता के आधार पर पारदर्शी प्राथमिकता स्कोरिंग।',
    pillar3_title: '60-सेकंड स्वचालित समाधान कोपायलट',
    pillar3_desc: 'ठेकेदार निर्देशिका का स्वतः मिलान, वर्क ऑर्डर जनरेशन और मरम्मत फोटो का कंप्यूटर विजन सत्यापन।',
    pillar4_title: 'एआई स्मार्ट सिटी डिजिटल ट्विन सिमुलेशन',
    pillar4_desc: 'नागरिकों की शिकायत से पहले ही सड़क, जल, कचरा और बिजली खराबी का पूर्वानुमान लगाने वाला लाइव टेलीमेट्री नक्शा।',
    
    // Workflow Section
    workflow_heading: '7 चरणों में पारदर्शी समाधान कार्यप्रवाह',
    workflow_sub: 'नागरिक की आवाज़ से लेकर ब्लॉकचेन ऑडिट रिकॉर्ड तक बिना किसी सरकारी देरी के',
    
    // Telemetry Map Section
    telemetry_heading: 'लाइव गूगल मैप्स शहरी टेलीमेट्री नक्शा',
    telemetry_sub: 'वार्ड 12 में सक्रिय समस्याओं और संरचनात्मक जोखिम स्कोर का सटीक लाइव स्थान',
    explore_digital_twin: 'पूरा डिजिटल ट्विन देखें →',
    
    // Citizen Portal
    citizen_portal_badge: 'नागरिक शिकायत पोर्टल • गोपनीयता सुरक्षा कवच सक्रिय',
    citizen_title: 'नागरिक शिकायत दर्ज करें',
    citizen_desc: 'सड़क गड्ढे, पानी लीकेज, कचरा, स्ट्रीटलाइट या सुरक्षा संबंधी समस्याओं को अपनी पसंदीदा भाषा में बोलकर, लाइव जियो-टैग कैमरे से फोटो खींचकर या लिखकर दर्ज करें।',
    citizen_voice_step: '1. आवाज़ द्वारा बोलकर लिखें (हिंदी / मराठी / English)',
    citizen_loc_step: '2. स्थान चयन व लाइव जियो-टैग कैमरा साक्ष्य फोटो',
    citizen_form_step: '3. नागरिक शिकायत प्रपत्र',
    citizen_submit_btn: 'एआई प्राथमिकता के साथ शिकायत दर्ज करें',
    citizen_submitting: 'एआई विश्लेषण के साथ दर्ज हो रहा है...',
    
    // Voice Input
    voice_start: 'आवाज़ रिकॉर्डिंग शुरू करें',
    voice_listening: 'सुन रहे हैं... हिंदी, मराठी या अंग्रेजी में बोलें',
    voice_stop: 'रिकॉर्डिंग रोकें',
    voice_presets: 'नमूना वॉयस रिकॉर्डिंग:',
    
    // Location Picker
    loc_title: 'गूगल मैप्स स्थान चयन',
    loc_sub: 'नक्शे पर कहीं भी क्लिक करें या मार्कर खींचकर सटीक समस्या का स्थान चुनें।',
    loc_auto_gps: 'ऑटो जीपीएस',
    loc_detecting: 'स्थान खोज रहे हैं...',
    loc_current: 'चयनित स्थान:',
    
    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'लाइव जियो-टैग कैमरा व साक्ष्य फोटो',
    geotag_cam_sub: 'लाइव कैमरा से फोटो लें जिसमें स्वतः सटीक जीपीएस निर्देशांक (Lat/Long), समय व नगर निगम का आधिकारिक वॉटरमार्क मुद्रित होता है।',
    geotag_open_btn: '📸 लाइव जियो-टैग कैमरा खोलें',
    geotag_snap_btn: 'जियो-टैग फोटो खींचें',
    geotag_retake_btn: 'दोबारा फोटो लें',
    geotag_use_btn: 'यह जियो-टैग्ड फोटो उपयोग करें',
    geotag_presets: 'या सत्यापित जियो-टैग्ड नमूना फोटो चुनें:',
    img_title: 'स्थल फोटो प्रमाण (YOLOv8 गोपनीयता रक्षक)',
    img_sub: 'समस्या का फोटो अपलोड करें। नागरिकों के चेहरे और वाहनों की नंबर प्लेट स्वतः धुंधली (Blur) कर दी जाती हैं।',
    img_drag_drop: 'यहाँ फोटो खींचकर छोड़ें या फाइल चुनें',
    img_formats: 'PNG, JPG या WEBP (10MB तक)',
    img_select_sample: 'या सत्यापित नमूना फोटो चुनें:',
    
    // Privacy Shield
    privacy_badge: 'गोपनीयता सुरक्षा प्रणाली',
    privacy_title: 'संवैधानिक एआई सुरक्षा कवच सक्रिय',
    privacy_pii: 'व्यक्तिगत डेटा सुरक्षा',
    privacy_pii_sub: 'आधार व फोन नंबर स्वतः छिपाए गए',
    privacy_yolo: 'YOLO ब्लर एआई',
    privacy_yolo_sub: 'चेहरे व नंबर प्लेट धुंधले किए गए',
    privacy_doxxing: 'डॉक्सिंग रोधी कवच',
    privacy_doxxing_sub: 'निजी पहचान सुरक्षा सक्रिय',
    privacy_dpdp: 'DPDP अनुपालन',
    privacy_dpdp_sub: 'डिजिटल डेटा संरक्षण अधिनियम 2023',
    
    // Form Fields
    form_title: 'शिकायत का शीर्षक',
    form_title_placeholder: 'समस्या का संक्षिप्त विवरण (जैसे: मुख्य सड़क पर गहरा गड्ढा)',
    form_desc: 'विस्तृत विवरण (आवाज़ से स्वतः भरा जाएगा)',
    form_desc_placeholder: 'समस्या की पूरी जानकारी दें...',
    form_category: 'समस्या की श्रेणी',
    form_location: 'स्थान / पता प्रविष्टि',
    form_live_gps: 'लाइव जीपीएस लें',
    form_impact_weight: 'एआई सामुदायिक प्रभाव स्कोर',
    
    // Categories
    cat_road: 'सड़क क्षति / गड्ढे',
    cat_water: 'जल आपूर्ति व पाइपलाइन लीकेज',
    cat_sanitation: 'सफाई व कचरा प्रबंधन',
    cat_electrical: 'बिजली व स्ट्रीटलाइट खराबी',
    cat_parks: 'उद्यान व सार्वजनिक सुविधाएं',
    cat_other: 'अन्य / विविध समस्याएं',
    
    // Officer Dashboard
    officer_title: 'अधिकारी ट्राइएज व वर्क ऑर्डर डैशबोर्ड',
    officer_zone: 'इंदौर नगर निगम • जोन 12',
    officer_dept_filter: 'विभाग विभाजन:',
    officer_all_depts: 'सभी विभाग (नगर पालिका विहंगावलोकन)',
    officer_start_btn: 'कार्य शुरू करें',
    officer_mark_solved: 'समाधान दर्ज करें',
    officer_grievances_in_view: 'सक्रिय शिकायतें',
    officer_logged_in_as: 'लॉगिन उपयोगकर्ता:',
    
    // Kanban Columns
    col_new: 'नई शिकायतें',
    col_assigned: 'अधिकारी आवंटित',
    col_in_progress: 'कार्य प्रगति पर',
    col_pending_verif: 'सत्यापन लंबित',
    col_resolved: 'सत्यापित व समाधानित',
    
    // SLA Countdown
    sla_timer_title: 'एसएलए (SLA) समय उलटी गिनती',
    sla_remaining: 'शेष समय (48 घंटे SLA नियम)',
    
    // Verification & Copilot
    verif_active: '⏳ 7-दिवसीय नागरिक सत्यापन विंडो सक्रिय',
    verif_desc: 'ठेकेदार भुगतान से पहले 3 स्थानीय नागरिकों द्वारा फोटो प्रमाण सत्यापन अनिवार्य है।',
    copilot_title: '60-सेकंड स्वचालित समाधान कोपायलट व वर्क ऑर्डर जनरेटर',
    copilot_sub: 'स्वायत्त एआई द्वारा तुरंत नगर निगम ठेकेदारों को वर्क ऑर्डर और उपकरण आवंटन',
    copilot_btn: '⚡ स्वायत्त वर्क ऑर्डर प्रेषण उत्पन्न करें',
    
    // Login & Register
    login_title: 'पंजीकृत उपयोगकर्ता लॉगिन',
    register_title: 'नया नागरिक पंजीकरण',
    resident_citizen: '👤 स्थानीय नागरिक',
    municipal_officer: '👮 नगर निगम अधिकारी',
    full_legal_name: 'पूरा कानूनी नाम',
    mobile_label: '10-अंकीय मोबाइल नंबर (SMS OTP)',
    send_otp_btn: '📱 OTP भेजें',
    verify_otp_btn: 'OTP सत्यापित करें',
    phone_verified_badge: '✓ मोबाइल नंबर SMS OTP द्वारा सत्यापित!',
    address_label: 'घर का पता / नजदीकी लैंडमार्क',
    complete_reg_btn: 'नागरिक पंजीकरण पूर्ण करें',
    quick_demo_signin: '1-क्लिक डेमो लॉगिन:',
    
    // Footer
    footer_desc: 'प्रगति 2.0 हैकाथॉन के लिए विकसित अगली पीढ़ी का नगर पालिका शिकायत निवारण और पूर्वानुमानित बुनियादी ढांचा प्रशासन मंच।',
    footer_nav: 'उपयोगी नेविगेशन',
    footer_transparency: 'प्रणाली पारदर्शिता',
    footer_rights: 'सर्वाधिकार सुरक्षित। डिजिटल पर्सनल डेटा प्रोटेक्शन (DPDP) अधिनियम 2023 के तहत 100% सुरक्षित।',

    // SMS & Call Complaint
    nav_sms_complaint: 'SMS शिकायत',
    nav_call_complaint: 'कॉल शिकायत',
    sms_page_title: 'SMS से शिकायत दर्ज करें',
    sms_page_desc: 'बिना ऐप, बिना इंटरनेट — सिर्फ एक SMS भेजकर नगरपालिका शिकायत दर्ज करें।',
    call_page_title: 'कॉल करके शिकायत दर्ज करें',
    call_page_desc: 'बस एक कॉल करें और अपनी शिकायत बोलें। IVR सिस्टम आपकी आवाज़ रिकॉर्ड करेगा।'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_lang');
      return saved === 'hi' ? 'hi' : 'en';
    } catch (e) {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    try {
      localStorage.setItem('civic_lang', nextLang);
      document.documentElement.lang = nextLang;
    } catch (e) {}
  };

  const setSpecificLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguage(lang);
      try {
        localStorage.setItem('civic_lang', lang);
        document.documentElement.lang = lang;
      } catch (e) {}
    }
  };

  const t = (key) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return currentDict[key] || TRANSLATIONS.en[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setSpecificLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
}
