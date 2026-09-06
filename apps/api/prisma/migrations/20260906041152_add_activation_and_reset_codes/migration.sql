-- AlterTable
ALTER TABLE `users` ADD COLUMN `activation_code` VARCHAR(191) NULL,
    ADD COLUMN `activation_code_expires_at` DATETIME(3) NULL,
    ADD COLUMN `is_activated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reset_password_code` VARCHAR(191) NULL,
    ADD COLUMN `reset_password_code_expires_at` DATETIME(3) NULL;
