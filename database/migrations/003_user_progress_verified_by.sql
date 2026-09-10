ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS verified_by text
  CHECK (verified_by IN ('ai', 'fallback'));
