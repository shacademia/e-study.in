/*
  Warnings:

  - You are about to drop the `Upload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_uploadedById_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "optionImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "questionImage" TEXT;

-- DropTable
DROP TABLE "Upload";
