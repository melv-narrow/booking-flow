// Test data fixtures for E2E tests
// All test data centralized here - no hardcoded strings in spec files

export const POSTCODES = {
  VALID_WITH_ADDRESSES: 'SW1A 1AA',
  VALID_NO_ADDRESSES: 'EC1A 1BB',
  LATENCY_TEST: 'M1 1AE',
  RETRY_TEST: 'BS1 4DJ',
} as const;

export const EXPECTED_VALUES = {
  MIN_ADDRESSES_FOR_VALID: 12,
  BOOKING_ID_PATTERN: /^BK-/,
  MIN_DISABLED_SKIPS_HEAVY_WASTE: 2,
  TOTAL_SKIP_COUNT: 8,
} as const;

export const SKIP_SIZES = {
  FOUR_YARD: '4-yard',
  SIX_YARD: '6-yard',
  EIGHT_YARD: '8-yard',
} as const;

export const WASTE_TYPES = {
  GENERAL: 'general',
  HEAVY: 'heavy',
  PLASTERBOARD: 'plasterboard',
} as const;
