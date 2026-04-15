import { NextRequest, NextResponse } from 'next/server';
import {
  SW1A_1AA_ADDRESSES,
  EC1A_1BB_ADDRESSES,
  BS1_4DJ_ADDRESSES,
  shouldFailBs1,
} from '@/lib/fixtures';
import { normalisePostcode } from '@/lib/validators';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('postcode' in body) ||
    typeof (body as Record<string, unknown>).postcode !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Missing required field: postcode' },
      { status: 400 }
    );
  }

  const raw = ((body as Record<string, unknown>).postcode as string).trim();
  const postcode = normalisePostcode(raw);

  if (!postcode) {
    return NextResponse.json(
      { error: 'Invalid postcode format' },
      { status: 400 }
    );
  }

  // Fixture: M1 1AE — simulated 1500ms latency
  if (postcode === 'M1 1AE') {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return NextResponse.json({
      postcode,
      addresses: [
        { id: 'm1_addr_1', line1: '1 Piccadilly Gardens', city: 'Manchester' },
        { id: 'm1_addr_2', line1: '5 Market Street', city: 'Manchester' },
        { id: 'm1_addr_3', line1: '10 Oldham Street', city: 'Manchester' },
      ],
    });
  }

  // Fixture: BS1 4DJ — 500 on first call, success on retry
  if (postcode === 'BS1 4DJ') {
    const fail = shouldFailBs1();
    if (fail) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ postcode, addresses: BS1_4DJ_ADDRESSES });
  }

  // Fixture: EC1A 1BB — empty addresses
  if (postcode === 'EC1A 1BB') {
    return NextResponse.json({ postcode, addresses: EC1A_1BB_ADDRESSES });
  }

  // Fixture: SW1A 1AA — 12 real-sounding London addresses
  if (postcode === 'SW1A 1AA') {
    return NextResponse.json({ postcode, addresses: SW1A_1AA_ADDRESSES });
  }

  // Unknown postcode — valid format, zero results
  return NextResponse.json({ postcode, addresses: [] });
}
