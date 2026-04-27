import { supabase } from './supabase'
import type { UserProfile, ProfileUpdate } from '../types/profile'

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function upsertProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...updates })

  return { error: error?.message ?? null }
}