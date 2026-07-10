/**
 * sync-app.cjs — copy the built web app (../dist) into desktop/app so the
 * Electron bundle is self-contained and fully offline. Builds the web app
 * first if dist/ is missing. Re-runnable; app/ is gitignored.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const dest = path.join(__dirname, 'app');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.log('dist/ missing — building the web app first…');
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(dist, dest, { recursive: true });
const count = fs.readdirSync(dest).length;
console.log(`synced dist/ -> desktop/app (${count} top-level entries)`);
