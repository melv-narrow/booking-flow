/**
 * API smoke-test script — development tool only.
 * Run with: npx ts-node --project tsconfig.json lib/test-api.ts
 *
 * Requires the dev server to be running on http://localhost:3000
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE = 'http://localhost:3000';

type Result = { pass: boolean; name: string; detail?: string };

async function run(name: string, fn: () => Promise<void>): Promise<Result> {
  try {
    await fn();
    return { pass: true, name };
  } catch (err) {
    return { pass: false, name, detail: String(err) };
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function json(res: Response): Promise<any> {
  return res.json();
}

async function main() {
  const results: Result[] = [];

  // ── POST /api/postcode/lookup ──────────────────────────────────────────────

  results.push(await run('Postcode SW1A 1AA → 12 addresses', async () => {
    const res = await fetch(`${BASE}/api/postcode/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'SW1A 1AA' }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    assert(data.postcode === 'SW1A 1AA', 'postcode mismatch');
    assert(Array.isArray(data.addresses) && data.addresses.length >= 12, `Expected ≥12 addresses, got ${data.addresses?.length}`);
  }));

  results.push(await run('Postcode EC1A 1BB → empty addresses', async () => {
    const res = await fetch(`${BASE}/api/postcode/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'EC1A 1BB' }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    assert(Array.isArray(data.addresses) && data.addresses.length === 0, 'Expected empty addresses array');
  }));

  results.push(await run('Postcode M1 1AE → responds (latency test)', async () => {
    const start = Date.now();
    const res = await fetch(`${BASE}/api/postcode/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'M1 1AE' }),
    });
    const elapsed = Date.now() - start;
    assert(res.ok, `Expected 200, got ${res.status}`);
    assert(elapsed >= 1400, `Expected ≥1500ms latency, got ${elapsed}ms`);
  }));

  results.push(await run('Postcode BS1 4DJ → 500 on first call', async () => {
    const res = await fetch(`${BASE}/api/postcode/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'BS1 4DJ' }),
    });
    assert(res.status === 500, `Expected 500, got ${res.status}`);
  }));

  results.push(await run('Postcode BS1 4DJ → success on retry', async () => {
    const res = await fetch(`${BASE}/api/postcode/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'BS1 4DJ' }),
    });
    assert(res.ok, `Expected 200 on retry, got ${res.status}`);
    const data = await json(res);
    assert(Array.isArray(data.addresses) && data.addresses.length > 0, 'Expected addresses on retry');
  }));

  results.push(await run('Invalid postcode format → 400', async () => {
    const res = await fetch(`${BASE}/api/postcode/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'NOT-A-POSTCODE' }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  }));

  // ── POST /api/waste-types ──────────────────────────────────────────────────

  results.push(await run('General waste → ok: true', async () => {
    const res = await fetch(`${BASE}/api/waste-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heavyWaste: false, plasterboard: false, plasterboardOption: null }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    assert(data.ok === true, 'Expected ok: true');
  }));

  results.push(await run('Plasterboard with valid option → ok: true', async () => {
    const res = await fetch(`${BASE}/api/waste-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heavyWaste: false, plasterboard: true, plasterboardOption: 'bag_it' }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    assert(data.ok === true, 'Expected ok: true');
  }));

  results.push(await run('Plasterboard without option → 400', async () => {
    const res = await fetch(`${BASE}/api/waste-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heavyWaste: false, plasterboard: true, plasterboardOption: null }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  }));

  // ── GET /api/skips ─────────────────────────────────────────────────────────

  results.push(await run('GET skips general waste → 8 skips, none disabled', async () => {
    const res = await fetch(`${BASE}/api/skips?postcode=SW1A1AA&heavyWaste=false`);
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    assert(data.skips.length === 8, `Expected 8 skips, got ${data.skips.length}`);
    const disabledCount = data.skips.filter((s: any) => s.disabled).length;
    assert(disabledCount === 0, `Expected 0 disabled, got ${disabledCount}`);
  }));

  results.push(await run('GET skips heavy waste → 2 disabled', async () => {
    const res = await fetch(`${BASE}/api/skips?postcode=SW1A1AA&heavyWaste=true`);
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    const disabledCount = data.skips.filter((s: any) => s.disabled).length;
    assert(disabledCount >= 2, `Expected ≥2 disabled, got ${disabledCount}`);
  }));

  // ── POST /api/booking/confirm ──────────────────────────────────────────────

  results.push(await run('Confirm booking → success + deterministic ID', async () => {
    const payload = {
      postcode: 'SW1A 1AA',
      addressId: 'addr_1',
      heavyWaste: false,
      plasterboard: false,
      skipSize: '4-yard',
      price: 120,
    };
    const res = await fetch(`${BASE}/api/booking/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const data = await json(res);
    assert(data.status === 'success', `Expected status: success, got ${data.status}`);
    assert(typeof data.bookingId === 'string' && data.bookingId.startsWith('BK-'), `Expected BK- prefix, got ${data.bookingId}`);

    // Same payload must return same ID
    const res2 = await fetch(`${BASE}/api/booking/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data2 = await json(res2);
    assert(data2.bookingId === data.bookingId, `ID not deterministic: ${data.bookingId} vs ${data2.bookingId}`);
  }));

  results.push(await run('Confirm booking missing fields → 400', async () => {
    const res = await fetch(`${BASE}/api/booking/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode: 'SW1A 1AA' }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  }));

  // ── Summary ────────────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);

  console.log('\n─── API Smoke Test Results ───────────────────────────');
  for (const r of results) {
    const icon = r.pass ? '✅' : '❌';
    console.log(`${icon}  ${r.name}`);
    if (!r.pass && r.detail) console.log(`     ${r.detail}`);
  }
  console.log(`\n${passed}/${results.length} passed`);

  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
