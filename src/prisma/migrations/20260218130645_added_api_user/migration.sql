-- CreateTable
CREATE TABLE "ApiUser" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL,

    CONSTRAINT "ApiUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiUser_key_key" ON "ApiUser"("key");
