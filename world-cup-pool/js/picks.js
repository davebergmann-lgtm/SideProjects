// =============================================================================
// WORLD CUP 2026 POOL — PARTICIPANT PICKS
// =============================================================================
// ranked: [1st, 2nd, 3rd, 4th] predicted finish in each group
// advancingThirds: 8 of the 12 third-place teams picked to advance
// =============================================================================

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

const SCORING = {
  FIRST:          25,
  SECOND:         15,
  THIRD:          10,
  FOURTH:          5,
  ADVANCING_THIRD: 5,
  PERFECT_GROUP:  10,
  MAX_PER_GROUP:  65,   // 25+15+10+5+10 bonus
  MAX_ADVANCING:  40,   // 8 × 5
  MAX_TOTAL:     820    // 12×65 + 40
};

const PICKS_DATA = {
  participants: [

    // ── Group teams for reference ────────────────────────────────────────────
    // A: MEX  KOR  CZE  RSA
    // B: CAN  SUI  BIH  QAT
    // C: BRA  MAR  SCO  HAI
    // D: TUR  USA  AUS  PAR
    // E: GER  ECU  CIV  CUW
    // F: NED  JPN  SWE  TUN
    // G: BEL  IRN  EGY  NZL
    // H: ESP  URU  SAU  CPV
    // I: FRA  NOR  SEN  IRQ
    // J: ARG  AUT  ALG  JOR
    // K: POR  COL  COD  UZB
    // L: ENG  CRO  PAN  GHA
    // ────────────────────────────────────────────────────────────────────────

    {
      name: "GREG",
      groups: {
        A: { ranked: ["KOR", "MEX", "CZE", "RSA"] },
        B: { ranked: ["SUI", "CAN", "BIH", "QAT"] },
        C: { ranked: ["MAR", "BRA", "SCO", "HAI"] },
        D: { ranked: ["TUR", "USA", "PAR", "AUS"] },
        E: { ranked: ["ECU", "GER", "CIV", "CUW"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "IRN", "EGY", "NZL"] },
        H: { ranked: ["ESP", "SAU", "URU", "CPV"] },
        I: { ranked: ["FRA", "NOR", "SEN", "IRQ"] },
        J: { ranked: ["ARG", "ALG", "AUT", "JOR"] },
        K: { ranked: ["POR", "COL", "UZB", "COD"] },
        L: { ranked: ["CRO", "ENG", "GHA", "PAN"] },
      },
      advancingThirds: ["CIV", "SWE", "EGY", "URU", "SEN", "AUT", "UZB", "GHA"]
    },

    {
      name: "Stan",
      groups: {
        A: { ranked: ["MEX", "CZE", "KOR", "RSA"] },
        B: { ranked: ["SUI", "CAN", "BIH", "QAT"] },
        C: { ranked: ["BRA", "MAR", "SCO", "HAI"] },
        D: { ranked: ["TUR", "USA", "PAR", "AUS"] },
        E: { ranked: ["GER", "ECU", "CIV", "CUW"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "IRN", "EGY", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "SEN", "NOR", "IRQ"] },
        J: { ranked: ["ARG", "ALG", "AUT", "JOR"] },
        K: { ranked: ["POR", "COL", "UZB", "COD"] },
        L: { ranked: ["ENG", "CRO", "PAN", "GHA"] },
      },
      advancingThirds: ["KOR", "BIH", "ECU", "SWE", "EGY", "SAU", "AUT", "PAN"]
    },

    {
      name: "George",
      groups: {
        A: { ranked: ["MEX", "CZE", "KOR", "RSA"] },
        B: { ranked: ["SUI", "CAN", "BIH", "QAT"] },
        C: { ranked: ["BRA", "MAR", "SCO", "HAI"] },
        D: { ranked: ["USA", "TUR", "PAR", "AUS"] },
        E: { ranked: ["GER", "ECU", "CIV", "CUW"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "EGY", "IRN", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "SEN", "NOR", "IRQ"] },
        J: { ranked: ["ARG", "AUT", "ALG", "JOR"] },
        K: { ranked: ["POR", "COL", "UZB", "COD"] },
        L: { ranked: ["ENG", "CRO", "PAN", "GHA"] },
      },
      advancingThirds: ["KOR", "SWE", "IRN", "SAU", "NOR", "ALG", "UZB", "PAN"]
    },

    {
      name: "Dave",
      groups: {
        A: { ranked: ["MEX", "KOR", "CZE", "RSA"] },
        B: { ranked: ["CAN", "SUI", "BIH", "QAT"] },
        C: { ranked: ["BRA", "MAR", "SCO", "HAI"] },
        D: { ranked: ["TUR", "USA", "AUS", "PAR"] },
        E: { ranked: ["GER", "ECU", "CIV", "CUW"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "IRN", "EGY", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "NOR", "SEN", "IRQ"] },
        J: { ranked: ["ARG", "AUT", "ALG", "JOR"] },
        K: { ranked: ["POR", "COL", "COD", "UZB"] },
        L: { ranked: ["ENG", "CRO", "PAN", "GHA"] },
      },
      advancingThirds: ["CZE", "SCO", "AUS", "CIV", "SWE", "EGY", "SEN", "PAN"]
    },

    {
      name: "Billy Dundee",
      groups: {
        A: { ranked: ["MEX", "KOR", "CZE", "RSA"] },
        B: { ranked: ["SUI", "CAN", "BIH", "QAT"] },
        C: { ranked: ["BRA", "MAR", "HAI", "SCO"] },
        D: { ranked: ["USA", "AUS", "PAR", "TUR"] },
        E: { ranked: ["GER", "ECU", "CUW", "CIV"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "NZL", "EGY", "IRN"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "NOR", "SEN", "IRQ"] },
        J: { ranked: ["ARG", "AUT", "ALG", "JOR"] },
        K: { ranked: ["COL", "POR", "UZB", "COD"] },
        L: { ranked: ["PAN", "ENG", "CRO", "GHA"] },
      },
      advancingThirds: ["CZE", "BIH", "PAR", "CUW", "SWE", "SAU", "SEN", "CRO"]
    },

    {
      name: "Ricky",
      groups: {
        A: { ranked: ["MEX", "KOR", "CZE", "RSA"] },
        B: { ranked: ["CAN", "SUI", "QAT", "BIH"] },
        C: { ranked: ["BRA", "MAR", "SCO", "HAI"] },
        D: { ranked: ["USA", "TUR", "AUS", "PAR"] },
        E: { ranked: ["GER", "ECU", "CUW", "CIV"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "IRN", "EGY", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "SEN", "NOR", "IRQ"] },
        J: { ranked: ["ARG", "AUT", "ALG", "JOR"] },
        K: { ranked: ["POR", "COL", "COD", "UZB"] },
        L: { ranked: ["ENG", "CRO", "PAN", "GHA"] },
      },
      advancingThirds: ["CZE", "SCO", "AUS", "SWE", "EGY", "NOR", "ALG", "PAN"]
    },

    {
      name: "Seth",
      groups: {
        A: { ranked: ["MEX", "KOR", "CZE", "RSA"] },
        B: { ranked: ["SUI", "CAN", "BIH", "QAT"] },
        C: { ranked: ["BRA", "MAR", "SCO", "HAI"] },
        D: { ranked: ["USA", "TUR", "PAR", "AUS"] },
        E: { ranked: ["GER", "ECU", "CIV", "CUW"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "EGY", "IRN", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "NOR", "SEN", "IRQ"] },
        J: { ranked: ["ARG", "AUT", "ALG", "JOR"] },
        K: { ranked: ["POR", "COL", "COD", "UZB"] },
        L: { ranked: ["ENG", "CRO", "GHA", "PAN"] },
      },
      advancingThirds: ["CZE", "BIH", "SCO", "PAR", "CIV", "SWE", "IRN", "SEN"]
    },

    {
      name: "Sandra",
      groups: {
        A: { ranked: ["MEX", "KOR", "RSA", "CZE"] },
        B: { ranked: ["QAT", "SUI", "CAN", "BIH"] },
        C: { ranked: ["BRA", "MAR", "HAI", "SCO"] },
        D: { ranked: ["USA", "PAR", "TUR", "AUS"] },
        E: { ranked: ["GER", "CIV", "ECU", "CUW"] },
        F: { ranked: ["NED", "JPN", "SWE", "TUN"] },
        G: { ranked: ["BEL", "IRN", "EGY", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "SEN", "IRQ", "NOR"] },
        J: { ranked: ["ARG", "ALG", "AUT", "JOR"] },
        K: { ranked: ["POR", "COL", "COD", "UZB"] },
        L: { ranked: ["ENG", "CRO", "GHA", "PAN"] },
      },
      advancingThirds: ["RSA", "CAN", "HAI", "SWE", "EGY", "SAU", "AUT", "GHA"]
    },

    {
      name: "Timmy",
      groups: {
        A: { ranked: ["MEX", "RSA", "KOR", "CZE"] },
        B: { ranked: ["SUI", "CAN", "BIH", "QAT"] },
        C: { ranked: ["BRA", "MAR", "SCO", "HAI"] },
        D: { ranked: ["TUR", "USA", "PAR", "AUS"] },
        E: { ranked: ["GER", "ECU", "CIV", "CUW"] },
        F: { ranked: ["NED", "SWE", "JPN", "TUN"] },
        G: { ranked: ["BEL", "EGY", "IRN", "NZL"] },
        H: { ranked: ["ESP", "URU", "SAU", "CPV"] },
        I: { ranked: ["FRA", "SEN", "NOR", "IRQ"] },
        J: { ranked: ["ARG", "ALG", "AUT", "JOR"] },
        K: { ranked: ["POR", "COL", "COD", "UZB"] },
        L: { ranked: ["ENG", "CRO", "PAN", "GHA"] },
      },
      advancingThirds: ["KOR", "SCO", "PAR", "JPN", "IRN", "NOR", "AUT", "PAN"]
    },

  ]
};
