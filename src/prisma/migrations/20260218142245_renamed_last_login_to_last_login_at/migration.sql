/*
  Warnings:

  - You are about to drop the column `lastLogin` on the `ApiUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiUser" DROP COLUMN "lastLogin",
ADD COLUMN     "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
