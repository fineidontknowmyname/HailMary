import { useState, useEffect, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { fetchProfile, upsertProfile } from '../lib/profile'
import type { UserProfile } from '../types/profile'
import { useAppTheme } from '../lib/ThemeProvider'
import type { AppTheme } from '../lib/theme'

const SOCIAL_DRAFT_KEY = 'socialLinksDraft'

type SocialDraft = {
  github_url: string
  linkedin_url: string
  twitter_url: string
  reddit_url: string
  website_url: string
}

const DEFAULT_DRAFT: SocialDraft = {
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  reddit_url: '',
  website_url: '',
}

function readDraftFromStorage(): SocialDraft {
  if (typeof window === 'undefined') return DEFAULT_DRAFT
  try {
    const raw = localStorage.getItem(SOCIAL_DRAFT_KEY)
    return raw ? (JSON.parse(raw) as SocialDraft) : DEFAULT_DRAFT
  } catch {
    return DEFAULT_DRAFT
  }
}

function Section({ title, children, theme }: { title: string; children: React.ReactNode; theme: AppTheme }) {
  return (
    <div className="rounded-2xl p-6 space-y-4 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
      <h2 className="text-sm font-bold font-mono tracking-wide border-b pb-3" style={{ color: theme.heading, borderColor: theme.cardBorder }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', theme }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; theme: AppTheme
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-mono mb-2" style={{ color: theme.muted }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
        />
      ) : (
        <input
          id={id}
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
        />
      )}
    </div>
  )
}

function SaveButton({ onClick, saving, saved, theme }: {
  onClick: () => void; saving: boolean; saved: boolean; theme: AppTheme
}) {
  return (
    <button
      onClick={onClick} disabled={saving}
      className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 border"
      style={saved
        ? { background: 'rgba(16,185,129,0.15)', color: '#34D399', borderColor: 'rgba(16,185,129,0.25)' }
        : { background: theme.accentText, color: theme.bgBase, borderColor: theme.accentText }}
    >
      {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
    </button>
  )
}

export default function ProfilePage({ onBack }: { onBack: () => void }) {
  const { theme } = useAppTheme()
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<Record<string, boolean>>({})
  const [saved,  setSaved]    = useState<Record<string, boolean>>({})
  const [error,  setError]    = useState<string | null>(null)

  const [socialDraft, setSocialDraft] = useState<SocialDraft>(readDraftFromStorage)

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(SOCIAL_DRAFT_KEY, JSON.stringify(socialDraft))
  }, [socialDraft])

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchProfile().then(p => {
      if (p) {
        const storedRaw = typeof window !== 'undefined' ? localStorage.getItem(SOCIAL_DRAFT_KEY) : null
        if (!storedRaw) {
          setSocialDraft({
            github_url:   p.github_url   ?? '',
            linkedin_url: p.linkedin_url ?? '',
            twitter_url:  p.twitter_url  ?? '',
            reddit_url:   p.reddit_url   ?? '',
            website_url:  p.website_url  ?? '',
          })
        }
      }
      setProfile(p ?? { user_id: user.id })
      setLoading(false)
    })
  }, [user, authLoading])

  function set(field: keyof UserProfile) {
    return (value: string | number) =>
      setProfile(prev => ({ ...prev, [field]: value }))
  }

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  async function saveSection(section: string, fields: Partial<UserProfile>) {
    if (!user) return
    setSaving(s => ({ ...s, [section]: true }))
    setSaved(s  => ({ ...s, [section]: false }))
    setError(null)
    try {
      const result = await upsertProfile(user.id, fields)
      if (result.error) {
        console.error(`[ProfilePage] Save failed for "${section}":`, result.error)
        setError(`Failed to save ${section}: ${result.error}`)
        setSaving(s => ({ ...s, [section]: false }))
        return
      }
      setSaving(s => ({ ...s, [section]: false }))
      setSaved(s  => ({ ...s, [section]: true }))
      if (section === 'social' && typeof window !== 'undefined') {
        localStorage.removeItem(SOCIAL_DRAFT_KEY)
      }
      setTimeout(() => setSaved(s => ({ ...s, [section]: false })), 2500)
    } catch (err) {
      console.error(`[ProfilePage] Unexpected error saving "${section}":`, err)
      setError(`Unexpected error saving ${section}. Check console for details.`)
      setSaving(s => ({ ...s, [section]: false }))
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bgBase }}>
        <div className="font-mono text-sm animate-pulse" style={{ color: theme.muted }}>Loading profile…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: theme.bgBase, color: theme.heading }}>
        <div className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: theme.headerBg, borderColor: theme.cardBorder }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={onBack} className="transition-colors text-sm font-mono" style={{ color: theme.muted }}>
              ← Back
            </button>
            <div className="font-black text-lg">
              Hail<span style={{ color: theme.accentText }}>Mary</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-4 text-center max-w-lg mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full mb-6 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
            <User className="h-10 w-10" style={{ color: theme.dim }} />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: theme.heading }}>No Active Session</h1>
          <p className="mb-1" style={{ color: theme.muted }}>
            To track your assessment scores, save resources, and build your profile, you need to initialize a session.
          </p>
          <p className="text-sm mb-8" style={{ color: theme.accentText }}>
            (New here? Clicking Initialize will automatically create your account).
          </p>
          <button
            onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
            className="rounded-xl px-8 py-3 text-sm font-bold transition-colors"
            style={{ background: theme.accentText, color: theme.bgBase }}
          >
            Initialize Session →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: theme.bgBase, color: theme.heading }}>

      <div className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: theme.headerBg, borderColor: theme.cardBorder }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="transition-colors text-sm font-mono"
            style={{ color: theme.muted }}
          >
            ← Back
          </button>
          <div className="font-black text-lg">
            Hail<span style={{ color: theme.accentText }}>Mary</span>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono transition-colors"
            style={{ borderColor: theme.cardBorder, color: theme.muted }}
            onMouseEnter={e => { e.currentTarget.style.color = theme.heading }}
            onMouseLeave={e => { e.currentTarget.style.color = theme.muted }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        <div>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <p className="text-sm mt-1" style={{ color: theme.muted }}>{user?.email}</p>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-mono bg-red-500/10 border border-red-500/30 text-red-400">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 hover:text-red-300 font-bold">✕</button>
          </div>
        )}

        <Section title="Basic Information" theme={theme}>
          <Field theme={theme} label="Username"  value={profile.username ?? ''} onChange={set('username')}  placeholder="your-username" />
          <Field theme={theme} label="Full Name" value={profile.name     ?? ''} onChange={set('name')}      placeholder="Your Name" />
          <Field theme={theme} label="Location"  value={profile.location ?? ''} onChange={set('location')}  placeholder="City, Country" />
          <div className="flex justify-end pt-2">
            <SaveButton
              theme={theme}
              onClick={() => saveSection('basic', {
                username: profile.username ?? null,
                name:     profile.name     ?? null,
                location: profile.location ?? null,
              })}
              saving={saving['basic']} saved={saved['basic']}
            />
          </div>
        </Section>

        <Section title="About You" theme={theme}>
          <Field theme={theme} label="Bio" value={profile.bio ?? ''} onChange={set('bio')} placeholder="A short bio about yourself…" type="textarea" />
          <div className="flex justify-end pt-2">
            <SaveButton
              theme={theme}
              onClick={() => saveSection('bio', { bio: profile.bio ?? null })}
              saving={saving['bio']} saved={saved['bio']}
            />
          </div>
        </Section>

        <Section title="Social Links" theme={theme}>
          <Field
            theme={theme}
            label="GitHub"
            value={socialDraft.github_url}
            onChange={v => setSocialDraft(d => ({ ...d, github_url: v }))}
            placeholder="https://github.com/username"
            type="url"
          />
          <Field
            theme={theme}
            label="LinkedIn"
            value={socialDraft.linkedin_url}
            onChange={v => setSocialDraft(d => ({ ...d, linkedin_url: v }))}
            placeholder="https://linkedin.com/in/username"
            type="url"
          />
          <Field
            theme={theme}
            label="X (Twitter)"
            value={socialDraft.twitter_url}
            onChange={v => setSocialDraft(d => ({ ...d, twitter_url: v }))}
            placeholder="https://x.com/username"
            type="url"
          />
          <Field
            theme={theme}
            label="Reddit"
            value={socialDraft.reddit_url}
            onChange={v => setSocialDraft(d => ({ ...d, reddit_url: v }))}
            placeholder="https://reddit.com/user/username"
            type="url"
          />
          <Field
            theme={theme}
            label="Personal Website"
            value={socialDraft.website_url}
            onChange={v => setSocialDraft(d => ({ ...d, website_url: v }))}
            placeholder="https://yoursite.com"
            type="url"
          />
          <div className="flex justify-end pt-2">
            <SaveButton
              theme={theme}
              onClick={() => saveSection('social', {
                github_url:   socialDraft.github_url   || null,
                linkedin_url: socialDraft.linkedin_url || null,
                twitter_url:  socialDraft.twitter_url  || null,
                reddit_url:   socialDraft.reddit_url   || null,
                website_url:  socialDraft.website_url  || null,
              })}
              saving={saving['social']} saved={saved['social']}
            />
          </div>
        </Section>

        <Section title="Connected Platforms" theme={theme}>
          <p className="text-xs font-mono" style={{ color: theme.muted }}>
            Enter your usernames to sync progress across platforms (e.g., LeetCode, HackerRank). This will allow us to track your coding activity and display it on your profile.
          </p>
          <Field theme={theme} label="LeetCode Username"   value={profile.leetcode_username   ?? ''} onChange={set('leetcode_username')}   placeholder="your-leetcode-username" />
          <Field theme={theme} label="HackerRank Username" value={profile.hackerrank_username ?? ''} onChange={set('hackerrank_username')} placeholder="your-hackerrank-username" />
          <div className="flex justify-end pt-2">
            <SaveButton
              theme={theme}
              onClick={() => saveSection('platforms', {
                leetcode_username:   profile.leetcode_username   ?? null,
                hackerrank_username: profile.hackerrank_username ?? null,
              })}
              saving={saving['platforms']} saved={saved['platforms']}
            />
          </div>
        </Section>

        <Section title="Learning Goals" theme={theme}>
          <label className="block text-xs font-mono mb-3" style={{ color: theme.muted }}>Weekly goal (hours)</label>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 5, 7, 10].map(h => (
              <button
                key={h}
                onClick={() => setProfile(p => ({ ...p, weekly_goal_hours: h }))}
                className="px-4 py-2 rounded-xl text-sm font-mono border transition-all"
                style={profile.weekly_goal_hours === h
                  ? { background: theme.accentText, borderColor: theme.accentText, color: theme.bgBase, fontWeight: 700 }
                  : { background: theme.inputBg, borderColor: theme.cardBorder, color: theme.muted }}
              >
                {h}h
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <SaveButton
              theme={theme}
              onClick={() => saveSection('goals', { weekly_goal_hours: profile.weekly_goal_hours ?? 1 })}
              saving={saving['goals']} saved={saved['goals']}
            />
          </div>
        </Section>



      </div>
    </div>
  )
}
