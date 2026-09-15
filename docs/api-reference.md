# 📡 Awaaz AI (आवाज़.ai) — REST & AI API Reference

---

## 🔐 Authentication & Security

All Officer and Administrative endpoints require the `x-officer-secret` header or a valid Bearer JWT token.

```http
x-officer-secret: ADMIN_OFFICER_SECRET_2026
Authorization: Bearer <JWT_TOKEN>
```

---

## 👤 Citizen Gateway Endpoints

### 1. Send SMS OTP
```http
POST /api/sms/send-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### 2. Verify SMS OTP
```http
POST /api/sms/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

### 3. Submit Complaint
```http
POST /api/complaints
Content-Type: application/json

{
  "title": "Severe pothole near Metro Station",
  "description": "Deep crater causing traffic slowdown and safety hazard",
  "category": "Road Damage",
  "department": "Roads & Infrastructure Department",
  "departmentCode": "DEPT_ROAD",
  "urgency": "High",
  "location": {
    "lat": 19.0760,
    "lng": 72.8777,
    "address": "Ward 12, Main MG Road, Mumbai"
  },
  "citizenPhone": "+919876543210",
  "isPhoneVerified": true,
  "imageUrl": "https://example.com/pothole.jpg"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "trackingId": "AWZ-2026-84920",
  "status": "Submitted",
  "slaDeadline": "2026-08-30T21:00:00.000Z",
  "aiTriage": {
    "confidenceScore": 96,
    "urgency": "High",
    "xaiReasoning": ["Road crater keywords detected", "Mapped to Ward 12"]
  }
}
```

### 4. Track Complaint by ID
```http
GET /api/complaints/track/:trackingId
```

---

## 👮 Officer & Operations Endpoints

### 1. List Department Complaints (Kanban)
```http
GET /api/officers/complaints?department=DEPT_ROAD&status=InProgress
```

### 2. Update Complaint Status & Mint Ledger Block
```http
PATCH /api/officers/complaints/:id/status
Content-Type: application/json

{
  "status": "Resolved",
  "officerId": "OFFICER_042",
  "resolutionNotes": "Hot-mix asphalt patch completed successfully",
  "proofImageUrl": "https://example.com/resolved_proof.jpg"
}
```

### 3. Generate Contractor Work Order (AI Copilot)
```http
POST /api/officers/complaints/:id/work-order
```

---

## 🧠 AI Engine Microservice Endpoints (FastAPI)

### 1. NLP Triage & Urgency Classification
```http
POST http://localhost:8000/analyze
Content-Type: application/json

{
  "text": "Huge water leakage flooding the road",
  "category": "Other / Miscellaneous"
}
```
**Response (200 OK):**
```json
{
  "category": "Water Supply",
  "department": "Water Supply & Drainage Dept",
  "departmentCode": "DEPT_WATER",
  "urgency": "Critical",
  "confidenceScore": 95,
  "isAutoClassified": true,
  "xaiReasoning": ["Hydraulic pipeline and drainage leakage detected", "Contamination risk escalation"]
}
```

### 2. DPDP PII Redaction
```http
POST http://localhost:8000/redact
Content-Type: application/json

{
  "text": "My phone is 9876543210 and Aadhaar is 123456789012"
}
```
**Response (200 OK):**
```json
{
  "redactedText": "My phone is [REDACTED_PHONE] and Aadhaar is [REDACTED_AADHAAR]",
  "piiDetected": ["Phone/Aadhaar"]
}
```

### 3. AI Resolution Copilot Recommendation
```http
POST http://localhost:8000/copilot
Content-Type: application/json

{
  "category": "Road Damage",
  "severity": "High"
}
```
**Response (200 OK):**
```json
{
  "repairMethod": "Hot-mix asphalt patching",
  "estimatedCost": "18500",
  "estimatedTime": "6 hours",
  "equipment": ["Asphalt Roller", "4 Crew members"]
}
```
