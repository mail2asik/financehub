-- CreateTable
CREATE TABLE `savings_goals` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `target_amount` DECIMAL(15, 2) NOT NULL,
    `current_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `target_date` DATETIME(3) NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goal_contributions` (
    `id` VARCHAR(191) NOT NULL,
    `goal_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `savings_goals` ADD CONSTRAINT `savings_goals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goal_contributions` ADD CONSTRAINT `goal_contributions_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `savings_goals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
