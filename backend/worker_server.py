import os
import sys
import threading
import subprocess
import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "worker running"}

def start_celery():
    subprocess.run([
        sys.executable, "-m", "celery",
        "-A", "tasks.celery_app", "worker",
        "--beat", "--loglevel=info",
    ])

if __name__ == "__main__":
    t = threading.Thread(target=start_celery, daemon=True)
    t.start()
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
