-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `classroom` 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `classroom`;

-- 创建班级表
CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT '班级名称',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级表';

-- 创建学生表
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY COMMENT '学生ID',
  `class_id` VARCHAR(255) NOT NULL COMMENT '所属班级ID',
  `name` VARCHAR(255) NOT NULL COMMENT '学生姓名',
  `student_id` VARCHAR(255) NOT NULL COMMENT '学号',
  `selected_count` INT DEFAULT 0 COMMENT '背诵数',
  `pass_count` INT DEFAULT 0 COMMENT '成功数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_student_class` (`class_id`, `student_id`),
  INDEX `idx_class_id` (`class_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生表';

