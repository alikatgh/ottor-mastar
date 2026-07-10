/**
 * Ottor Mastar — desktop shell (Windows / macOS / Linux via Electron).
 *
 * Serves the bundled static web app (desktop/app, copied from ../dist by
 * sync-app.cjs) over a loopback HTTP server and opens it in a window.
 * The server exists because the SPA uses BrowserRouter — file:// URLs would
 * break routing; http://127.0.0.1:<random port> keeps deep links working.
 * Everything is local: the app is fully usable offline.
 *
 * OM_SMOKE=1 quits right after the first successful load (CI smoke test).
 */
const { app, BrowserWindow, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'app');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

/** Static server with SPA fallback (unknown, extension-less paths → index.html). */
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        // Resolve inside APP_DIR only — no path traversal.
        let filePath = path.normalize(path.join(APP_DIR, urlPath));
        if (!filePath.startsWith(APP_DIR)) {
          res.writeHead(403).end();
          return;
        }
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        if (!fs.existsSync(filePath)) {
          // SPA fallback, mirroring public/_redirects (/* -> /index.html 200)
          filePath = path.join(APP_DIR, 'index.html');
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch {
        res.writeHead(500).end();
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function createWindow() {
  const port = await serve();
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Ottor Mastar',
    backgroundColor: '#F4F1E8',
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  win.removeMenu?.();

  // External links (Wikipedia, the website) open in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(`http://127.0.0.1:${port}`)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  if (process.env.OM_SMOKE) {
    win.webContents.once('did-finish-load', () => {
      console.log('SMOKE OK — loaded', win.webContents.getURL());
      app.quit();
    });
  }

  await win.loadURL(`http://127.0.0.1:${port}/`);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
