-- AlterTable
ALTER TABLE "project_configs" ADD COLUMN     "columns" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "project_templates" (
    "id" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "modules" JSONB NOT NULL,
    "columns" JSONB,
    "tasks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_templates_focus_key" ON "project_templates"("focus");
