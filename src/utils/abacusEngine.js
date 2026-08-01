// Pure functions for soroban abacus state. No React here — keeps the
// math testable and reusable by the Flash Anzan / practice generator later.

export const EARTH_BEADS_PER_ROD = 4;

/**
 * Create a blank rod state.
 */
export function emptyRod() {
  return { heaven: 0, earth: 0 }; // heaven: 0|1, earth: 0-4
}

export function emptyRods(count) {
  return Array.from({ length: count }, emptyRod);
}

/**
 * Compute the numeric value represented by the rods.
 * Rods are stored left-to-right (most significant first).
 */
export function computeValue(rods) {
  const n = rods.length;
  let value = 0;
  for (let i = 0; i < n; i++) {
    const place = n - 1 - i;
    const digit = rods[i].heaven * 5 + rods[i].earth;
    value += digit * Math.pow(10, place);
  }
  return value;
}

/**
 * Set a specific rod to represent a single digit 0-9 (used by
 * "show number" validation / demo animations).
 */
export function digitToRod(digit) {
  const d = Math.max(0, Math.min(9, digit));
  return { heaven: d >= 5 ? 1 : 0, earth: d >= 5 ? d - 5 : d };
}

/**
 * Convert a non-negative integer into a full rod array, right-aligned,
 * clipped/padded to rodCount rods.
 */
export function valueToRods(value, rodCount) {
  const digits = Math.abs(Math.trunc(value)).toString().padStart(rodCount, '0').split('');
  const trimmed = digits.slice(-rodCount);
  return trimmed.map((d) => digitToRod(Number(d)));
}

/**
 * Given the current earth-bead count and the slot index the user
 * interacted with (0 = nearest the reckoning bar), return the new count.
 * Clicking/dragging to an already-active slot retracts to that slot;
 * clicking an inactive slot extends up to and including it.
 */
export function nextEarthCount(currentCount, slotIndex) {
  const clamped = Math.max(0, Math.min(EARTH_BEADS_PER_ROD - 1, slotIndex));
  return clamped < currentCount ? clamped : clamped + 1;
}

export function clampRodCount(n) {
  return Math.max(3, Math.min(15, n));
}
