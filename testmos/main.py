from fastapi import FastAPI, Request
import logging

app = FastAPI()

# Setup the logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.api_route(
    "/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
)
async def root(full_path: str, request: Request):
    body = await request.body()
    logger.info(
        f"Path: {full_path}, Method: {request.method}, Headers: {request.headers}, Body: {body}"
    )
    return {"message": "Request received"}
