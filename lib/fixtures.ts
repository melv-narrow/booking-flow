import type { Address, Skip } from './types';

// ------------------------------------------------------------
// Addresses
// ------------------------------------------------------------

export const SW1A_1AA_ADDRESSES: Address[] = [
  { id: 'addr_1', line1: '10 Downing Street', city: 'London' },
  { id: 'addr_2', line1: '11 Downing Street', city: 'London' },
  { id: 'addr_3', line1: '12 Downing Street', city: 'London' },
  { id: 'addr_4', line1: '1 Horse Guards Road', city: 'London' },
  { id: 'addr_5', line1: '2 Horse Guards Road', city: 'London' },
  { id: 'addr_6', line1: '70 Whitehall', city: 'London' },
  { id: 'addr_7', line1: '72 Whitehall', city: 'London' },
  { id: 'addr_8', line1: '1 Parliament Street', city: 'London' },
  { id: 'addr_9', line1: '3 Parliament Street', city: 'London' },
  { id: 'addr_10', line1: '5 King Charles Street', city: 'London' },
  { id: 'addr_11', line1: '10 Great George Street', city: 'London' },
  { id: 'addr_12', line1: '15 Storey Gate', city: 'London' },
];

export const EC1A_1BB_ADDRESSES: Address[] = []; // empty state fixture

// ------------------------------------------------------------
// Skips — 8 total; 2 disabled when heavyWaste=true
// Heavy-waste-disabled sizes: 8-yard, 10-yard
// ------------------------------------------------------------

export const ALL_SKIPS: Skip[] = [
  { size: '2-yard',  price: 85,  disabled: false },
  { size: '4-yard',  price: 120, disabled: false },
  { size: '6-yard',  price: 155, disabled: false },
  { size: '8-yard',  price: 195, disabled: false },
  { size: '10-yard', price: 230, disabled: false },
  { size: '12-yard', price: 265, disabled: false },
  { size: '14-yard', price: 305, disabled: false },
  { size: '16-yard', price: 345, disabled: false },
];

// Sizes not suitable for heavy waste (dense materials exceed weight limits)
export const HEAVY_WASTE_DISABLED_SIZES = new Set(['8-yard', '10-yard']);

// ------------------------------------------------------------
// Plasterboard options
// ------------------------------------------------------------

export const VALID_PLASTERBOARD_OPTIONS = [
  'bag_it',
  'mixed_load',
  'separate_collection',
] as const;

// ------------------------------------------------------------
// BS1 4DJ retry counter
// Server-side Map — resets on server restart, which is correct
// behaviour for this fixture (first call fails, retry succeeds).
// ------------------------------------------------------------

export const bs1RetryCount = new Map<string, number>();
const BS1_KEY = 'BS1 4DJ';

export function shouldFailBs1(): boolean {
  const count = bs1RetryCount.get(BS1_KEY) ?? 0;
  bs1RetryCount.set(BS1_KEY, count + 1);
  // Fail on the FIRST call (count === 0 before increment means count was 0)
  return count === 0;
}

export function resetBs1RetryCount(): void {
  bs1RetryCount.delete(BS1_KEY);
}

// ------------------------------------------------------------
// BS1 4DJ success addresses (returned on retry)
// ------------------------------------------------------------

export const BS1_4DJ_ADDRESSES: Address[] = [
  { id: 'bs1_addr_1', line1: '1 Corn Street', city: 'Bristol' },
  { id: 'bs1_addr_2', line1: '14 Small Street', city: 'Bristol' },
  { id: 'bs1_addr_3', line1: '7 Wine Street', city: 'Bristol' },
  { id: 'bs1_addr_4', line1: '20 Broad Street', city: 'Bristol' },
  { id: 'bs1_addr_5', line1: '3 St Nicholas Street', city: 'Bristol' },
  { id: 'bs1_addr_6', line1: '5 Baldwin Street', city: 'Bristol' },
];
