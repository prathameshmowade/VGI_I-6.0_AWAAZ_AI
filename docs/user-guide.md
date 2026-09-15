# 📖 Awaaz AI (आवाज़.ai) — User & Operator Guide

---

## 👤 Part 1: Citizen Guide

### 1. Submitting a Complaint (Web / Mobile PWA)
1. Navigate to the **Awaaz AI** home page: `https://code-rush-2-0-pragati-2-o-community.vercel.app/` (or `http://localhost:3000`).
2. Toggle your preferred language in the top navbar: **`🇬🇧 EN`** or **`🇮🇳 हिन्दी`**.
3. Click **"Report Complaint"** (शिकायत दर्ज करें).
4. Enter your 10-digit mobile number and click **"Send OTP"**.
5. Enter the 6-digit verification code (`123456`) and confirm the green **"Verified"** badge.
6. Click the **Microphone** icon to speak your complaint in your native language, or type the details.
7. Click **"Detect My Location"** or select the pin on the Google Map.
8. (Optional) Upload an evidence photo. The **Privacy Shield** will automatically blur any faces or vehicle number plates.
9. Click **"Submit Complaint"**. You will receive an instant **Tracking ID** (e.g. `AWZ-2026-84920`).

### 2. Tracking Real-Time Status
1. Click **"Track Status"** in the top navigation.
2. Enter your Tracking ID (or select from your recent submissions).
3. View the live step-by-step progress timeline, SLA countdown, and Explainable AI triage details.

### 3. Crowd Verification Audit
- When a complaint in your neighborhood is marked as "Resolved", you may receive a notification to verify the fix.
- Tap **"Verified Fixed"** (सत्यापित हुआ) or **"Still Broken"** (अभी भी खराब है) to assist municipal quality control.

---

## 👮 Part 2: Municipal Officer Guide

### 1. Accessing the Officer Dashboard
1. Navigate to `/login` or click **"Officer Login"**.
2. Enter the municipal credentials or the **Officer Secret Key** (`ADMIN_OFFICER_SECRET_2026`).
3. You will be redirected to the **Officer Kanban Dashboard** (`/officer`).

### 2. Department Bifurcation & Kanban Management
- Use the top **Department Filter** dropdown to view complaints for your specific department:
  - `ALL` — City-Wide Overview
  - `DEPT_ROAD` — Roads & Infrastructure
  - `DEPT_WATER` — Water Supply & Drainage
  - `DEPT_SANITATION` — Sanitation & Solid Waste
  - `DEPT_ELECTRICAL` — Electrical & Smart Lighting
  - `DEPT_PARKS` — Parks & Public Amenities
- Drag and drop or click cards to update status through the 5 stages:
  1. `Submitted` (दर्ज)
  2. `Triaged / In Review` (समीक्षाधीन)
  3. `Assigned to Crew` (सौंपा गया)
  4. `In Progress` (प्रगति पर)
  5. `Resolved` (समाधानित)

### 3. Generating Contractor Work Orders
- Open any active complaint card and click **"Generate Work Order"**.
- The **AI Copilot** will automatically calculate:
  - Standard repair procedure
  - Estimated cost breakdown (INR)
  - Required machinery and crew size
  - Target completion time

### 4. Uploading Resolution Proof
- When work is finished, click **"Resolve & Upload Proof"**.
- The **Computer Vision Verifier** will analyze the photo against the initial submission before certifying closure and minting a block on the **SHA-256 Audit Ledger**.

---

## 📊 Part 3: Municipal Executive & City Digital Twin Guide

1. Navigate to `/digital-twin` to explore the **2D/3D Ward Infrastructure Health Grid**.
2. Inspect the **Ward 12 Telemetry Simulation** (Roads, Water, Sanitation, Streetlights).
3. Access `/analytics` to review:
   - SLA Compliance Trends
   - Department Efficiency Rankings
   - Causal Root-Cause Infrastructure Insights
   - Failure Risk Hotspots for proactive maintenance budget allocation.
