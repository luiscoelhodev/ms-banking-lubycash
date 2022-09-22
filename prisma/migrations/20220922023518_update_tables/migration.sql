/*
  Warnings:

  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `secure_id` on the `customers` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("customers_status")`.

*/
-- DropForeignKey
ALTER TABLE `transfers` DROP FOREIGN KEY `transfers_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `transfers` DROP FOREIGN KEY `transfers_sender_id_fkey`;

-- AlterTable
ALTER TABLE `customers` DROP PRIMARY KEY,
    DROP COLUMN `secure_id`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `current_balance` DECIMAL(12, 2) NOT NULL,
    MODIFY `status` ENUM('Accepted', 'Rejected') NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `transfers` MODIFY `sender_id` VARCHAR(191) NOT NULL,
    MODIFY `receiver_id` VARCHAR(191) NOT NULL,
    MODIFY `amount` DECIMAL(6, 2) NOT NULL;

-- AddForeignKey
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
