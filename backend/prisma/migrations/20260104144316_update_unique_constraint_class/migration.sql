/*
  Warnings:

  - A unique constraint covering the columns `[code,semester,year]` on the table `Class` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Class_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_semester_year_key" ON "Class"("code", "semester", "year");
