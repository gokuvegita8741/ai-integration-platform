import os
import uuid
from typing import List
from fastapi import HTTPException, UploadFile, status
from app.db import prisma
from app.schemas.document import DocumentResponse
from app.services.activity import ActivityService


UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


class DocumentService:
    @staticmethod
    async def upload_document(
        workspace_id: str, user_id: str, file: UploadFile
    ) -> DocumentResponse:
        """Upload a document and store metadata."""
        # Verify workspace access
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        if workspace.userId != user_id:
            member = await prisma.workspacemember.find_unique(
                where={
                    "userId_workspaceId": {
                        "userId": user_id,
                        "workspaceId": workspace_id,
                    }
                }
            )
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized",
                )

        # Create workspace-specific upload directory
        workspace_dir = os.path.join(UPLOADS_DIR, workspace_id)
        os.makedirs(workspace_dir, exist_ok=True)

        # Generate unique filename
        file_ext = os.path.splitext(file.filename or "file")[1]
        unique_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(workspace_dir, unique_name)

        # Read file content and save
        content = await file.read()
        file_size = len(content)
        with open(file_path, "wb") as f:
            f.write(content)

        # Store relative path for portability
        relative_path = f"uploads/{workspace_id}/{unique_name}"

        # Create database record
        document = await prisma.document.create(
            data={
                "name": file.filename or "Untitled",
                "originalName": file.filename or "Untitled",
                "mimeType": file.content_type or "application/octet-stream",
                "sizeBytes": file_size,
                "filePath": relative_path,
                "workspaceId": workspace_id,
                "userId": user_id,
                "processingStatus": "pending",
            }
        )

        # Update workspace lastActivityAt
        await prisma.workspace.update(
            where={"id": workspace_id},
            data={"lastActivityAt": document.createdAt},
        )

        # Log activity
        await ActivityService.log_activity(
            user_id=user_id,
            action="document_uploaded",
            entity_type="document",
            entity_id=document.id,
            entity_name=document.name,
            workspace_id=workspace_id,
        )

        return DocumentResponse(
            id=document.id,
            name=document.name,
            originalName=document.originalName,
            mimeType=document.mimeType,
            sizeBytes=document.sizeBytes,
            processingStatus=document.processingStatus,
            chunkStatus=document.chunkStatus,
            embeddingStatus=document.embeddingStatus,
            vectorStatus=document.vectorStatus,
            knowledgeStatus=document.knowledgeStatus,
            createdAt=document.createdAt,
            updatedAt=document.updatedAt,
        )

    @staticmethod
    async def get_documents(workspace_id: str, user_id: str) -> List[DocumentResponse]:
        """Get all documents in a workspace."""
        # Verify workspace access
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        if workspace.userId != user_id:
            member = await prisma.workspacemember.find_unique(
                where={
                    "userId_workspaceId": {
                        "userId": user_id,
                        "workspaceId": workspace_id,
                    }
                }
            )
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized",
                )

        documents = await prisma.document.find_many(
            where={"workspaceId": workspace_id},
            order={"createdAt": "desc"},
        )

        return [
            DocumentResponse(
                id=doc.id,
                name=doc.name,
                originalName=doc.originalName,
                mimeType=doc.mimeType,
                sizeBytes=doc.sizeBytes,
                processingStatus=doc.processingStatus,
                chunkStatus=doc.chunkStatus,
                embeddingStatus=doc.embeddingStatus,
                vectorStatus=doc.vectorStatus,
                knowledgeStatus=doc.knowledgeStatus,
                createdAt=doc.createdAt,
                updatedAt=doc.updatedAt,
            )
            for doc in documents
        ]

    @staticmethod
    async def get_document(document_id: str, user_id: str) -> DocumentResponse:
        """Get a single document's metadata."""
        document = await prisma.document.find_unique(where={"id": document_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )
        if document.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        return DocumentResponse(
            id=document.id,
            name=document.name,
            originalName=document.originalName,
            mimeType=document.mimeType,
            sizeBytes=document.sizeBytes,
            processingStatus=document.processingStatus,
            chunkStatus=document.chunkStatus,
            embeddingStatus=document.embeddingStatus,
            vectorStatus=document.vectorStatus,
            knowledgeStatus=document.knowledgeStatus,
            createdAt=document.createdAt,
            updatedAt=document.updatedAt,
        )

    @staticmethod
    async def rename_document(
        document_id: str, user_id: str, new_name: str
    ) -> DocumentResponse:
        """Rename a document."""
        document = await prisma.document.find_unique(where={"id": document_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )
        if document.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        updated = await prisma.document.update(
            where={"id": document_id},
            data={"name": new_name},
        )

        return DocumentResponse(
            id=updated.id,
            name=updated.name,
            originalName=updated.originalName,
            mimeType=updated.mimeType,
            sizeBytes=updated.sizeBytes,
            processingStatus=updated.processingStatus,
            chunkStatus=updated.chunkStatus,
            embeddingStatus=updated.embeddingStatus,
            vectorStatus=updated.vectorStatus,
            knowledgeStatus=updated.knowledgeStatus,
            createdAt=updated.createdAt,
            updatedAt=updated.updatedAt,
        )

    @staticmethod
    async def delete_document(document_id: str, user_id: str):
        """Delete a document and its file."""
        document = await prisma.document.find_unique(where={"id": document_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )
        if document.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        # Delete the physical file
        full_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            document.filePath,
        )
        if os.path.exists(full_path):
            os.remove(full_path)

        workspace_id = document.workspaceId
        doc_name = document.name

        # Delete database record
        await prisma.document.delete(where={"id": document_id})

        # Log activity
        await ActivityService.log_activity(
            user_id=user_id,
            action="document_deleted",
            entity_type="document",
            entity_id=document_id,
            entity_name=doc_name,
            workspace_id=workspace_id,
        )

        return {"success": True, "message": "Document deleted"}
