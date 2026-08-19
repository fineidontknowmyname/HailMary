import { api } from './api'
import type { UserProfile, ProfileUpdate } from '../types/profile'

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const data = await api.get<UserProfile>('/api/profile')
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function upsertProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ error: string | null }> {
  try {
    await api.put('/api/profile', { user_id: userId, ...updates })
    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}