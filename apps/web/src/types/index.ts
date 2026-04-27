export interface Resource {
  id: string
  title: string
  description: string
  type: 'course' | 'doc' | 'video' | 'practice' | 'project' | 'roadmap' | 'interview' | 'opensource'
  source: string
  link: string
  redirect_url: string
  icon: string
  color: string
  tags: string[]
  domains: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  format: string
  badge: string
  depth: 'surface' | 'guided' | 'deep' | 'foundational'
  understanding: string | null
  video_id?: string
  playlist_id?: string
  channel_name?: string
  thumbnail_url?: string
  estimated_time?: number
}