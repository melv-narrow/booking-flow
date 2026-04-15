// UK postcode regex — covers formats like SW1A 1AA, M1 1AE, BS1 4DJ, EC1A 1BB
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

/**
 * Returns the postcode normalised to uppercase with a single space in the
 * correct position, or null if the format is invalid.
 */
export function normalisePostcode(raw: string): string | null {
  const stripped = raw.replace(/\s+/g, '').toUpperCase();

  if (!UK_POSTCODE_REGEX.test(raw.trim())) return null;

  // Insert space before the last 3 characters (inward code)
  const inward = stripped.slice(-3);
  const outward = stripped.slice(0, -3);
  return `${outward} ${inward}`;
}

export function isValidUKPostcode(raw: string): boolean {
  return normalisePostcode(raw) !== null;
}
