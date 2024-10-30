CREATE DATABASE IF NOT EXISTS usof_db_alukash;
GRANT ALL PRIVILEGES ON usof_db_alukash.* TO 'alukash'@'localhost';
USE usof_db_alukash;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_picture VARCHAR(255) DEFAULT 'default.png',
    rating INT DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    email_confirmed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    content TEXT,
    rating INT DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT,
    category_id INT,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    post_id INT NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    rating INT DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    entity_type ENUM('post', 'comment') NOT NULL,
    entity_id INT NOT NULL,
    type ENUM('like', 'dislike') NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_posts (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);


INSERT INTO users (login, password, full_name, email, profile_picture, rating, role, email_confirmed) VALUES
('user1', '$2b$10$j7lagcBvOsuHrC02U1sTQuW6c5otoTWdaIcIxOEJp/ZwDerwebqdm', 'User One', 'user1@example.com', 'uploads/avatars/default.png', 5, 'user', 1),
('user2', '$2b$10$j7lagcBvOsuHrC02U1sTQuW6c5otoTWdaIcIxOEJp/ZwDerwebqdm', 'User Two', 'user2@example.com', 'uploads/avatars/default.png', 10, 'user', 1),
('user3', '$2b$10$j7lagcBvOsuHrC02U1sTQuW6c5otoTWdaIcIxOEJp/ZwDerwebqdm', 'User Three', 'user3@example.com', 'uploads/avatars/default.png', 15, 'user', 1),
('admin1', '$2b$10$j7lagcBvOsuHrC02U1sTQuW6c5otoTWdaIcIxOEJp/ZwDerwebqdm', 'Admin One', 'admin1@example.com', 'uploads/avatars/default.png', 20, 'admin', 1),
('user4', '$2b$10$j7lagcBvOsuHrC02U1sTQuW6c5otoTWdaIcIxOEJp/ZwDerwebqdm', 'User Four', 'user4@example.com', 'uploads/avatars/default.png', 0, 'user', 0);


INSERT INTO categories (title, description) VALUES
('Technology', 'Posts about technology and innovation.'),
('Health', 'Posts about health and wellness.'),
('Education', 'Posts about educational resources and news.'),
('Entertainment', 'Posts about movies, music, and pop culture.'),
('Sports', 'Posts about sports and athletic events.');

INSERT INTO posts (author_id, title, content, rating, status) VALUES
(1, 'Tech Innovations 2024', 'Content about tech innovations in 2024', 3, 'active'),
(2, 'Healthy Living Tips', 'Content about living a healthy life', 5, 'active'),
(3, 'Education Trends 2024', 'Content about upcoming education trends', 2, 'inactive'),
(4, 'Top Movies of the Year', 'Content about popular movies this year', 4, 'active'),
(1, 'Football World Cup', 'Content about the football world cup', 1, 'active');

INSERT INTO post_categories (post_id, category_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

INSERT INTO comments (author_id, post_id, content, rating) VALUES
(2, 1, 'Interesting article about technology!', 2),
(3, 1, 'I learned a lot from this post', 1),
(1, 2, 'Thanks for the health tips', 3),
(4, 4, 'Great selection of movies', 2),
(1, 5, 'Can’t wait for the world cup!', 4);

INSERT INTO likes (author_id, entity_type, entity_id, type) VALUES
(1, 'post', 1, 'like'),
(2, 'post', 2, 'like'),
(3, 'post', 3, 'dislike'),
(4, 'comment', 1, 'like'),
(5, 'comment', 3, 'dislike');

INSERT INTO saved_posts (user_id, post_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4),
(4, 5);