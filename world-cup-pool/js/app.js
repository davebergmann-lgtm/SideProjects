// =============================================================================
// APP CONTROLLER
// =============================================================================

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes
let refreshTimer  = null;
let nextRefreshAt = null;
let liveGroups    = {};
let lastUpdated   = null;

// ── MAIN LOOP ────────────────────────────────────────────────────────────────

async function init() {
  renderSkeleton();
  await refresh();
  scheduleRefresh();
}

async function refresh() {
  try {
    const groups = await fetchLiveStandings();
    liveGroups  = groups || getFallbackStandings();
    lastUpdated = new Date();
    render();
  } catch (e) {
    console.error('Refresh error:', e);
    liveGroups  = getFallbackStandings();
    lastUpdated = new Date();
    render();
  }
}

function scheduleRefresh() {
  clearInterval(refreshTimer);
  nextRefreshAt = Date.now() + REFRESH_MS;
  refreshTimer  = setInterval(refresh, REFRESH_MS);
  setInterval(updateCountdown, 10000);
  updateCountdown();
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function renderSkeleton() {
  document.getElementById('app').innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <div class="header-title">
          <span class="trophy">🏆</span>
          <div>
            <h1>2026 FIFA World Cup Pool</h1>
            <p class="subtitle">Live Leaderboard</p>
          </div>
        </div>
        <div class="header-meta" id="headerMeta">
          <span class="loading-pulse">Loading standings…</span>
        </div>
      </div>
    </header>
    <main>
      <div class="stats-bar" id="statsBar"></div>
      <section class="card" id="leaderboardSection">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Fetching live data…</p>
        </div>
      </section>
      <section class="card" id="groupsSection">
        <h2 class="section-title">Group Standings</h2>
        <div class="loading-state"><div class="spinner"></div></div>
      </section>
    </main>
    <footer>
      <p>Auto-refreshes every 5 minutes · Live data via ESPN · <span id="countdown"></span></p>
    </footer>
  `;
}

function render() {
  const participants = PICKS_DATA.participants || [];
  const { results, poolAvailToDate } = calculateLeaderboard(participants, liveGroups);

  renderHeader(poolAvailToDate);
  renderStatsBar(poolAvailToDate);
  renderLeaderboard(results, poolAvailToDate);
  renderGroups();
}

function renderHeader(poolAvailToDate) {
  document.getElementById('headerMeta').innerHTML = `
    <div class="meta-item">
      <span class="meta-label">Pts Decided</span>
      <span class="meta-value">${poolAvailToDate} <small>/ ${SCORING.MAX_TOTAL}</small></span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Updated</span>
      <span class="meta-value">${lastUpdated ? fmtTime(lastUpdated) : '—'}</span>
    </div>
  `;
}

function renderStatsBar(poolAvailToDate) {
  const groupsDone = GROUPS.filter(g => {
    const e = liveGroups[g] || [];
    return e.length === 4 && e.every(t => t.gamesPlayed >= 3);
  }).length;

  document.getElementById('statsBar').innerHTML = `
    <div class="stat">
      <span class="stat-num">${groupsDone}</span>
      <span class="stat-label">Groups Complete</span>
    </div>
    <div class="stat">
      <span class="stat-num">${12 - groupsDone}</span>
      <span class="stat-label">In Progress</span>
    </div>
    <div class="stat">
      <span class="stat-num">${poolAvailToDate}</span>
      <span class="stat-label">Pts Decided</span>
    </div>
    <div class="stat">
      <span class="stat-num">${SCORING.MAX_TOTAL}</span>
      <span class="stat-label">Total Possible</span>
    </div>
  `;
}

function renderLeaderboard(results, poolAvailToDate) {
  const topMax = results.length > 0 ? results[0].maxPossible : SCORING.MAX_TOTAL;
  const hasDemo = results.some(r => r.demo);

  const rows = results.map((r, i) => {
    const rank   = i + 1;
    const medal  = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    const pct    = topMax > 0 ? Math.round((r.maxPossible / topMax) * 100) : 0;
    const epct   = poolAvailToDate > 0 ? Math.round((r.earned / poolAvailToDate) * 100) : 0;
    const gapPts = i === 0 ? 0 : results[0].maxPossible - r.maxPossible;
    const gapHtml = gapPts > 0
      ? `<span class="gap">-${gapPts} max pts</span>` : '';
    const earnedBar  = SCORING.MAX_TOTAL > 0
      ? Math.min(100, (r.earned / SCORING.MAX_TOTAL) * 100) : 0;
    const possibleBar = SCORING.MAX_TOTAL > 0
      ? Math.min(100, (r.maxPossible / SCORING.MAX_TOTAL) * 100) : 0;

    return `
      <tr class="${r.demo ? 'demo-row' : ''}${rank <= 3 ? ' top-three' : ''}">
        <td class="col-rank rank-cell">${medal}</td>
        <td class="col-name">${escHtml(r.name)}${gapHtml}</td>
        <td class="col-pts">
          <strong>${r.earned}</strong>
          ${poolAvailToDate > 0 ? `<small>${epct}% of decided</small>` : ''}
        </td>
        <td class="col-avail">${poolAvailToDate}</td>
        <td class="col-max max-cell">${r.maxPossible}</td>
        <td class="col-bar">
          <div class="progress-track">
            <div class="progress-possible" style="width:${possibleBar.toFixed(1)}%"></div>
            <div class="progress-earned"   style="width:${earnedBar.toFixed(1)}%"></div>
          </div>
          <span class="progress-label">${pct}% of leader's max</span>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('leaderboardSection').innerHTML = `
    <h2 class="section-title">Leaderboard</h2>
    <div class="table-scroll">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="col-rank">#</th>
            <th class="col-name">Participant</th>
            <th class="col-pts" title="Actual points from locked/decided positions">Pts Earned</th>
            <th class="col-avail" title="Total pts available from decided positions (same for all)">Avail<br>to Date</th>
            <th class="col-max" title="Best possible final total if remaining picks are all correct">Max<br>Possible</th>
            <th class="col-bar">Progress vs Max Possible</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${hasDemo ? '<p class="demo-notice">⚠️ Demo entries shown — replace with real picks in <code>js/picks.js</code></p>' : ''}
  `;
}

function renderGroups() {
  const cards = GROUPS.map(letter => {
    const entries = liveGroups[letter] || [];
    if (entries.length === 0) {
      return `<div class="group-card group-pending"><h3>Group ${letter}</h3><p class="pending-msg">Pending…</p></div>`;
    }

    const complete = entries.every(e => e.gamesPlayed >= 3);
    const sorted   = [...entries].sort((a, b) => (a.rank || 9) - (b.rank || 9));

    const tableRows = sorted.map(e => {
      const locked  = e.lockedRank !== null && e.lockedRank !== undefined;
      const pos     = e.rank || '?';
      const lockBadge = locked ? lockIcon(pos) : '⏳';
      return `
        <tr class="${locked ? `locked pos-${pos}` : 'unlocked'}">
          <td class="gp-pos">${pos}</td>
          <td class="gp-team">${escHtml(e.teamFull || e.team)} ${lockBadge}</td>
          <td>${e.wins}-${e.ties}-${e.losses}</td>
          <td>${e.points}</td>
          <td class="gd">${e.gd >= 0 ? '+' : ''}${e.gd}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="group-card ${complete ? 'complete' : 'active'}">
        <h3>Group ${letter}${complete ? ' ✅' : ''}</h3>
        <table class="group-table">
          <thead><tr><th>#</th><th>Team</th><th>W-D-L</th><th>Pts</th><th>GD</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
  }).join('');

  document.getElementById('groupsSection').innerHTML = `
    <h2 class="section-title">Group Standings</h2>
    <div class="groups-grid">${cards}</div>
  `;
}

function lockIcon(pos) {
  return ['', '🔒🥇', '🔒🥈', '🔒🥉', '🔒4️⃣'][pos] || '🔒';
}

// ── UTILITIES ────────────────────────────────────────────────────────────────

function updateCountdown() {
  const el = document.getElementById('countdown');
  if (!el || !nextRefreshAt) return;
  const secs = Math.max(0, Math.round((nextRefreshAt - Date.now()) / 1000));
  el.textContent = `next refresh in ${secs}s`;
}

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
