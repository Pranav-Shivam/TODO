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

@app.on_event("startup")
async def startup_event():
    """Initialize database and create system databases on startup"""
    try:
        from database.couchdb_client import get_db_client
        db_client = get_db_client()
        # Force initialization to create system databases
        db_client._ensure_initialized()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Calendar-Integrated To-Do API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection using the new health check method
        from database.couchdb_client import get_db_client
        db_client = get_db_client()
        health_status = db_client.health_check()
        
        if health_status["status"] == "healthy":
            return health_status
        else:
            return JSONResponse(
                status_code=503,
                content=health_status
            )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )

@app.post("/init-db")
async def init_database():
    """Manually initialize database and create system databases"""
    try:
        from database.couchdb_client import get_db_client
        db_client = get_db_client()
        result = db_client.create_system_databases()
        
        if result["status"] == "success":
            return result
        else:
            return JSONResponse(
                status_code=500,
                content=result
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Failed to initialize database: {e}"}
        )

if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 7035))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    ) 