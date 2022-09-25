/*
  Warnings:

  - You are about to alter the column `status` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("customers_status")`.

*/
-- AlterTable
ALTER TABLE `customers` MODIFY `status` ENUM('Accepted', 'Rejected') NOT NULL;
