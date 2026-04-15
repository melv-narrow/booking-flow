# API Testing Guide — REM Waste Booking Flow

**Base URL:** `http://localhost:3000`  
**Start server:** `npm run dev`  
**Automated smoke test:** `npx ts-node --transpile-only lib/test-api.ts`

> All data is deterministic fixture data. No real bookings. No external calls.

---

## Fixture Postcode Reference

| Postcode | Behaviour | Notes |
|---|---|---|
| `SW1A 1AA` | 12 London addresses | Happy path fixture |
| `EC1A 1BB` | Empty address array | Tests empty state UI |
| `M1 1AE` | ~1500ms delay, 3 addresses | Tests loading state |
| `BS1 4DJ` | **500** first call, **200** on retry | Tests retry logic — counter resets on server restart |
| Any other valid UK | Empty address array | Treated as unknown |

---

## Endpoint 1 — POST /api/postcode/lookup

Validates a UK postcode, returns matching addresses.  
Postcode auto-normalises: `sw1a1aa` → `SW1A 1AA`.

### Request

```
POST /api/postcode/lookup
Content-Type: application/json
```

```json
{
  "postcode": "SW1A 1AA"
}
```

### Response shape

```json
{
  "postcode": "SW1A 1AA",
  "addresses": [
    { "id": "addr_1", "line1": "10 Downing Street", "city": "London" },
    { "id": "addr_2", "line1": "11 Downing Street", "city": "London" }
  ]
}
```

### All test cases

#### ✅ TC-P1 — Valid postcode, 12 addresses

```bash
curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"SW1A 1AA"}' | jq .
```

**Expected:** `200`, `addresses` array length = 12, `postcode` = `"SW1A 1AA"`

---

#### ✅ TC-P2 — Valid postcode, empty result

```bash
curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"EC1A 1BB"}' | jq .
```

**Expected:** `200`, `addresses: []`

---

#### ✅ TC-P3 — Latency fixture (time the response)

```bash
time curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"M1 1AE"}'
```

**Expected:** `200`, response time ≥ 1.5s, 3 Manchester addresses returned

---

#### ✅ TC-P4 — Retry fixture: first call fails

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"BS1 4DJ"}'
```

**Expected:** `500`  
**Body:** `{ "error": "Service temporarily unavailable. Please try again." }`

> ⚠ **Counter is server-side and persistent per process.** To reset, restart `npm run dev`.

---

#### ✅ TC-P5 — Retry fixture: second call succeeds

Run TC-P4 first. Then:

```bash
curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"BS1 4DJ"}' | jq .
```

**Expected:** `200`, 6 Bristol addresses

---

#### ✅ TC-P6 — Unknown valid postcode

```bash
curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"W1A 1AA"}' | jq .
```

**Expected:** `200`, `addresses: []`

---

#### ❌ TC-P7 — Invalid postcode format

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"NOTAPOSTCODE"}'
```

**Expected:** `400`  
**Body:** `{ "error": "Invalid postcode format" }`

---

#### ❌ TC-P8 — Missing postcode field

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** `400`  
**Body:** `{ "error": "Missing required field: postcode" }`

---

#### ❌ TC-P9 — Empty string postcode

```bash
curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":""}'
```

**Expected:** `400`, `{ "error": "Invalid postcode format" }`

---

#### ✅ TC-P10 — Case-insensitive input normalised

```bash
curl -s -X POST http://localhost:3000/api/postcode/lookup \
  -H "Content-Type: application/json" \
  -d '{"postcode":"sw1a 1aa"}' | jq .postcode
```

**Expected:** `"SW1A 1AA"` (normalised in response)

---

## Endpoint 2 — POST /api/waste-types

Validates waste type selection. If `plasterboard: true`, option must be provided.

### Request

```
POST /api/waste-types
Content-Type: application/json
```

```json
{
  "heavyWaste": false,
  "plasterboard": false,
  "plasterboardOption": null
}
```

### Response shape

```json
{ "ok": true }
```

### All test cases

#### ✅ TC-W1 — General waste

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":false,"plasterboard":false,"plasterboardOption":null}'
```

**Expected:** `200`, `{ "ok": true }`

---

#### ✅ TC-W2 — Heavy waste

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":true,"plasterboard":false,"plasterboardOption":null}'
```

**Expected:** `200`, `{ "ok": true }`

---

#### ✅ TC-W3 — Plasterboard with valid option: bag_it

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":false,"plasterboard":true,"plasterboardOption":"bag_it"}'
```

**Expected:** `200`, `{ "ok": true }`

---

#### ✅ TC-W4 — Plasterboard with valid option: mixed_load

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":false,"plasterboard":true,"plasterboardOption":"mixed_load"}'
```

**Expected:** `200`, `{ "ok": true }`

---

#### ✅ TC-W5 — Plasterboard with valid option: separate_collection

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":false,"plasterboard":true,"plasterboardOption":"separate_collection"}'
```

**Expected:** `200`, `{ "ok": true }`

---

#### ❌ TC-W6 — Plasterboard without option (null)

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":false,"plasterboard":true,"plasterboardOption":null}'
```

**Expected:** `400`  
**Body:** `{ "error": "plasterboardOption must be one of: bag_it, mixed_load, separate_collection" }`

---

#### ❌ TC-W7 — Plasterboard with invalid option string

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":false,"plasterboard":true,"plasterboardOption":"skip_it"}'
```

**Expected:** `400`, same error as TC-W6

---

#### ❌ TC-W8 — heavyWaste not a boolean

```bash
curl -s -X POST http://localhost:3000/api/waste-types \
  -H "Content-Type: application/json" \
  -d '{"heavyWaste":"yes","plasterboard":false,"plasterboardOption":null}'
```

**Expected:** `400`  
**Body:** `{ "error": "heavyWaste and plasterboard must be booleans" }`

---

## Endpoint 3 — GET /api/skips

Returns all 8 skip sizes. Pass `heavyWaste=true` to mark 8-yard and 10-yard as disabled.

### Request

```
GET /api/skips?postcode=SW1A1AA&heavyWaste=false
```

### Response shape

```json
{
  "skips": [
    { "size": "2-yard",  "price": 85,  "disabled": false },
    { "size": "4-yard",  "price": 120, "disabled": false },
    { "size": "6-yard",  "price": 155, "disabled": false },
    { "size": "8-yard",  "price": 195, "disabled": false },
    { "size": "10-yard", "price": 230, "disabled": false },
    { "size": "12-yard", "price": 265, "disabled": false },
    { "size": "14-yard", "price": 305, "disabled": false },
    { "size": "16-yard", "price": 345, "disabled": false }
  ]
}
```

### All test cases

#### ✅ TC-S1 — General waste: all 8 enabled

```bash
curl -s "http://localhost:3000/api/skips?postcode=SW1A1AA&heavyWaste=false" | jq .
```

**Expected:** `200`, 8 skips, all `disabled: false`

---

#### ✅ TC-S2 — Heavy waste: 8-yard and 10-yard disabled

```bash
curl -s "http://localhost:3000/api/skips?postcode=SW1A1AA&heavyWaste=true" | jq '.skips[] | select(.disabled)'
```

**Expected:** `200`; exactly 2 skips with `disabled: true` — sizes `8-yard` and `10-yard`

---

#### ✅ TC-S3 — No query params (defaults to general waste)

```bash
curl -s "http://localhost:3000/api/skips" | jq '.skips | length'
```

**Expected:** `200`, `8` skips, none disabled

---

#### ✅ TC-S4 — Verify all prices match fixture

```bash
curl -s "http://localhost:3000/api/skips" | jq '[.skips[] | {size, price}]'
```

**Expected prices:**

| Size | Price (£) |
|---|---|
| 2-yard | 85 |
| 4-yard | 120 |
| 6-yard | 155 |
| 8-yard | 195 |
| 10-yard | 230 |
| 12-yard | 265 |
| 14-yard | 305 |
| 16-yard | 345 |

---

#### ✅ TC-S5 — Disabled skips still appear in response

```bash
curl -s "http://localhost:3000/api/skips?heavyWaste=true" | jq '.skips | length'
```

**Expected:** `8` (not 6 — disabled skips must not be removed from response)

---

## Endpoint 4 — POST /api/booking/confirm

Validates full booking payload. Returns deterministic `BK-XXXXX` ID.

> **Deterministic IDs:** same `postcode` + `skipSize` + `price` always returns same `bookingId`. Ensures Playwright tests are stable across runs.

### Request

```
POST /api/booking/confirm
Content-Type: application/json
```

```json
{
  "postcode": "SW1A 1AA",
  "addressId": "addr_1",
  "heavyWaste": false,
  "plasterboard": false,
  "plasterboardOption": null,
  "skipSize": "4-yard",
  "price": 120
}
```

### Response shape

```json
{
  "status": "success",
  "bookingId": "BK-74231"
}
```

### All test cases

#### ✅ TC-B1 — General waste booking

```bash
curl -s -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "SW1A 1AA",
    "addressId": "addr_1",
    "heavyWaste": false,
    "plasterboard": false,
    "plasterboardOption": null,
    "skipSize": "4-yard",
    "price": 120
  }' | jq .
```

**Expected:** `200`, `status: "success"`, `bookingId` matches `/^BK-\d{5}$/`

---

#### ✅ TC-B2 — Deterministic ID: same inputs → same ID

Run TC-B1 twice. Compare `bookingId` values.

**Expected:** Both calls return identical `bookingId`.

---

#### ✅ TC-B3 — Heavy waste booking

```bash
curl -s -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "SW1A 1AA",
    "addressId": "addr_1",
    "heavyWaste": true,
    "plasterboard": false,
    "plasterboardOption": null,
    "skipSize": "12-yard",
    "price": 265
  }' | jq .
```

**Expected:** `200`, `status: "success"`, different `bookingId` from TC-B1

---

#### ✅ TC-B4 — Plasterboard booking

```bash
curl -s -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "SW1A 1AA",
    "addressId": "addr_1",
    "heavyWaste": false,
    "plasterboard": true,
    "plasterboardOption": "bag_it",
    "skipSize": "6-yard",
    "price": 155
  }' | jq .
```

**Expected:** `200`, `status: "success"`

---

#### ✅ TC-B5 — Manual address booking (no addressId)

```bash
curl -s -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "EC1A 1BB",
    "manualAddress": "Flat 2, 10 High Street, London",
    "heavyWaste": false,
    "plasterboard": false,
    "plasterboardOption": null,
    "skipSize": "2-yard",
    "price": 85
  }' | jq .
```

**Expected:** `200`, `status: "success"`

---

#### ❌ TC-B6 — Missing required fields

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{"postcode":"SW1A 1AA"}'
```

**Expected:** `400`  
**Body:** `{ "error": "Missing required fields: heavyWaste, plasterboard, skipSize, price, addressId or manualAddress" }`

---

#### ❌ TC-B7 — No address provided (no addressId, no manualAddress)

```bash
curl -s -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "SW1A 1AA",
    "heavyWaste": false,
    "plasterboard": false,
    "skipSize": "4-yard",
    "price": 120
  }'
```

**Expected:** `400`  
**Body contains:** `addressId or manualAddress`

---

#### ❌ TC-B8 — Empty body

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** `400`

---

## Postman / Insomnia Setup

Import `docs/api-spec.yaml` directly:

- **Postman:** Import → OpenAPI → select `docs/api-spec.yaml`
- **Insomnia:** Import → From File → select `docs/api-spec.yaml`

All requests and example bodies will be pre-populated.

---

## Running the Automated Smoke Test

Runs all 13 assertions against live server in ~5s:

```bash
# Server must be running first
npm run dev

# In a second terminal
npx ts-node --transpile-only lib/test-api.ts
```

Expected output:
```
─── API Smoke Test Results ───────────────────────────
✅  Postcode SW1A 1AA → 12 addresses
✅  Postcode EC1A 1BB → empty addresses
✅  Postcode M1 1AE → responds (latency test)
✅  Postcode BS1 4DJ → 500 on first call
✅  Postcode BS1 4DJ → success on retry
✅  Invalid postcode format → 400
✅  General waste → ok: true
✅  Plasterboard with valid option → ok: true
✅  Plasterboard without option → 400
✅  GET skips general waste → 8 skips, none disabled
✅  GET skips heavy waste → 2 disabled
✅  Confirm booking → success + deterministic ID
✅  Confirm booking missing fields → 400

13/13 passed
```

> ⚠ Run smoke test once per server session. BS1 4DJ retry counter resets on server restart. Running twice without restart means TC-P4 (500 test) will fail.
