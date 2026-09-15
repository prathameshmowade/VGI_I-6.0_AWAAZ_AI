# 🏛️ Awaaz AI (आवाज़.ai) — AI-Powered Community Redressal & Predictive Civic Infrastructure Planner

> **Innovik Hackathon 6.0 | Track 3: Sustainable Development Goals (SDG-01: No Poverty & SDG-11: Sustainable Cities & Communities)**  
> **Team Name: Pragati 2.0**  
> *Transforming municipal grievances into explainable, prioritized, and cryptographically verified civic outcomes for Indore Municipal Corporation (IMC).*

---

## 📋 Executive Summary

**Awaaz AI (आवाज़.ai)** is an enterprise-grade, multi-channel civic intelligence and automated grievance redressal platform engineered for **Indore Municipal Corporation (IMC)** — India's cleanest city. 

By unifying multimodal citizen inputs (voice, SMS, web, mobile photos, and IVR phone calls), Awaaz AI breaks down digital accessibility barriers. It combines **Explainable AI (XAI)** triage, **DPDP Act 2023** compliant privacy anonymization, **SHA-256 cryptographic audit ledgers**, an **Officer Resolution Copilot**, and a **Predictive City Digital Twin** to transition civic governance from reactive complaint resolution to proactive, data-driven urban care.

---

## 🌐 Live Deployment & Platform Navigation

| Service / Portal | Route | Key Capabilities |
| :--- | :--- | :--- |
| **🚀 Public Portal & Overview** | [`/`](http://localhost:3000/) | Live city KPIs, Indore Ward Telemetry, 4 Pillars, and 7-Step Redressal Workflow |
| **👤 Citizen Voice & Web Intake** | [`/citizen`](http://localhost:3000/citizen) | Multi-lingual voice recording (EN/HI/MR), auto GPS geo-tagging, and YOLOv8 privacy blur |
| **👮 Officer Operations Kanban** | [`/officer`](http://localhost:3000/officer) | Department bifurcation (Roads, Water, Sanitation, Electrical, Parks), live SLA countdowns, and copilot |
| **🏙️ City Digital Twin & Heatmap** | [`/digital-twin`](http://localhost:3000/digital-twin) | Live Indore ward telemetry simulation, infrastructure health scores, and 3-citizen crowd audit |
| **📊 City Resolution Analytics** | [`/analytics`](http://localhost:3000/analytics) | Real-time SLA breach trends, failure hotspots, contractor ratings, and resolution KPIs |
| **📱 SMS Grievance Simulator** | [`/sms-complaint`](http://localhost:3000/sms-complaint) | Offline text-based filing simulation for non-smartphone users |
| **📞 Voice IVR Call Simulator** | [`/call-complaint`](http://localhost:3000/call-complaint) | 24x7 phone helpline audio simulation with automatic speech transcription |
| **🔍 Public Complaint Tracker** | [`/track`](http://localhost:3000/track) | Real-time status lookup by Complaint ID with cryptographic proof ledger |
| **🔐 Government Single Sign-On** | [`/login`](http://localhost:3000/login) | SMS OTP mobile verification, Google 2FA email verification, and Officer Secret Key auth |

---

## 🏛️ Grounded in Indore's Civic Redressal Ecosystem

Awaaz AI integrates directly into Indore's established multi-tier civic management structure:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       INDORE CITIZEN COMPLAINT INTAKE & TRIAGE ECOSYSTEM                       │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────────────┤
│ Channel / Level   │ Operator          │ Scope & Focus     │ Awaaz AI Interoperability          │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 📱 Indore 311 App │ IMC               │ Civic issues with │ Automated ingestion & GPS          │
│                   │                   │ geo-tagged photos │ coordinate mapping                 │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 🏢 ICCC Smart     │ Indore Smart City │ SLA breach triage │ Live telemetry feed into           │
│    City Centre    │ (ISCDL)           │ & fleet tracking  │ Predictive City Digital Twin       │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 📞 CM Helpline    │ Govt. of Madhya   │ State-level call  │ Bi-directional ticket sync         │
│    (181)          │ Pradesh           │ center escalation │ & district SLA tracking            │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 🌐 IMC Grievance  │ IMC IT Cell       │ Desk portal for   │ REST API bridge & SHA-256          │
│    Portal         │                   │ tracking requests │ audit ledger export                │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 💬 IMC WhatsApp   │ IMC Automated     │ Bot conversational│ Natural NLP intent classification  │
│    Citizen Bot    │ Helpdesk          │ grievance filing  │ & instant tracking ID generation   │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 🗣️ Ward / Mayor   │ Corporators &     │ Offline physical  │ Field Officer Kanban portal        │
│    Jan Sunwai     │ Civic Officers    │ public hearings   │ & Resolution Copilot dispatch      │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────────────┤
│ 📡 SMS & IVR      │ Awaaz AI Zero-    │ Non-smartphone /  │ Speech-to-text NLP auto-routing    │
│    Toll Helpline  │ Net Engine        │ rural accessibility│ without requiring data or internet │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────────────┘
```

**Localized Indore Zones Covered**:
* **Zone 12**: Vijay Nagar & Scheme 54
* **Zone 09**: Old Palasia & New Palasia
* **Zone 01**: Rajwada & Sarafa Bazaar
* **Zone 03**: Chhappan Dukan & Tukoganj
* **Zone 08**: Bhanwarkuan & Vishnupuri
* **Zone 04**: Annapurna & Sudama Nagar

---

## 🔴 The Core Problems We Solve

1. **Digital Literacy & Linguistic Exclusion**:
   Traditional portals demand complex English typing. Rural, elderly, and non-tech-savvy citizens who communicate in regional Hindi or dialectal speech are structurally disenfranchised.
2. **Duplicate Flooding & Ticket Clutter**:
   A single burst water pipe or major road crater on AB Road triggers dozens of separate reports, swamping municipal dispatch officers with duplicate noise.
3. **Black-Box Bureaucracy & Opaque Escalations**:
   Grievances disappear into untracked government databases. Citizens have zero visibility into why a ticket was routed to a specific department or why SLAs breached.
4. **Contractor Fraud & Ghost Repairs**:
   Tickets are routinely marked "Closed" without physical validation or community confirmation, draining municipal funds without tangible ground reality fixes.
5. **Reactive Firefighting**:
   Municipal bodies act only after road cave-ins or public protests occur, with no predictive capacity to repair aging infrastructure before disaster strikes.

---

## 🟢 The Awaaz AI Solution Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 CITIZEN INTAKE MODES                   │
                  │  Voice (EN/HI/MR) • Web Form • SMS • IVR Phone Call    │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │            PRIVACY & INGESTION GATEWAY                 │
                  │   • DPDP Act 2023 Regex PII Shield (Aadhaar/Phone)     │
                  │   • Edge YOLOv8 Face & License Plate Anonymizer        │
                  │   • SMS OTP 2-Factor Identity Verification             │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │            EXPLAINABLE AI (XAI) TRIAGE                 │
                  │   • Fast Natural NLP Urgency Scoring (Critical/Medium) │
                  │   • Automated Department Bifurcation (Roads/Water/...) │
                  │   • Geo-Spatial Boundary Matching to Indore Wards      │
                  │   • Transparent Decision Reasoning Output              │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
         ┌───────────────────────────────┐         ┌───────────────────────────────┐
         │     OFFICER RESOLUTION HUB    │         │     PUBLIC TRANSPARENCY       │
         │ • 5-Stage Kanban Board        │         │ • Public Tracking by ID       │
         │ • Real-Time SLA Countdowns    │         │ • 3-Citizen Crowd Consensus   │
         │ • Contractor Work Orders      │         │ • SHA-256 Merkle Audit Chain  │
         │ • Resolution Copilot Actions  │         │ • City Digital Twin Heatmap   │
         └───────────────────────────────┘         └───────────────────────────────┘
```

---

## ✨ 8 Pillar Innovations & Differentiators

### 1. 🧠 Explainable AI (XAI) Triage Engine
Unlike opaque black-box machine learning models, Awaaz AI generates **human-readable rationale** for every categorization:
* Detects severity keywords (e.g., *"water leakage"*, *"live electrical wire"*, *"garbage fire"*).
* Assigns confidence ratings (85%–98%) and explains exact jurisdictional routing rules (e.g., *"Assigned to Water Works — Zone 12 based on keyword triggers and Ward coordinates"*).
* Intelligently classifies tickets marked *"Other / Miscellaneous"* without human intervention.

### 2. 🌐 Complete Dynamic English ↔ Hindi Localization (`🇬🇧 EN` | `🇮🇳 हिन्दी`)
* Global navigation bar switch instantly translates the entire web platform, form labels, status chips, officer workflows, and system analytics into grammatically accurate Hindi or English.
* State persists seamlessly across page reloads via reactive language context.

### 3. 🏛️ Officer Kanban Board with Department Bifurcation
* Granular filtering across **Roads, Water Works, Solid Waste / Sanitation, Electrical & Streetlights, Gardens & Parks**, or citywide aggregate (`ALL`).
* Live SLA countdown timers with color-coded alerts (Green: Safe, Amber: Approaching, Red: Breached).
* Officer Secret API Key protection preventing unauthorized departmental modifications.

### 4. 🔒 DPDP Act 2023 Compliant Privacy & YOLOv8 Computer Vision Anonymizer
* **Textual Privacy**: Automatic client-side regex masking of 12-digit Aadhaar numbers and sensitive personal identifiers before server storage.
* **Visual Privacy**: Automated edge computer vision canvas algorithms blurring human faces and vehicle license plates on citizen evidence photos.

### 5. 👥 3-Citizen Crowd Consensus Verification
* Eliminates contractor fraud and false closure reports.
* If AI visual confidence on a contractor's post-repair evidence is below 90%, the ticket enters a **Community Audit** phase requiring 3 independent verified residents in that ward to validate before municipal contractor payment release.

### 6. 🏙️ Predictive City Digital Twin & Telemetry Grid
* Simulates live IoT telemetry across Indore municipal zones:
  * **Road Infrastructure**: Vibration indices, asphalt wear rates, pothole cluster alerts.
  * **Water Distribution**: Pressure differentials, pipeline strain, turbidity sensors.
  * **Lighting & Sanitation**: Grid outages, bin capacity fill rates, fleet GPS pings.
* Visualizes failure hotspots on interactive Google Maps with real-time zone health indices.

### 7. 🔗 Tamper-Evident SHA-256 Cryptographic Audit Ledger
* Every ticket event (creation, triage, assignment, status transition, contractor proof, and citizen sign-off) is hashed into an immutable cryptographic chain.
* Officers and citizens can inspect the hash tree to guarantee that no grievance was silently altered, backdated, or deleted.

### 8. 📱 Zero-Internet Accessibility (SMS & Voice IVR)
* Built-in interactive simulators for **SMS-based ticket filing** and **24x7 IVR phone call triage**.
* Voice is recorded, transcribed, summarized, and assigned a tracking ID sent back via SMS confirmation.

---

## 🛠️ Technical Stack & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Awaaz AI Tech Stack                           │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Layer             │ Technologies      │ Purpose & Highlights           │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 🖥️ Frontend Client│ React 18, Vite,   │ Dark Emerald + Slate Theme,    │
│                   │ Tailwind CSS      │ 100% Responsive, Lucide Icons  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 🗺️ Geospatial & 3D│ Google Maps API,  │ Interactive Indore Ward Maps,  │
│                   │ Three.js, Canvas  │ Ambient 3D Dynamic Background  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ ⚙️ Backend Server │ Node.js, Express, │ RESTful Microservices,         │
│                   │ CORS, Multer      │ Modular Controller Pipeline    │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 🧠 AI & Vision    │ Fast Natural NLP, │ Urgency Classifier, Multi-     │
│                   │ Web Speech API    │ Lingual Voice, YOLOv8 Blur     │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 🗄️ Persistence    │ MongoDB Mongoose, │ JSON Ground-Truth Data Stores, │
│                   │ LocalStorage Sync │ 100% Resilient Offline Fallback│
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 🔒 Security & Auth│ SHA-256 Hashes,   │ DPDP Act PII Shield, SMS OTP,  │
│                   │ Google OAuth 2FA  │ Officer Secret API Key Auth    │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
AWAAZ AI/
├── frontend/                     # React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── CallSimulator.jsx # Phone helpline IVR simulation
│   │   │   ├── ComplaintForm.jsx # Multi-lingual intake form with GPS
│   │   │   ├── DigitalTwinMap.jsx# Google Maps Indore Ward telemetry
│   │   │   ├── Footer.jsx        # Hackathon footer & attribution
│   │   │   ├── GeoTagCamera.jsx  # Photo intake with watermark & metadata
│   │   │   ├── Header.jsx        # Navigation bar & language toggle
│   │   │   ├── KanbanBoard.jsx   # 5-stage officer grievance board
│   │   │   ├── LocationPicker.jsx# Interactive map pin drop
│   │   │   ├── VoiceInput.jsx    # Speech recognition in EN/HI/MR
│   │   │   └── XAIPanel.jsx      # Explainable AI confidence breakdown
│   │   ├── pages/                # Route view containers
│   │   │   ├── CitizenPortal.jsx # Citizen filing & tracking dashboard
│   │   │   ├── DigitalTwinPage.jsx# Predictive telemetry & audit page
│   │   │   ├── LandingPage.jsx   # Public overview, pillars, and KPIs
│   │   │   ├── LoginPage.jsx     # Government SSO & demo auth
│   │   │   ├── OfficerDashboard.jsx # Officer Kanban & copilot
│   │   │   └── TrackComplaint.jsx# Public verification timeline
│   │   ├── context/              # Global state providers
│   │   │   ├── AuthContext.jsx   # Authentication & role management
│   │   │   └── LanguageContext.jsx # English <-> Hindi translation state
│   │   ├── App.jsx               # Route mapping & provider wrapper
│   │   └── main.jsx              # Application DOM entrypoint
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite configuration & proxy rules
│
├── backend/                      # Node.js + Express API server
│   ├── config/                   # Database & environment configuration
│   │   ├── db.js                 # MongoDB connection & fallback
│   │   └── env.js                # Environment variable reader
│   ├── controllers/              # Request handlers
│   │   ├── authController.js     # SMS OTP, Google auth, and login
│   │   ├── complaintController.js# Grievance CRUD & status transitions
│   │   └── analyticsController.js# Citywide resolution metrics
│   ├── models/                   # Mongoose schemas
│   │   ├── Complaint.js          # Core ticket schema with audit history
│   │   └── User.js               # Citizen and Officer user models
│   ├── routes/                   # API endpoint route bindings
│   ├── services/                 # Business logic & AI helpers
│   │   ├── aiService.js          # NLP triage & explainability service
│   │   └── jurisdictionService.js# Indore Ward mapping & boundary logic
│   ├── package.json              # Backend dependencies & scripts
│   └── index.js                  # Express application root
│
├── data/                         # Localized Indore municipal datasets
│   ├── wards.json                # 10 IMC Ward definitions & boundaries
│   ├── wardBoundaries.json       # Indore polygon geo-coordinates
│   ├── assets.json               # Civic infrastructure asset inventory
│   ├── contractors.json          # IMC registered contractor directory
│   ├── officers.json             # IMC Ward officer roster
│   └── sample_complaints.json    # Pre-seeded grievance datasets
│
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Setup & Local Execution Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

---

### Step 1: Install Dependencies

Open a terminal in the root folder:

```powershell
# 1. Install frontend packages
cd frontend
npm install

# 2. Install backend packages
cd ../backend
npm install
cd ..
```

---

### Step 2: Environment Configuration

Create or verify the `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/awaaz_ai
NODE_ENV=development
OFFICER_SECRET_KEY=ADMIN_OFFICER_SECRET_2026
```

*(Note: If MongoDB is not running locally, the system automatically uses resilient mock and LocalStorage fallbacks with zero crash risk).*

---

### Step 3: Run the Application

Run the backend and frontend in separate terminal windows:

#### **Terminal 1 — Backend API**
```powershell
cd backend
npm start
```
* Backend starts on: **`http://localhost:5000`**
* Health check: `http://localhost:5000/api/health`

#### **Terminal 2 — Frontend Application**
```powershell
cd frontend
npm run dev
```
* Frontend starts on: **`http://localhost:3000`**
* API proxy routes `/api/*` requests directly to `http://localhost:5000`.

---

### Step 4: Single-Port Production Mode (Optional)

To bundle the frontend and serve both the API and client from a unified server:

```powershell
# Build production bundle
cd frontend
npm run build
cd ..

# Run backend with production flag
$env:NODE_ENV="production"
node backend/index.js
```
* Access the entire application at: **`http://localhost:5000`**

---

## 🔑 Demo Access Credentials

| Role | Access URL | Authentication Method | Test Credentials |
| :--- | :--- | :--- | :--- |
| **Citizen (Phone)** | [`/login`](http://localhost:3000/login) | SMS Mobile OTP | Any 10-digit number + OTP: `123456` |
| **Citizen (Google)**| [`/login`](http://localhost:3000/login) | Google 2FA Email OTP | Click "Sign in with Google" + OTP: `123456` |
| **Municipal Officer**| [`/login`](http://localhost:3000/login) | Officer Login | Email: `officer@imcindore.mp.gov.in`<br>Password: `password123`<br>Secret Key: `ADMIN_OFFICER_SECRET_2026` |
| **Quick Demo** | [`/login`](http://localhost:3000/login) | 1-Click Demo Buttons | Click **"Citizen Demo"** or **"Officer Demo"** at the bottom of the card |

---

## 🎯 SDG Alignment & Societal Impact

| Sustainable Development Goal | Target | Awaaz AI Contribution |
| :--- | :--- | :--- |
| **SDG-11: Sustainable Cities & Communities** | Target 11.3 & 11.6 | Provides proactive infrastructure monitoring, reduces civic repair turnaround by up to 60%, and prevents urban failure cascades. |
| **SDG-01: No Poverty** | Target 1.4 & 1.b | Ensures vulnerable, rural, and illiterate communities have equal voice access to municipal resources via voice, SMS, and IVR without digital barriers. |
| **SDG-16: Peace, Justice & Strong Institutions** | Target 16.6 & 16.10 | Implements cryptographic SHA-256 audit ledgers, eliminating ghost repairs, bureaucratic tampering, and corruption in public works. |

---

## 👥 Team Pragati 2.0 — Members & Roles

| Avatar | Member Name | Role & Core Contributions |
| :---: | :--- | :--- |
| 🏛️ | **Prathamesh Mowade** | **Team Lead & Full-Stack Architect**<br>System design, REST microservices, Google Maps API, Indore dataset localization, and department bifurcation engine. |
| 👩‍💻 | **Gautamkhushboo** | **Backend & Analytics Engineer**<br>Resolution analytics aggregation, error boundary resilience, cryptographic SHA-256 ledger, and SLA escalation pipelines. |
| 👩‍💻 | **Neha Musale** | **UI/UX & Design Lead**<br>React component hierarchy, dual-language context (EN/HI), theme styling, responsive layouts, and accessibility. |
| 👨‍💻 | **Yash K** | **AI/ML & Automation Lead**<br>Fast Natural NLP triage classifier, SMS OTP verification workflows, and SLA countdown mathematics. |
| 👩‍💻 | **Dhanshree Bhorkar** | **Frontend & Computer Vision Engineer**<br>Multi-lingual Web Speech recognition, City Digital Twin 3D view, and YOLOv8 privacy canvas blurring. |

---

## 📜 License & Compliance

* Developed for **Innovik Hackathon 6.0** by **Team Pragati 2.0** under the **MIT License**.
* Compliant with the provisions of the **Digital Personal Data Protection (DPDP) Act 2023** (Government of India).
