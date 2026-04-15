import { NextRequest, NextResponse } from 'next/server';

interface ConfirmBody {
  postcode?: unknown;
  addressId?: unknown;
  manualAddress?: unknown;
  heavyWaste?: unknown;
  plasterboard?: unknown;
  plasterboardOption?: unknown;
  skipSize?: unknown;
  price?: unknown;
}

/**
 * Generates a deterministic booking ID from input so tests aren't flaky.
 * Uses a simple hash of the key booking fields — not cryptographic, just stable.
 */
function deterministicBookingId(postcode: string, skipSize: string, price: number): string {
  const raw = `${postcode}-${skipSize}-${price}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  // Produce a 5-digit positive number
  const id = Math.abs(hash) % 90000 + 10000;
  return `BK-${id}`;
}

export async function POST(request: NextRequest) {
  let body: ConfirmBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { postcode, heavyWaste, plasterboard, skipSize, price } = body;

  // Required fields check
  const missing: string[] = [];
  if (typeof postcode !== 'string' || !postcode) missing.push('postcode');
  if (typeof heavyWaste !== 'boolean') missing.push('heavyWaste');
  if (typeof plasterboard !== 'boolean') missing.push('plasterboard');
  if (typeof skipSize !== 'string' || !skipSize) missing.push('skipSize');
  if (typeof price !== 'number') missing.push('price');

  // address: one of addressId or manualAddress must be present
  const { addressId, manualAddress } = body;
  if (!addressId && !manualAddress) missing.push('addressId or manualAddress');

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  const bookingId = deterministicBookingId(
    postcode as string,
    skipSize as string,
    price as number
  );

  return NextResponse.json({ status: 'success', bookingId });
}
