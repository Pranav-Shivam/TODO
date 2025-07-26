from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date
from models.task import Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority
from database.couchdb_client import db_client

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post("/", response_model=Task)
async def create_task(task: TaskCreate):
    """Create a new task"""
    try:
        return db_client.create_task(task)
    except Exception as e:
        import logging
        logging.error(f"Error in create_task: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

@router.get("/", response_model=List[Task])
async def get_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority"),
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    include_deleted: bool = Query(False, description="Include soft-deleted tasks"),
    high_priority_only: bool = Query(False, description="Show only high priority tasks"),
    today_only: bool = Query(False, description="Show only today's tasks")
):
    """Get all tasks with optional filtering"""
    try:
        if today_only:
            today = date.today()
            start_datetime = datetime.combine(today, datetime.min.time())
            end_datetime = datetime.combine(today, datetime.max.time())
            tasks = db_client.get_tasks_by_date(start_datetime, end_datetime, include_deleted)
            if high_priority_only:
                return [task for task in tasks if task.priority == TaskPriority.HIGH]
            return tasks
        
        if status and priority:
            return db_client.get_tasks_by_status_and_priority(status, priority, include_deleted)
        elif status:
            return db_client.get_tasks_by_status(status, include_deleted)
        elif priority:
            return db_client.get_tasks_by_priority(priority, include_deleted)
        elif start_date and end_date:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            end_datetime = datetime.combine(end_date, datetime.max.time())
            return db_client.get_tasks_by_date(start_datetime, end_datetime, include_deleted)
        else:
            return db_client.get_all_tasks(include_deleted)
    except Exception as e:
        import logging
        logging.error(f"Error in get_tasks: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get tasks: {str(e)}")

@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """Get a specific task by ID"""
    task = db_client.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task"""
    task = db_client.update_task(task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{task_id}/soft-delete")
async def soft_delete_task(task_id: str):
    """Soft delete a task (mark as deleted but keep in database)"""
    success = db_client.soft_delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task soft deleted successfully"}

@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """Permanently delete a task from database"""
    success = db_client.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task permanently deleted successfully"}

@router.get("/by-date/{target_date}", response_model=List[Task])
async def get_tasks_by_date(
    target_date: date,
    include_deleted: bool = Query(False, description="Include soft-deleted tasks")
):
    """Get tasks for a specific date"""
    try:
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        return db_client.get_tasks_by_date(start_datetime, end_datetime, include_deleted)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tasks for date: {str(e)}")

@router.get("/status/{status}", response_model=List[Task])
async def get_tasks_by_status_route(
    status: TaskStatus,
    include_deleted: bool = Query(False, description="Include soft-deleted tasks")
):
    """Get tasks by status"""
    try:
        return db_client.get_tasks_by_status(status, include_deleted)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tasks by status: {str(e)}")

@router.get("/priority/{priority}", response_model=List[Task])
async def get_tasks_by_priority_route(
    priority: TaskPriority,
    include_deleted: bool = Query(False, description="Include soft-deleted tasks")
):
    """Get tasks by priority"""
    try:
        return db_client.get_tasks_by_priority(priority, include_deleted)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tasks by priority: {str(e)}")

@router.patch("/{task_id}/status", response_model=Task)
async def update_task_status(task_id: str, status: TaskStatus):
    """Update only the status of a task"""
    task_update = TaskUpdate(status=status)
    task = db_client.update_task(task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{task_id}/priority", response_model=Task)
async def update_task_priority(task_id: str, priority: TaskPriority):
    """Update only the priority of a task"""
    task_update = TaskUpdate(priority=priority)
    task = db_client.update_task(task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task 