CREATE INDEX "ActivityLog_workspaceId_createdAt_id_idx" ON "ActivityLog"("workspaceId", "createdAt", "id");

CREATE INDEX "ActivityLog_userId_createdAt_id_idx" ON "ActivityLog"("userId", "createdAt", "id");
