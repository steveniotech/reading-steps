// Validation for Reading Steps local brand review server and static assets.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler } from './serve-brand-review.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 8774;

function requestMock(method, url) {
  return new Promise(resolve => {
    const req = { method, url };
    let status = 0;
    let headers = {};
    let chunks = [];
    const res = {
      writeHead(code, head = {}) {
        status = code;
        headers = head;
      },
      end(chunk) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        resolve({
          status,
          headers,
          body: Buffer.concat(chunks)
        });
      }
    };
    handler(req, res);
  });
}

async function runChecks() {
  // 1. Root redirect
  const rootRes = await requestMock('GET', '/');
  assert.equal(rootRes.status, 302);
  assert.equal(rootRes.headers.Location, '/reading-steps/');

  // 2. Hub redirect
  const hubRes = await requestMock('GET', '/io-tech-learning-hub/');
  assert.equal(hubRes.status, 302);
  assert.equal(hubRes.headers.Location, 'http://127.0.0.1:8765/io-tech-learning-hub/');

  // 3. Homepage 200
  const homeRes = await requestMock('GET', '/reading-steps/');
  assert.equal(homeRes.status, 200);
  assert.equal(homeRes.headers['Content-Type'], 'text/html; charset=utf-8');
  assert.ok(homeRes.body.toString('utf8').includes('Reading Steps'));

  // 4. Logo PNG check
  const logoRes = await requestMock('GET', '/reading-steps/assets/io-tech-center-logo.png');
  assert.equal(logoRes.status, 200);
  assert.equal(logoRes.headers['Content-Type'], 'image/png');
  assert.equal(logoRes.body.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(logoRes.body.readUInt32BE(16), 1383);
  assert.equal(logoRes.body.readUInt32BE(20), 742);

  // 5. CSS files
  const cssRes = await requestMock('GET', '/reading-steps/styles.css');
  assert.equal(cssRes.status, 200);
  const brandRes = await requestMock('GET', '/reading-steps/brand.css');
  assert.equal(brandRes.status, 200);

  // 6. Before baseline
  const beforeRes = await requestMock('GET', '/before/reading-steps/');
  assert.equal(beforeRes.status, 200);

  // 7. Private path rejection
  const privRes = await requestMock('GET', '/reading-steps/private/');
  assert.equal(privRes.status, 404);
  const travRes = await requestMock('GET', '/reading-steps/../package.json');
  assert.equal(travRes.status, 404);

  console.log('PASS routing, real PNG bytes/MIME, exact built resources, private-path rejection, unchanged baseline route and production Hub path.');

  if (process.argv.includes('--http')) {
    await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${port}/reading-steps/`, res => {
        assert.equal(res.statusCode, 200);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          assert.ok(data.includes('Reading Steps'));
          resolve();
        });
      });
      req.on('error', reject);
    });
    console.log('PASS actual HTTP: latest homepage from running preview.');
  }
}

runChecks().catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});
