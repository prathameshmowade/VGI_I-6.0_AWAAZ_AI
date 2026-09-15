# 🏛️ Awaaz AI (आवाज़.ai) — System Architecture Blueprint

> **Theme:** AI-Driven Digital Governance and Citizen-Centric Public Services  
> **Category:** Software + AI + Cloud Computing + Data Analytics + Mobile Technology  

---

## 🌐 1. High-Level Architectural Overview

Awaaz AI is built on a resilient, microservices-driven, hybrid cloud architecture designed for high throughput, sub-second latency, zero-friction citizen accessibility, and immutable cryptographic accountability.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Citizen Touchpoints & Ingress Layer                   │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Web PWA (React 18)│ Mobile (Android/  │ WhatsApp / Telegram Bot /      │
│ Vite + Tailwind   │ iOS PWA & Native) │ IVR Voice AI (Indic Whisper)   │
└─────────┬─────────┴─────────┬─────────┴───────────────┬────────────────┘
          │                   │                         │
          ▼                   ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Cloud Edge & Security Gateway Layer                   │
├────────────────────────────────────────────────────────────────────────┤
│ • Cloudflare CDN / Edge Caching & WAF Protection                       │
│ • Kong / NGINX Ingress Controller & Dynamic Rate Limiting              │
│ • DPDP Act 2023 Regex PII Masking & Aadhaar/Phone Redactor             │
│ • JWT Session Management & SMS OTP (2FA) Identity Gateway              │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Core Backend Microservices (Node.js)                 │
├─────────────────────────────────┬──────────────────────────────────────┤
│ • Grievance Lifecycle Service   │ • Officer Kanban & Dispatch Service  │
│ • SLA Countdown & Alert Service │ • Digital Twin Telemetry Engine      │
│ • Omnichannel Notification Hub  │ • Cryptographic SHA-256 Ledger Node  │
└──────────────┬──────────────────┴───────────────────┬──────────────────┘
               │                                      │
               ▼                                      ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│   🧠 Python AI/ML Engine        │   │    🗄️ Persistence & Storage Tier │
├─────────────────────────────────┤   ├──────────────────────────────────┤
│ • Multilingual Speech-to-Text   │   │ • MongoDB Atlas / PostgreSQL     │
│ • XAI Triage & Urgency Scorer   │   │ • Redis Cluster (SLA Timers)     │
│ • Vector Deduplication & Geo    │   │ • AWS S3 / Cloud Storage (Media) │
│ • YOLOv8 PII Anonymizer & Blur  │   │ • SHA-256 Merkle Audit Chain     │
│ • CLIP CV Resolution Verifier   │   │ • Vector DB (pgvector / Pinecone)│
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 🧩 2. Core Subsystems

### 2.1 Omnichannel Citizen Intake Subsystem
- **Multi-Lingual Speech Processing:** Uses Indic Whisper and Web Speech APIs for zero-friction complaint logging across English, Hindi, and regional languages.
- **Automated GPS & Geofencing:** Captures high-precision latitude/longitude via browser/mobile GPS and maps to municipal ward boundaries.
- **SMS OTP Verification:** Authenticates citizen phone numbers with a 6-digit verification code (`123456`), preventing spam and bot submissions.

### 2.2 Explainable AI (XAI) Triage & Auto-Routing Subsystem
- **Multi-Class NLP Classifier:** Analyzes complaint title, description, and keywords to automatically map submissions to:
  - `DEPT_ROAD` — Roads & Infrastructure
  - `DEPT_WATER` — Water Supply & Drainage
  - `DEPT_SANITATION` — Sanitation & Waste Management
  - `DEPT_ELECTRICAL` — Electrical & Smart Lighting
  - `DEPT_PARKS` — Parks & Public Amenities
  - `DEPT_HEALTH` — Public Health & Pest Control
- **XAI Confidence & Reasoning Cards:** Transparently displays matched keywords, applied rules, and confidence percentages.

### 2.3 Computer Vision (CV) Resolution & Privacy Shield Subsystem
- **Edge PII Redaction:** Auto-detects and blurs human faces and vehicle license plates via YOLOv8.
- **Before/After Structural Comparison:** Compares repair photos against initial complaint images using CLIP/ResNet embeddings to prevent fraudulent ticket closures.
- **3-Citizen Crowd Consensus Audit:** Repairs below 90% AI visual confidence trigger 3 neighbor verifications before final closure.

### 2.4 City Digital Twin & Predictive Analytics Subsystem
- **Ward-Level Infrastructure Health Grid:** Computes dynamic health index (0–100%) for roads, water pipelines, electrical grids, and sanitation zones.
- **Causal Root Cause Analysis:** Aggregates localized symptom tickets into a single master infrastructure repair order.
- **SLA Breach Forecasting:** Predicts SLA risks 12 hours ahead using backlog velocity models.

### 2.5 Tamper-Evident SHA-256 Cryptographic Audit Ledger
- Forms a Merkle-like hash chain for every ticket lifecycle event:
  $$\text{Hash}_n = \text{SHA256}(\text{Index} + \text{Timestamp} + \text{TicketID} + \text{Action} + \text{Actor} + \text{Hash}_{n-1})$$
- Guarantees transparency and eliminates silent ticket suppression or modifications.

---

## 🔒 3. Security, Privacy & Compliance

1. **DPDP Act 2023 Compliance:** Automated Aadhaar and phone number masking before persistence.
2. **Officer Secret Key Security:** Cryptographically verified admin keys for administrative actions.
3. **Role-Based Access Control (RBAC):** Strict isolation between Citizen, Field Officer, Department Head, and Commissioner roles.
