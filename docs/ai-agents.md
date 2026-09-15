# 🤖 Awaaz AI (आवाज़.ai) — AI Agents & Autonomous Subsystems

Awaaz AI employs a multi-agent orchestrated intelligence architecture where specialized agents handle dedicated phases of the municipal grievance lifecycle.

---

## 🏛️ The 9 Specialized Civic AI Agents

```
                        ┌──────────────────────────────┐
                        │   🎯 Master Civic Dispatcher │
                        └──────────────┬───────────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│  Voice & NLU ││  XAI Triage  ││ Deduplication││ Privacy PII  ││ SLA Sentinel │
│  Agent (STT) ││  Classifier  ││  & Spatial   ││ Shield Agent ││  & Escalation│
└──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
        │              │               │               │              │
        └──────────────┴───────────────┼───────────────┴──────────────┘
                                       ▼
        ┌──────────────┬───────────────────────────────┬──────────────┐
        ▼              ▼                               ▼              ▼
┌──────────────┐┌──────────────┐               ┌──────────────┐┌──────────────┐
│  Resolution  ││  Computer    │               │  Predictive  ││  Causal Root │
│   Copilot    ││  Vision (CV) │               │  Twin Agent  ││  Cause AI    │
└──────────────┘└──────────────┘               └──────────────┘└──────────────┘
```

### 1. 🎙️ Voice & Multilingual NLU Agent
- **Purpose:** Transcribes live citizen voice notes in English, Hindi, and Marathi.
- **Engine:** Indic Whisper / WebSpeech API with audio signal normalization.
- **Output:** Structured JSON containing Title, Full Description, and Detected Language.

### 2. 🧠 Explainable Triage & Classification Agent (XAI)
- **Purpose:** Automatically categorizes complaints and routes to the correct department (`DEPT_ROAD`, `DEPT_WATER`, `DEPT_SANITATION`, `DEPT_ELECTRICAL`, `DEPT_PARKS`).
- **Urgency Scoring:** Assigns Low, Medium, High, or Critical urgency with human-readable rationale cards.

### 3. 🔍 Deduplication & Spatial-Temporal Clustering Agent
- **Purpose:** Identifies multiple citizens reporting the same physical incident within a $50\text{m}$ to $100\text{m}$ radius and within 72 hours.
- **Action:** Merges redundant tickets into a single Master Ticket with an incremented Endorsement count.

### 4. 🛡️ Privacy & PII Shield Agent (DPDP Act 2023)
- **Purpose:** Scrubs private citizen data (Aadhaar numbers, phone numbers) from public feeds and runs YOLOv8 edge computer vision to blur human faces and license plates in attached photos.

### 5. ⏱️ SLA Sentinel & Escalation Agent
- **Purpose:** Monitors real-time SLA countdown timers. If a ticket approaches 80% SLA consumption without resolution, triggers automated supervisory alerts to the Ward Councilor.

### 6. 🛠️ Resolution Copilot Agent
- **Purpose:** Assists field municipal engineers by recommending standard repair procedures, bill-of-materials, equipment requirements, labor crew sizing, and cost estimations.

### 7. 👁️ Computer Vision (CV) Resolution Verifier
- **Purpose:** Performs structural feature comparison between the initial complaint photo and the repair proof photo using CLIP embeddings to eliminate fake ticket closures.

### 8. 🏙️ Predictive City Digital Twin Agent
- **Purpose:** Continuously analyzes historical complaint velocities, weather forecasts, and asset aging to simulate Ward infrastructure health (0–100%).

### 9. 🔬 Causal Root-Cause Intelligence Agent
- **Purpose:** Connects multiple distinct complaints across adjacent streets to identify underlying systemic infrastructure failures (e.g., stormwater mainline failure causing recurring potholes).
