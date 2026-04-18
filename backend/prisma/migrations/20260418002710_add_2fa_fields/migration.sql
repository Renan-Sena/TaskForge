/*
  Warnings:

  - You are about to drop the column `backup_codes` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_enabled` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_secret` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_verified` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "backup_codes",
DROP COLUMN "two_factor_enabled",
DROP COLUMN "two_factor_secret",
DROP COLUMN "two_factor_verified";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "backup_codes" TEXT[],
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT,
ADD COLUMN     "two_factor_verified" BOOLEAN NOT NULL DEFAULT false;
