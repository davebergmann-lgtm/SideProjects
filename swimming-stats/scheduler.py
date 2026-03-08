"""
Daily 5 PM scheduler — aggregates any new data that arrived from the
Android Health Connect companion and logs the result.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

_scheduler = None


def run_daily_aggregation(app):
    """Called every day at 17:00 (local time) and on manual trigger."""
    with app.app_context():
        from database import db, SwimmingWorkout, SyncLog

        total = SwimmingWorkout.query.count()
        log = SyncLog(
            source="scheduler",
            workouts_added=0,
            workouts_skipped=0,
            status="success",
            message=(
                f"Daily aggregation complete at {datetime.now().strftime('%Y-%m-%d %H:%M')}. "
                f"Total workouts in database: {total}. "
                "Reminder: open Samsung Health on your phone and let it sync, "
                "or run the Health Connect companion to push today's data."
            ),
        )
        db.session.add(log)
        db.session.commit()
        logger.info("Daily aggregation job ran. Total workouts: %d", total)


def init_scheduler(app):
    global _scheduler
    if _scheduler is not None:
        return

    _scheduler = BackgroundScheduler()

    # Run every day at 17:00 in the local system timezone
    local_tz = pytz.timezone("America/New_York")   # Change via ENV: TZ=America/Chicago etc.
    tz_env = __import__("os").environ.get("TZ", "America/New_York")
    try:
        local_tz = pytz.timezone(tz_env)
    except Exception:
        local_tz = pytz.timezone("America/New_York")

    _scheduler.add_job(
        func=lambda: run_daily_aggregation(app),
        trigger=CronTrigger(hour=17, minute=0, timezone=local_tz),
        id="daily_aggregation",
        name="Daily 5PM aggregation",
        replace_existing=True,
        misfire_grace_time=3600,  # Allow up to 1 hour late
    )

    _scheduler.start()
    logger.info("Scheduler started — daily aggregation at 17:00 %s", local_tz.zone)
