// =============================================================================
// MANUALLY CONFIRMED LOCKED POSITIONS
// =============================================================================
// Update this file whenever a team mathematically clinches their group position.
// Format: LOCKED_POSITIONS[groupLetter][teamCode] = finishPosition (1-4)
//
// Only add entries here when a position is 100% confirmed — not just leading.
// =============================================================================

const LOCKED_POSITIONS = {
  A: { MEX: 1, RSA: 2, KOR: 3, CZE: 4 }, // Group A final standings
  B: { SUI: 1, CAN: 2, BIH: 3, QAT: 4 }, // Group B final standings
  C: { BRA: 1, MAR: 2, SCO: 3, HAI: 4 }, // Group C final standings
  D: { USA: 1, AUS: 2, PAR: 3, TUR: 4 }, // Group D final standings
  E: { GER: 1, CIV: 2, ECU: 3, CUW: 4 }, // Group E final standings
  F: { NED: 1, JPN: 2, SWE: 3, TUN: 4 }, // Group F final standings
  J: { ARG: 1, JOR: 4 },        // Argentina clinched 1st, Jordan clinched 4th
  L: { PAN: 4 },                // Panama clinched Group L 4th (eliminated)
};

// =============================================================================
// CONFIRMED ADVANCING THIRD-PLACE TEAMS
// =============================================================================
// Add team codes here ONLY when FIFA officially confirms they advance to the
// knockout round. Finishing 3rd in a group does NOT mean they advance yet —
// all 12 groups must finish before FIFA selects the best 8 of 12 third-placers.
// =============================================================================

const ADVANCING_THIRDS = [
  // e.g. 'SCO', 'BIH' — fill in when knockout bracket is announced
];

