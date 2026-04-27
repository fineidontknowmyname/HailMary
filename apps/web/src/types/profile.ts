export interface UserProfile {
  user_id: string
  username: string | null
  name: string | null
  location: string | null
  bio: string | null
  github_url: string | null
  linkedin_url: string | null
  x_url: string | null
  bluesky_url: string | null
  personal_website: string | null
  leetcode_username: string | null
  hackerrank_username: string | null
  weekly_goal_hours: number
  comfort_zone_score: number
  last_new_domain_at: string | null
  explored_languages: string[]
}

export type ProfileUpdate = Partial<Omit<UserProfile, 'user_id'>>