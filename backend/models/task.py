from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union
from datetime import datetime, time
from enum import Enum

class TaskStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class TaskPriority(int, Enum):
    LOW = 3
    MEDIUM = 2
    HIGH = 1

class TaskBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=500)
    comment: Optional[str] = Field(None, max_length=1000)
    status: TaskStatus = TaskStatus.NOT_STARTED
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[Union[datetime, str]] = None
    start_time: Optional[Union[time, str]] = None
    end_time: Optional[Union[time, str]] = None
    custom_color: Optional[str] = Field(None, max_length=7)  # Hex color code
    created_date: datetime = Field(default_factory=datetime.now)
    is_deleted: bool = Field(default=False)
    
    @field_validator('due_date', mode='before')
    @classmethod
    def validate_due_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError('Invalid date format')
        return v
    
    @field_validator('start_time', mode='before')
    @classmethod
    def validate_start_time(cls, v):
        if isinstance(v, str):
            try:
                return time.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid time format')
        return v
    
    @field_validator('end_time', mode='before')
    @classmethod
    def validate_end_time(cls, v):
        if isinstance(v, str):
            try:
                return time.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid time format')
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    comment: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[Union[datetime, str]] = None
    start_time: Optional[Union[time, str]] = None
    end_time: Optional[Union[time, str]] = None
    custom_color: Optional[str] = Field(None, max_length=7)
    is_deleted: Optional[bool] = None
    
    @field_validator('due_date', mode='before')
    @classmethod
    def validate_due_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError('Invalid date format')
        return v
    
    @field_validator('start_time', mode='before')
    @classmethod
    def validate_start_time(cls, v):
        if isinstance(v, str):
            try:
                return time.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid time format')
        return v
    
    @field_validator('end_time', mode='before')
    @classmethod
    def validate_end_time(cls, v):
        if isinstance(v, str):
            try:
                return time.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid time format')
        return v

class Task(TaskBase):
    id: str
    serial_number: int
    modified_date: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True 