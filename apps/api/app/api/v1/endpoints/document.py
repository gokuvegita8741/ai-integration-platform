from typing import List
from fastapi import APIRouter, Depends, File, UploadFile
from prisma import models
from app.api import deps
from app.schemas.document import DocumentResponse, DocumentRenameRequest
from app.services.document import DocumentService

router = APIRouter()


@router.post(
    "/workspaces/{workspace_id}/documents",
    response_model=DocumentResponse,
    status_code=201,
)
async def upload_document(
    workspace_id: str,
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
):
    """Upload a document to a workspace."""
    return await DocumentService.upload_document(workspace_id, current_user.id, file)


@router.get(
    "/workspaces/{workspace_id}/documents",
    response_model=List[DocumentResponse],
)
async def list_documents(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """List all documents in a workspace."""
    return await DocumentService.get_documents(workspace_id, current_user.id)


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get a document's metadata."""
    return await DocumentService.get_document(document_id, current_user.id)


@router.put("/documents/{document_id}", response_model=DocumentResponse)
async def rename_document(
    document_id: str,
    data: DocumentRenameRequest,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Rename a document."""
    return await DocumentService.rename_document(
        document_id, current_user.id, data.name
    )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Delete a document."""
    return await DocumentService.delete_document(document_id, current_user.id)
