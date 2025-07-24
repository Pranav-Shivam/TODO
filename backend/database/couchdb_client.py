import couchdb
import uuid
import os
import time
import logging
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from models.task import Task, TaskCreate, TaskUpdate, TaskStatus
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CouchDBClient:
    def __init__(self):
        self.username: str = os.getenv("COUCHDB_USERNAME", "root")
        self.password: str = os.getenv("COUCHDB_PASSWORD", "root")
        self.host: str = os.getenv("COUCHDB_HOST", "localhost")
        self.port: str = os.getenv("COUCHDB_PORT", "5984")
        self.server_url: str = f"http://{self.username}:{self.password}@{self.host}:{self.port}"
        self.db_name = os.getenv("COUCHDB_DATABASE", "todo_tasks")
        
        # Retry configuration from environment
        self.max_retries: int = int(os.getenv("COUCHDB_MAX_RETRIES", "5"))
        self.retry_delay: float = float(os.getenv("COUCHDB_RETRY_DELAY", "2.0"))
        self.connection_timeout: int = int(os.getenv("COUCHDB_CONNECTION_TIMEOUT", "10"))
        
        # Lazy initialization - don't connect immediately
        self.server = None
        self.db = None
        self._initialized = False

    def _connect_with_retry(self, max_retries: int = None, delay: float = None):
        """Connect to CouchDB with retry logic"""
        max_retries = max_retries or self.max_retries
        delay = delay or self.retry_delay
        
        last_exception = None
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempting to connect to CouchDB at {self.host}:{self.port} (attempt {attempt + 1}/{max_retries})")
                self.server = couchdb.Server(self.server_url)
                
                # Test the connection by listing databases
                list(self.server)
                logger.info("Successfully connected to CouchDB")
                return
                
            except Exception as e:
                last_exception = e
                logger.warning(f"Failed to connect to CouchDB (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                    # Exponential backoff for subsequent attempts
                    delay = min(delay * 1.5, 30.0)
        
        # If we get here, all retries failed
        error_msg = f"Failed to connect to CouchDB after {max_retries} attempts. Last error: {last_exception}"
        logger.error(error_msg)
        raise ConnectionError(error_msg) from last_exception

    def is_connected(self) -> bool:
        """Check if the client is connected to CouchDB"""
        try:
            if self.server is None:
                return False
            # Simple connectivity test
            list(self.server)
            return True
        except Exception:
            return False

    def health_check(self) -> Dict[str, Any]:
        """Perform a comprehensive health check"""
        try:
            self._ensure_initialized()
            
            # Test basic connectivity
            server_info = dict(self.server.version())
            
            # Test database access
            doc_count = len(list(self.db.view('_all_docs')))
            
            return {
                "status": "healthy",
                "couchdb_version": server_info.get("version", "unknown"),
                "database": self.db_name,
                "document_count": doc_count,
                "connected": True
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "connected": False
            }

    def create_system_databases(self) -> Dict[str, Any]:
        """Explicitly create system databases and return status"""
        try:
            self._connect_with_retry()
            self._create_system_databases()
            return {
                "status": "success",
                "message": "System databases created successfully"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to create system databases: {e}"
            }

    def _ensure_initialized(self):
        """Ensure the client is initialized and connected"""
        if not self._initialized:
            self._connect_with_retry()
            self._create_system_databases()
            self.db = self._get_or_create_database()
            self._create_views()
            self._initialized = True

    def _create_system_databases(self):
        """Create system databases to eliminate CouchDB warnings"""
        system_dbs = ["_users", "_replicator"]
        
        for db_name in system_dbs:
            try:
                if db_name not in self.server:
                    logger.info(f"Creating {db_name} system database")
                    self.server.create(db_name)
                    logger.info(f"Successfully created {db_name} database")
                else:
                    logger.debug(f"{db_name} database already exists")
            except couchdb.ResourceConflict:
                logger.debug(f"{db_name} database already exists (conflict)")
            except Exception as e:
                logger.warning(f"Could not create {db_name} system database: {e}")
                # Don't fail if system databases can't be created

    def _get_or_create_database(self):
        """Get existing database or create a new one"""
        try:
            return self.server[self.db_name]
        except couchdb.ResourceNotFound:
            logger.info(f"Creating database: {self.db_name}")
            return self.server.create(self.db_name)

    def _create_views(self):
        """Create CouchDB views for querying tasks"""
        views = {
            "_id": "_design/tasks",
            "views": {
                "by_serial_number": {
                    "map": "function(doc) { if (doc.serial_number) emit(doc.serial_number, doc); }"
                },
                "by_date": {
                    "map": "function(doc) { if (doc.due_date) emit(doc.due_date, doc); }"
                },
                "by_status": {
                    "map": "function(doc) { if (doc.status) emit(doc.status, doc); }"
                },
                "by_created_date": {
                    "map": "function(doc) { if (doc.created_date) emit(doc.created_date, doc); }"
                }
            }
        }
        
        try:
            self.db.save(views)
        except couchdb.ResourceConflict:
            # View already exists
            pass

    def _day_range(self, target: datetime) -> tuple[str, str]:
        """Return ISO start / end keys for the day of *target*."""
        start = datetime.combine(target.date(), datetime.min.time()).isoformat()
        end   = datetime.combine(target.date(), datetime.max.time()).isoformat()
        return start, end

    def _next_serial_for_day(self, target: datetime) -> int:
        """Serial numbers restart every day and ignore deleted tasks."""
        start_key, end_key = self._day_range(target)
        count = 0
        for row in self.db.view('tasks/by_date', startkey=start_key, endkey=end_key):
            doc = self.db[row.id]
            if not doc.get("is_deleted", False):
                count += 1
        return count + 1  # 1-based

    def _reorder_day(self, target: datetime) -> None:
        """Close numbering gaps for the day (after a delete)."""
        start_key, end_key = self._day_range(target)
        tasks = (
            self._doc_to_task(self.db[row.id])
            for row in self.db.view('tasks/by_date', startkey=start_key, endkey=end_key)
        )
        active = sorted((t for t in tasks if not t.is_deleted), key=lambda t: t.serial_number)
        for idx, task in enumerate(active, start=1):
            if task.serial_number != idx:
                doc = self.db[task.id]
                doc["serial_number"] = idx
                doc["modified_date"] = datetime.now().isoformat()
                self.db.save(doc)

    def create_task(self, task_data: TaskCreate) -> Task:
        """Create a new task"""
        self._ensure_initialized()
        doc_id = str(uuid.uuid4())
        
        # Pick date basis – due_date if provided, else created_date
        task_day = task_data.due_date or task_data.created_date
        serial_number = self._next_serial_for_day(task_day)
        
        task_doc = {
            "_id": doc_id,
            "serial_number": serial_number,
            "description": task_data.description,
            "comment": task_data.comment,
            "status": task_data.status.value,
            "due_date": task_data.due_date.isoformat() if task_data.due_date else None,
            "created_date": task_data.created_date.isoformat(),
            "modified_date": datetime.now().isoformat(),
            "is_deleted": task_data.is_deleted,
            "type": "task"
        }
        
        self.db.save(task_doc)
        return self._doc_to_task(task_doc)

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        self._ensure_initialized()
        try:
            doc = self.db[task_id]
            return self._doc_to_task(doc)
        except couchdb.ResourceNotFound:
            return None

    def get_all_tasks(self, include_deleted: bool = False) -> List[Task]:
        """Get all tasks, optionally including soft-deleted ones"""
        self._ensure_initialized()
        tasks = []
        for row in self.db.view('tasks/by_serial_number'):
            doc = self.db[row.id]
            task = self._doc_to_task(doc)
            # Filter out deleted tasks unless explicitly requested
            if include_deleted or not task.is_deleted:
                tasks.append(task)
        return tasks

    def get_tasks_by_date(self, start_date: datetime, end_date: datetime, include_deleted: bool = False) -> List[Task]:
        """Get tasks within a date range"""
        self._ensure_initialized()
        tasks = []
        start_key = start_date.isoformat()
        end_key = end_date.isoformat()
        
        for row in self.db.view('tasks/by_date', startkey=start_key, endkey=end_key):
            doc = self.db[row.id]
            task = self._doc_to_task(doc)
            # Filter out deleted tasks unless explicitly requested
            if include_deleted or not task.is_deleted:
                tasks.append(task)
        return tasks

    def get_tasks_by_status(self, status: TaskStatus, include_deleted: bool = False) -> List[Task]:
        """Get tasks by status"""
        self._ensure_initialized()
        tasks = []
        for row in self.db.view('tasks/by_status', key=status.value):
            doc = self.db[row.id]
            task = self._doc_to_task(doc)
            # Filter out deleted tasks unless explicitly requested
            if include_deleted or not task.is_deleted:
                tasks.append(task)
        return tasks

    def update_task(self, task_id: str, task_update: TaskUpdate) -> Optional[Task]:
        """Update a task"""
        self._ensure_initialized()
        try:
            doc = self.db[task_id]
            
            # Update fields if provided
            if task_update.description is not None:
                doc["description"] = task_update.description
            if task_update.comment is not None:
                doc["comment"] = task_update.comment
            if task_update.status is not None:
                doc["status"] = task_update.status.value
            if task_update.due_date is not None:
                doc["due_date"] = task_update.due_date.isoformat()
            if task_update.is_deleted is not None:
                doc["is_deleted"] = task_update.is_deleted
            
            doc["modified_date"] = datetime.now().isoformat()
            
            self.db.save(doc)
            return self._doc_to_task(doc)
        except couchdb.ResourceNotFound:
            return None

    def soft_delete_task(self, task_id: str) -> bool:
        """Soft delete a task by marking it as deleted and renumber the day"""
        self._ensure_initialized()
        try:
            doc = self.db[task_id]
            doc["is_deleted"] = True
            doc["modified_date"] = datetime.now().isoformat()
            self.db.save(doc)

            # renumber remaining tasks for that date
            task_day = datetime.fromisoformat(doc.get("due_date") or doc["created_date"])
            self._reorder_day(task_day)
            return True
        except couchdb.ResourceNotFound:
            return False

    def delete_task(self, task_id: str) -> bool:
        """Permanently delete a task from database and renumber the day"""
        self._ensure_initialized()
        try:
            doc = self.db[task_id]
            task_day = datetime.fromisoformat(doc.get("due_date") or doc["created_date"])
            self.db.delete(doc)

            # renumber remaining tasks for that date
            self._reorder_day(task_day)
            return True
        except couchdb.ResourceNotFound:
            return False

    def _doc_to_task(self, doc: Dict[str, Any]) -> Task:
        """Convert CouchDB document to Task model"""
        return Task(
            id=doc["_id"],
            serial_number=doc["serial_number"],
            description=doc["description"],
            comment=doc.get("comment"),
            status=TaskStatus(doc["status"]),
            due_date=datetime.fromisoformat(doc["due_date"]) if doc.get("due_date") else None,
            created_date=datetime.fromisoformat(doc["created_date"]),
            modified_date=datetime.fromisoformat(doc["modified_date"]),
            is_deleted=doc.get("is_deleted", False)
        )

# Global database instance - will be lazily initialized
_db_client_instance = None

def get_db_client() -> CouchDBClient:
    """Get the global database client instance (lazy singleton)"""
    global _db_client_instance
    if _db_client_instance is None:
        _db_client_instance = CouchDBClient()
    return _db_client_instance

# For backward compatibility
db_client = get_db_client() 