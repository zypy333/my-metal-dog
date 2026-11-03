import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const indexPath = path.join(dist, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('未找到 dist/index.html，请先执行 expo export。');
  process.exit(1);
}

// public/ 里的 PWA 静态资源（manifest、service worker、图标）落到产物根目录
fs.cpSync(publicDir, dist, { recursive: true });

/** expo-router 中除根路由外的页面路径，刷新时需要能直接命中 SPA 外壳 */
const ROUTES = ['calendar'];

/**
 * Cloudflare Pages 会忽略路径中带 node_modules 段的文件，导致字体与图标 404。
 * 把 assets/node_modules 改名为 assets/vendor，并同步改写打包产物里的引用。
 */
const TEXT_EXT = new Set(['.js', '.css', '.html', '.json', '.webmanifest']);

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

const vendorFrom = path.join(dist, 'assets', 'node_modules');
if (fs.existsSync(vendorFrom)) {
  fs.rmSync(path.join(dist, 'assets', 'vendor'), { recursive: true, force: true });
  fs.renameSync(vendorFrom, path.join(dist, 'assets', 'vendor'));
  walk(dist, (file) => {
    if (!TEXT_EXT.has(path.extname(file))) return;
    const source = fs.readFileSync(file, 'utf8');
    const next = source.replaceAll('assets/node_modules/', 'assets/vendor/');
    if (next !== source) fs.writeFileSync(file, next, 'utf8');
  });
}

let html = fs.readFileSync(indexPath, 'utf8');

const headTags = [
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<meta name="theme-color" content="#2563EB" />',
  '<meta name="description" content="查看常去健身房的人流与温湿度，记录训练打卡日历。" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
  '<meta name="apple-mobile-web-app-title" content="撸铁雷达" />',
  '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />',
].join('\n    ');

const swScript = `<script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    </script>`;

if (!html.includes('rel="manifest"')) {
  html = html
    .replace('<html lang="en">', '<html lang="zh-CN">')
    .replace(/<title>.*?<\/title>/, '<title>撸铁雷达 · 我的健身房</title>')
    .replace('</head>', `  ${headTags}\n  </head>`)
    .replace('</body>', `  ${swScript}\n</body>`);
}

fs.writeFileSync(indexPath, html, 'utf8');

// 让 Expo Router 的其它路由（例如 /calendar）刷新后仍能拿到 SPA 外壳
for (const route of ROUTES) {
  const routeDir = path.join(dist, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');
}

console.log('PWA 资源已注入 dist/：manifest、service worker、图标、路由外壳');
