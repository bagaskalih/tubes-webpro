/*
  Warnings:

  - The values [GENERAL,TECHNOLOGY,HEALTH,EDUCATION,OTHER] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - The values [CHILD_NUTRITION,CHILD_PSYCHOLOGY,CHILD_DEVELOPMENT,CHILD_EDUCATION] on the enum `ExpertSpecialty` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('UMUM', 'TEKNOLOGI', 'KESEHATAN', 'EDUKASI', 'LAINNYA');
ALTER TABLE "Thread" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Thread" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
ALTER TABLE "Thread" ALTER COLUMN "category" SET DEFAULT 'UMUM';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ExpertSpecialty_new" AS ENUM ('NUTRISI_ANAK', 'PSIKOLOGI_ANAK', 'PARENTING', 'PERTUMBUHAN_ANAK', 'EDUKASI_ANAK');
ALTER TABLE "User" ALTER COLUMN "specialty" TYPE "ExpertSpecialty_new" USING ("specialty"::text::"ExpertSpecialty_new");
ALTER TYPE "ExpertSpecialty" RENAME TO "ExpertSpecialty_old";
ALTER TYPE "ExpertSpecialty_new" RENAME TO "ExpertSpecialty";
DROP TYPE "ExpertSpecialty_old";
COMMIT;

-- AlterTable
ALTER TABLE "Thread" ALTER COLUMN "category" SET DEFAULT 'UMUM';
