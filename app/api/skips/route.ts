import { NextRequest, NextResponse } from 'next/server';
import { ALL_SKIPS, HEAVY_WASTE_DISABLED_SIZES } from '@/lib/fixtures';
import type { Skip } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const heavyWasteParam = searchParams.get('heavyWaste');
  const heavyWaste = heavyWasteParam === 'true';

  const skips: Skip[] = ALL_SKIPS.map((skip) => ({
    ...skip,
    disabled: heavyWaste ? HEAVY_WASTE_DISABLED_SIZES.has(skip.size) : false,
  }));

  return NextResponse.json({ skips });
}
