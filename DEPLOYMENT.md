# 🚀 CivicFlow AI-X / Awaaz AI — Complete Production Deployment Guide

This guide provides end-to-end instructions to deploy the **CivicFlow AI-X / Awaaz AI** platform to production across modern cloud hosting providers, container engines, and Kubernetes clusters.

---

## ⚡ Quick Pre-Flight Check

Before deploying, run the automated deployment validator to verify all bundles, blueprints, and environment configurations:

```bash
npm run verify:deployment
```
Expected output:
```text
✔ PASS  Node.js Environment & Version
✔ PASS  Root & Workspace package.json
✔ PASS  Frontend Production Bundle (dist/index.html)
✔ PASS  Docker Configuration (Dockerfile, .dockerignore, docker-compose.yml)
✔ PASS  Cloud Deployment Blueprints (render.yaml, vercel.json, railway.json, netlify.toml)
✔ PASS  Environment Configuration (.env.example)
✔ PASS  Unified Express App (backend/app.js & backend/index.js)
✔ PASS  Vercel Serverless Function (api/index.js)

🚀 All critical checks passed! The application is 100% ready for production deployment.
```

---

## 🌐 Deployment Targets

### Option 1: 1-Click Render Blueprint (Full-Stack Monolith + Redis) [Recommended]

This repository includes a native [`render.yaml`](./render.yaml) Infrastructure-as-Code Blueprint.

1. Fork or push this repository to your GitHub account: `https://github.com/prathameshmowade/VGI_I-6.0_AWAAZ_AI`.
2. Go to [Render Blueprints](https://dashboard.render.com/blueprints).
3. Click **New Blueprint Instance** and connect your repository.
4. Render will automatically detect [`render.yaml`](./render.yaml) and provision:
   - **`awaaz-ai-gateway`** (Node.js Web Service: builds React frontend and runs Express gateway on port 5000)
   - **`awaaz-ai-worker`** (Background Worker Pool: processes AI triage, deduplication, and webhooks)
   - **`awaaz-ai-redis`** (Managed Redis Cluster: queues and edge caching)
5. (Optional) Provide `MONGODB_URI` or leave empty to use the built-in resilient offline JSON database.
6. Click **Apply**. Your app is live with SSL in ~3 minutes!

---

### Option 2: Vercel (Frontend CDN) + Render / Railway (Backend API)

#### Part A: Deploy Backend API to Render or Railway
1. Create a **Web Service** on [Render](https://dashboard.render.com/) or [Railway](https://railway.app/).
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: (Random secure string)
   - `MONGODB_URI`: (Your MongoDB Atlas connection string, or leave empty for offline mock)
6. Copy your live backend URL (e.g. `https://awaaz-ai-api.onrender.com`).

#### Part B: Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new) and import your GitHub repository.
2. Select **Vite** preset:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://awaaz-ai-api.onrender.com` (your backend URL from Part A)
4. Click **Deploy**. Vercel will build and assign you a global HTTPS domain (e.g. `https://awaaz-ai.vercel.app`).

---

### Option 3: Docker & Docker Compose (VPS / AWS EC2 / DigitalOcean)

The platform includes a multi-stage [`Dockerfile`](./Dockerfile) and production [`docker-compose.yml`](./docker-compose.yml).

#### 1. Single Container Run
```bash
# Build multi-stage production image
docker build -t awaaz-ai:latest .

# Run container
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=production_secret_key_2026 \
  --name awaaz-ai-app \
  awaaz-ai:latest
```
Access the application at `http://localhost:5000`.

#### 2. Full Multi-Service Production Compose
```bash
# Spin up Web Gateway, AI Worker Pool, PostGIS 16, PgBouncer, and Redis 7
docker-compose up --build -d

# Verify all services are healthy
docker-compose ps
```

Health probes:
- `http://localhost:5000/healthz` (Liveness)
- `http://localhost:5000/readyz` (Readiness)
- `http://localhost:5000/metrics` (Prometheus telemetry)

---

### Option 4: Railway Deployment

The repository includes [`railway.json`](./railway.json).
1. Install Railway CLI: `npm i -g @railway/cli`
2. Link your project: `railway link`
3. Deploy: `railway up`
Railway automatically executes `npm run build` and boots `npm start`.

---

### Option 5: Kubernetes (K8s) Cluster

Kubernetes deployment manifests are located in [`backend/infrastructure/k8s/deployment.yaml`](./backend/infrastructure/k8s/deployment.yaml).

```bash
# Apply secrets & configmap
kubectl apply -f backend/infrastructure/k8s/deployment.yaml

# Monitor rolling deployment
kubectl rollout status deployment/civicflow-api-gateway
```

Includes:
- Horizontal Pod Autoscaler (HPA) auto-scaling from 2 to 20 replicas based on CPU threshold (70%).
- Liveness probe (`/healthz`) and readiness probe (`/readyz`).
- Anti-affinity rules to distribute pods across separate availability zones.

---

## 🔒 Production Environment Variables Reference

Refer to [`.env.example`](./.env.example) for a complete template:

| Variable | Description | Required? | Default / Example |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Web server listening port | Yes | `5000` |
| `JWT_SECRET` | Auth token encryption key | Yes | `awaaz-ai-production-secret-2026` |
| `MONGODB_URI` | MongoDB Atlas database URI | Optional | `mongodb+srv://...` (falls back to local offline JSON store if omitted) |
| `POSTGRES_URL` | PostgreSQL/PostGIS connection | Optional | `postgresql://...` |
| `REDIS_URL` | Redis cache & queue backplane | Optional | `redis://...` (falls back to in-memory queue if omitted) |
| `AI_SERVICE_URL` | YOLO / CV inference endpoint | Optional | `http://localhost:8000` |
| `GEMINI_API_KEY` | Google Gemini AI triage key | Optional | Cloud LLM categorization |
| `TELEGRAM_BOT_TOKEN` | Telegram bot access token | Optional | Enables direct Telegram civic complaint intake |
| `B2B_WEBHOOK_SECRET` | HMAC SHA256 webhook signer | Optional | Enterprise B2B route protection |
| `VITE_API_URL` | Frontend API proxy override | Optional | Leave blank for monolithic; specify when frontend is split onto CDN |

---

## 🛡️ SRE Health Check Probes

| Endpoint | HTTP Method | Description |
| :--- | :--- | :--- |
| `/healthz` | `GET` | Kubernetes & Docker liveness probe (`{"status":"healthy"}`) |
| `/readyz` | `GET` | Readiness probe verifying database & queue readiness |
| `/metrics` | `GET` | Prometheus telemetry (memory, CPU, uptime, requests) |
| `/api/health` | `GET` | Comprehensive API gateway health and tenant metadata |
