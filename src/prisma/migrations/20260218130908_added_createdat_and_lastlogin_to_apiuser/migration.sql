/*
  Warnings:

  - Added the required column `lastLogin` to the `ApiUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastLogin" TIMESTAMP(3) NOT NULL;
