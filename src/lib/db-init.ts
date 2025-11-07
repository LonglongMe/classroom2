import { query } from "./db"

export async function initDatabase() {
  try {
    // 创建班级表
    await query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // 创建学生表
    await query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        class_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        student_id VARCHAR(255) NOT NULL,
        selected_count INT DEFAULT 0 COMMENT '背诵数',
        pass_count INT DEFAULT 0 COMMENT '成功数',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_class (class_id, student_id)
      )
    `)

    console.log("Database tables initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

