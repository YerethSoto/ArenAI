CREATE TABLE IF NOT EXISTS friend_requests (
    id_request INT AUTO_INCREMENT PRIMARY KEY,
    id_sender INT NOT NULL,
    id_receiver INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fr_sender FOREIGN KEY (id_sender) REFERENCES user(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_fr_receiver FOREIGN KEY (id_receiver) REFERENCES user(id_user) ON DELETE CASCADE,
    UNIQUE KEY unique_request (id_sender, id_receiver)
);
