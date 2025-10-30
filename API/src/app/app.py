"""Definition of Flask application"""
from fastapi import FastAPI


def create_app() -> FastAPI:
    app = FastAPI(title="Aren AI API")

    # Routers registration
    # this will be moved to api_v1 later
    # app.include_router(auth_bp, prefix="/api/auth", tags=["Auth"])
    # app.include_router(students_bp, prefix="/api/students", tags=["Students"])
    # app.include_router(lessons_bp, prefix="/api/lessons", tags=["Lessons"])

    # Endpoint
    @app.get("/")
    async def root():
        return {"message": "Welcome to the Aren AI Backend API"}

    return app


# app instance
app = create_app()