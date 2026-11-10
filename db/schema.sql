CREATE TABLE IF NOT EXISTS bot_settings (
  id TINYINT PRIMARY KEY,
  schedule_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  schedule_expression VARCHAR(64) NOT NULL DEFAULT '*/30 * * * *',
  room VARCHAR(48) NOT NULL DEFAULT 'lobby',
  checkin_message VARCHAR(4096) NOT NULL DEFAULT 'FLOP agent check-in',
  last_nonce BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_activity (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL,
  summary VARCHAR(1000) NOT NULL,
  nonce BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX activity_created_at_idx (created_at)
);

INSERT IGNORE INTO bot_settings (id, schedule_enabled, schedule_expression, room, checkin_message)
VALUES (1, FALSE, '*/30 * * * *', 'lobby', 'FLOP agent check-in');

CREATE TABLE IF NOT EXISTS bot_issues (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(24) NOT NULL,
  category VARCHAR(64) NOT NULL,
  network VARCHAR(128) NOT NULL,
  summary TEXT NOT NULL,
  steps TEXT NOT NULL,
  expected TEXT NOT NULL,
  actual TEXT NOT NULL,
  impact TEXT NOT NULL,
  tx_hash VARCHAR(255) NOT NULL DEFAULT '',
  request_id VARCHAR(255) NOT NULL DEFAULT '',
  notes TEXT NOT NULL,
  issue_status VARCHAR(24) NOT NULL DEFAULT 'ready',
  report_text MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX issue_created_at_idx (created_at),
  INDEX issue_severity_idx (severity)
);
