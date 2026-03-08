from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class SwimmingWorkout(db.Model):
    __tablename__ = "swimming_workouts"

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(255), unique=True, nullable=True)  # Health Connect UUID
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    duration_seconds = db.Column(db.Integer)
    distance_meters = db.Column(db.Float)
    calories = db.Column(db.Float)
    laps = db.Column(db.Integer)
    avg_heart_rate = db.Column(db.Float)
    max_heart_rate = db.Column(db.Float)
    stroke_type = db.Column(db.String(50))       # FREESTYLE, BACKSTROKE, BREASTSTROKE, etc.
    pool_length_meters = db.Column(db.Float)     # 25 or 50
    avg_pace_per_100m = db.Column(db.Float)      # seconds per 100m (lower = faster)
    source = db.Column(db.String(50), default="health_connect")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    synced_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "external_id": self.external_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "duration_seconds": self.duration_seconds,
            "duration_display": self._format_duration(self.duration_seconds),
            "distance_meters": self.distance_meters,
            "distance_km": round(self.distance_meters / 1000, 2) if self.distance_meters else None,
            "calories": self.calories,
            "laps": self.laps,
            "avg_heart_rate": self.avg_heart_rate,
            "max_heart_rate": self.max_heart_rate,
            "stroke_type": self.stroke_type,
            "pool_length_meters": self.pool_length_meters,
            "avg_pace_per_100m": self.avg_pace_per_100m,
            "pace_display": self._format_pace(self.avg_pace_per_100m),
            "source": self.source,
        }

    @staticmethod
    def _format_duration(seconds):
        if not seconds:
            return "—"
        h = seconds // 3600
        m = (seconds % 3600) // 60
        s = seconds % 60
        if h:
            return f"{h}h {m:02d}m {s:02d}s"
        return f"{m}m {s:02d}s"

    @staticmethod
    def _format_pace(seconds_per_100m):
        if not seconds_per_100m:
            return "—"
        m = int(seconds_per_100m) // 60
        s = int(seconds_per_100m) % 60
        return f"{m}:{s:02d}/100m"


class SyncLog(db.Model):
    __tablename__ = "sync_logs"

    id = db.Column(db.Integer, primary_key=True)
    synced_at = db.Column(db.DateTime, default=datetime.utcnow)
    source = db.Column(db.String(50))            # health_connect, manual, scheduler
    workouts_added = db.Column(db.Integer, default=0)
    workouts_skipped = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default="success")  # success, error
    message = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "synced_at": self.synced_at.isoformat(),
            "source": self.source,
            "workouts_added": self.workouts_added,
            "workouts_skipped": self.workouts_skipped,
            "status": self.status,
            "message": self.message,
        }
