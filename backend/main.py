from fastapi import FastAPI
from pydantic import BaseModel
import requests
import redis
import os

app = FastAPI()

# Redis connection
redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)

# Dummy Electricity API (replace later)
ELECTRICITY_API = "https://api.electricitymap.org/v3/carbon-intensity/latest"
API_KEY = "YOUR_API_KEY"

# -------------------------
# Models
# -------------------------

class JobRequest(BaseModel):
    job_id: str
    carbon_threshold: int


# -------------------------
# Routes
# -------------------------

@app.get("/")
def home():
    return {"message": "EcoPulse Backend Running 🚀"}


@app.post("/start-job")
def start_job(job: JobRequest):
    redis_client.set(job.job_id, "running")
    redis_client.set(f"{job.job_id}_threshold", job.carbon_threshold)

    return {
        "status": "started",
        "job_id": job.job_id
    }


@app.get("/job-status/{job_id}")
def job_status(job_id: str):
    status = redis_client.get(job_id)

    return {
        "job_id": job_id,
        "status": status
    }


@app.get("/carbon")
def get_carbon_data():
    try:
        # Dummy fallback (for hackathon demo)
        carbon_intensity = 150

        return {
            "carbon_intensity": carbon_intensity,
            "status": "success"
        }

    except Exception as e:
        return {"error": str(e)}


@app.post("/decision/{job_id}")
def decision_engine(job_id: str):
    carbon = 150  # Replace with API later
    threshold = int(redis_client.get(f"{job_id}_threshold") or 200)

    if carbon > threshold:
        redis_client.set(job_id, "paused")
        action = "pause"
    else:
        redis_client.set(job_id, "running")
        action = "resume"

    return {
        "job_id": job_id,
        "carbon": carbon,
        "threshold": threshold,
        "action": action
    }