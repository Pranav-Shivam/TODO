from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.tasks import router as tasks_router
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Calendar-Integrated To-Do API",
    description="A persistent to-do application with calendar integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:7008", "http://127.0.0.1:7008", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:7009", "http://127.0.0.1:7009"],  # Vite dev server
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
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=7005,
        reload=True
    ) 