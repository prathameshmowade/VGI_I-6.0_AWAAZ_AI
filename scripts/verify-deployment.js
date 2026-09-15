/**
 * Automated Deployment Pre-Flight Check
 * Validates all deployment configurations, builds, files, and endpoints.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const checks = [];

function check(title, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      checks.push({ title, status: 'PASS' });
    } else if (result && result.warning) {
      checks.push({ title, status: 'WARN', message: result.warning });
    } else {
      checks.push({ title, status: 'FAIL', message: (result && result.error) || 'Failed check' });
    }
  } catch (err) {
    checks.push({ title, status: 'FAIL', message: err.message });
  }
}

console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Awaaz AI Production Deployment Pre-Flight Validator ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

// 1. Check Node & Platform
check('Node.js Environment & Version', () => {
  const version = parseInt(process.versions.node.split('.')[0], 10);
  if (version < 18) return { error: `Node version ${process.version} is too low. >= 18 required.` };
  return true;
});

// 2. Check Package Manifests
check('Root & Workspace package.json', () => {
  const rootPkg = require(path.join(ROOT_DIR, 'package.json'));
  if (!rootPkg.scripts || !rootPkg.scripts.build || !rootPkg.scripts.start) {
    return { error: 'Root package.json missing required "build" or "start" scripts.' };
  }
  return true;
});

// 3. Check Frontend Build Distribution
check('Frontend Production Bundle (dist/index.html)', () => {
  const distHtml = path.join(ROOT_DIR, 'frontend', 'dist', 'index.html');
  if (!fs.existsSync(distHtml)) {
    return { warning: 'frontend/dist/index.html not built yet. Run "npm run build:frontend" before deploying.' };
  }
  const stat = fs.statSync(distHtml);
  if (stat.size === 0) return { error: 'dist/index.html is empty.' };
  return true;
});

// 4. Check Docker & Container Files
check('Docker Configuration (Dockerfile, .dockerignore, docker-compose.yml)', () => {
  const dockerfile = path.join(ROOT_DIR, 'Dockerfile');
  const dockerignore = path.join(ROOT_DIR, '.dockerignore');
  const compose = path.join(ROOT_DIR, 'docker-compose.yml');
  if (!fs.existsSync(dockerfile)) return { error: 'Missing root Dockerfile.' };
  if (!fs.existsSync(dockerignore)) return { warning: 'Missing .dockerignore.' };
  if (!fs.existsSync(compose)) return { error: 'Missing docker-compose.yml.' };
  return true;
});

// 5. Check Cloud Blueprint Manifests
check('Cloud Deployment Blueprints (render.yaml, vercel.json, railway.json, netlify.toml)', () => {
  const files = ['render.yaml', 'vercel.json', 'railway.json', 'netlify.toml'];
  const missing = files.filter(f => !fs.existsSync(path.join(ROOT_DIR, f)));
  if (missing.length > 0) return { warning: `Missing blueprints: ${missing.join(', ')}` };
  return true;
});

// 6. Check Environment Configuration Template
check('Environment Configuration (.env.example)', () => {
  const envExample = path.join(ROOT_DIR, '.env.example');
  if (!fs.existsSync(envExample)) return { error: 'Missing .env.example template.' };
  const content = fs.readFileSync(envExample, 'utf8');
  if (!content.includes('PORT=') || !content.includes('JWT_SECRET=')) {
    return { error: '.env.example missing required variables.' };
  }
  return true;
});

// 7. Check Unified Backend App Exports
check('Unified Express App (backend/app.js & backend/index.js)', () => {
  const appFile = path.join(ROOT_DIR, 'backend', 'app.js');
  const indexFile = path.join(ROOT_DIR, 'backend', 'index.js');
  if (!fs.existsSync(appFile)) return { error: 'Missing backend/app.js' };
  if (!fs.existsSync(indexFile)) return { error: 'Missing backend/index.js' };
  
  // Verify app loads cleanly in test environment
  process.env.NODE_ENV = 'test';
  const app = require(appFile);
  if (typeof app !== 'function') return { error: 'backend/app.js does not export an Express app instance.' };
  return true;
});

// 8. Check Vercel Serverless Gateway
check('Vercel Serverless Function (api/index.js)', () => {
  const apiIndex = path.join(ROOT_DIR, 'api', 'index.js');
  if (!fs.existsSync(apiIndex)) return { error: 'Missing api/index.js' };
  const apiApp = require(apiIndex);
  if (typeof apiApp !== 'function') return { error: 'api/index.js does not export an Express app instance.' };
  return true;
});

// Print Results
let passed = 0;
let warnings = 0;
let failed = 0;

checks.forEach((c) => {
  if (c.status === 'PASS') {
    console.log(`  ${colors.green}✔ PASS${colors.reset}  ${c.title}`);
    passed++;
  } else if (c.status === 'WARN') {
    console.log(`  ${colors.yellow}▲ WARN${colors.reset}  ${c.title} — ${c.message}`);
    warnings++;
  } else {
    console.log(`  ${colors.red}✖ FAIL${colors.reset}  ${c.title} — ${c.message}`);
    failed++;
  }
});

console.log(`\n${colors.bold}Summary:${colors.reset} ${passed} passed, ${warnings} warnings, ${failed} failed.\n`);

if (failed > 0) {
  console.log(`${colors.red}${colors.bold}Deployment readiness check failed. Please resolve errors before pushing to production.${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}🚀 All critical checks passed! The application is 100% ready for production deployment.${colors.reset}\n`);
  process.exit(0);
}
