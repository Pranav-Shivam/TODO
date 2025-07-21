import couchdb
import uuid
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from models.task import Task, TaskCreate, TaskUpdate, TaskStatus
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CouchDBClient:
    def __init__(self):
        username: str = os.getenv("COUCHDB_USERNAME", "root")
        password: str = os.getenv("COUCHDB_PASSWORD", "root")
        host: str = os.getenv("COUCHDB_HOST", "localhost")
        port: str = os.getenv("COUCHDB_PORT", "5984")
        server_url: str = f"http://{username}:{password}@{host}:{port}"

        self.server = couchdb.Server(server_url)
        self.db_name = os.getenv("COUCHDB_DATABASE", "todo_tasks")
        self.db = self._get_or_create_database()
        self._create_views()

    def _get_or_create_database(self):
        """Get existing database or create a new one"""
        try:
            return self.server[self.db_name]
        except couchdb.ResourceNotFound:
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

    def _get_next_serial_number(self) -> int:
        """Get the next available serial number"""
        try:
            result = self.db.view('tasks/by_serial_number', descending=True, limit=1)
            if result:
                last_serial = list(result)[0].key
                return last_serial + 1
            return 1
        except:
            return 1

    def create_task(self, task_data: TaskCreate) -> Task:
        """Create a new task"""
        doc_id = str(uuid.uuid4())
        serial_number = self._get_next_serial_number()
        
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
        try:
            doc = self.db[task_id]
            return self._doc_to_task(doc)
        except couchdb.ResourceNotFound:
            return None

    def get_all_tasks(self, include_deleted: bool = False) -> List[Task]:
        """Get all tasks, optionally including soft-deleted ones"""
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
        """Soft delete a task by marking it as deleted"""
        try:
            doc = self.db[task_id]
            doc["is_deleted"] = True
            doc["modified_date"] = datetime.now().isoformat()
            self.db.save(doc)
            return True
        except couchdb.ResourceNotFound:
            return False

    def delete_task(self, task_id: str) -> bool:
        """Permanently delete a task from database"""
        try:
            doc = self.db[task_id]
            self.db.delete(doc)
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

# Global database instance
db_client = CouchDBClient() 