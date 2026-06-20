// =============================================================================
// LIVE STANDINGS FETCHER — ESPN API
// =============================================================================

const ESPN_URLS = [
  'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings',
  'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026',
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/standings'
];

// Common team name / abbreviation variations → canonical FIFA 3-letter code
// Covers ESPN API display names, FIFA official names, and common variants.
const TEAM_ALIASES = {
  // Americas
  'united states': 'USA', 'united states of america': 'USA', 'us': 'USA', 'u.s.': 'USA',
  'mexico': 'MEX', 'méxico': 'MEX',
  'canada': 'CAN',
  'brazil': 'BRA', 'brasil': 'BRA',
  'argentina': 'ARG',
  'colombia': 'COL',
  'ecuador': 'ECU',
  'uruguay': 'URU',
  'chile': 'CHI',
  'panama': 'PAN',
  'haiti': 'HAI',
  'jamaica': 'JAM',
  'venezuela': 'VEN',
  'bolivia': 'BOL',
  'peru': 'PER',
  'paraguay': 'PAR',
  'costa rica': 'CRC',
  'honduras': 'HON',
  'el salvador': 'SLV',
  'trinidad and tobago': 'TRI', 'trinidad & tobago': 'TRI',
  'cuba': 'CUB',
  'guatemala': 'GUA',
  'nicaragua': 'NCA',
  'dominican republic': 'DOM',
  'curacao': 'CUW', 'curaçao': 'CUW',

  // Europe
  'france': 'FRA',
  'england': 'ENG',
  'spain': 'ESP',
  'germany': 'GER',
  'portugal': 'POR',
  'netherlands': 'NED', 'holland': 'NED',
  'belgium': 'BEL',
  'croatia': 'CRO',
  'poland': 'POL',
  'switzerland': 'SUI',
  'turkey': 'TUR', 'türkiye': 'TUR',
  'italy': 'ITA',
  'serbia': 'SRB',
  'hungary': 'HUN',
  'georgia': 'GEO',
  'albania': 'ALB',
  'scotland': 'SCO',
  'austria': 'AUT',
  'czech republic': 'CZE', 'czechia': 'CZE',
  'slovakia': 'SVK',
  'slovenia': 'SVN',
  'ukraine': 'UKR',
  'romania': 'ROU',
  'denmark': 'DEN',
  'sweden': 'SWE',
  'norway': 'NOR',
  'finland': 'FIN',
  'greece': 'GRE',
  'israel': 'ISR',
  'bosnia and herzegovina': 'BIH', 'bosnia & herzegovina': 'BIH',
  'bosnia and herz.': 'BIH', 'bosnia': 'BIH',

  // Africa
  'morocco': 'MAR',
  'senegal': 'SEN',
  'ghana': 'GHA',
  'nigeria': 'NGR', 'nigeria (nff)': 'NGR',
  'ivory coast': 'CIV', "côte d'ivoire": 'CIV', "cote d'ivoire": 'CIV',
  'ivory coast/civ': 'CIV',
  'south africa': 'RSA',
  'cameroon': 'CMR',
  'egypt': 'EGY',
  'algeria': 'ALG',
  'tanzania': 'TAN',
  'guinea': 'GUI',
  'mozambique': 'MOZ',
  'angola': 'ANG',
  'dr congo': 'COD', 'congo dr': 'COD', 'democratic republic of congo': 'COD',
  'congo, dr': 'COD', 'congo (dr)': 'COD', 'dem. rep. congo': 'COD',
  'cape verde': 'CPV', 'cabo verde': 'CPV', 'cape verde islands': 'CPV',

  // Asia / Middle East
  'japan': 'JPN',
  'south korea': 'KOR', 'korea republic': 'KOR', 'korea, republic of': 'KOR',
  'saudi arabia': 'SAU',
  'iran': 'IRN', 'iran (islamic republic of)': 'IRN',
  'iraq': 'IRQ',
  'jordan': 'JOR',
  'qatar': 'QAT',
  'uae': 'UAE', 'united arab emirates': 'UAE',
  'uzbekistan': 'UZB',
  'indonesia': 'IDN',
  'thailand': 'THA',
  'china': 'CHN', 'china pr': 'CHN',
  'vietnam': 'VIE',
  'oman': 'OMA',
  'bahrain': 'BHR',

  // Oceania
  'australia': 'AUS',
  'new zealand': 'NZL',
};

function normalizeTeam(name) {
  if (!name) return '';
  const lower = name.trim().toLowerCase();
  return TEAM_ALIASES[lower] || name.trim().toUpperCase();
}

function getStat(stats, statName) {
  if (!stats) return null;
  const stat = stats.find(s => s.name === statName || s.shortDisplayName === statName);
  return stat ? stat.value : null;
}

// Parse ESPN standings response into our internal format:
// { A: [{team, rank, lockedRank, gamesPlayed, stats}], B: [...], ... }
function parseESPNStandings(data) {
  const groups = {};

  // ESPN nests children differently depending on endpoint/season
  const rawGroups =
    data?.standings?.children ||
    data?.children ||
    data?.content?.standings?.children ||
    data?.groups ||
    [];

  for (const rawGroup of rawGroups) {
    const groupName = rawGroup.name || rawGroup.displayName || '';
    // "Group A" → "A", or "A" → "A"
    const letter = groupName.replace(/group\s*/i, '').trim();
    if (!letter || letter.length > 2) continue;

    const entries =
      rawGroup.standings?.entries ||
      rawGroup.entries ||
      [];

    const teamEntries = entries.map(entry => {
      const stats = entry.stats || [];
      const rank = getStat(stats, 'rank');
      const gamesPlayed = getStat(stats, 'gamesPlayed') || 0;
      const note = entry.note || null;

      // Determine locked rank
      let lockedRank = null;
      if (note) {
        const desc = (note.description || '').toLowerCase();
        // ESPN uses note.rank to express the team's final/clinched position
        if (note.rank) {
          if (desc.includes('clinch') || desc.includes('advance') ||
              desc.includes('eliminat') || desc.includes('qualify')) {
            lockedRank = note.rank;
          }
        }
      }

      const teamObj = entry.team || {};
      const teamAbbr = normalizeTeam(
        teamObj.abbreviation || teamObj.shortDisplayName || teamObj.displayName || ''
      );

      return {
        team: teamAbbr,
        teamFull: teamObj.displayName || teamAbbr,
        teamLogo: (teamObj.logos || [])[0]?.href || null,
        rank: rank,
        gamesPlayed: gamesPlayed,
        lockedRank: lockedRank,
        points: getStat(stats, 'points') || 0,
        gf: getStat(stats, 'pointsFor') || 0,
        ga: getStat(stats, 'pointsAgainst') || 0,
        gd: getStat(stats, 'pointDifferential') || 0,
        wins: getStat(stats, 'wins') || 0,
        ties: getStat(stats, 'ties') || 0,
        losses: getStat(stats, 'losses') || 0,
        note: note
      };
    });

    // If all 4 teams have played 3 games → group complete → all ranks locked
    const allDone = teamEntries.length === 4 && teamEntries.every(e => e.gamesPlayed >= 3);
    if (allDone) {
      teamEntries.forEach(e => {
        if (e.lockedRank === null || e.lockedRank === undefined) {
          e.lockedRank = e.rank;
        }
      });
    }

    groups[letter.toUpperCase()] = teamEntries;
  }

  return groups;
}

async function fetchLiveStandings() {
  for (const url of ESPN_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const groups = parseESPNStandings(data);
      if (Object.keys(groups).length > 0) {
        console.log('[API] Loaded standings from', url, '— groups:', Object.keys(groups));
        return groups;
      }
    } catch (e) {
      console.warn('[API] Failed:', url, e.message);
    }
  }
  console.error('[API] All ESPN endpoints failed — using manual fallback data');
  return null;
}

// Fallback/demo standings (used when ESPN is unreachable or returns no groups)
// Fill this in manually to keep the board working during outages.
// Format matches parseESPNStandings output.
function getFallbackStandings() {
  console.warn('[API] Using fallback standings — edit js/api.js to update');
  return {
    // Each group: teams listed 1st→4th by current rank
    // Set lockedRank if position is mathematically confirmed
    // Example (update with real data):
    A: [
      { team:'USA',  rank:1, gamesPlayed:3, lockedRank:1, points:9, gf:5, ga:1, gd:4, wins:3, ties:0, losses:0 },
      { team:'URU',  rank:2, gamesPlayed:3, lockedRank:2, points:6, gf:4, ga:2, gd:2, wins:2, ties:0, losses:1 },
      { team:'PAN',  rank:3, gamesPlayed:3, lockedRank:3, points:3, gf:2, ga:4, gd:-2, wins:1, ties:0, losses:2 },
      { team:'BOL',  rank:4, gamesPlayed:3, lockedRank:4, points:0, gf:0, ga:4, gd:-4, wins:0, ties:0, losses:3 },
    ],
    // Add B through L below as groups complete...
  };
}
