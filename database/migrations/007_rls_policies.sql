ALTER TABLE resources               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_knowledge_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_paths              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_doubts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE hailmary_projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE hailmary_education      ENABLE ROW LEVEL SECURITY;
ALTER TABLE hailmary_experience     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for approved resources" ON resources;
CREATE POLICY "Allow public read for approved resources" ON resources
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Allow public inserts" ON resources;
CREATE POLICY "Allow public inserts" ON resources
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON user_profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "users can view own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can manage their own links" ON user_social_links;
CREATE POLICY "Users can manage their own links" ON user_social_links
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can view own progress" ON user_progress;
CREATE POLICY "users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own progress" ON user_progress;
CREATE POLICY "users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can delete own progress" ON user_progress;
CREATE POLICY "users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own resource tracking" ON user_resources;
CREATE POLICY "Users can manage their own resource tracking" ON user_resources
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own study sessions" ON study_sessions;
CREATE POLICY "Users can manage their own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can manage own difficulty" ON learner_knowledge_state;
CREATE POLICY "users can manage own knowledge state" ON learner_knowledge_state
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can view own path" ON user_paths;
CREATE POLICY "users can view own path" ON user_paths
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own path" ON user_paths;
CREATE POLICY "users can insert own path" ON user_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own path" ON user_paths;
CREATE POLICY "users can update own path" ON user_paths
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can delete own path" ON user_paths;
CREATE POLICY "users can delete own path" ON user_paths
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own AI chats" ON ai_doubts;
CREATE POLICY "Users can manage their own AI chats" ON ai_doubts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access for aptitude" ON aptitude_questions;
CREATE POLICY "Allow public read access for aptitude" ON aptitude_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access for mock tests" ON mock_test_questions;
CREATE POLICY "Allow public read access for mock tests" ON mock_test_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own assessment results" ON assessment_results;
CREATE POLICY "Users can manage their own assessment results" ON assessment_results
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own projects" ON hailmary_projects;
CREATE POLICY "Users can manage their own projects" ON hailmary_projects
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own education" ON hailmary_education;
CREATE POLICY "Users can manage their own education" ON hailmary_education
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own experience" ON hailmary_experience;
CREATE POLICY "Users can manage their own experience" ON hailmary_experience
  FOR ALL USING (auth.uid() = user_id);
