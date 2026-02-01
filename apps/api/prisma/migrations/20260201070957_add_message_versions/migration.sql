/*
  Warnings:

  - A unique constraint covering the columns `[activeVersionId]` on the table `ChatMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequence` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chatId_fkey";

-- AlterTable - Add columns with sequence having a temporary default
ALTER TABLE "ChatMessage" ADD COLUMN     "activeVersionId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;

-- Backfill sequence values for existing rows (ordered by createdAt within each chat)
WITH numbered_messages AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY "chatId" ORDER BY "createdAt") - 1 AS seq
    FROM "ChatMessage"
)
UPDATE "ChatMessage" 
SET "sequence" = numbered_messages.seq
FROM numbered_messages
WHERE "ChatMessage".id = numbered_messages.id;

-- Remove the default now that all rows have proper sequence values
ALTER TABLE "ChatMessage" ALTER COLUMN "sequence" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ChatMessageVersion" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT,
    "temperature" DOUBLE PRECISION,

    CONSTRAINT "ChatMessageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessageVersion_messageId_idx" ON "ChatMessageVersion"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessageVersion_messageId_versionNumber_key" ON "ChatMessageVersion"("messageId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_activeVersionId_key" ON "ChatMessage"("activeVersionId");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_sequence_idx" ON "ChatMessage"("chatId", "sequence");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_isActive_idx" ON "ChatMessage"("chatId", "isActive");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "ChatMessageVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageVersion" ADD CONSTRAINT "ChatMessageVersion_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
