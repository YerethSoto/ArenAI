from fastapi import FastAPI
from controllers.v1.ai import router as ai_router

app = FastAPI()
app.include_router(ai_router, prefix="/api")

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

