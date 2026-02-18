/*
  Warnings:

  - You are about to drop the column `admin` on the `ApiUser` table. All the data in the column will be lost.
  - Added the required column `description` to the `ApiUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAdmin` to the `ApiUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiUser" DROP COLUMN "admin",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL;
