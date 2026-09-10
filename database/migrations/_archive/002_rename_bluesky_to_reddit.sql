-- Migration: Rename x_url to twitter_url, bluesky_url to reddit_url, and personal_website to website_url
-- This aligns the database schema with the updated frontend (twitter_url, reddit_url, website_url)
-- Target table: user_profiles (the actual Supabase table name)

ALTER TABLE user_profiles RENAME COLUMN x_url TO twitter_url;
ALTER TABLE user_profiles RENAME COLUMN bluesky_url TO reddit_url;
ALTER TABLE user_profiles RENAME COLUMN personal_website TO website_url;
