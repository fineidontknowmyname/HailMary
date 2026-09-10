CREATE TABLE resources (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  description    text,
  understanding  text,
  depth          text DEFAULT 'surface',
  type           text,
  source         text,
  link           text,
  icon           text,
  color          text,
  tags           text[],
  domains        text[],
  difficulty     text,
  format         text,
  badge          text,
  video_id       text,
  playlist_id    text,
  channel_name   text,
  thumbnail_url  text,
  status         text DEFAULT 'approved',
  created_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE user_profiles (
  user_id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username            text UNIQUE,
  name                text,
  location            text,
  bio                 text,
  github_url          text,
  linkedin_url        text,
  x_url               text,
  reddit_url          text,
  personal_website    text,
  leetcode_username   text,
  hackerrank_username text,
  weekly_goal_hours   integer DEFAULT 1,
  created_at          timestamptz DEFAULT now(),
  comfort_zone_score  integer DEFAULT 100,
  last_new_domain_at  timestamptz,
  explored_languages  text[] DEFAULT '{}'
);

CREATE TABLE user_social_links (
  id            serial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name varchar NOT NULL,
  url           varchar NOT NULL,
  created_at    timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id         uuid,
  completed_at        timestamptz DEFAULT now(),
  challenge_completed boolean DEFAULT false,
  feynman_response    text,
  verified_by         text CHECK (verified_by IN ('ai', 'fallback')),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE user_resources (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id),
  resource_id         uuid NOT NULL REFERENCES resources(id),
  status              text DEFAULT 'in_progress',
  total_sessions      integer DEFAULT 0,
  total_minutes_spent integer DEFAULT 0,
  last_accessed       timestamptz DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE study_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  resource_id     uuid NOT NULL REFERENCES resources(id),
  planned_minutes integer NOT NULL,
  actual_minutes  integer DEFAULT 0,
  feeling         text,
  status          text DEFAULT 'active',
  created_at      timestamptz DEFAULT now(),
  ended_at        timestamptz
);

CREATE TABLE learner_knowledge_state (
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic            text NOT NULL,
  difficulty       text DEFAULT 'easy',
  solved_streak    integer DEFAULT 0,
  hard_skips       integer DEFAULT 0,
  status           text,
  source           text,
  confidence       numeric,
  last_verified_at timestamptz,
  last_tested_at   timestamptz,
  updated_at       timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, topic)
);

CREATE TABLE user_paths (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  domain     text NOT NULL,
  language   text,
  level      text,
  goal       text,
  path_order text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ai_doubts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  resource_id  uuid NOT NULL REFERENCES resources(id),
  user_message text NOT NULL,
  ai_response  text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE aptitude_questions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category       text NOT NULL,
  question_text  text NOT NULL,
  options        jsonb NOT NULL,
  correct_answer text NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE mock_test_questions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company        text NOT NULL,
  question_text  text NOT NULL,
  options        jsonb NOT NULL,
  correct_answer text NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE assessment_results (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_simulated  text,
  score              integer NOT NULL,
  total_questions    integer NOT NULL,
  time_taken_seconds integer NOT NULL,
  section_breakdown  jsonb,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE hailmary_projects (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title                text NOT NULL,
  status               text DEFAULT 'Not Started'
                         CHECK (status IN ('Not Started', 'Ongoing', 'Finished')),
  raw_notes            text,
  technical_challenges text,
  metrics              text,
  tech_stack           text[] DEFAULT '{}',
  github_url           text,
  live_url             text,
  sync_to_portfolio    boolean DEFAULT false,
  sync_to_resume       boolean DEFAULT true,
  created_at           timestamptz DEFAULT now()
);

CREATE TABLE hailmary_education (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree      text NOT NULL,
  cgpa        text,
  start_year  text,
  end_year    text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE hailmary_experience (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company    text NOT NULL,
  role       text NOT NULL,
  raw_notes  text,
  start_year text,
  end_year   text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_knowledge_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_paths              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_doubts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hailmary_projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hailmary_education    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hailmary_experience   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for approved resources" ON resources
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow public inserts" ON resources
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public profiles are viewable by everyone." ON user_profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own links" ON user_social_links
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own resource tracking" ON user_resources
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users can manage own difficulty" ON learner_knowledge_state
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users can view own path" ON user_paths
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users can insert own path" ON user_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI chats" ON ai_doubts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow public read access for aptitude" ON aptitude_questions
  FOR SELECT USING (true);
CREATE POLICY "Allow public read access for mock tests" ON mock_test_questions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own projects" ON hailmary_projects
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own education" ON hailmary_education
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own experience" ON hailmary_experience
  FOR ALL USING (auth.uid() = user_id);
