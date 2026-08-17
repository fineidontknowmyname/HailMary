import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { fetchProfile, upsertProfile } from '../lib/profile'
import type { UserProfile } from '../types/profile'

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111520] border border-[#1e2535] rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-bold text-white font-mono tracking-wide border-b border-[#1e2535] pb-3">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-[#7a849a] mb-2">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          className="w-full bg-[#0b0e14] border border-[#1e2535] rounded-xl px-4 py-3 text-sm text-white placeholder-[#7a849a] outline-none focus:border-[#4fffb0] transition-colors resize-none"
        />
      ) : (
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0b0e14] border border-[#1e2535] rounded-xl px-4 py-3 text-sm text-white placeholder-[#7a849a] outline-none focus:border-[#4fffb0] transition-colors"
        />
      )}
    </div>
  )
}

function SaveButton({ onClick, saving, saved }: {
  onClick: () => void; saving: boolean; saved: boolean
}) {
  return (
    <button
      onClick={onClick} disabled={saving}
      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
        saved
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e]'
      }`}
    >
      {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
    </button>
  )
}

export default function ProfilePage({ onBack }: { onBack: () => void }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<Record<string, boolean>>({})
  const [saved,  setSaved]    = useState<Record<string, boolean>>({})
  const [error,  setError]    = useState<string | null>(null)

  // Social Links draft — persisted in localStorage so mobile tab-switches don't wipe inputs
  const [socialDraft, setSocialDraft] = useState<SocialDraft>(readDraftFromStorage)

  // Persist social draft to localStorage on every keystroke
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
        // Seed draft from DB only when localStorage has no in-progress edits
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
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-[#7a849a] font-mono text-sm animate-pulse">Loading profile…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col">
        <div className="sticky top-0 z-40 bg-[#0b0e14]/80 backdrop-blur-md border-b border-[#1e2535]">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={onBack} className="text-[#7a849a] hover:text-white transition-colors text-sm font-mono">
              ← Back
            </button>
            <div className="font-black text-lg">
              Hail<span className="text-[#4fffb0]">Mary</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-4 text-center max-w-lg mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1a1e28] mb-6 border border-gray-800">
            <User className="h-10 w-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">No Active Session</h1>
          <p className="text-gray-400 mb-1">
            To track your assessment scores, save resources, and build your profile, you need to initialize a session.
          </p>
          <p className="text-green-400/80 text-sm mb-8">
            (New here? Clicking Initialize will automatically create your account).
          </p>
          {/* Note: I'm putting a placeholder button here, but ideally this triggers the AuthModal. Assuming there's a global trigger or they can just go back to header. I'll dispatch a custom event or let them click it if there's a global state. I'll just make it a button that says 'Initialize Session →'. */}
          <button 
            onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
            className="rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#0b0e14]"
          >
            Initialize Session →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">

      <div className="sticky top-0 z-40 bg-[#0b0e14]/80 backdrop-blur-md border-b border-[#1e2535]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-[#7a849a] hover:text-white transition-colors text-sm font-mono"
          >
            ← Back
          </button>
          <div className="font-black text-lg">
            Hail<span className="text-[#4fffb0]">Mary</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        <div>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <p className="text-[#7a849a] text-sm mt-1">{user?.email}</p>
        </div>

        {error && (
          <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-mono">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-300 font-bold">✕</button>
          </div>
        )}

        <Section title="Basic Information">
          <Field label="Username"  value={profile.username ?? ''} onChange={set('username')}  placeholder="your-username" />
          <Field label="Full Name" value={profile.name     ?? ''} onChange={set('name')}      placeholder="Your Name" />
          <Field label="Location"  value={profile.location ?? ''} onChange={set('location')}  placeholder="City, Country" />
          <div className="flex justify-end pt-2">
            <SaveButton
              onClick={() => saveSection('basic', {
                username: profile.username ?? null,
                name:     profile.name     ?? null,
                location: profile.location ?? null,
              })}
              saving={saving['basic']} saved={saved['basic']}
            />
          </div>
        </Section>

        <Section title="About You">
          <Field label="Bio" value={profile.bio ?? ''} onChange={set('bio')} placeholder="A short bio about yourself…" type="textarea" />
          <div className="flex justify-end pt-2">
            <SaveButton
              onClick={() => saveSection('bio', { bio: profile.bio ?? null })}
              saving={saving['bio']} saved={saved['bio']}
            />
          </div>
        </Section>

        <Section title="Social Links">
          <Field
            label="GitHub"
            value={socialDraft.github_url}
            onChange={v => setSocialDraft(d => ({ ...d, github_url: v }))}
            placeholder="https://github.com/username"
            type="url"
          />
          <Field
            label="LinkedIn"
            value={socialDraft.linkedin_url}
            onChange={v => setSocialDraft(d => ({ ...d, linkedin_url: v }))}
            placeholder="https://linkedin.com/in/username"
            type="url"
          />
          <Field
            label="X (Twitter)"
            value={socialDraft.twitter_url}
            onChange={v => setSocialDraft(d => ({ ...d, twitter_url: v }))}
            placeholder="https://x.com/username"
            type="url"
          />
          <Field
            label="Reddit"
            value={socialDraft.reddit_url}
            onChange={v => setSocialDraft(d => ({ ...d, reddit_url: v }))}
            placeholder="https://reddit.com/user/username"
            type="url"
          />
          <Field
            label="Personal Website"
            value={socialDraft.website_url}
            onChange={v => setSocialDraft(d => ({ ...d, website_url: v }))}
            placeholder="https://yoursite.com"
            type="url"
          />
          <div className="flex justify-end pt-2">
            <SaveButton
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

        <Section title="Connected Platforms">
          <p className="text-xs text-[#7a849a] font-mono">
            Enter your usernames to sync progress across platforms (e.g., LeetCode, HackerRank). This will allow us to track your coding activity and display it on your profile.
          </p>
          <Field label="LeetCode Username"   value={profile.leetcode_username   ?? ''} onChange={set('leetcode_username')}   placeholder="your-leetcode-username" />
          <Field label="HackerRank Username" value={profile.hackerrank_username ?? ''} onChange={set('hackerrank_username')} placeholder="your-hackerrank-username" />
          <div className="flex justify-end pt-2">
            <SaveButton
              onClick={() => saveSection('platforms', {
                leetcode_username:   profile.leetcode_username   ?? null,
                hackerrank_username: profile.hackerrank_username ?? null,
              })}
              saving={saving['platforms']} saved={saved['platforms']}
            />
          </div>
        </Section>

        <Section title="Learning Goals">
          <label className="block text-xs font-mono text-[#7a849a] mb-3">Weekly goal (hours)</label>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 5, 7, 10].map(h => (
              <button
                key={h}
                onClick={() => setProfile(p => ({ ...p, weekly_goal_hours: h }))}
                className={`px-4 py-2 rounded-xl text-sm font-mono border transition-all ${
                  profile.weekly_goal_hours === h
                    ? 'bg-[#4fffb0] border-[#4fffb0] text-[#0b0e14] font-bold'
                    : 'bg-[#0b0e14] border-[#1e2535] text-[#7a849a] hover:border-[#4fffb0]/50 hover:text-white'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <SaveButton
              onClick={() => saveSection('goals', { weekly_goal_hours: profile.weekly_goal_hours ?? 1 })}
              saving={saving['goals']} saved={saved['goals']}
            />
          </div>
        </Section>



      </div>
    </div>
  )
}