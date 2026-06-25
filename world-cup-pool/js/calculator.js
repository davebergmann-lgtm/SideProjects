// =============================================================================
// SCORING CALCULATOR
// =============================================================================
// Three metrics per participant:
//   earned       – points actually locked in (from decided positions)
//   maxPossible  – earned + best-case from all remaining undecided positions
//   availToDate  – total pts available from decided positions pool-wide
//                  (same for everyone; shows how competitive the live board is)
// =============================================================================

const POSITION_POINTS = [25, 15, 10, 5]; // index 0 = 1st place

// Build lookup maps for a single group's live standings entries
function buildGroupMaps(entries) {
  const byPosition = {}; // lockedRank → normalizedTeamName
  const byTeam    = {}; // normalizedTeamName → lockedRank

  for (const entry of entries) {
    if (entry.lockedRank !== null && entry.lockedRank !== undefined) {
      const code = normalizeTeam(entry.team);
      byPosition[entry.lockedRank] = code;
      byTeam[code] = entry.lockedRank;
    }
  }
  return { byPosition, byTeam };
}

// Score a single group for one participant
// picks.ranked = ["USA", "PAN", "URU", "BOL"]  (predicted 1st→4th)
// entries = live group standings from ESPN (may be empty / partial)
function scoreGroup(picks, entries) {
  if (!picks || !entries || entries.length === 0) {
    // Group not yet loaded → optimistically credit full group max
    return { earned: 0, stillPossible: SCORING.MAX_PER_GROUP, availToDate: 0 };
  }

  const { byPosition, byTeam } = buildGroupMaps(entries);
  let earned = 0;
  let stillPossible = 0;
  let availToDate = 0;
  let anyLockedWrong = false;

  for (let pos = 0; pos < 4; pos++) {
    const position   = pos + 1;           // 1..4
    const pts        = POSITION_POINTS[pos];
    const myPick     = normalizeTeam(picks.ranked[pos]);

    const lockedHere = byPosition[position]; // which team is locked in this slot?
    const myPickLock = byTeam[myPick];       // where is my pick locked (if at all)?

    if (lockedHere !== undefined) {
      // This position has been officially decided
      availToDate += pts;
      if (lockedHere === myPick) {
        earned += pts;          // ✓ correct
      } else {
        anyLockedWrong = true;  // ✗ wrong
      }
    } else if (myPickLock !== undefined) {
      // My pick for this slot is locked into a DIFFERENT position → permanently lost
      anyLockedWrong = true;
      // Do NOT add to stillPossible
    } else {
      // Undecided and still achievable
      stillPossible += pts;
    }
  }

  // Perfect Group Bonus (10 pts)
  const lockedCount = Object.keys(byPosition).length;
  if (lockedCount === 4) {
    // Group fully complete
    availToDate += SCORING.PERFECT_GROUP;
    if (!anyLockedWrong) {
      earned += SCORING.PERFECT_GROUP;
    }
  } else if (!anyLockedWrong) {
    // Perfect bonus still achievable
    stillPossible += SCORING.PERFECT_GROUP;
  }

  return { earned, stillPossible, availToDate };
}

// Score advancing-3rd picks
// advancingPicks = array of 8 team abbreviations participant picked to advance
// liveGroups     = all groups' standings (used only to detect teams locked out of 3rd)
function scoreAdvancingThirds(advancingPicks, liveGroups) {
  if (!advancingPicks || advancingPicks.length === 0) {
    return { earned: 0, stillPossible: SCORING.MAX_ADVANCING, availToDate: 0 };
  }

  // Use only manually confirmed advancing thirds from locked.js.
  // Finishing 3rd in a group does NOT automatically mean a team advances —
  // FIFA selects the best 8 of 12 third-placers after all groups are done.
  const confirmedAdvancing = (typeof ADVANCING_THIRDS !== 'undefined')
    ? new Set(ADVANCING_THIRDS.map(t => normalizeTeam(t)))
    : new Set();

  const allThirdsAnnounced = confirmedAdvancing.size === 8;
  const availToDate = confirmedAdvancing.size * SCORING.ADVANCING_THIRD;

  let earned = 0;
  let stillPossible = 0;

  for (const pick of advancingPicks) {
    const code = normalizeTeam(pick);

    if (confirmedAdvancing.has(code)) {
      earned += SCORING.ADVANCING_THIRD;
      continue;
    }

    // Check if this team is permanently eliminated from the advancing thirds race:
    // locked into any position other than 3rd in their group
    let lockedOut = false;
    for (const letter of GROUPS) {
      const entries = liveGroups[letter] || [];
      const entry = entries.find(e => normalizeTeam(e.team) === code);
      if (entry && entry.lockedRank !== null && entry.lockedRank !== undefined && entry.lockedRank !== 3) {
        lockedOut = true;
        break;
      }
    }

    if (!lockedOut && !allThirdsAnnounced) {
      stillPossible += SCORING.ADVANCING_THIRD;
    }
    // else: permanently lost (locked out of 3rd, or all 8 are announced and this team isn't one)
  }

  return { earned, stillPossible, availToDate };
}

// Main calculation — returns scored result for every participant
function calculateLeaderboard(participants, liveGroups) {
  const results = participants.map(p => {
    let totalEarned = 0;
    let totalStillPossible = 0;
    let totalAvailToDate = 0;
    const groupBreakdown = {};

    for (const letter of GROUPS) {
      const groupPicks   = (p.groups || {})[letter];
      const groupEntries = (liveGroups || {})[letter] || [];
      const gs = scoreGroup(groupPicks, groupEntries);
      totalEarned        += gs.earned;
      totalStillPossible += gs.stillPossible;
      totalAvailToDate   += gs.availToDate;
      groupBreakdown[letter] = gs;
    }

    const adv = scoreAdvancingThirds(p.advancingThirds || [], liveGroups || {});
    totalEarned        += adv.earned;
    totalStillPossible += adv.stillPossible;
    totalAvailToDate   += adv.availToDate;

    return {
      name: p.name,
      demo: p._demo || false,
      earned: totalEarned,
      maxPossible: totalEarned + totalStillPossible,
      availToDate: totalAvailToDate,
      groupBreakdown
    };
  });

  // Default sort: highest earned first, then highest maxPossible as tiebreaker
  results.sort((a, b) => b.earned - a.earned || b.maxPossible - a.maxPossible);

  // Pool-wide availToDate (max of any entry — same for everyone if all have all groups)
  const poolAvailToDate = results.length > 0
    ? Math.max(...results.map(r => r.availToDate))
    : 0;

  return { results, poolAvailToDate };
}
