# 🚀 Awaaz AI — Complete Production Deployment Guide

This guide provides step-by-step instructions to deploy the **Awaaz AI** platform to production across free and popular cloud hosting providers.

---

## ⚡ Option 1: Vercel (Frontend) + Render (Backend) [Recommended]

### Part A: Deploy Backend API to Render (Free)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your project codebase.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Add Environment Variables in Render:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: (Optional) Your MongoDB Atlas connection string, or leave blank to use the built-in in-memory offline mock engine.
5. Click **Create Web Service**. Note your backend URL (e.g. `https://awaaz-ai-api.onrender.com`).

---

### Part B: Deploy Frontend to Vercel (Free)
1. Go to [Vercel Dashboard](https://vercel.com/new) and import your codebase.
2. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**. Vercel will build and assign you a global HTTPS domain (e.g. `https://awaaz-ai.vercel.app`).

---

## 🚂 Option 2: Render Full-Stack Monolithic Deployment

Deploy both Frontend and Backend together in one single Web Service on Render:

1. In Render, create a **Web Service** pointing to the repository root.
2. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && node index.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
3. Render will serve the static React frontend and the Express REST API together from port 5000!

---

## 🐳 Option 3: Docker Deployment

You can build and run the entire application using Docker:

### 1. Build Docker Image
```bash
docker build -t awaaz-ai:latest .
```

### 2. Run Container
```bash
docker run -d -p 5000:5000 --name awaaz-ai-app awaaz-ai:latest
```
Open `http://localhost:5000` in your browser.

---

## 🌐 Production Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Connection URL | `mongodb+srv://...` (or blank for offline mock) |
| `JWT_SECRET` | Token encryption secret | `awaaz-ai-production-secret-2026` |
