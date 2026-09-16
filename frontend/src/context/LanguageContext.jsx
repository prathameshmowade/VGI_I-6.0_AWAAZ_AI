import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const SUPPORTED_LANGS = ['en', 'hi', 'mr', 'ta', 'te'];

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
    nav_helpline_channels: 'Helplines',
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
    pillar1_desc: 'Native Speech-to-Text in English, Hindi, Marathi, Tamil & Telugu with localized dialect intent mapping.',
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
    citizen_portal_badge: 'Citizen Portal',
    citizen_title: 'Report a Civic Issue',
    citizen_desc: 'Report road damage, water leaks, garbage, streetlights, or public issues. Speak in your language, attach a photo, and submit in seconds.',
    citizen_voice_step: '1. Speak or Type (Hindi / Marathi / Tamil / Telugu / English)',
    citizen_loc_step: '2. Location & Photo Evidence',
    citizen_form_step: '3. Complaint Details & Submit',
    citizen_submit_btn: 'Submit Complaint',
    citizen_submitting: 'Submitting Complaint...',
    
    // Voice Input
    voice_start: 'Speak to Record',
    voice_listening: 'Listening... Speak clearly',
    voice_stop: 'Stop Recording',
    voice_presets: 'Try an example:',
    
    // Location Picker
    loc_title: 'Pin Location on Map',
    loc_sub: 'Click on the map or drag the pin to set where the problem is located.',
    loc_auto_gps: 'Find My Location',
    loc_detecting: 'Locating...',
    loc_current: 'Selected Location:',
    
    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'Camera & Photo Evidence',
    geotag_cam_sub: 'Take a photo or upload an image. Personal faces and license plates are automatically blurred to protect privacy.',
    geotag_open_btn: 'Open Camera',
    geotag_snap_btn: 'Take Photo',
    geotag_retake_btn: 'Retake Photo',
    geotag_use_btn: 'Use This Photo',
    geotag_presets: 'Or choose a sample photo:',
    img_title: 'Upload Photo (Privacy Protected)',
    img_sub: 'Upload a site photo. Faces and vehicle plates are blurred automatically.',
    img_drag_drop: 'Click to select a photo or drag & drop here',
    img_formats: 'PNG, JPG, or WEBP up to 10MB',
    img_select_sample: 'Or select a sample photo:',
    
    // Privacy Shield
    privacy_badge: 'Privacy Protected',
    privacy_title: 'Your privacy is 100% protected',
    privacy_pii: 'Private Details Hidden',
    privacy_pii_sub: 'Phone & ID numbers masked',
    privacy_yolo: 'Photo Privacy',
    privacy_yolo_sub: 'Faces & number plates blurred',
    privacy_doxxing: 'Anti-Doxxing',
    privacy_doxxing_sub: 'Identity kept confidential',
    privacy_dpdp: 'DPDP 2023 Compliant',
    privacy_dpdp_sub: 'Fully compliant with privacy laws',
    
    // Form Fields
    form_title: 'Issue Summary',
    form_title_placeholder: 'Brief summary (e.g. Large pothole on main road)',
    form_desc: 'Detailed Description',
    form_desc_placeholder: 'Describe the issue or what needs to be fixed...',
    form_category: 'Category',
    form_location: 'Location / Address',
    form_live_gps: 'Use Current GPS',
    form_impact_weight: 'Estimated Resolution Time',
    
    // Categories
    cat_road: 'Roads & Potholes',
    cat_water: 'Water Supply & Leakage',
    cat_sanitation: 'Garbage & Sanitation',
    cat_electrical: 'Streetlights & Electrical',
    cat_parks: 'Parks & Public Amenities',
    cat_other: 'Other Issue',
    
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
    call_page_desc: 'Just make a phone call and speak your complaint. The IVR system records your voice and creates a ticket.',

    // Language selector
    lang_select_label: 'Language:',
    lang_clear: 'Clear',
    lang_spoken_desc: 'Spoken Description:',
    lang_auto_added: '✓ Automatically added to your complaint form below',
    lang_edit: 'Edit',
    lang_done: 'Done',
    lang_clean: 'Clean Text',
    lang_enhance: 'Enhance',
    lang_listening: 'Listening... Speak clearly',
    lang_privacy_note: 'Privacy Protected: Phone numbers and IDs will be masked automatically.',
    lang_locating: 'Locating...',
    lang_sla_title: 'Estimated Resolution Time',
    lang_sla_desc: 'Reviewed and assigned to the municipal team within 24–48 hours.',
    lang_provide_details: 'Please provide complaint details',
    lang_other_placeholder: 'Specify the issue type (e.g. broken transformer, pipeline leak)...',
    lang_location_placeholder: 'e.g. Vijay Nagar, Palasia, Rajwada, Indore...',
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
    nav_helpline_channels: 'हेल्पलाइन',
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
    pillar1_desc: 'हिंदी, मराठी, तमिल, तेलुगु और अंग्रेजी में स्थानीय बोलियों के साथ त्वरित वॉयस-टू-टेक्स्ट ट्रांसक्रिप्शन।',
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
    citizen_portal_badge: 'नागरिक पोर्टल',
    citizen_title: 'नागरिक समस्या दर्ज करें',
    citizen_desc: 'सड़क गड्ढे, पानी लीकेज, कचरा, स्ट्रीटलाइट या अन्य समस्याओं को बोलकर, फोटो खींचकर या लिखकर आसानी से दर्ज करें।',
    citizen_voice_step: '1. बोलकर या लिखकर बताएं (हिंदी / मराठी / तमिल / तेलुगु / English)',
    citizen_loc_step: '2. समस्या का स्थान व फोटो प्रमाण',
    citizen_form_step: '3. शिकायत विवरण व सबमिट',
    citizen_submit_btn: 'शिकायत दर्ज करें',
    citizen_submitting: 'शिकायत दर्ज हो रही है...',
    
    // Voice Input
    voice_start: 'बोलकर दर्ज करें',
    voice_listening: 'सुन रहे हैं... कृपया स्पष्ट बोलें',
    voice_stop: 'रिकॉर्डिंग रोकें',
    voice_presets: 'नमूना समस्या चुनें:',
    
    // Location Picker
    loc_title: 'नक्शे पर स्थान चुनें',
    loc_sub: 'नक्शे पर क्लिक करें या पिन खींचकर समस्या का सही स्थान बताएं।',
    loc_auto_gps: 'मेरा स्थान खोजें',
    loc_detecting: 'स्थान खोज रहे हैं...',
    loc_current: 'चयनित स्थान:',
    
    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'कैमरा व फोटो प्रमाण',
    geotag_cam_sub: 'लाइव फोटो लें या अपलोड करें। आपकी गोपनीयता के लिए चेहरे और गाड़ियों की नंबर प्लेट स्वतः सुरक्षित की जाती हैं।',
    geotag_open_btn: 'कैमरा खोलें',
    geotag_snap_btn: 'फोटो खींचें',
    geotag_retake_btn: 'दोबारा फोटो लें',
    geotag_use_btn: 'यह फोटो उपयोग करें',
    geotag_presets: 'या नमूना फोटो चुनें:',
    img_title: 'फोटो अपलोड करें (गोपनीयता सुरक्षित)',
    img_sub: 'समस्या का फोटो अपलोड करें। चेहरे और नंबर प्लेट स्वतः सुरक्षित कर दिए जाते हैं।',
    img_drag_drop: 'यहाँ फोटो खींचकर छोड़ें या फाइल चुनें',
    img_formats: 'PNG, JPG या WEBP (10MB तक)',
    img_select_sample: 'या नमूना फोटो चुनें:',
    
    // Privacy Shield
    privacy_badge: 'गोपनीयता सुरक्षित',
    privacy_title: 'आपकी गोपनीयता 100% सुरक्षित है',
    privacy_pii: 'व्यक्तिगत जानकारी सुरक्षित',
    privacy_pii_sub: 'फोन नंबर व आईडी स्वतः सुरक्षित',
    privacy_yolo: 'फोटो सुरक्षा',
    privacy_yolo_sub: 'चेहरे व नंबर प्लेट धुंधले',
    privacy_doxxing: 'पहचान सुरक्षा',
    privacy_doxxing_sub: 'नागरिक पहचान गोपनीय',
    privacy_dpdp: 'DPDP अनुपालन',
    privacy_dpdp_sub: 'डेटा संरक्षण नियमों के अनुसार',
    
    // Form Fields
    form_title: 'समस्या का सारांश',
    form_title_placeholder: 'संक्षिप्त विवरण (जैसे: मुख्य सड़क पर गहरा गड्ढा)',
    form_desc: 'विस्तृत विवरण',
    form_desc_placeholder: 'समस्या की पूरी जानकारी लिखें या बोलें...',
    form_category: 'समस्या का प्रकार',
    form_location: 'स्थान / पता',
    form_live_gps: 'वर्तमान GPS लें',
    form_impact_weight: 'अनुमानित समाधान समय',
    
    // Categories
    cat_road: 'सड़क व गड्ढे',
    cat_water: 'पानी आपूर्ति व लीकेज',
    cat_sanitation: 'कचरा व सफाई',
    cat_electrical: 'स्ट्रीटलाइट व बिजली',
    cat_parks: 'उद्यान व सार्वजनिक स्थल',
    cat_other: 'अन्य समस्या',
    
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
    call_page_desc: 'बस एक कॉल करें और अपनी शिकायत बोलें। IVR सिस्टम आपकी आवाज़ रिकॉर्ड करेगा।',

    // Language selector
    lang_select_label: 'भाषा चुनें:',
    lang_clear: 'हटाएं',
    lang_spoken_desc: 'पहचाना गया विवरण:',
    lang_auto_added: '✓ यह विवरण नीचे दिए गए फॉर्म में स्वतः जुड़ गया है',
    lang_edit: 'संपादित करें',
    lang_done: 'सम्पन्न',
    lang_clean: 'सुधारें',
    lang_enhance: 'सुधारें',
    lang_listening: 'सुन रहे हैं... स्पष्ट बोलें',
    lang_privacy_note: 'गोपनीयता सुरक्षा: पहचान व संपर्क नंबर स्वतः सुरक्षित किए जाएंगे।',
    lang_locating: 'स्थान खोज रहे...',
    lang_sla_title: 'अनुमानित समाधान समय',
    lang_sla_desc: 'शिकायत 24 से 48 घंटे के भीतर संबंधित विभाग व अधिकारी को सौंपी जाएगी।',
    lang_provide_details: 'कृपया शिकायत का विवरण दर्ज करें',
    lang_other_placeholder: 'कृपया समस्या का प्रकार लिखें (जैसे: ट्रांसफार्मर खराब, पाइप लीकेज)...',
    lang_location_placeholder: 'जैसे: विजय नगर, पलासिया, राजवाड़ा, इंदौर...',
  },
  mr: {
    // Brand & Header
    brand_name: 'awaaz.ai',
    brand_slogan: 'प्रत्येक आवाज ऐकली जाईल. प्रत्येक समस्या सोडवली जाईल.',
    nav_overview: 'आढावा',
    nav_citizen: 'नागरिक पोर्टल',
    nav_officer: 'अधिकारी डॅशबोर्ड',
    nav_digital_twin: 'डिजिटल ट्विन',
    nav_analytics: 'विश्लेषण',
    nav_login: 'साइन इन',
    nav_logout: 'लॉगआउट',
    nav_track: 'स्थिती ट्रॅक करा',
    nav_helpline_channels: 'हेल्पलाइन',
    auth_signin: 'साइन इन',
    auth_logout: 'लॉगआउट',

    // Landing Page Hero
    hero_badge: 'awaaz.ai • प्रत्येक आवाज ऐकली जाईल. प्रत्येक समस्या सोडवली जाईल.',
    hero_title: 'awaaz.ai — AI-आधारित नागरिक तक्रार निवारण प्रणाली',
    hero_sub: 'नागरिक आणि नगरपालिका अधिकाऱ्यांना बहुभाषी आवाज नोंदणी, पारदर्शक AI ट्राइएज, 60-सेकंद स्वयंचलित वर्क ऑर्डर आणि 3-नागरिक पडताळणीसह सक्षम करणे.',
    hero_btn_submit: 'तक्रार दाखल करा',
    hero_btn_officer: 'अधिकारी डॅशबोर्ड',
    system_status: 'प्रणाली स्थिती',
    operational: 'सक्रिय',
    avg_sla: 'सरासरी निराकरण वेळ:',
    avg_sla_val: '4.2 तास',
    ai_conf_score: 'AI अचूकता स्कोर:',
    blockchain_blocks: 'ब्लॉकचेन नोंदी:',
    blockchain_blocks_val: '1,420 पडताळणी',

    // Architectural Pillars
    pillars_heading: 'मूळ प्रणाली रचना',
    pillars_sub: 'नागरिक कृत्रिम बुद्धिमत्तेच्या 4 मुख्य स्तंभांवर बनलेले',
    pillar1_title: 'बहुभाषी आवाज आणि मजकूर विश्लेषण AI',
    pillar1_desc: 'हिंदी, मराठी, तमिळ, तेलुगू आणि इंग्रजीमध्ये स्थानिक बोलींसह जलद स्पीच-टू-टेक्स्ट.',
    pillar2_title: 'स्पष्टीकरणात्मक AI (XAI) आणि सामुदायिक स्कोर',
    pillar2_desc: 'शाळा, रुग्णालये आणि वर्दळीच्या ठिकाणांच्या जवळीकतेवर आधारित पारदर्शक प्राधान्य स्कोरिंग.',
    pillar3_title: '60-सेकंद स्वयंचलित निराकरण सहाय्यक',
    pillar3_desc: 'कंत्राटदार निर्देशिका शोध, स्वयंचलित वर्क ऑर्डर तयार करणे आणि फोटो पडताळणी.',
    pillar4_title: 'AI स्मार्ट सिटी डिजिटल ट्विन सिम्युलेशन',
    pillar4_desc: 'नागरिकांच्या तक्रारीपूर्वीच पायाभूत सुविधांच्या बिघाडाचा अंदाज लावणारा लाइव टेलीमेट्री नकाशा.',

    // Workflow Section
    workflow_heading: '7 टप्प्यांमध्ये तक्रार निवारण कार्यप्रवाह',
    workflow_sub: 'नागरिकाच्या आवाजापासून ब्लॉकचेन ऑडिटपर्यंत, कोणत्याही विलंबाशिवाय',

    // Telemetry Map Section
    telemetry_heading: 'लाइव गुगल मॅप्स शहरी टेलीमेट्री',
    telemetry_sub: 'सक्रिय तक्रारी आणि पायाभूत सुविधा जोखीम स्कोर',
    explore_digital_twin: 'संपूर्ण डिजिटल ट्विन पहा →',

    // Citizen Portal
    citizen_portal_badge: 'नागरिक पोर्टल',
    citizen_title: 'नागरिक समस्या नोंदवा',
    citizen_desc: 'रस्ते खड्डे, पाणी गळती, कचरा, पथदिवे किंवा इतर समस्या बोलून, फोटो काढून किंवा लिहून सहज नोंदवा.',
    citizen_voice_step: '1. बोलून किंवा लिहून सांगा (मराठी / हिंदी / तमिळ / तेलुगू / English)',
    citizen_loc_step: '2. समस्येचे ठिकाण आणि फोटो पुरावा',
    citizen_form_step: '3. तक्रार तपशील आणि सबमिट',
    citizen_submit_btn: 'तक्रार दाखल करा',
    citizen_submitting: 'तक्रार दाखल होत आहे...',

    // Voice Input
    voice_start: 'बोलून नोंदवा',
    voice_listening: 'ऐकत आहे... स्पष्ट बोला',
    voice_stop: 'रेकॉर्डिंग थांबवा',
    voice_presets: 'नमुना समस्या निवडा:',

    // Location Picker
    loc_title: 'नकाशावर ठिकाण निवडा',
    loc_sub: 'नकाशावर क्लिक करा किंवा पिन ओढून समस्येचे अचूक ठिकाण दर्शवा.',
    loc_auto_gps: 'माझे ठिकाण शोधा',
    loc_detecting: 'ठिकाण शोधत आहे...',
    loc_current: 'निवडलेले ठिकाण:',

    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'कॅमेरा आणि फोटो पुरावा',
    geotag_cam_sub: 'लाइव फोटो घ्या किंवा अपलोड करा. तुमच्या गोपनीयतेसाठी चेहरे आणि नंबर प्लेट्स स्वयंचलितपणे अस्पष्ट केल्या जातात.',
    geotag_open_btn: 'कॅमेरा उघडा',
    geotag_snap_btn: 'फोटो काढा',
    geotag_retake_btn: 'पुन्हा फोटो काढा',
    geotag_use_btn: 'हा फोटो वापरा',
    geotag_presets: 'किंवा नमुना फोटो निवडा:',
    img_title: 'फोटो अपलोड करा (गोपनीयता सुरक्षित)',
    img_sub: 'समस्येचा फोटो अपलोड करा. चेहरे आणि नंबर प्लेट्स स्वयंचलितपणे सुरक्षित.',
    img_drag_drop: 'फोटो इथे ओढा किंवा फाइल निवडा',
    img_formats: 'PNG, JPG किंवा WEBP (10MB पर्यंत)',
    img_select_sample: 'किंवा नमुना फोटो निवडा:',

    // Privacy Shield
    privacy_badge: 'गोपनीयता सुरक्षित',
    privacy_title: 'तुमची गोपनीयता 100% सुरक्षित आहे',
    privacy_pii: 'वैयक्तिक माहिती सुरक्षित',
    privacy_pii_sub: 'फोन नंबर आणि ID स्वयंचलित सुरक्षित',
    privacy_yolo: 'फोटो सुरक्षा',
    privacy_yolo_sub: 'चेहरे आणि नंबर प्लेट अस्पष्ट',
    privacy_doxxing: 'ओळख सुरक्षा',
    privacy_doxxing_sub: 'नागरिक ओळख गोपनीय',
    privacy_dpdp: 'DPDP अनुपालन',
    privacy_dpdp_sub: 'डेटा संरक्षण कायद्यांनुसार',

    // Form Fields
    form_title: 'समस्येचा सारांश',
    form_title_placeholder: 'संक्षिप्त वर्णन (उदा: मुख्य रस्त्यावर मोठा खड्डा)',
    form_desc: 'सविस्तर वर्णन',
    form_desc_placeholder: 'समस्येची संपूर्ण माहिती लिहा किंवा बोला...',
    form_category: 'समस्येचा प्रकार',
    form_location: 'ठिकाण / पत्ता',
    form_live_gps: 'सध्याचे GPS घ्या',
    form_impact_weight: 'अंदाजित निराकरण वेळ',

    // Categories
    cat_road: 'रस्ते आणि खड्डे',
    cat_water: 'पाणी पुरवठा आणि गळती',
    cat_sanitation: 'कचरा आणि स्वच्छता',
    cat_electrical: 'पथदिवे आणि वीज',
    cat_parks: 'उद्याने आणि सार्वजनिक सुविधा',
    cat_other: 'इतर समस्या',

    // Officer Dashboard
    officer_title: 'अधिकारी ट्राइएज आणि वर्क ऑर्डर डॅशबोर्ड',
    officer_zone: 'इंदौर नगरपालिका • विभाग 12',
    officer_dept_filter: 'विभाग वर्गीकरण:',
    officer_all_depts: 'सर्व विभाग (नगरपालिका आढावा)',
    officer_start_btn: 'कार्य सुरू करा',
    officer_mark_solved: 'निराकरण नोंदवा',
    officer_grievances_in_view: 'सक्रिय तक्रारी',
    officer_logged_in_as: 'लॉगिन वापरकर्ता:',

    // Kanban Columns
    col_new: 'नवीन तक्रारी',
    col_assigned: 'अधिकारी नियुक्त',
    col_in_progress: 'कार्य प्रगतीत',
    col_pending_verif: 'पडताळणी प्रलंबित',
    col_resolved: 'पडताळणी पूर्ण आणि निराकरण',

    // SLA Countdown
    sla_timer_title: 'SLA वेळ उलटगणना',
    sla_remaining: 'उर्वरित वेळ (48 तास SLA)',

    // Verification & Copilot
    verif_active: '⏳ 7-दिवसीय पडताळणी विंडो सक्रिय',
    verif_desc: 'कंत्राटदार देयकापूर्वी 3 स्थानिक नागरिकांची फोटो पुरावा पडताळणी अनिवार्य.',
    copilot_title: '60-सेकंद स्वयंचलित निराकरण सहाय्यक आणि वर्क ऑर्डर जनरेटर',
    copilot_sub: 'स्वायत्त AI द्वारे त्वरित नगरपालिका कंत्राटदारांना वर्क ऑर्डर',
    copilot_btn: '⚡ स्वयंचलित वर्क ऑर्डर तयार करा',

    // Login & Register
    login_title: 'नोंदणीकृत वापरकर्ता लॉगिन',
    register_title: 'नवीन नागरिक नोंदणी',
    resident_citizen: '👤 स्थानिक नागरिक',
    municipal_officer: '👮 नगरपालिका अधिकारी',
    full_legal_name: 'पूर्ण कायदेशीर नाव',
    mobile_label: '10-अंकी मोबाइल नंबर (SMS OTP)',
    send_otp_btn: '📱 OTP पाठवा',
    verify_otp_btn: 'OTP पडताळा',
    phone_verified_badge: '✓ मोबाइल नंबर SMS OTP द्वारे पडताळला!',
    address_label: 'घरचा पत्ता / जवळचे ठिकाण',
    complete_reg_btn: 'नागरिक नोंदणी पूर्ण करा',
    quick_demo_signin: '1-क्लिक डेमो लॉगिन:',

    // Footer
    footer_desc: 'प्रगती 2.0 हॅकाथॉनसाठी विकसित पुढील पिढीचे नगरपालिका तक्रार निवारण आणि पायाभूत सुविधा प्रशासन व्यासपीठ.',
    footer_nav: 'उपयुक्त दुवे',
    footer_transparency: 'प्रणाली पारदर्शकता',
    footer_rights: 'सर्व हक्क राखीव. डिजिटल पर्सनल डेटा प्रोटेक्शन (DPDP) कायदा 2023 अंतर्गत सुरक्षित.',

    // SMS & Call Complaint
    nav_sms_complaint: 'SMS तक्रार',
    nav_call_complaint: 'कॉल तक्रार',
    sms_page_title: 'SMS द्वारे तक्रार दाखल करा',
    sms_page_desc: 'अॅप नाही, इंटरनेट नाही — फक्त एक SMS पाठवून नगरपालिका तक्रार नोंदवा.',
    call_page_title: 'कॉल करून तक्रार दाखल करा',
    call_page_desc: 'फक्त एक कॉल करा आणि तुमची तक्रार बोला. IVR प्रणाली तुमचा आवाज नोंदवेल.',

    // Language selector
    lang_select_label: 'भाषा निवडा:',
    lang_clear: 'काढा',
    lang_spoken_desc: 'ओळखलेले वर्णन:',
    lang_auto_added: '✓ हे वर्णन खालील फॉर्ममध्ये स्वयंचलित जोडले गेले',
    lang_edit: 'संपादित करा',
    lang_done: 'पूर्ण',
    lang_clean: 'सुधारा',
    lang_enhance: 'सुधारा',
    lang_listening: 'ऐकत आहे... स्पष्ट बोला',
    lang_privacy_note: 'गोपनीयता सुरक्षा: ओळख आणि संपर्क क्रमांक स्वयंचलित सुरक्षित केले जातील.',
    lang_locating: 'ठिकाण शोधत आहे...',
    lang_sla_title: 'अंदाजित निराकरण वेळ',
    lang_sla_desc: 'तक्रार 24 ते 48 तासांत संबंधित विभाग आणि अधिकाऱ्यांना सोपवली जाईल.',
    lang_provide_details: 'कृपया तक्रारीचे तपशील प्रविष्ट करा',
    lang_other_placeholder: 'कृपया समस्येचा प्रकार लिहा (उदा: ट्रान्सफॉर्मर बिघाड, पाइप गळती)...',
    lang_location_placeholder: 'उदा: विजय नगर, पलासिया, राजवाडा, इंदौर...',
  },
  ta: {
    // Brand & Header
    brand_name: 'awaaz.ai',
    brand_slogan: 'ஒவ்வொரு குரலும் கேட்கப்படும். ஒவ்வொரு பிரச்சனையும் தீர்க்கப்படும்.',
    nav_overview: 'கண்ணோட்டம்',
    nav_citizen: 'குடிமக்கள் போர்டல்',
    nav_officer: 'அதிகாரி டாஷ்போர்ட்',
    nav_digital_twin: 'டிஜிட்டல் ட்விண்',
    nav_analytics: 'பகுப்பாய்வு',
    nav_login: 'உள்நுழைவு',
    nav_logout: 'வெளியேறு',
    nav_track: 'நிலை கண்காணிப்பு',
    nav_helpline_channels: 'ஹெல்ப்லைன்',
    auth_signin: 'உள்நுழைவு',
    auth_logout: 'வெளியேறு',

    // Landing Page Hero
    hero_badge: 'awaaz.ai • ஒவ்வொரு குரலும் கேட்கப்படும். ஒவ்வொரு பிரச்சனையும் தீர்க்கப்படும்.',
    hero_title: 'awaaz.ai — AI-இயக்கப்படும் குடிமக்கள் புகார் தீர்வு அமைப்பு',
    hero_sub: 'குடிமக்கள் மற்றும் நகராட்சி அதிகாரிகளுக்கு பன்மொழி குரல் பதிவு, வெளிப்படையான AI ட்ரையேஜ், 60-வினாடி தானியங்கி பணி ஆணை மற்றும் 3-குடிமக்கள் சரிபார்ப்புடன் அதிகாரம் அளிப்பது.',
    hero_btn_submit: 'புகார் பதிவு செய்யுங்கள்',
    hero_btn_officer: 'அதிகாரி டாஷ்போர்ட்',
    system_status: 'அமைப்பு நிலை',
    operational: 'செயல்பாட்டில்',
    avg_sla: 'சராசரி தீர்வு நேரம்:',
    avg_sla_val: '4.2 மணி நேரம்',
    ai_conf_score: 'AI துல்லியம் மதிப்பெண்:',
    blockchain_blocks: 'பிளாக்செயின் பதிவுகள்:',
    blockchain_blocks_val: '1,420 சரிபார்ப்புகள்',

    // Architectural Pillars
    pillars_heading: 'முக்கிய அமைப்பு கட்டமைப்பு',
    pillars_sub: 'குடிமக்கள் செயற்கை நுண்ணறிவின் 4 முக்கிய தூண்களில் கட்டப்பட்டது',
    pillar1_title: 'பன்மொழி குரல் மற்றும் உரை பகுப்பாய்வு AI',
    pillar1_desc: 'ஹிந்தி, மராத்தி, தமிழ், தெலுங்கு மற்றும் ஆங்கிலத்தில் உள்ளூர் மொழிவழக்குகளுடன் விரைவான பேச்சு-உரையாக்கம்.',
    pillar2_title: 'விளக்கமான AI (XAI) மற்றும் சமூக மதிப்பெண்',
    pillar2_desc: 'பள்ளிகள், மருத்துவமனைகள் மற்றும் நெரிசலான பகுதிகளின் அருகாமையின் அடிப்படையில் வெளிப்படையான முன்னுரிமை மதிப்பீடு.',
    pillar3_title: '60-வினாடி தானியங்கி தீர்வு உதவியாளர்',
    pillar3_desc: 'ஒப்பந்ததாரர் அடைவு தேடல், தானியங்கி பணி ஆணை உருவாக்கம் மற்றும் புகைப்பட சரிபார்ப்பு.',
    pillar4_title: 'AI ஸ்மார்ட் நகர டிஜிட்டல் ட்விண் உருவகப்படுத்தல்',
    pillar4_desc: 'குடிமக்கள் புகார் செய்வதற்கு முன்பே உள்கட்டமைப்பு செயலிழப்புகளை கணிக்கும் நேரடி டெலிமெட்ரி வரைபடம்.',

    // Workflow Section
    workflow_heading: '7 படிகளில் புகார் தீர்வு செயல்முறை',
    workflow_sub: 'குடிமக்கள் குரலிலிருந்து பிளாக்செயின் தணிக்கை வரை, எந்த தாமதமும் இல்லாமல்',

    // Telemetry Map Section
    telemetry_heading: 'நேரடி கூகுள் மேப்ஸ் நகர டெலிமெட்ரி',
    telemetry_sub: 'செயலில் உள்ள புகார்கள் மற்றும் உள்கட்டமைப்பு ஆபத்து மதிப்பெண்கள்',
    explore_digital_twin: 'முழு டிஜிட்டல் ட்விண் பார்க்கவும் →',

    // Citizen Portal
    citizen_portal_badge: 'குடிமக்கள் போர்டல்',
    citizen_title: 'குடிமக்கள் பிரச்சனை பதிவு செய்யுங்கள்',
    citizen_desc: 'சாலை குழிகள், நீர் கசிவு, குப்பை, தெரு விளக்குகள் அல்லது பிற பிரச்சனைகளை பேசி, புகைப்படம் எடுத்து அல்லது எழுதி எளிதாக பதிவு செய்யுங்கள்.',
    citizen_voice_step: '1. பேசி அல்லது எழுதி தெரிவியுங்கள் (தமிழ் / ஹிந்தி / மராத்தி / தெலுங்கு / English)',
    citizen_loc_step: '2. பிரச்சனையின் இடம் மற்றும் புகைப்பட சான்று',
    citizen_form_step: '3. புகார் விவரங்கள் மற்றும் சமர்ப்பிக்கவும்',
    citizen_submit_btn: 'புகார் சமர்ப்பிக்கவும்',
    citizen_submitting: 'புகார் சமர்ப்பிக்கப்படுகிறது...',

    // Voice Input
    voice_start: 'பேசி பதிவு செய்யுங்கள்',
    voice_listening: 'கேட்கிறோம்... தெளிவாக பேசுங்கள்',
    voice_stop: 'பதிவை நிறுத்துங்கள்',
    voice_presets: 'மாதிரி பிரச்சனை தேர்வு செய்யுங்கள்:',

    // Location Picker
    loc_title: 'வரைபடத்தில் இடத்தை குறியிடுங்கள்',
    loc_sub: 'வரைபடத்தில் கிளிக் செய்யுங்கள் அல்லது பிரச்சனையின் சரியான இடத்தை காட்டுங்கள்.',
    loc_auto_gps: 'என் இடத்தை கண்டறியுங்கள்',
    loc_detecting: 'இடம் கண்டறியப்படுகிறது...',
    loc_current: 'தேர்ந்தெடுக்கப்பட்ட இடம்:',

    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'கேமரா மற்றும் புகைப்பட சான்று',
    geotag_cam_sub: 'நேரடி புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும். உங்கள் தனியுரிமைக்காக முகங்கள் மற்றும் எண் தட்டுகள் தானாகவே மறைக்கப்படும்.',
    geotag_open_btn: 'கேமரா திற',
    geotag_snap_btn: 'புகைப்படம் எடு',
    geotag_retake_btn: 'மீண்டும் எடு',
    geotag_use_btn: 'இந்த புகைப்படத்தை பயன்படுத்து',
    geotag_presets: 'அல்லது மாதிரி புகைப்படம் தேர்வு:',
    img_title: 'புகைப்படம் பதிவேற்றுங்கள் (தனியுரிமை பாதுகாப்பு)',
    img_sub: 'பிரச்சனையின் புகைப்படத்தை பதிவேற்றுங்கள். முகங்கள் மற்றும் எண் தட்டுகள் தானாகவே பாதுகாக்கப்படும்.',
    img_drag_drop: 'புகைப்படத்தை இங்கே இழுக்கவும் அல்லது கோப்பை தேர்வு செய்யவும்',
    img_formats: 'PNG, JPG அல்லது WEBP (10MB வரை)',
    img_select_sample: 'அல்லது மாதிரி புகைப்படம் தேர்வு செய்யுங்கள்:',

    // Privacy Shield
    privacy_badge: 'தனியுரிமை பாதுகாப்பு',
    privacy_title: 'உங்கள் தனியுரிமை 100% பாதுகாக்கப்படுகிறது',
    privacy_pii: 'தனிப்பட்ட தகவல் பாதுகாப்பு',
    privacy_pii_sub: 'தொலைபேசி எண் மற்றும் ID தானாகவே பாதுகாப்பு',
    privacy_yolo: 'புகைப்பட பாதுகாப்பு',
    privacy_yolo_sub: 'முகங்கள் மற்றும் எண் தட்டுகள் மறைப்பு',
    privacy_doxxing: 'அடையாள பாதுகாப்பு',
    privacy_doxxing_sub: 'குடிமக்கள் அடையாளம் ரகசியம்',
    privacy_dpdp: 'DPDP இணக்கம்',
    privacy_dpdp_sub: 'தரவு பாதுகாப்பு சட்டங்களின்படி',

    // Form Fields
    form_title: 'பிரச்சனையின் சுருக்கம்',
    form_title_placeholder: 'சுருக்கமான விவரம் (எ.கா: முக்கிய சாலையில் பெரிய குழி)',
    form_desc: 'விரிவான விவரம்',
    form_desc_placeholder: 'பிரச்சனையின் முழு தகவலை எழுதுங்கள் அல்லது பேசுங்கள்...',
    form_category: 'பிரச்சனை வகை',
    form_location: 'இடம் / முகவரி',
    form_live_gps: 'தற்போதைய GPS பெறுங்கள்',
    form_impact_weight: 'மதிப்பிடப்பட்ட தீர்வு நேரம்',

    // Categories
    cat_road: 'சாலைகள் மற்றும் குழிகள்',
    cat_water: 'நீர் வழங்கல் மற்றும் கசிவு',
    cat_sanitation: 'குப்பை மற்றும் சுகாதாரம்',
    cat_electrical: 'தெரு விளக்குகள் மற்றும் மின்சாரம்',
    cat_parks: 'பூங்காக்கள் மற்றும் பொது வசதிகள்',
    cat_other: 'மற்ற பிரச்சனை',

    // Officer Dashboard
    officer_title: 'அதிகாரி ட்ரையேஜ் மற்றும் பணி ஆணை டாஷ்போர்ட்',
    officer_zone: 'இந்தூர் நகராட்சி • மண்டலம் 12',
    officer_dept_filter: 'துறை வகைப்பாடு:',
    officer_all_depts: 'அனைத்து துறைகள் (நகராட்சி கண்ணோட்டம்)',
    officer_start_btn: 'பணி தொடங்குங்கள்',
    officer_mark_solved: 'தீர்வு பதிவு செய்யுங்கள்',
    officer_grievances_in_view: 'செயலில் உள்ள புகார்கள்',
    officer_logged_in_as: 'உள்நுழைந்த பயனர்:',

    // Kanban Columns
    col_new: 'புதிய புகார்கள்',
    col_assigned: 'அதிகாரி நியமிக்கப்பட்டது',
    col_in_progress: 'பணி முன்னேற்றத்தில்',
    col_pending_verif: 'சரிபார்ப்பு நிலுவையில்',
    col_resolved: 'சரிபார்க்கப்பட்டு தீர்க்கப்பட்டது',

    // SLA Countdown
    sla_timer_title: 'SLA நேர கவுண்ட்டவுன்',
    sla_remaining: 'மீதமுள்ள நேரம் (48 மணி SLA)',

    // Verification & Copilot
    verif_active: '⏳ 7-நாள் சரிபார்ப்பு சாளரம் செயலில்',
    verif_desc: 'ஒப்பந்ததாரர் கட்டணத்திற்கு முன் 3 உள்ளூர் குடிமக்களின் புகைப்பட சான்று சரிபார்ப்பு கட்டாயம்.',
    copilot_title: '60-வினாடி தானியங்கி தீர்வு உதவியாளர் மற்றும் பணி ஆணை உருவாக்கி',
    copilot_sub: 'தானியங்கி AI மூலம் உடனடியாக நகராட்சி ஒப்பந்ததாரர்களுக்கு பணி ஆணை',
    copilot_btn: '⚡ தானியங்கி பணி ஆணை உருவாக்குங்கள்',

    // Login & Register
    login_title: 'பதிவு செய்த பயனர் உள்நுழைவு',
    register_title: 'புதிய குடிமக்கள் பதிவு',
    resident_citizen: '👤 உள்ளூர் குடிமகன்',
    municipal_officer: '👮 நகராட்சி அதிகாரி',
    full_legal_name: 'முழு சட்டப்பூர்வ பெயர்',
    mobile_label: '10-இலக்க மொபைல் எண் (SMS OTP)',
    send_otp_btn: '📱 OTP அனுப்புங்கள்',
    verify_otp_btn: 'OTP சரிபார்க்கவும்',
    phone_verified_badge: '✓ மொபைல் எண் SMS OTP மூலம் சரிபார்க்கப்பட்டது!',
    address_label: 'வீட்டு முகவரி / அருகிலுள்ள அடையாளம்',
    complete_reg_btn: 'குடிமக்கள் பதிவை முடிக்கவும்',
    quick_demo_signin: '1-கிளிக் டெமோ உள்நுழைவு:',

    // Footer
    footer_desc: 'பிரகதி 2.0 ஹேக்கத்தானுக்காக உருவாக்கப்பட்ட அடுத்த தலைமுறை நகராட்சி புகார் தீர்வு மற்றும் உள்கட்டமைப்பு ஆளுகை தளம்.',
    footer_nav: 'பயனுள்ள இணைப்புகள்',
    footer_transparency: 'அமைப்பு வெளிப்படைத்தன்மை',
    footer_rights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. டிஜிட்டல் தனிப்பட்ட தரவு பாதுகாப்பு (DPDP) சட்டம் 2023 இன் கீழ் பாதுகாப்பு.',

    // SMS & Call Complaint
    nav_sms_complaint: 'SMS புகார்',
    nav_call_complaint: 'அழைப்பு புகார்',
    sms_page_title: 'SMS மூலம் புகார் பதிவு செய்யுங்கள்',
    sms_page_desc: 'ஆப் இல்லை, இணையம் இல்லை — ஒரு SMS அனுப்பி நகராட்சி புகார் பதிவு செய்யுங்கள்.',
    call_page_title: 'தொலைபேசி அழைப்பு மூலம் புகார் பதிவு',
    call_page_desc: 'ஒரு அழைப்பு செய்து உங்கள் புகாரை பேசுங்கள். IVR அமைப்பு உங்கள் குரலை பதிவு செய்யும்.',

    // Language selector
    lang_select_label: 'மொழி தேர்வு:',
    lang_clear: 'அழி',
    lang_spoken_desc: 'அடையாளம் காணப்பட்ட விவரம்:',
    lang_auto_added: '✓ இந்த விவரம் கீழே உள்ள படிவத்தில் தானாகவே சேர்க்கப்பட்டது',
    lang_edit: 'திருத்து',
    lang_done: 'முடிந்தது',
    lang_clean: 'மேம்படுத்து',
    lang_enhance: 'மேம்படுத்து',
    lang_listening: 'கேட்கிறோம்... தெளிவாக பேசுங்கள்',
    lang_privacy_note: 'தனியுரிமை பாதுகாப்பு: அடையாளம் மற்றும் தொடர்பு எண்கள் தானாகவே பாதுகாக்கப்படும்.',
    lang_locating: 'இடம் கண்டறியப்படுகிறது...',
    lang_sla_title: 'மதிப்பிடப்பட்ட தீர்வு நேரம்',
    lang_sla_desc: 'புகார் 24 முதல் 48 மணி நேரத்திற்குள் சம்பந்தப்பட்ட துறை மற்றும் அதிகாரிகளிடம் ஒப்படைக்கப்படும்.',
    lang_provide_details: 'புகார் விவரங்களை வழங்கவும்',
    lang_other_placeholder: 'பிரச்சனை வகையை குறிப்பிடவும் (எ.கா: மின்மாற்றி பழுது, குழாய் கசிவு)...',
    lang_location_placeholder: 'எ.கா: விஜய் நகர், பலாசியா, ராஜ்வாடா, இந்தூர்...',
  },
  te: {
    // Brand & Header
    brand_name: 'awaaz.ai',
    brand_slogan: 'ప్రతి గొంతు వినబడుతుంది. ప్రతి సమస్య పరిష్కరించబడుతుంది.',
    nav_overview: 'అవలోకనం',
    nav_citizen: 'పౌర పోర్టల్',
    nav_officer: 'అధికారి డాష్‌బోర్డ్',
    nav_digital_twin: 'డిజిటల్ ట్విన్',
    nav_analytics: 'విశ్లేషణ',
    nav_login: 'సైన్ ఇన్',
    nav_logout: 'లాగ్‌అవుట్',
    nav_track: 'స్థితి ట్రాక్ చేయండి',
    nav_helpline_channels: 'హెల్ప్‌లైన్',
    auth_signin: 'సైన్ ఇన్',
    auth_logout: 'లాగ్‌అవుట్',

    // Landing Page Hero
    hero_badge: 'awaaz.ai • ప్రతి గొంతు వినబడుతుంది. ప్రతి సమస్య పరిష్కరించబడుతుంది.',
    hero_title: 'awaaz.ai — AI-ఆధారిత పౌర ఫిర్యాదు పరిష్కార వ్యవస్థ',
    hero_sub: 'పౌరులు మరియు నగరపాలక అధికారులకు బహుభాషా వాయిస్ రికార్డింగ్, పారదర్శక AI ట్రయాజ్, 60-సెకన్ల ఆటోమేటిక్ వర్క్ ఆర్డర్ మరియు 3-పౌర ధృవీకరణతో సాధికారత.',
    hero_btn_submit: 'ఫిర్యాదు నమోదు చేయండి',
    hero_btn_officer: 'అధికారి డాష్‌బోర్డ్',
    system_status: 'వ్యవస్థ స్థితి',
    operational: 'పనిచేస్తోంది',
    avg_sla: 'సగటు పరిష్కార సమయం:',
    avg_sla_val: '4.2 గంటలు',
    ai_conf_score: 'AI ఖచ్చితత్వ స్కోర్:',
    blockchain_blocks: 'బ్లాక్‌చెయిన్ రికార్డులు:',
    blockchain_blocks_val: '1,420 ధృవీకరణలు',

    // Architectural Pillars
    pillars_heading: 'ప్రధాన వ్యవస్థ నిర్మాణం',
    pillars_sub: 'పౌర కృత్రిమ మేధస్సు యొక్క 4 ప్రధాన స్తంభాలపై నిర్మించబడింది',
    pillar1_title: 'బహుభాషా వాయిస్ మరియు టెక్స్ట్ విశ్లేషణ AI',
    pillar1_desc: 'హిందీ, మరాఠీ, తమిళం, తెలుగు మరియు ఆంగ్లంలో స్థానిక మాండలికాలతో శీఘ్ర స్పీచ్-టు-టెక్స్ట్.',
    pillar2_title: 'వివరణాత్మక AI (XAI) మరియు సామాజిక స్కోర్',
    pillar2_desc: 'పాఠశాలలు, ఆసుపత్రులు మరియు రద్దీ ప్రాంతాల సామీప్యత ఆధారంగా పారదర్శక ప్రాధాన్య మూల్యాంకనం.',
    pillar3_title: '60-సెకన్ల ఆటోమేటిక్ పరిష్కార సహాయకుడు',
    pillar3_desc: 'కాంట్రాక్టర్ డైరెక్టరీ శోధన, ఆటోమేటిక్ వర్క్ ఆర్డర్ సృష్టి మరియు ఫోటో ధృవీకరణ.',
    pillar4_title: 'AI స్మార్ట్ సిటీ డిజిటల్ ట్విన్ సిమ్యులేషన్',
    pillar4_desc: 'పౌరులు ఫిర్యాదు చేయడానికి ముందే మౌలిక సదుపాయాల వైఫల్యాలను అంచనా వేసే లైవ్ టెలిమెట్రీ మ్యాప్.',

    // Workflow Section
    workflow_heading: '7 దశల్లో ఫిర్యాదు పరిష్కార ప్రక్రియ',
    workflow_sub: 'పౌరుని గొంతు నుండి బ్లాక్‌చెయిన్ ఆడిట్ వరకు, ఏ ఆలస్యమూ లేకుండా',

    // Telemetry Map Section
    telemetry_heading: 'లైవ్ గూగుల్ మ్యాప్స్ నగర టెలిమెట్రీ',
    telemetry_sub: 'చురుకుగా ఉన్న ఫిర్యాదులు మరియు మౌలిక సదుపాయాల ప్రమాద స్కోర్లు',
    explore_digital_twin: 'పూర్తి డిజిటల్ ట్విన్ చూడండి →',

    // Citizen Portal
    citizen_portal_badge: 'పౌర పోర్టల్',
    citizen_title: 'పౌర సమస్యను నమోదు చేయండి',
    citizen_desc: 'రోడ్ గుంతలు, నీటి లీకేజీ, చెత్త, వీధి దీపాలు లేదా ఇతర సమస్యలను మాట్లాడి, ఫోటో తీసి లేదా రాసి సులభంగా నమోదు చేయండి.',
    citizen_voice_step: '1. మాట్లాడి లేదా రాసి చెప్పండి (తెలుగు / హిందీ / మరాఠీ / తమిళం / English)',
    citizen_loc_step: '2. సమస్య యొక్క ప్రదేశం మరియు ఫోటో రుజువు',
    citizen_form_step: '3. ఫిర్యాదు వివరాలు మరియు సమర్పించండి',
    citizen_submit_btn: 'ఫిర్యాదు సమర్పించండి',
    citizen_submitting: 'ఫిర్యాదు సమర్పించబడుతోంది...',

    // Voice Input
    voice_start: 'మాట్లాడి నమోదు చేయండి',
    voice_listening: 'వింటున్నాము... స్పష్టంగా మాట్లాడండి',
    voice_stop: 'రికార్డింగ్ ఆపండి',
    voice_presets: 'నమూనా సమస్య ఎంచుకోండి:',

    // Location Picker
    loc_title: 'మ్యాప్‌లో ప్రదేశం గుర్తించండి',
    loc_sub: 'మ్యాప్‌పై క్లిక్ చేయండి లేదా సమస్య యొక్క ఖచ్చితమైన ప్రదేశం చూపించండి.',
    loc_auto_gps: 'నా ప్రదేశం కనుగొనండి',
    loc_detecting: 'ప్రదేశం కనుగొంటున్నాము...',
    loc_current: 'ఎంచుకున్న ప్రదేశం:',

    // Geo-Tag Camera & Image Upload
    geotag_cam_title: 'కెమెరా మరియు ఫోటో రుజువు',
    geotag_cam_sub: 'లైవ్ ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి. మీ గోప్యత కోసం ముఖాలు మరియు నంబర్ ప్లేట్లు స్వయంచాలకంగా బ్లర్ చేయబడతాయి.',
    geotag_open_btn: 'కెమెరా తెరవండి',
    geotag_snap_btn: 'ఫోటో తీయండి',
    geotag_retake_btn: 'మళ్ళీ తీయండి',
    geotag_use_btn: 'ఈ ఫోటో వాడండి',
    geotag_presets: 'లేదా నమూనా ఫోటో ఎంచుకోండి:',
    img_title: 'ఫోటో అప్‌లోడ్ చేయండి (గోప్యత రక్షణ)',
    img_sub: 'సమస్య యొక్క ఫోటో అప్‌లోడ్ చేయండి. ముఖాలు మరియు నంబర్ ప్లేట్లు స్వయంచాలకంగా రక్షించబడతాయి.',
    img_drag_drop: 'ఫోటోను ఇక్కడ డ్రాగ్ చేయండి లేదా ఫైల్ ఎంచుకోండి',
    img_formats: 'PNG, JPG లేదా WEBP (10MB వరకు)',
    img_select_sample: 'లేదా నమూనా ఫోటో ఎంచుకోండి:',

    // Privacy Shield
    privacy_badge: 'గోప్యత రక్షణ',
    privacy_title: 'మీ గోప్యత 100% రక్షించబడింది',
    privacy_pii: 'వ్యక్తిగత సమాచార రక్షణ',
    privacy_pii_sub: 'ఫోన్ నంబర్ మరియు ID స్వయంచాలక రక్షణ',
    privacy_yolo: 'ఫోటో రక్షణ',
    privacy_yolo_sub: 'ముఖాలు మరియు నంబర్ ప్లేట్లు బ్లర్',
    privacy_doxxing: 'గుర్తింపు రక్షణ',
    privacy_doxxing_sub: 'పౌర గుర్తింపు రహస్యం',
    privacy_dpdp: 'DPDP అనుసరణ',
    privacy_dpdp_sub: 'డేటా రక్షణ చట్టాల ప్రకారం',

    // Form Fields
    form_title: 'సమస్య సారాంశం',
    form_title_placeholder: 'సంక్షిప్త వివరణ (ఉదా: ప్రధాన రహదారిలో పెద్ద గొయ్యి)',
    form_desc: 'వివరమైన వర్ణన',
    form_desc_placeholder: 'సమస్య యొక్క పూర్తి సమాచారం రాయండి లేదా మాట్లాడండి...',
    form_category: 'సమస్య రకం',
    form_location: 'ప్రదేశం / చిరునామా',
    form_live_gps: 'ప్రస్తుత GPS పొందండి',
    form_impact_weight: 'అంచనా పరిష్కార సమయం',

    // Categories
    cat_road: 'రహదారులు మరియు గుంతలు',
    cat_water: 'నీటి సరఫరా మరియు లీకేజీ',
    cat_sanitation: 'చెత్త మరియు పారిశుద్ధ్యం',
    cat_electrical: 'వీధి దీపాలు మరియు విద్యుత్',
    cat_parks: 'పార్కులు మరియు ప్రజా సౌకర్యాలు',
    cat_other: 'ఇతర సమస్య',

    // Officer Dashboard
    officer_title: 'అధికారి ట్రయాజ్ మరియు వర్క్ ఆర్డర్ డాష్‌బోర్డ్',
    officer_zone: 'ఇండోర్ నగరపాలక సంస్థ • జోన్ 12',
    officer_dept_filter: 'విభాగ వర్గీకరణ:',
    officer_all_depts: 'అన్ని విభాగాలు (నగరపాలక అవలోకనం)',
    officer_start_btn: 'పని ప్రారంభించండి',
    officer_mark_solved: 'పరిష్కారం నమోదు చేయండి',
    officer_grievances_in_view: 'చురుకుగా ఉన్న ఫిర్యాదులు',
    officer_logged_in_as: 'లాగిన్ వాడుకరి:',

    // Kanban Columns
    col_new: 'కొత్త ఫిర్యాదులు',
    col_assigned: 'అధికారి నియమించబడింది',
    col_in_progress: 'పని పురోగతిలో',
    col_pending_verif: 'ధృవీకరణ పెండింగ్',
    col_resolved: 'ధృవీకరించబడి పరిష్కరించబడింది',

    // SLA Countdown
    sla_timer_title: 'SLA సమయ కౌంట్‌డౌన్',
    sla_remaining: 'మిగిలిన సమయం (48 గంటల SLA)',

    // Verification & Copilot
    verif_active: '⏳ 7-రోజుల ధృవీకరణ విండో చురుకుగా',
    verif_desc: 'కాంట్రాక్టర్ చెల్లింపు ముందు 3 స్థానిక పౌరుల ఫోటో రుజువు ధృవీకరణ తప్పనిసరి.',
    copilot_title: '60-సెకన్ల ఆటోమేటిక్ పరిష్కార సహాయకుడు మరియు వర్క్ ఆర్డర్ జనరేటర్',
    copilot_sub: 'ఆటోమేటిక్ AI ద్వారా వెంటనే నగరపాలక కాంట్రాక్టర్లకు వర్క్ ఆర్డర్',
    copilot_btn: '⚡ ఆటోమేటిక్ వర్క్ ఆర్డర్ సృష్టించండి',

    // Login & Register
    login_title: 'నమోదిత వాడుకరి లాగిన్',
    register_title: 'కొత్త పౌర నమోదు',
    resident_citizen: '👤 స్థానిక పౌరుడు',
    municipal_officer: '👮 నగరపాలక అధికారి',
    full_legal_name: 'పూర్తి చట్టబద్ధ పేరు',
    mobile_label: '10-అంకెల మొబైల్ నంబర్ (SMS OTP)',
    send_otp_btn: '📱 OTP పంపండి',
    verify_otp_btn: 'OTP ధృవీకరించండి',
    phone_verified_badge: '✓ మొబైల్ నంబర్ SMS OTP ద్వారా ధృవీకరించబడింది!',
    address_label: 'ఇంటి చిరునామా / సమీప గుర్తింపు ప్రదేశం',
    complete_reg_btn: 'పౌర నమోదు పూర్తి చేయండి',
    quick_demo_signin: '1-క్లిక్ డెమో లాగిన్:',

    // Footer
    footer_desc: 'ప్రగతి 2.0 హ్యాకథాన్ కోసం అభివృద్ధి చేయబడిన తదుపరి తరం నగరపాలక ఫిర్యాదు పరిష్కారం మరియు మౌలిక సదుపాయాల పాలన వేదిక.',
    footer_nav: 'ఉపయోగకరమైన లింకులు',
    footer_transparency: 'వ్యవస్థ పారదర్శకత',
    footer_rights: 'అన్ని హక్కులు రక్షించబడ్డాయి. డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ (DPDP) చట్టం 2023 ప్రకారం రక్షణ.',

    // SMS & Call Complaint
    nav_sms_complaint: 'SMS ఫిర్యాదు',
    nav_call_complaint: 'కాల్ ఫిర్యాదు',
    sms_page_title: 'SMS ద్వారా ఫిర్యాదు నమోదు చేయండి',
    sms_page_desc: 'యాప్ లేదు, ఇంటర్నెట్ లేదు — ఒక SMS పంపి నగరపాలక ఫిర్యాదు నమోదు చేయండి.',
    call_page_title: 'ఫోన్ కాల్ ద్వారా ఫిర్యాదు నమోదు',
    call_page_desc: 'ఒక కాల్ చేసి మీ ఫిర్యాదు చెప్పండి. IVR వ్యవస్థ మీ గొంతును రికార్డ్ చేస్తుంది.',

    // Language selector
    lang_select_label: 'భాష ఎంచుకోండి:',
    lang_clear: 'తొలగించు',
    lang_spoken_desc: 'గుర్తించిన వివరణ:',
    lang_auto_added: '✓ ఈ వివరణ క్రింద ఉన్న ఫారంలో స్వయంచాలకంగా జోడించబడింది',
    lang_edit: 'సవరించు',
    lang_done: 'పూర్తి',
    lang_clean: 'మెరుగుపరచు',
    lang_enhance: 'మెరుగుపరచు',
    lang_listening: 'వింటున్నాము... స్పష్టంగా మాట్లాడండి',
    lang_privacy_note: 'గోప్యత రక్షణ: గుర్తింపు మరియు సంప్రదింపు నంబర్లు స్వయంచాలకంగా రక్షించబడతాయి.',
    lang_locating: 'ప్రదేశం కనుగొంటున్నాము...',
    lang_sla_title: 'అంచనా పరిష్కార సమయం',
    lang_sla_desc: 'ఫిర్యాదు 24 నుండి 48 గంటల్లో సంబంధిత విభాగం మరియు అధికారులకు అప్పగించబడుతుంది.',
    lang_provide_details: 'దయచేసి ఫిర్యాదు వివరాలు అందించండి',
    lang_other_placeholder: 'సమస్య రకాన్ని పేర్కొనండి (ఉదా: ట్రాన్స్‌ఫార్మర్ పాడు, పైప్ లీకేజీ)...',
    lang_location_placeholder: 'ఉదా: విజయ్ నగర్, పలాసియా, రాజ్‌వాడా, ఇండోర్...',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_lang');
      return SUPPORTED_LANGS.includes(saved) ? saved : 'en';
    } catch (e) {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    const currentIndex = SUPPORTED_LANGS.indexOf(language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGS.length;
    const nextLang = SUPPORTED_LANGS[nextIndex];
    setLanguage(nextLang);
    try {
      localStorage.setItem('civic_lang', nextLang);
      document.documentElement.lang = nextLang;
    } catch (e) {}
  };

  const setSpecificLanguage = (lang) => {
    if (SUPPORTED_LANGS.includes(lang)) {
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
