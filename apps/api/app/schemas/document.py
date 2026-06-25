from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class DocumentResponse(BaseModel):
    id: str
    name: str
    originalName: str
    mimeType: str
    sizeBytes: int
    processingStatus: str
    chunkStatus: Optional[str] = None
    embeddingStatus: Optional[str] = None
    vectorStatus: Optional[str] = None
    knowledgeStatus: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class DocumentRenameRequest(BaseModel):
    name: str
