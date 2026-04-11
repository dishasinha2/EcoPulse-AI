from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "EcoPulse Backend Running"}