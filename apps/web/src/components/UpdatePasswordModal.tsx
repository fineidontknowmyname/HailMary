import { useState, useEffect, useRef } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { useNavigate } from 'react-router-dom'

// ─── Password strength helpers ─────────────────────────────────────────────

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string        // Tailwind bg class
  textColor: string    // Tailwind text class
}

function getStrength(pw: string): StrengthResult {
  if (!pw) return { score: 0, label: '', color: 'bg-zinc-800', textColor: 'text-zinc-600' }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++

  const map: Record<number, Omit<StrengthResult, 'score'>> = {
    0: { label: '',         color: 'bg-zinc-800',    textColor: 'text-zinc-600' },
    1: { label: 'Weak',     color: 'bg-red-500',     textColor: 'text-red-400' },
    2: { label: 'Fair',     color: 'bg-amber-500',   textColor: 'text-amber-400' },
    3: { label: 'Good',     color: 'bg-[#4fffb0]',   textColor: 'text-[#4fffb0]' },
    4: { label: 'Strong',   color: 'bg-[#4fffb0]',   textColor: 'text-[#4fffb0]' },
  }
  return { score: score as StrengthResult['score'], ...map[score] }
}

// ─── PasswordInput sub-component ───────────────────────────────────────────

interface PasswordInputProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  strengthBar?: boolean
}

function PasswordInput({
  id, label, value, onChange, placeholder = '••••••••', autoFocus = false, strengthBar = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const strength = getStrength(value)

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-mono text-[#7a849a]">{label}</label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={id === 'new-password' ? 'new-password' : 'off'}
          required
          minLength={6}
          className="w-full bg-[#0b0e14] border border-[#1e2535] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-[#3d4760] outline-none focus:border-[#4fffb0] focus:ring-2 focus:ring-[#4fffb0]/10 transition-all"
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a849a] hover:text-white transition-colors p-1"
        >
          {visible
            ? <EyeOff className="h-4 w-4" />
            : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Strength bar — only shown on the primary password field */}
      {strengthBar && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {([1, 2, 3, 4] as const).map(seg => (
              <div
                key={seg}
                className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                  strength.score >= seg ? strength.color : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <p className={`text-[10px] font-mono ${strength.textColor}`}>{strength.label}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

type Phase = 'idle' | 'loading' | 'success' | 'error'

interface UpdatePasswordModalProps {
  /**
   * Called after the user successfully updates their password.
   * Typically: navigate to '/' or close the modal.
   */
  onSuccess?: () => void
}

export default function UpdatePasswordModal({ onSuccess }: UpdatePasswordModalProps) {
  const { setPasswordRecoveryPending } = useAuth()
  const navigate = useNavigate()

  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phase,           setPhase]           = useState<Phase>('idle')
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null)
  const [matchError,      setMatchError]      = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [countdown, setCountdown] = useState(3)

  // Validate match in real-time once the user has typed in the confirm field
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setMatchError(newPassword !== confirmPassword)
    } else {
      setMatchError(false)
    }
  }, [newPassword, confirmPassword])

  // Auto-redirect countdown after success
  useEffect(() => {
    if (phase === 'success') {
      setCountdown(3)
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!)
            handleDone()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleDone() {
    setPasswordRecoveryPending(false)
    if (onSuccess) {
      onSuccess()
    } else {
      navigate('/', { replace: true })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (newPassword !== confirmPassword) {
      setMatchError(true)
      return
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    setPhase('loading')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setErrorMsg(error.message)
      setPhase('error')
      return
    }

    setPhase('success')
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Password updated"
      >
        <div className="bg-[#111520] border border-[#1e2535] rounded-2xl w-full max-w-md mx-4 p-10 flex flex-col items-center gap-5 text-center animate-[fadeSlideUp_0.25s_ease]">
          {/* Glow ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#4fffb0]/20 blur-xl scale-150" />
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(79,255,176,0.12)', border: '1px solid rgba(79,255,176,0.3)' }}
            >
              <CheckCircle2 className="h-8 w-8 text-[#4fffb0]" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Password Updated!</h2>
            <p className="mt-2 text-sm font-mono text-[#7a849a]">
              Your password has been changed successfully.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#4fffb0]/20 bg-[#4fffb0]/5 px-4 py-1.5 text-xs font-mono text-[#4fffb0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4fffb0] animate-pulse" />
            Redirecting to dashboard in {countdown}s…
          </div>

          <button
            onClick={handleDone}
            className="mt-1 text-xs font-mono text-[#7a849a] hover:text-white transition-colors underline underline-offset-2"
          >
            Go now
          </button>
        </div>
      </div>
    )
  }

  // ── Form state ────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-password-title"
    >
      <div className="bg-[#111520] border border-[#1e2535] rounded-2xl w-full max-w-md mx-4 p-8 relative">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(79,255,176,0.15) 0%, rgba(79,255,176,0.04) 100%)',
              border: '1px solid rgba(79,255,176,0.2)',
            }}
          >
            <KeyRound className="h-5 w-5 text-[#4fffb0]" />
          </div>
          <h2 id="update-password-title" className="text-xl font-black text-white">
            Set New Password
          </h2>
          <p className="mt-1.5 text-sm font-mono text-[#7a849a]">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          <PasswordInput
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoFocus
            strengthBar
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {/* Match validation */}
          {matchError && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Passwords do not match.
            </div>
          )}

          {/* Supabase / server errors */}
          {(phase === 'error' || errorMsg) && errorMsg && (
            <div className="flex items-start gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            id="update-password-submit"
            disabled={phase === 'loading' || matchError || newPassword.length < 6}
            className="w-full flex items-center justify-center gap-2 bg-[#4fffb0] text-[#0b0e14] font-bold py-3 rounded-xl text-sm hover:bg-[#3de89e] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {phase === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        {/* Bail-out link */}
        <p className="text-center text-xs text-[#3d4760] mt-6 font-mono">
          Changed your mind?{' '}
          <button
            type="button"
            onClick={() => {
              setPasswordRecoveryPending(false)
              navigate('/', { replace: true })
            }}
            className="text-[#7a849a] hover:text-white transition-colors underline underline-offset-2"
          >
            Return to dashboard
          </button>
        </p>
      </div>
    </div>
  )
}
