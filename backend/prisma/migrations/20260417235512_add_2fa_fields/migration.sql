-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "backup_codes" TEXT[],
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT,
ADD COLUMN     "two_factor_verified" BOOLEAN NOT NULL DEFAULT false;
