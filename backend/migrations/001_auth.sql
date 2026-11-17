-- Adapt the existing TaskFlow schema and add storage for ratings and attachments.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (lower(email));

ALTER TABLE comments ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'comment';

CREATE TABLE IF NOT EXISTS comment_ratings (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS comments_issue_created_idx ON comments (issue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS files_issue_created_idx ON files (issue_id, created_at DESC);
