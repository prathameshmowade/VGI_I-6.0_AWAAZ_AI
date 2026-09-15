# Multi-Stage Production Dockerfile for Awaaz AI Gateway & Workers
FROM node:20-alpine AS base

WORKDIR /app

# Install system dependencies for native builds
RUN apk add --no-cache curl python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "index.js"]
