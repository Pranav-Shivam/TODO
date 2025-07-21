from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.tasks import router as tasks_router
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Calendar-Integrated To-Do API",
    description="A persistent to-do application with calendar integration",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:7038,http://127.0.0.1:7038,http://localhost:7039,http://127.0.0.1:7039").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Calendar-Integrated To-Do API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        from database.couchdb_client import db_client
        db_client.get_all_tasks()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 7035))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    ) 