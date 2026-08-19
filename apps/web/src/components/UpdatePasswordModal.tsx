import { useState, useEffect, useRef } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { useNavigate } from 'react-router-dom'
import { useAppTheme } from '../lib/ThemeProvider'
import type { AppTheme } from '../lib/theme'

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: string
}

function getStrength(pw: string, theme: AppTheme): StrengthResult & { color: string; textColor: string } {
  if (!pw) return { score: 0, label: '', color: theme.cardBorder, textColor: theme.dim }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++

  const map: Record<number, { label: string; color: string; textColor: string }> = {
    0: { label: '',       color: theme.cardBorder, textColor: theme.dim },
    1: { label: 'Weak',   color: '#EF4444',         textColor: '#F87171' },
    2: { label: 'Fair',   color: '#F59E0B',         textColor: '#FBBF24' },
    3: { label: 'Good',   color: theme.accentText,  textColor: theme.accentText },
    4: { label: 'Strong', color: theme.accentText,  textColor: theme.accentText },
  }
  return { score: score as StrengthResult['score'], ...map[score] }
}

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
  const { theme } = useAppTheme();
  const [visible, setVisible] = useState(false)
  const strength = getStrength(value, theme)

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-mono" style={{ color: theme.muted }}>{label}</label>

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
          className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1"
          style={{ color: theme.muted }}
        >
          {visible
            ? <EyeOff className="h-4 w-4" />
            : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {strengthBar && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {([1, 2, 3, 4] as const).map(seg => (
              <div
                key={seg}
                className="h-[3px] flex-1 rounded-full transition-all duration-300"
                style={{ background: strength.score >= seg ? strength.color : theme.cardBorder }}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono" style={{ color: strength.textColor }}>{strength.label}</p>
        </div>
      )}
    </div>
  )
}

type Phase = 'idle' | 'loading' | 'success' | 'error'

interface UpdatePasswordModalProps {
  onSuccess?: () => void
}

export default function UpdatePasswordModal({ onSuccess }: UpdatePasswordModalProps) {
  const { setPasswordRecoveryPending } = useAuth()
  const { theme } = useAppTheme()
  const navigate = useNavigate()

  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phase,           setPhase]           = useState<Phase>('idle')
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null)
  const [matchError,      setMatchError]      = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (phase === 'loading' || phase === 'success') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPasswordRecoveryPending(false)
        navigate('/', { replace: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, setPasswordRecoveryPending, navigate])

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setMatchError(newPassword !== confirmPassword)
    } else {
      setMatchError(false)
    }
  }, [newPassword, confirmPassword])

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

  if (phase === 'success') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Password updated"
      >
        <div
          className="rounded-2xl w-full max-w-md mx-4 p-10 flex flex-col items-center gap-5 text-center border backdrop-blur-xl animate-[fadeSlideUp_0.25s_ease]"
          style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: theme.accentSoftBg, border: `1px solid ${theme.accentBorder}` }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: theme.accentText }} />
          </div>

          <div>
            <h2 className="text-xl font-black" style={{ color: theme.heading }}>Password Updated!</h2>
            <p className="mt-2 text-sm font-mono" style={{ color: theme.muted }}>
              Your password has been changed successfully.
            </p>
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono"
            style={{ borderColor: theme.accentBorder, background: theme.accentSoftBg, color: theme.accentText }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: theme.accentText }} />
            Redirecting to dashboard in {countdown}s…
          </div>

          <button
            onClick={handleDone}
            className="mt-1 text-xs font-mono transition-colors underline underline-offset-2"
            style={{ color: theme.muted }}
          >
            Go now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-password-title"
    >
      <div
        className="rounded-2xl w-full max-w-md mx-4 p-8 relative border backdrop-blur-xl"
        style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
            style={{ background: theme.accentSoftBg, border: `1px solid ${theme.accentBorder}` }}
          >
            <KeyRound className="h-5 w-5" style={{ color: theme.accentText }} />
          </div>
          <h2 id="update-password-title" className="text-xl font-black" style={{ color: theme.heading }}>
            Set New Password
          </h2>
          <p className="mt-1.5 text-sm font-mono" style={{ color: theme.muted }}>
            Choose a strong password for your account.
          </p>
        </div>

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

          {matchError && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Passwords do not match.
            </div>
          )}

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
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{ background: theme.accentText, color: theme.bgBase }}
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

        <p className="text-center text-xs mt-6 font-mono" style={{ color: theme.dim }}>
          Changed your mind?{' '}
          <button
            type="button"
            onClick={() => {
              setPasswordRecoveryPending(false)
              navigate('/', { replace: true })
            }}
            className="transition-colors underline underline-offset-2"
            style={{ color: theme.muted }}
          >
            Return to dashboard
          </button>
        </p>
      </div>
    </div>
  )
}
