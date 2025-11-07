-- 完整初始化脚本（可直接执行）
-- 字符集统一使用 utf8mb4

-- 1) 创建数据库
CREATE DATABASE IF NOT EXISTS `classroom`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `classroom`;

-- 2) 班级表
CREATE TABLE IF NOT EXISTS `classes` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT '班级名称',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_name` (`name`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级表';

-- 3) 学生表
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY COMMENT '学生ID',
  `class_id` VARCHAR(255) NOT NULL COMMENT '所属班级ID',
  `name` VARCHAR(255) NOT NULL COMMENT '学生姓名',
  `student_id` VARCHAR(255) NOT NULL COMMENT '学号',
  `selected_count` INT DEFAULT 0 COMMENT '背诵数',
  `pass_count` INT DEFAULT 0 COMMENT '成功数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  CONSTRAINT `fk_students_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_student_class` (`class_id`, `student_id`),
  INDEX `idx_class_id` (`class_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生表';

-- 4) 篇目表（独立于班级）
CREATE TABLE IF NOT EXISTS `passages` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL DEFAULT '',
  `content` MEDIUMTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_passages_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='篇目表';

-- 5) 学生-篇目统计表
CREATE TABLE IF NOT EXISTS `passage_stats` (
  `student_id` VARCHAR(255) NOT NULL,
  `passage_id` VARCHAR(255) NOT NULL,
  `selected_count` INT NOT NULL DEFAULT 0,
  `pass_count` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`student_id`, `passage_id`),
  CONSTRAINT `fk_stats_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stats_passage` FOREIGN KEY (`passage_id`) REFERENCES `passages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_stats_passage` (`passage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生-篇目统计表';

-- 可选初始化数据（示例）
-- INSERT INTO classes (id, name) VALUES ('demo-class-1', '示例班级');
-- INSERT INTO students (id, class_id, name, student_id) VALUES ('stu-1','demo-class-1','张三','2024001');
-- INSERT INTO passages (id, title, author, content) VALUES ('p-1','春晓','孟浩然','春眠不觉晓…');

