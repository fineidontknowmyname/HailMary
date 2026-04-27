import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  /** True when Supabase fires the PASSWORD_RECOVERY event from a reset-email link. */
  passwordRecoveryPending: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setPasswordRecoveryPending: (pending: boolean) => void
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  passwordRecoveryPending: false,

  setUser:    (user)    => set({ user }),
  setSession: (session) => set({ session }),
  setPasswordRecoveryPending: (pending) => set({ passwordRecoveryPending: pending }),

  signUp: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (data.session) set({ user: data.user, session: data.session })
    set({ loading: false })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    set({
      user:        data.session?.user ?? null,
      session:     data.session      ?? null,
      initialized: true,
    })

    // Listen for all auth state changes.
    // PASSWORD_RECOVERY fires when the user clicks a Supabase reset-password
    // email link and lands back on the app — we surface the update-password UI.
    supabase.auth.onAuthStateChange((event, session) => {
      set({
        user:    session?.user ?? null,
        session: session       ?? null,
      })

      if (event === 'PASSWORD_RECOVERY') {
        set({ passwordRecoveryPending: true })
      }
    })
  },
}))