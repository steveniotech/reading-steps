// Local-only, exact public asset allowlist for Reading Steps.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = '/reading-steps/';
const beforeBase = '/before/reading-steps/';
const files = new Map([
  ['index.html', 'text/html; charset=utf-8'],
  ['styles.css', 'text/css; charset=utf-8'],
  ['brand.css', 'text/css; charset=utf-8'],
  ['assets/io-tech-center-logo.png', 'image/png'],
  ['lessons.js', 'text/javascript; charset=utf-8'],
  ['rewards.js', 'text/javascript; charset=utf-8'],
  ['reading-records.js', 'text/javascript; charset=utf-8'],
  ['practice-completion.js', 'text/javascript; charset=utf-8'],
  ['app.js', 'text/javascript; charset=utf-8']
]);

export function handler(req, res) {
  const send = (status, body, headers = {}) => {
    res.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      ...headers
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    return send(405, 'Method not allowed', { 'Allow': 'GET, HEAD' });
  }

  const pathname = req.url.split('?')[0];
  if (pathname === '/') return send(302, '', { 'Location': base });
  if (pathname === '/io-tech-learning-hub/') {
    return send(302, '', { 'Location': 'http://127.0.0.1:8765/io-tech-learning-hub/' });
  }

  const before = pathname.startsWith(beforeBase);
  const prefix = before ? beforeBase : base;
  if (!pathname.startsWith(prefix)) return send(404, 'Not found');

  const name = pathname.slice(prefix.length) || 'index.html';
  if (!files.has(name)) return send(404, 'Not found');

  const filename = path.join(
    root,
    before && ['index.html', 'styles.css'].includes(name) ? '.local/brand-review/before' : '',
    name
  );

  try {
    const stat = fs.lstatSync(filename);
    if (!stat.isFile() || stat.isSymbolicLink()) return send(404, 'Not found');
    const data = fs.readFileSync(filename);
    return send(200, data, { 'Content-Type': files.get(name), 'Content-Length': data.length });
  } catch {
    return send(404, 'Not found');
  }
}

export const createPreviewServer = () => http.createServer(handler);

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createPreviewServer();
  server.on('error', e => {
    console.error('Preview startup failed: ' + e.code);
    process.exitCode = 1;
  });
  server.listen(8774, '127.0.0.1', () =>
    console.log('Reading Steps brand preview: http://127.0.0.1:8774/reading-steps/')
  );
}
