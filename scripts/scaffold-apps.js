// =====================================================
// Scaffold Script — Generates 3 React+Vite frontend apps
// Run: node scripts/scaffold-apps.js
// =====================================================

const fs = require('fs');
const path = require('path');

const apps = [
  { name: 'customer-app',      port: 5173, title: 'ScanGo — Self-Scan Checkout', description: 'Customer-facing scan & checkout PWA' },
  { name: 'associate-console', port: 5174, title: 'ScanGo — Associate Console',  description: 'Store associate & LP officer console' },
  { name: 'admin-portal',      port: 5175, title: 'ScanGo — Admin Portal',       description: 'Enterprise admin management portal' },
];

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const app of apps) {
  const appDir = path.join(__dirname, '..', 'apps', app.name);
  const srcDir = path.join(appDir, 'src');
  const publicDir = path.join(appDir, 'public');
  mkdirp(srcDir);
  mkdirp(publicDir);

  // package.json
  const pkg = {
    name: `@scango/${app.name}`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: `vite --port ${app.port}`,
      build: 'tsc && vite build',
      preview: 'vite preview',
      lint: 'eslint src/',
      typecheck: 'tsc --noEmit',
      test: 'vitest run',
      'test:watch': 'vitest',
      clean: 'rimraf dist'
    },
    dependencies: {
      react: '^18.3.0',
      'react-dom': '^18.3.0',
      'react-router-dom': '^6.26.0',
      '@scango/ui': '*',
      '@scango/common': '*',
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.3.0',
      typescript: '^5.5.0',
      vite: '^5.4.0',
      vitest: '^2.0.0',
      '@testing-library/react': '^16.0.0',
      '@testing-library/jest-dom': '^6.5.0',
      rimraf: '^6.0.0',
    },
  };
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // tsconfig.json
  const tsconfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      outDir: './dist',
      rootDir: './src',
      noEmit: true,
    },
    include: ['src'],
  };
  fs.writeFileSync(path.join(appDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${app.port},
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
`;
  fs.writeFileSync(path.join(appDir, 'vite.config.ts'), viteConfig);

  // index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="description" content="${app.description}" />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>${app.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, 'index.html'), indexHtml);

  // src/main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
`;
  fs.writeFileSync(path.join(srcDir, 'main.tsx'), mainTsx);

  // src/App.tsx — different content per app
  let appTsx;
  if (app.name === 'customer-app') {
    appTsx = `import { Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div className="app-container">
      <div className="hero-card">
        <div className="logo-icon">📱</div>
        <h1>ScanGo</h1>
        <p className="subtitle">Smart Self-Scanning Checkout</p>
        <p className="description">Scan items as you shop. Skip the queue. Pay & go.</p>
        <button className="cta-button" id="start-shopping-btn">
          Start Shopping
        </button>
        <p className="hint">Scan the QR code at the store entrance to begin</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
`;
  } else if (app.name === 'associate-console') {
    appTsx = `import { Routes, Route } from 'react-router-dom';

function DashboardPage() {
  return (
    <div className="app-container">
      <div className="hero-card">
        <div className="logo-icon">🛡️</div>
        <h1>ScanGo Associate Console</h1>
        <p className="subtitle">Store Operations & Loss Prevention</p>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Active Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Exceptions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Completed Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
    </Routes>
  );
}
`;
  } else {
    appTsx = `import { Routes, Route } from 'react-router-dom';

function AdminHome() {
  return (
    <div className="app-container">
      <div className="hero-card">
        <div className="logo-icon">⚙️</div>
        <h1>ScanGo Admin Portal</h1>
        <p className="subtitle">Enterprise Configuration & Analytics</p>
        <div className="nav-grid">
          <div className="nav-card">🏪 Store Config</div>
          <div className="nav-card">📦 Catalog</div>
          <div className="nav-card">🎫 Promotions</div>
          <div className="nav-card">👥 Users & Roles</div>
          <div className="nav-card">📊 Analytics</div>
          <div className="nav-card">🔍 Audit Logs</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
    </Routes>
  );
}
`;
  }
  fs.writeFileSync(path.join(srcDir, 'App.tsx'), appTsx);

  // src/index.css
  const indexCss = `/* =====================================================
   ${app.title} — Global Styles
   ===================================================== */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-bg: #f0f2f5;
  --color-card: #ffffff;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --radius: 16px;
  --shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

.app-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.hero-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-button {
  background: linear-gradient(135deg, var(--color-primary), #7c3aed);
  color: white;
  border: none;
  padding: 0.9rem 2.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 48px;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
}

.cta-button:active {
  transform: translateY(0);
}

.hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.stats-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.stat-card {
  flex: 1;
  background: var(--color-bg);
  border-radius: 12px;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.nav-card {
  background: var(--color-bg);
  border-radius: 12px;
  padding: 1.25rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-card:hover {
  border-color: var(--color-primary);
  background: rgba(79, 70, 229, 0.05);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 480px) {
  .hero-card { padding: 1.5rem; }
  h1 { font-size: 1.5rem; }
  .stats-row { flex-direction: column; }
}
`;
  fs.writeFileSync(path.join(srcDir, 'index.css'), indexCss);

  // src/vite-env.d.ts
  fs.writeFileSync(path.join(srcDir, 'vite-env.d.ts'), '/// <reference types="vite/client" />\n');

  console.log(`✅ Scaffolded ${app.name} (port ${app.port})`);
}

console.log(`\n🎉 All ${apps.length} frontend apps scaffolded!`);
