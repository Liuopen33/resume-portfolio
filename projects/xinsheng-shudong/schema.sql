-- ============================================
-- 心声树洞 - 数据库设计
-- ============================================

CREATE DATABASE IF NOT EXISTS xinsheng_shudong
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE xinsheng_shudong;

-- 1. 用户表（支持匿名+注册用户）
CREATE TABLE user (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  nickname    VARCHAR(50),
  avatar      VARCHAR(255) DEFAULT '/images/default-avatar.png',
  role        ENUM('user','admin') DEFAULT 'user',
  is_anonymous TINYINT(1)  DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 帖子表
CREATE TABLE post (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  content     TEXT         NOT NULL,
  mood        VARCHAR(20)  DEFAULT 'other',
  is_anonymous TINYINT(1)  DEFAULT 1,
  views       INT          DEFAULT 0,
  likes_count INT          DEFAULT 0,
  status      ENUM('active','hidden','deleted') DEFAULT 'active',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 评论表
CREATE TABLE comment (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  post_id     INT          NOT NULL,
  user_id     INT,
  content     TEXT         NOT NULL,
  parent_id   INT          DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 点赞表
CREATE TABLE `like` (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  post_id     INT,
  comment_id  INT,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (user_id, post_id, comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 标签表
CREATE TABLE tag (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(30) UNIQUE NOT NULL,
  color VARCHAR(7)  DEFAULT '#999'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 帖子-标签关联表
CREATE TABLE post_tag (
  post_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tag(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 预置情绪标签
INSERT INTO tag (name, color) VALUES
  ('开心', '#f6c23e'),
  ('难过', '#6c8ebf'),
  ('焦虑', '#e8a87c'),
  ('生气', '#e06c6c'),
  ('平静', '#7ec8a0'),
  ('迷茫', '#b0a8b9'),
  ('感恩', '#f2b88c'),
  ('吐槽', '#a0a0a0');

-- 测试用户（密码: 123456，bcrypt加密）
INSERT INTO user (username, password, nickname, is_anonymous) VALUES
  ('admin', '$2a$10$xVqYLGGYGD1QHMErXYZLeeuB4JDNdMvFhb4jKSLfIn9rTXEOxX4iO', '管理员', 0);
