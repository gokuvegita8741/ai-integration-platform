-- Track which assistant-message version a later message belongs to.
ALTER TABLE "ChatMessage" ADD COLUMN "parentVersionId" TEXT;

ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_parentVersionId_fkey"
FOREIGN KEY ("parentVersionId") REFERENCES "ChatMessageVersion"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ChatMessage_parentVersionId_idx" ON "ChatMessage"("parentVersionId");
