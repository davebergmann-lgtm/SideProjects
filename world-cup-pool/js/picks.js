// =============================================================================
// WORLD CUP 2026 POOL — PARTICIPANT PICKS
// =============================================================================
// Instructions:
//   • Each group's "ranked" array lists teams in predicted order: [1st, 2nd, 3rd, 4th]
//   • Use FIFA 3-letter codes: USA, MEX, CAN, BRA, ARG, FRA, ENG, ESP, POR, etc.
//   • "advancingThirds" = 8 teams (from the 12 group 3rd-place finishers) you
//     think will advance to the knockout round.
//   • Dave will replace the placeholder data below with actual picks.
// =============================================================================

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// SCORING CONSTANTS
const SCORING = {
  FIRST:   25,
  SECOND:  15,
  THIRD:   10,
  FOURTH:   5,
  ADVANCING_THIRD: 5,
  PERFECT_GROUP:  10,
  MAX_PER_GROUP:  65,   // 25+15+10+5+10 bonus
  MAX_ADVANCING:  40,   // 8 × 5
  MAX_TOTAL:     820    // 12×65 + 40
};

// Replace placeholder entries below with real participant picks
const PICKS_DATA = {
  participants: [
    // ── ADD PARTICIPANTS HERE ──────────────────────────────────────────────
    // {
    //   name: "Dave",
    //   groups: {
    //     A: { ranked: ["USA", "URU", "PAN", "BOL"] },
    //     B: { ranked: ["CAN", "MAR", "BEL", "CRO"] },
    //     C: { ranked: ["MEX", "ARG", "ECU", "TUN"] },
    //     D: { ranked: ["ENG", "NED", "CHI", "IRN"] },
    //     E: { ranked: ["ESP", "GER", "COL", "SRB"] },
    //     F: { ranked: ["BRA", "POR", "NGR", "SUI"] },
    //     G: { ranked: ["FRA", "BEL", "POL", "AUS"] },
    //     H: { ranked: ["ARG", "MEX", "ECU", "DOM"] },
    //     I: { ranked: ["JPN", "KOR", "SAU", "VIE"] },
    //     J: { ranked: ["SEN", "GHA", "CMR", "GUI"] },
    //     K: { ranked: ["POR", "TUR", "HUN", "GEO"] },
    //     L: { ranked: ["ITA", "CRO", "SRB", "ALB"] },
    //   },
    //   advancingThirds: ["URU", "ARG", "NED", "CHI", "SUI", "JPN", "GHA", "TUR"]
    // },

    // ── DEMO ENTRIES (remove once you add real picks) ──────────────────────
    {
      name: "🏆 Example: Perfect",
      _demo: true,
      groups: {
        A: { ranked: ["USA", "URU", "PAN", "BOL"] },
        B: { ranked: ["CAN", "MAR", "TAN", "SEN"] },
        C: { ranked: ["MEX", "ECU", "ARG", "JAM"] },
        D: { ranked: ["ENG", "NED", "SEN", "CHI"] },
        E: { ranked: ["ESP", "GER", "COL", "SRB"] },
        F: { ranked: ["BRA", "POR", "NGR", "SUI"] },
        G: { ranked: ["FRA", "BEL", "POL", "AUS"] },
        H: { ranked: ["ARG", "GER", "ECU", "DOM"] },
        I: { ranked: ["JPN", "KOR", "SAU", "VIE"] },
        J: { ranked: ["SEN", "GHA", "CMR", "GUI"] },
        K: { ranked: ["POR", "TUR", "HUN", "GEO"] },
        L: { ranked: ["ITA", "CRO", "SRB", "ALB"] },
      },
      advancingThirds: ["PAN", "TAN", "ARG", "SEN", "COL", "NGR", "POL", "ECU"]
    },
    {
      name: "Example: Got Haiti Wrong",
      _demo: true,
      groups: {
        A: { ranked: ["USA", "URU", "BOL", "PAN"] }, // wrong 3rd/4th
        B: { ranked: ["CAN", "MAR", "TAN", "SEN"] },
        C: { ranked: ["MEX", "ECU", "ARG", "JAM"] },
        D: { ranked: ["ENG", "NED", "SEN", "CHI"] },
        E: { ranked: ["ESP", "GER", "COL", "SRB"] },
        F: { ranked: ["BRA", "POR", "NGR", "SUI"] },
        G: { ranked: ["FRA", "BEL", "POL", "AUS"] },
        H: { ranked: ["ARG", "GER", "ECU", "DOM"] },
        I: { ranked: ["JPN", "KOR", "SAU", "VIE"] },
        J: { ranked: ["SEN", "GHA", "CMR", "GUI"] },
        K: { ranked: ["POR", "TUR", "HUN", "GEO"] },
        L: { ranked: ["ITA", "CRO", "SRB", "ALB"] },
      },
      advancingThirds: ["PAN", "TAN", "ARG", "SEN", "COL", "NGR", "POL", "ECU"]
    }
  ]
};
