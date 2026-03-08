# Swimming Stats Dashboard

A local web dashboard that pulls your swimming workout history from
**Samsung Health via Google Health Connect**, aggregates statistics across
multiple timelines, and automatically re-aggregates every day at 5 PM.

---

## Features

- **Timelines:** Previous Week · Month · 2 Months · 6 Months · Year · All Time
- **Stats per timeline:** total/avg/high/low for distance, duration, calories, pace, heart rate, laps
- **Charts:** distance, duration, calories, workout frequency over time
- **Daily 5 PM scheduler:** aggregates any data received from your phone
- **REST API:** POST new workouts from your Android companion; GET stats as JSON
- **Duplicate detection:** workouts already in the database are safely skipped

---

## Quick Start

### 1. Install dependencies

```bash
cd swimming-stats
pip install -r requirements.txt
```

### 2. Run the server

```bash
python app.py
```

Dashboard is at **http://localhost:5000**

> Set the `TZ` environment variable to your local timezone so the 5 PM job
> fires at the right time (default: `America/New_York`):
> ```bash
> TZ=America/Chicago python app.py
> ```

---

## Android Setup (Health Connect → Dashboard)

Samsung Health automatically syncs to Google Health Connect on Android 9+.

### Step 1 — Enable Samsung Health → Health Connect sync

1. Open **Samsung Health** → **Settings** → **Connected services** → **Health Connect**
2. Grant **all permissions** (especially *Exercise*)

### Step 2 — Find your PC's local IP address

Your phone and PC must be on the same Wi-Fi network.

| OS | Command |
|----|---------|
| Linux / Mac | `hostname -I` or `ip a` |
| Windows | `ipconfig` (look for IPv4 Address) |

Example: `192.168.1.42` → your API endpoint is `http://192.168.1.42:5000/api/sync`

### Step 3 — Set up automatic daily sync (pick one method)

---

#### Option A — Tasker + AutoHealth plugin (most powerful)

1. Install **Tasker** (paid) and **AutoHealth** (free) from the Play Store.
2. In Tasker create a new **Profile → Time → Repeat every day at 17:00**.
3. Add a **Task** with these two actions:

**Action 1 — AutoHealth: Get Exercises**
```
Plugin: AutoHealth
Action: Get Exercises
Exercise Type: Swimming (Pool)
Start: %LAST_SYNC_DATE   (store the date after each successful POST)
End:   %DATE %TIME
```

**Action 2 — HTTP Request**
```
Method:       POST
URL:          http://YOUR_PC_IP:5000/api/sync
Headers:      Content-Type: application/json
Body:         (AutoHealth output converted to the JSON format below)
```

The Tasker JavaScript action to convert AutoHealth output to the expected JSON:
```javascript
// Tasker JS action — runs between AutoHealth and HTTP Request
var raw = JSON.parse(global('ah_exercises'));
var workouts = raw.map(function(e) {
  return {
    id:               e.id,
    startTime:        e.start_time,
    endTime:          e.end_time,
    distanceMeters:   e.distance,
    energyKcal:       e.calories,
    laps:             e.laps,
    avgHeartRateBpm:  e.avg_heart_rate,
    maxHeartRateBpm:  e.max_heart_rate,
    strokeType:       e.stroke_type || 'UNKNOWN',
    poolLengthMeters: e.pool_length
  };
});
setGlobal('SWIM_JSON', JSON.stringify({ source: 'health_connect', workouts: workouts }));
```

Then use `%SWIM_JSON` as the HTTP Request body.

---

#### Option B — HTTP Shortcuts app (simpler, manual trigger)

1. Install **HTTP Shortcuts** (free) from the Play Store.
2. Tap **+** → **Regular shortcut**
3. Set:
   - Method: `POST`
   - URL: `http://YOUR_PC_IP:5000/api/sync`
   - Request Body → **Custom text/JSON**
4. Paste your workout JSON (copy from Samsung Health export or build manually).
5. Add the shortcut to your home screen.

---

#### Option C — Direct curl (for testing / manual import)

```bash
curl -X POST http://localhost:5000/api/sync \
  -H "Content-Type: application/json" \
  -d '{
    "source": "health_connect",
    "workouts": [
      {
        "id": "test-uuid-001",
        "startTime": "2024-01-15T07:00:00Z",
        "endTime":   "2024-01-15T08:00:00Z",
        "distanceMeters": 2000,
        "energyKcal": 450,
        "laps": 40,
        "avgHeartRateBpm": 140,
        "maxHeartRateBpm": 165,
        "strokeType": "FREESTYLE",
        "poolLengthMeters": 50
      }
    ]
  }'
```

---

## REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sync` | Ingest new workouts from Android |
| `GET`  | `/api/stats` | All timeline stats as JSON |
| `GET`  | `/api/workouts?timeline=month&page=1&limit=50` | Paginated workout list |
| `GET`  | `/api/last-sync` | Most recent sync log entry |
| `POST` | `/api/trigger-sync` | Manually run the aggregation job |

### POST /api/sync — Workout object fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | No | Health Connect record UUID (used for deduplication) |
| `startTime` | ISO-8601 | Yes | Workout start |
| `endTime` | ISO-8601 | Yes | Workout end |
| `distanceMeters` | number | No | Total distance swum |
| `energyKcal` | number | No | Calories burned |
| `laps` | integer | No | Number of laps |
| `avgHeartRateBpm` | number | No | Average heart rate |
| `maxHeartRateBpm` | number | No | Peak heart rate |
| `strokeType` | string | No | FREESTYLE, BACKSTROKE, BREASTSTROKE, BUTTERFLY, MIXED |
| `poolLengthMeters` | number | No | Pool length (25 or 50) |

---

## Configuration

| Environment variable | Default | Description |
|----------------------|---------|-------------|
| `TZ` | `America/New_York` | Timezone for 5 PM daily job |
| `PORT` | `5000` | HTTP port |
| `SECRET_KEY` | random string | Flask session secret |
| `DATABASE_URL` | `sqlite:///data/swimming.db` | SQLAlchemy DB URL |

---

## Project Structure

```
swimming-stats/
├── app.py            # Flask application + all routes
├── database.py       # SQLAlchemy models (SwimmingWorkout, SyncLog)
├── scheduler.py      # APScheduler — daily 5 PM aggregation job
├── requirements.txt
├── static/
│   ├── css/style.css # Dark blue swimming theme
│   └── js/dashboard.js  # Chart.js charts
├── templates/
│   ├── base.html     # Shared layout
│   ├── dashboard.html   # Main stats dashboard
│   └── import.html      # Sync setup + history
└── data/
    └── swimming.db   # SQLite database (auto-created)
```
