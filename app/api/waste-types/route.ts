import { NextRequest, NextResponse } from 'next/server';
import { VALID_PLASTERBOARD_OPTIONS } from '@/lib/fixtures';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    heavyWaste,
    plasterboard,
    plasterboardOption,
  } = body as Record<string, unknown>;

  if (typeof heavyWaste !== 'boolean' || typeof plasterboard !== 'boolean') {
    return NextResponse.json(
      { error: 'heavyWaste and plasterboard must be booleans' },
      { status: 400 }
    );
  }

  if (plasterboard) {
    if (
      typeof plasterboardOption !== 'string' ||
      !(VALID_PLASTERBOARD_OPTIONS as readonly string[]).includes(plasterboardOption)
    ) {
      return NextResponse.json(
        {
          error: `plasterboardOption must be one of: ${VALID_PLASTERBOARD_OPTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
