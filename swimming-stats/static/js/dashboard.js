/**
 * Swimming Stats — Chart.js setup
 * Called from dashboard.html after Chart.js is loaded.
 */

const ACCENT  = '#1a7fd4';
const ACCENT2 = '#0fb4d4';
const GOOD    = '#22d3a2';
const WARN    = '#fbbf24';
const BORDER  = '#1e3055';
const TEXT_MUTED = '#7a90b8';

Chart.defaults.color = TEXT_MUTED;
Chart.defaults.borderColor = BORDER;
Chart.defaults.font.family = "'Inter','Segoe UI',system-ui,sans-serif";
Chart.defaults.font.size   = 12;

function mkGradient(ctx, color) {
  const g = ctx.createLinearGradient(0, 0, 0, 200);
  g.addColorStop(0, color + 'aa');
  g.addColorStop(1, color + '00');
  return g;
}

function initCharts(data) {
  const { labels, distances, durations, calories, counts } = data;
  if (!labels || labels.length === 0) return;

  // ── Distance chart ──────────────────────────────────────────────────────────
  const distCtx = document.getElementById('distanceChart');
  if (distCtx) {
    const ctx = distCtx.getContext('2d');
    new Chart(distCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Distance (m)',
          data: distances,
          borderColor: ACCENT2,
          backgroundColor: mkGradient(ctx, ACCENT2),
          borderWidth: 2,
          pointRadius: distances.length > 30 ? 0 : 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.3,
        }]
      },
      options: chartOptions('Distance (m)', false),
    });
  }

  // ── Calories chart ──────────────────────────────────────────────────────────
  const calCtx = document.getElementById('caloriesChart');
  if (calCtx) {
    new Chart(calCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Calories (kcal)',
          data: calories,
          backgroundColor: WARN + 'bb',
          borderColor: WARN,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: chartOptions('kcal', false),
    });
  }

  // ── Duration chart ──────────────────────────────────────────────────────────
  const durCtx = document.getElementById('durationChart');
  if (durCtx) {
    const ctx2 = durCtx.getContext('2d');
    new Chart(durCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Duration (min)',
          data: durations,
          borderColor: GOOD,
          backgroundColor: mkGradient(ctx2, GOOD),
          borderWidth: 2,
          pointRadius: durations.length > 30 ? 0 : 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.3,
        }]
      },
      options: chartOptions('Minutes', false),
    });
  }

  // ── Count chart ─────────────────────────────────────────────────────────────
  const countCtx = document.getElementById('countChart');
  if (countCtx) {
    new Chart(countCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Workouts',
          data: counts,
          backgroundColor: ACCENT + 'bb',
          borderColor: ACCENT,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: chartOptions('Workouts', false),
    });
  }
}

function chartOptions(yLabel, showLegend) {
  return {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: showLegend },
      tooltip: {
        backgroundColor: '#0d1628',
        borderColor: '#1e3055',
        borderWidth: 1,
        titleColor: '#e0eaff',
        bodyColor: '#7a90b8',
      },
    },
    scales: {
      x: {
        grid:  { color: BORDER + '55' },
        ticks: { maxTicksLimit: 10, maxRotation: 30 },
      },
      y: {
        grid:  { color: BORDER + '55' },
        title: { display: !!yLabel, text: yLabel },
        beginAtZero: true,
      },
    },
  };
}
