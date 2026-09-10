DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_topic_difficulty'
  ) THEN
    ALTER TABLE user_topic_difficulty RENAME TO learner_knowledge_state;
  END IF;
END $$;

ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS confidence numeric;
ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;
ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS last_tested_at timestamptz;
ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
