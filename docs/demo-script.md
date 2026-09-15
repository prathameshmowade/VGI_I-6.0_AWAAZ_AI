# CivicFlow AI-X — 5-Minute Hackathon Demo Script

> **Goal:** Wow the judges in 300 seconds by showcasing live working code for core SDG-01 requirements + Tier 1 Hero Innovations (Agentic Resolution Engine, Computer Vision Verification, Explainable AI, and Digital Twin).

---

## ⏱️ Timeline & Pitch Flow (300 Seconds)

### 0:00 - 0:45 | Minute 1: The Problem & Vision
- **Hook**: "Existing grievance portals are reactive black holes where complaints get filed, delayed, or silently closed without accountability."
- **Solution Pitch**: *"CivicFlow AI-X is the world's first Agentic Civic Operations Platform. It doesn't just register complaints—it autonomously resolves routine issues, verifies repairs using Computer Vision, predicts failures before citizens complain, and uncovers root causes."*
- **Key Differentiator**: Highlight the **18 Innovation Pillars** and human-in-the-loop safety boundary.

### 0:45 - 1:45 | Minute 2: Multilingual Citizen Intake & Privacy Shield
- Open [`CitizenPortal.jsx`](file:///frontend/src/pages/CitizenPortal.jsx).
- **Voice Demo**: Click 🎤 **Voice Input** and speak in Hindi/Marathi/English: *"ABC School ke paas bada pothole hai, accident ho rahe hain."*
- **Privacy Shield Demo**: Add an Aadhaar number in text. Show instant auto-redaction: `[REDACTED_AADHAAR]`.
- **Submit**: Show instant tracking ID (`CMP-2026-004`) and 5-step visual tracking timeline.

### 1:45 - 2:45 | Minute 3: Explainable AI (XAI) & Duplicate Clustering
- Open [`TrackComplaint.jsx`](file:///frontend/src/pages/TrackComplaint.jsx).
- **XAI Rationale**: Show the 96% AI confidence score, matched keywords, rules applied, and similar precedent cases.
- **Duplicate Clustering**: Show how 4 similar complaints in Ward 12 are merged into a single master ticket, auto-boosting priority score to 88/100.

### 2:45 - 3:45 | Minute 4: Officer Dashboard & Computer Vision Verifier
- Open [`OfficerDashboard.jsx`](file:///frontend/src/pages/OfficerDashboard.jsx).
- **Kanban Board**: Show real-time SLA countdown timer (e.g. 34h remaining).
- **Resolution Copilot**: Show AI recommended repair method (*"Hot-mix asphalt patching"*, ₹18,500 cost, 6h duration).
- **CV Resolution Verifier**: Show how uploading a fake/unchanged repair photo triggers `Resolution Rejected: No structural change detected`.

### 3:45 - 5:00 | Minute 5: AI Digital Twin & Blockchain Audit Trail
- Open [`DigitalTwinPage.jsx`](file:///frontend/src/pages/DigitalTwinPage.jsx).
- **Digital Twin**: Show live ward infrastructure map, displaying predictive drainage alerts before citizen complaints arrive.
- **Blockchain Audit**: Show the SHA-256 cryptographic block hash log for tamper-evident government accountability.
- **Closing**: *"CivicFlow AI-X turns grievance handling into proactive, trustworthy city operations."*
