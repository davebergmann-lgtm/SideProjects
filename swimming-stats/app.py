import os
import json
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, render_template, request, redirect, url_for, flash
from sqlalchemy import func, case

from database import db, SwimmingWorkout, SyncLog
from scheduler import init_scheduler

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "swim-stats-secret-change-in-prod")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(__file__), 'data', 'swimming.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

init_scheduler(app)

# ─── Timeline helpers ─────────────────────────────────────────────────────────

TIMELINES = {
    "week":    {"label": "Previous Week",  "days": 7},
    "month":   {"label": "Previous Month", "days": 30},
    "2months": {"label": "2 Months",       "days": 60},
    "6months": {"label": "6 Months",       "days": 180},
    "year":    {"label": "Year",           "days": 365},
    "alltime": {"label": "All Time",       "days": None},
}


def get_cutoff(days):
    if days is None:
        return None
    return datetime.now(timezone.utc) - timedelta(days=days)


def query_workouts(days):
    q = SwimmingWorkout.query
    cutoff = get_cutoff(days)
    if cutoff:
        q = q.filter(SwimmingWorkout.start_time >= cutoff.replace(tzinfo=None))
    return q


def compute_stats(days):
    q = query_workouts(days)
    workouts = q.order_by(SwimmingWorkout.start_time.asc()).all()

    if not workouts:
        return None

    distances = [w.distance_meters for w in workouts if w.distance_meters]
    durations = [w.duration_seconds for w in workouts if w.duration_seconds]
    calories  = [w.calories for w in workouts if w.calories]
    paces     = [w.avg_pace_per_100m for w in workouts if w.avg_pace_per_100m]
    hrs       = [w.avg_heart_rate for w in workouts if w.avg_heart_rate]
    laps_list = [w.laps for w in workouts if w.laps]

    def safe_avg(lst):
        return round(sum(lst) / len(lst), 1) if lst else None

    def fmt_pace(s):
        if not s:
            return "—"
        m, sec = divmod(int(s), 60)
        return f"{m}:{sec:02d}/100m"

    def fmt_dur(s):
        if not s:
            return "—"
        h, rem = divmod(int(s), 3600)
        m, sec = divmod(rem, 60)
        return f"{h}h {m:02d}m" if h else f"{m}m {sec:02d}s"

    # Build chart series (weekly bucketed for long ranges, daily otherwise)
    chart_series = _build_chart_series(workouts, days)

    return {
        "count":            len(workouts),
        "total_distance_m": round(sum(distances), 0) if distances else 0,
        "avg_distance_m":   round(safe_avg(distances) or 0, 0),
        "max_distance_m":   round(max(distances), 0) if distances else None,
        "min_distance_m":   round(min(distances), 0) if distances else None,
        "total_duration_s": sum(durations) if durations else 0,
        "avg_duration_s":   int(safe_avg(durations) or 0),
        "max_duration_s":   max(durations) if durations else None,
        "total_calories":   round(sum(calories), 0) if calories else 0,
        "avg_calories":     round(safe_avg(calories) or 0, 0),
        "best_pace_s":      min(paces) if paces else None,   # lower = faster
        "avg_pace_s":       safe_avg(paces),
        "avg_heart_rate":   safe_avg(hrs),
        "max_heart_rate":   max(hrs) if hrs else None,
        "total_laps":       sum(laps_list) if laps_list else 0,
        "avg_laps":         round(safe_avg(laps_list) or 0, 0),
        # Display-formatted
        "fmt_avg_duration": fmt_dur(safe_avg(durations)),
        "fmt_max_duration": fmt_dur(max(durations) if durations else None),
        "fmt_total_duration": fmt_dur(sum(durations) if durations else None),
        "fmt_best_pace":    fmt_pace(min(paces) if paces else None),
        "fmt_avg_pace":     fmt_pace(safe_avg(paces)),
        # Chart data
        "chart": chart_series,
    }


def _build_chart_series(workouts, days):
    """Return {labels, distances, durations, calories} for Chart.js."""
    if not workouts:
        return {}

    # Group by date
    from collections import defaultdict
    buckets = defaultdict(lambda: {"distance": 0, "duration": 0, "calories": 0, "count": 0})

    for w in workouts:
        key = w.start_time.strftime("%Y-%m-%d")
        if w.distance_meters:
            buckets[key]["distance"] += w.distance_meters
        if w.duration_seconds:
            buckets[key]["duration"] += w.duration_seconds
        if w.calories:
            buckets[key]["calories"] += w.calories
        buckets[key]["count"] += 1

    sorted_keys = sorted(buckets.keys())
    return {
        "labels":    sorted_keys,
        "distances": [round(buckets[k]["distance"], 0) for k in sorted_keys],
        "durations": [round(buckets[k]["duration"] / 60, 1) for k in sorted_keys],  # minutes
        "calories":  [round(buckets[k]["calories"], 0) for k in sorted_keys],
        "counts":    [buckets[k]["count"] for k in sorted_keys],
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    timeline = request.args.get("timeline", "month")
    if timeline not in TIMELINES:
        timeline = "month"

    days = TIMELINES[timeline]["days"]
    stats = compute_stats(days)

    recent = (
        SwimmingWorkout.query
        .order_by(SwimmingWorkout.start_time.desc())
        .limit(10)
        .all()
    )

    last_sync = SyncLog.query.order_by(SyncLog.synced_at.desc()).first()

    return render_template(
        "dashboard.html",
        stats=stats,
        timeline=timeline,
        timelines=TIMELINES,
        recent=[w.to_dict() for w in recent],
        last_sync=last_sync,
    )


@app.route("/import")
def import_page():
    logs = SyncLog.query.order_by(SyncLog.synced_at.desc()).limit(20).all()
    return render_template("import.html", logs=[l.to_dict() for l in logs])


# ─── REST API ─────────────────────────────────────────────────────────────────

@app.route("/api/sync", methods=["POST"])
def api_sync():
    """
    Receive swimming workout data from Android Health Connect companion.

    Expected JSON body:
    {
      "source": "health_connect",     // optional
      "workouts": [
        {
          "id": "uuid",               // Health Connect record ID
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
    }
    """
    data = request.get_json(silent=True)
    if not data or "workouts" not in data:
        return jsonify({"error": "Missing 'workouts' key in JSON body"}), 400

    source = data.get("source", "health_connect")
    added = 0
    skipped = 0

    for w in data["workouts"]:
        try:
            ext_id = w.get("id")
            # Skip duplicates
            if ext_id and SwimmingWorkout.query.filter_by(external_id=ext_id).first():
                skipped += 1
                continue

            start = _parse_dt(w.get("startTime"))
            end   = _parse_dt(w.get("endTime"))
            if not start or not end:
                skipped += 1
                continue

            dist  = w.get("distanceMeters")
            dur   = int((end - start).total_seconds())
            pace  = None
            if dist and dur and dist > 0:
                pace = (dur / dist) * 100  # seconds per 100m

            workout = SwimmingWorkout(
                external_id       = ext_id,
                start_time        = start,
                end_time          = end,
                duration_seconds  = dur,
                distance_meters   = dist,
                calories          = w.get("energyKcal"),
                laps              = w.get("laps"),
                avg_heart_rate    = w.get("avgHeartRateBpm"),
                max_heart_rate    = w.get("maxHeartRateBpm"),
                stroke_type       = w.get("strokeType"),
                pool_length_meters= w.get("poolLengthMeters"),
                avg_pace_per_100m = pace,
                source            = source,
                synced_at         = datetime.utcnow(),
            )
            db.session.add(workout)
            added += 1

        except Exception as e:
            skipped += 1
            continue

    try:
        db.session.commit()
        log = SyncLog(
            source=source, workouts_added=added,
            workouts_skipped=skipped, status="success",
            message=f"Received {added} new workouts, {skipped} skipped."
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "status": "success",
        "workouts_added": added,
        "workouts_skipped": skipped,
    })


@app.route("/api/stats")
def api_stats():
    """Return aggregated stats for all timelines as JSON."""
    result = {}
    for key, meta in TIMELINES.items():
        result[key] = {
            "label": meta["label"],
            "stats": compute_stats(meta["days"]),
        }
    return jsonify(result)


@app.route("/api/workouts")
def api_workouts():
    """Return paginated list of workouts."""
    page  = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 50, type=int)
    timeline = request.args.get("timeline", "alltime")
    days = TIMELINES.get(timeline, TIMELINES["alltime"])["days"]

    q = query_workouts(days).order_by(SwimmingWorkout.start_time.desc())
    total = q.count()
    workouts = q.offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        "total": total,
        "page": page,
        "limit": limit,
        "workouts": [w.to_dict() for w in workouts],
    })


@app.route("/api/trigger-sync", methods=["POST"])
def trigger_sync():
    """Manually trigger the daily aggregation job."""
    from scheduler import run_daily_aggregation
    run_daily_aggregation(app)
    return jsonify({"status": "ok", "message": "Aggregation run complete."})


@app.route("/api/last-sync")
def last_sync():
    log = SyncLog.query.order_by(SyncLog.synced_at.desc()).first()
    return jsonify(log.to_dict() if log else {})


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _parse_dt(value):
    if not value:
        return None
    from dateutil import parser as dtparser
    try:
        dt = dtparser.parse(value)
        # Strip timezone info for SQLite compatibility
        if dt.tzinfo is not None:
            dt = dt.replace(tzinfo=None)
        return dt
    except Exception:
        return None


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n Swimming Stats Dashboard running at http://localhost:{port}\n")
    app.run(debug=True, host="0.0.0.0", port=port)
