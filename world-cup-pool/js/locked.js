// =============================================================================
// MANUALLY CONFIRMED LOCKED POSITIONS
// =============================================================================
// Update this file whenever a team mathematically clinches their group position.
// Format: LOCKED_POSITIONS[groupLetter][teamCode] = finishPosition (1-4)
//
// Only add entries here when a position is 100% confirmed — not just leading.
// =============================================================================

const LOCKED_POSITIONS = {
  A: { MEX: 1 },           // Mexico clinched Group A 1st
  C: { HAI: 4 },           // Haiti clinched Group C 4th (eliminated)
  D: { USA: 1, TUR: 4 },   // USA clinched 1st, Turkey clinched 4th
  E: { GER: 1 },           // Germany clinched Group E 1st
  F: { TUN: 4 },           // Tunisia clinched Group F 4th (eliminated)
};
