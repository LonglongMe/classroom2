-- Passages: 篇目表（独立于班级）
CREATE TABLE IF NOT EXISTS passages (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) DEFAULT '' NOT NULL,
  content MEDIUMTEXT DEFAULT '' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passage stats: 学生-篇目统计
CREATE TABLE IF NOT EXISTS passage_stats (
  student_id VARCHAR(64) NOT NULL,
  passage_id VARCHAR(64) NOT NULL,
  selected_count INT DEFAULT 0 NOT NULL,
  pass_count INT DEFAULT 0 NOT NULL,
  PRIMARY KEY (student_id, passage_id),
  CONSTRAINT fk_stats_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_stats_passage FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE CASCADE
);

