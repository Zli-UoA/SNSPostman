const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const os = require('os');
const path = require('path');
const { PassThrough } = require('stream');

const bundle = path.resolve(process.cwd(), 'dist/main.js');
const originalDirectory = process.cwd();
const originalRequest = http.request;
const originalLog = console.log;
const secret = 'local-bundle-test-secret';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'welcome-bundle-'));
let authRequests = 0;
let port;

function mockSlackRequest(options, callback) {
  assert.ok(/(?:auth\.test|users\.info)(?:\?|$)/.test(options.path));
  authRequests += 1;
  const request = new PassThrough();
  const headers = { ...options.headers };
  request.setHeader = (name, value) => { headers[name] = value; };
  request.getHeader = name => headers[name];
  request.removeHeader = name => { delete headers[name]; };
  request.setTimeout = () => request;
  request.abort = () => request.destroy();
  if (callback) request.on('response', callback);
  request.on('finish', () => {
    const response = new PassThrough();
    response.statusCode = 200;
    response.headers = { 'content-type': 'application/json' };
    response.req = request;
    request.emit('response', response);
    response.end(JSON.stringify({
      ok: true, team_id: 'TLOCAL', user_id: 'ULOCAL', bot_id: 'BLOCAL',
      user: { id: 'ULOCAL', profile: { bot_id: 'BLOCAL' } }, team: 'local-team', url: 'https://local.invalid/',
    }));
  });
  return request;
}

function post(body, signature) {
  return new Promise((resolve, reject) => {
    const request = originalRequest({
      hostname: '127.0.0.1', port, path: '/slack/events', method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-slack-request-timestamp': timestamp,
        'x-slack-signature': signature,
      },
    }, response => {
      let text = '';
      response.on('data', chunk => { text += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, text }));
    });
    request.on('error', reject);
    request.end(body);
  });
}

const timestamp = String(Math.floor(Date.now() / 1000));
const timeout = setTimeout(() => { console.error('Bundle startup timed out'); process.exit(1); }, 10000);
console.log = (...args) => {
  originalLog(...args);
  if (!args.some(value => String(value).includes('Running Slack Bot'))) return;
  (async () => {
    const body = JSON.stringify({ type: 'url_verification', challenge: 'local-challenge' });
    const signature = 'v0=' + crypto.createHmac('sha256', secret).update('v0:' + timestamp + ':' + body).digest('hex');
    const valid = await post(body, signature);
    assert.strictEqual(valid.status, 200);
    assert.deepStrictEqual(JSON.parse(valid.text), { challenge: 'local-challenge' });
    assert.strictEqual((await post(body + ' ', signature)).status, 500);
    assert.ok(authRequests > 0);
    clearTimeout(timeout);
    process.chdir(originalDirectory);
    fs.unlinkSync(path.join(directory, 'dm_template.txt')); fs.unlinkSync(path.join(directory, 'join_log.txt')); fs.rmdirSync(directory);
    originalLog('Bundled bot startup, signed challenge, and tamper rejection passed');
    process.exit(0);
  })().catch(error => { console.error(error); process.exit(1); });
};

(async () => {
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  fs.writeFileSync(path.join(directory, 'dm_template.txt'), 'hello username');
  fs.writeFileSync(path.join(directory, 'join_log.txt'), 'joined username');
  process.chdir(directory);
  process.env.SLACK_BOT_TOKEN = 'xoxb-local-only';
  process.env.SLACK_SIGNING_SECRET = secret;
  process.env.PORT = String(port);
  process.env.NODE_ENV = 'test';
  http.request = mockSlackRequest;
  https.request = mockSlackRequest;
  require(bundle);
})().catch(error => { console.error(error); process.exit(1); });
