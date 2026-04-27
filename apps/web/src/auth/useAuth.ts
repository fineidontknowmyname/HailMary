import { useAuthStore } from './authStore'

export function useAuth() {
  const user    = useAuthStore(s => s.user)
  const session = useAuthStore(s => s.session)
  const loading = useAuthStore(s => s.loading)
  const signIn  = useAuthStore(s => s.signIn)
  const signUp  = useAuthStore(s => s.signUp)
  const signOut = useAuthStore(s => s.signOut)
  const passwordRecoveryPending    = useAuthStore(s => s.passwordRecoveryPending)
  const setPasswordRecoveryPending = useAuthStore(s => s.setPasswordRecoveryPending)

  return {
    user,
    session,
    loading,
    isLoggedIn: !!user,
    signIn,
    signUp,
    signOut,
    passwordRecoveryPending,
    setPasswordRecoveryPending,
  }
}