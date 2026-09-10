ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS last_struggled_at timestamptz;
ALTER TABLE learner_knowledge_state ADD COLUMN IF NOT EXISTS struggle_count integer DEFAULT 0;
