// =============================================================================
// MANUALLY CONFIRMED LOCKED POSITIONS
// =============================================================================
// Update this file whenever a team mathematically clinches their group position.
// Format: LOCKED_POSITIONS[groupLetter][teamCode] = finishPosition (1-4)
//
// Only add entries here when a position is 100% confirmed — not just leading.
// =============================================================================

const LOCKED_POSITIONS = {
  A: { MEX: 1 },                // Mexico clinched Group A 1st
  B: { SUI: 1, CAN: 2, BIH: 3, QAT: 4 }, // Group B final standings
  C: { BRA: 1, MAR: 2, SCO: 3, HAI: 4 }, // Group C final standings
  D: { USA: 1, TUR: 4 },        // USA clinched 1st, Turkey clinched 4th
  E: { GER: 1 },                // Germany clinched Group E 1st
  F: { TUN: 4 },                // Tunisia clinched Group F 4th (eliminated)
  J: { ARG: 1, JOR: 4 },        // Argentina clinched 1st, Jordan clinched 4th
  L: { PAN: 4 },                // Panama clinched Group L 4th (eliminated)
};
