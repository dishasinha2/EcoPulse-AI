import os
import time
import logging
import redis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("ecopulse.worker")


def main() -> None:
    redis_url = os.getenv("REDIS_URL", "redis://ecopulse-redis:6379/0")
    job_id = os.getenv("JOB_ID", "demo-job")
    step_s = float(os.getenv("TRAIN_STEP_SECONDS", "1"))
    progress_step = int(os.getenv("TRAIN_PROGRESS_STEP", "5"))

    r = redis.Redis.from_url(redis_url, decode_responses=True)
    status_key = f"job_status:{job_id}"
    progress_key = f"job_progress:{job_id}"

    progress = int(r.get(progress_key) or "0")

    while True:
        status = r.get(status_key) or "paused"

        if status == "paused":
            logger.info("training_paused job_id=%s progress=%s", job_id, progress)
            time.sleep(2.0)
            continue

        progress = min(100, progress + progress_step)
        r.set(progress_key, str(progress))

        logger.info("training_running job_id=%s progress=%s", job_id, progress)

        if progress >= 100:
            logger.info("training_complete job_id=%s", job_id)
            r.set(status_key, "paused")
            progress = 0
            r.set(progress_key, "0")

        time.sleep(step_s)


if __name__ == "__main__":
    main()