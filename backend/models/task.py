from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class TaskBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=500)
    comment: Optional[str] = Field(None, max_length=1000)
    status: TaskStatus = TaskStatus.NOT_STARTED
    due_date: Optional[datetime] = None
    created_date: datetime = Field(default_factory=datetime.now)
    is_deleted: bool = Field(default=False)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    comment: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    is_deleted: Optional[bool] = None

class Task(TaskBase):
    id: str
    serial_number: int
    modified_date: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True 