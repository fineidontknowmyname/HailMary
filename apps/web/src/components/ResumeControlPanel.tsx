import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Trash2,
  User, GraduationCap, Briefcase, FolderKanban, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { upsertProfile } from '../lib/profile';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience, EducationFormData, ExperienceFormData } from '../types/resume';
import { EMPTY_EDUCATION, EMPTY_EXPERIENCE } from '../types/resume';
import { useAppTheme } from '../lib/ThemeProvider';
import type { AppTheme } from '../lib/theme';

interface Props {
  profile: Partial<UserProfile>;
  setProfile: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  education: HailMaryEducation[];
  setEducation: React.Dispatch<React.SetStateAction<HailMaryEducation[]>>;
  experience: HailMaryExperience[];
  setExperience: React.Dispatch<React.SetStateAction<HailMaryExperience[]>>;
  projects: HailMaryProject[];
  setProjects: React.Dispatch<React.SetStateAction<HailMaryProject[]>>;
}

function SectionCard({ title, icon, defaultOpen = false, children, theme }: { title: string, icon: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode, theme: AppTheme }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden mb-4 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3 font-bold" style={{ color: theme.heading }}>
          <span style={{ color: theme.accentText }}>{icon}</span>
          {title}
        </div>
        <div style={{ color: theme.muted }}>
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: theme.cardBorder }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = '', theme }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, theme: AppTheme }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-mono mb-1.5" style={{ color: theme.muted }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
        style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '', theme }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, theme: AppTheme }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-mono mb-1.5" style={{ color: theme.muted }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all resize-none"
        style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
      />
    </div>
  );
}

function InlineError({ message, onDismiss }: { message: string, onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2.5 mb-3">
      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
      <p className="flex-1 text-xs text-red-300 leading-relaxed">{message}</p>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-300 text-xs font-bold leading-none">✕</button>
    </div>
  );
}

export function ResumeControlPanel({
  profile, setProfile,
  education, setEducation,
  experience, setExperience,
  projects, setProjects
}: Props) {
  const { theme } = useAppTheme();
  const { user } = useAuth();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    setProfileError(null);
    setSavedProfile(false);

    try {
      const result = await upsertProfile(user.id, profile);
      if (result.error) {
        console.error('[ResumeControlPanel] Profile sync failed:', result.error);
        setProfileError(result.error);
      } else {
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 3000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error saving profile.';
      console.error('[ResumeControlPanel] Profile sync exception:', msg);
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  const [eduForm, setEduForm] = useState<EducationFormData | null>(null);
  const [savingEdu, setSavingEdu] = useState(false);
  const [eduError, setEduError] = useState<string | null>(null);

  async function saveEdu() {
    if (!user || !eduForm) return;
    if (!eduForm.institution.trim() || !eduForm.degree.trim()) {
      setEduError('Institution and Degree are required.');
      return;
    }

    setSavingEdu(true);
    setEduError(null);

    try {
      const data = await api.post<HailMaryEducation>('/api/education', {
        institution: eduForm.institution,
        degree: eduForm.degree,
        cgpa: eduForm.cgpa || null,
        start_year: eduForm.start_year || null,
        end_year: eduForm.end_year || null,
      });

      setEducation([data, ...education]);
      setEduForm(null);
      setEduError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error saving education.';
      console.error('[ResumeControlPanel] Education save exception:', msg);
      setEduError(msg);
    } finally {
      setSavingEdu(false);
    }
  }

  async function deleteEdu(id: string) {
    try {
      await api.delete(`/api/education/${id}`);
      setEducation(education.filter(e => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete education entry.');
    }
  }

  const [expForm, setExpForm] = useState<ExperienceFormData | null>(null);
  const [savingExp, setSavingExp] = useState(false);
  const [expError, setExpError] = useState<string | null>(null);

  async function saveExp() {
    if (!user || !expForm) return;
    if (!expForm.company.trim() || !expForm.role.trim()) {
      setExpError('Company and Role are required.');
      return;
    }

    setSavingExp(true);
    setExpError(null);

    try {
      const data = await api.post<HailMaryExperience>('/api/experience', {
        company: expForm.company,
        role: expForm.role,
        raw_notes: expForm.raw_notes || null,
        start_year: expForm.start_year || null,
        end_year: expForm.end_year || null,
      });

      setExperience([data, ...experience]);
      setExpForm(null);
      setExpError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error saving experience.';
      console.error('[ResumeControlPanel] Experience save exception:', msg);
      setExpError(msg);
    } finally {
      setSavingExp(false);
    }
  }

  async function deleteExp(id: string) {
    try {
      await api.delete(`/api/experience/${id}`);
      setExperience(experience.filter(e => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete experience entry.');
    }
  }

  async function toggleProjectSync(id: string, currentVal: boolean) {
    const nextVal = !currentVal;
    const previous = projects;
    setProjects(projects.map(p => p.id === id ? { ...p, sync_to_resume: nextVal } : p));
    try {
      await api.put(`/api/projects/${id}`, { sync_to_resume: nextVal });
    } catch (err) {
      setProjects(previous);
      alert(err instanceof Error ? err.message : 'Failed to update project sync.');
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-black" style={{ color: theme.heading }}>Command Center</h2>
        <p className="text-sm font-mono" style={{ color: theme.muted }}>Build your ATS-optimized single-column resume.</p>
      </div>

      <SectionCard title="Identity & Links" icon={<User className="h-5 w-5" />} defaultOpen theme={theme}>
        <div className="flex items-center gap-1.5 mb-4 px-2 py-1.5 rounded-lg w-fit border" style={{ background: theme.accentSoftBg, borderColor: theme.accentBorder }}>
          <RefreshCw className="h-3 w-3" style={{ color: theme.accentText }} />
          <span className="text-[10px] font-mono tracking-wide" style={{ color: theme.accentText }}>Synced from Profile</span>
        </div>

        {profileError && <InlineError message={profileError} onDismiss={() => setProfileError(null)} />}

        <TextInput theme={theme} label="Full Name" value={profile.name || ''} onChange={(v) => setProfile({ ...profile, name: v })} />
        <TextInput theme={theme} label="Location" value={profile.location || ''} onChange={(v) => setProfile({ ...profile, location: v })} />
        <TextArea theme={theme} label="Tagline / Short Bio" value={profile.bio || ''} onChange={(v) => setProfile({ ...profile, bio: v })} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput theme={theme} label="GitHub URL" value={profile.github_url || ''} onChange={(v) => setProfile({ ...profile, github_url: v })} />
          <TextInput theme={theme} label="LinkedIn URL" value={profile.linkedin_url || ''} onChange={(v) => setProfile({ ...profile, linkedin_url: v })} />
        </div>
        <TextInput theme={theme} label="Website URL" value={profile.website_url || ''} onChange={(v) => setProfile({ ...profile, website_url: v })} />

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-2 w-full py-2.5 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 border"
          style={savedProfile
            ? { background: 'rgba(16,185,129,0.15)', color: '#34D399', borderColor: 'rgba(16,185,129,0.25)' }
            : { background: theme.accentSoftBg, color: theme.accentText, borderColor: theme.accentBorder }}
        >
          {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
          {savingProfile ? 'Syncing...' : savedProfile ? '✓ Synced to Profile' : 'Save Identity'}
        </button>

        {savedProfile && (
          <p className="text-[10px] font-mono text-center mt-2" style={{ color: theme.muted }}>Changes saved to your global profile — visible everywhere.</p>
        )}
      </SectionCard>

      <SectionCard title="Education" icon={<GraduationCap className="h-5 w-5" />} theme={theme}>
        {education.map(edu => (
          <div key={edu.id} className="rounded-lg p-4 mb-3 flex justify-between items-start border" style={{ background: theme.inputBg, borderColor: theme.cardBorder }}>
            <div>
              <div className="font-bold text-sm" style={{ color: theme.heading }}>{edu.degree}</div>
              <div className="text-xs" style={{ color: theme.muted }}>{edu.institution}</div>
              <div className="text-[10px] font-mono mt-1" style={{ color: theme.accentText }}>{edu.start_year || '?'} - {edu.end_year || 'Present'}</div>
            </div>
            <button onClick={() => deleteEdu(edu.id)} className="hover:text-red-400 p-1" style={{ color: theme.muted }}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}

        {eduForm ? (
          <div className="rounded-lg p-4 mt-4 border" style={{ background: theme.inputBg, borderColor: theme.accentBorder }}>
            {eduError && <InlineError message={eduError} onDismiss={() => setEduError(null)} />}
            <TextInput theme={theme} label="Institution" value={eduForm.institution} onChange={(v) => setEduForm({ ...eduForm, institution: v })} placeholder="University of..." />
            <TextInput theme={theme} label="Degree" value={eduForm.degree} onChange={(v) => setEduForm({ ...eduForm, degree: v })} placeholder="B.S. Computer Science" />
            <div className="grid grid-cols-2 gap-3">
              <TextInput theme={theme} label="Start Year" value={eduForm.start_year || ''} onChange={(v) => setEduForm({ ...eduForm, start_year: v })} placeholder="2018" />
              <TextInput theme={theme} label="End Year" value={eduForm.end_year || ''} onChange={(v) => setEduForm({ ...eduForm, end_year: v })} placeholder="2022 or Present" />
            </div>
            <TextInput theme={theme} label="GPA / CGPA (Optional)" value={eduForm.cgpa || ''} onChange={(v) => setEduForm({ ...eduForm, cgpa: v })} placeholder="3.8/4.0" />

            <div className="flex gap-2 mt-4">
              <button onClick={() => { setEduForm(null); setEduError(null); }} className="flex-1 py-2 text-xs font-bold border rounded-lg transition-colors" style={{ color: theme.muted, borderColor: theme.cardBorder }}>Cancel</button>
              <button onClick={saveEdu} disabled={savingEdu} className="flex-1 py-2 text-xs font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5" style={{ background: theme.accentText, color: theme.bgBase }}>
                {savingEdu && <Loader2 className="h-3 w-3 animate-spin" />}
                {savingEdu ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEduForm({ ...EMPTY_EDUCATION })} className="w-full py-3 border border-dashed rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors" style={{ color: theme.muted, borderColor: theme.cardBorder }}>
            <Plus className="h-4 w-4" /> Add Education
          </button>
        )}
      </SectionCard>

      <SectionCard title="Experience" icon={<Briefcase className="h-5 w-5" />} theme={theme}>
        {experience.map(exp => (
          <div key={exp.id} className="rounded-lg p-4 mb-3 flex justify-between items-start border" style={{ background: theme.inputBg, borderColor: theme.cardBorder }}>
            <div>
              <div className="font-bold text-sm" style={{ color: theme.heading }}>{exp.role}</div>
              <div className="text-xs" style={{ color: theme.muted }}>{exp.company}</div>
              <div className="text-[10px] font-mono mt-1" style={{ color: theme.accentText }}>{exp.start_year || '?'} - {exp.end_year || 'Present'}</div>
            </div>
            <button onClick={() => deleteExp(exp.id)} className="hover:text-red-400 p-1" style={{ color: theme.muted }}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}

        {expForm ? (
          <div className="rounded-lg p-4 mt-4 border" style={{ background: theme.inputBg, borderColor: theme.accentBorder }}>
            {expError && <InlineError message={expError} onDismiss={() => setExpError(null)} />}
            <TextInput theme={theme} label="Company" value={expForm.company} onChange={(v) => setExpForm({ ...expForm, company: v })} placeholder="Acme Corp" />
            <TextInput theme={theme} label="Role" value={expForm.role} onChange={(v) => setExpForm({ ...expForm, role: v })} placeholder="Software Engineer" />
            <div className="grid grid-cols-2 gap-3">
              <TextInput theme={theme} label="Start Year" value={expForm.start_year || ''} onChange={(v) => setExpForm({ ...expForm, start_year: v })} placeholder="2020" />
              <TextInput theme={theme} label="End Year" value={expForm.end_year || ''} onChange={(v) => setExpForm({ ...expForm, end_year: v })} placeholder="2023 or Present" />
            </div>
            <TextArea theme={theme} label="Bullet Points (Raw Notes)" value={expForm.raw_notes || ''} onChange={(v) => setExpForm({ ...expForm, raw_notes: v })} placeholder={"• Developed feature X using Y...\n• Reduced latency by 20%..."} />

            <div className="flex gap-2 mt-4">
              <button onClick={() => { setExpForm(null); setExpError(null); }} className="flex-1 py-2 text-xs font-bold border rounded-lg transition-colors" style={{ color: theme.muted, borderColor: theme.cardBorder }}>Cancel</button>
              <button onClick={saveExp} disabled={savingExp} className="flex-1 py-2 text-xs font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5" style={{ background: theme.accentText, color: theme.bgBase }}>
                {savingExp && <Loader2 className="h-3 w-3 animate-spin" />}
                {savingExp ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setExpForm({ ...EMPTY_EXPERIENCE })} className="w-full py-3 border border-dashed rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors" style={{ color: theme.muted, borderColor: theme.cardBorder }}>
            <Plus className="h-4 w-4" /> Add Experience
          </button>
        )}
      </SectionCard>

      <SectionCard title="Projects" icon={<FolderKanban className="h-5 w-5" />} theme={theme}>
        {projects.length === 0 ? (
          <p className="text-xs font-mono text-center py-4" style={{ color: theme.muted }}>No projects found. Add them in the Incubator first.</p>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="rounded-lg p-4 mb-3 border" style={{ background: theme.inputBg, borderColor: theme.cardBorder }}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-sm line-clamp-1" style={{ color: theme.heading }}>{proj.title}</div>
                <label className="flex items-center cursor-pointer ml-3 flex-shrink-0">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={proj.sync_to_resume} onChange={() => toggleProjectSync(proj.id, proj.sync_to_resume)} />
                    <div className="block w-8 h-5 rounded-full transition-colors" style={{ background: proj.sync_to_resume ? theme.accentText : theme.cardBorder }}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${proj.sync_to_resume ? 'transform translate-x-3' : ''}`}></div>
                  </div>
                </label>
              </div>
              <div className="text-xs line-clamp-2 mb-3" style={{ color: theme.muted }}>{proj.raw_notes}</div>
              <button
                className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border"
                style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.accentText }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Polish with AI
              </button>
            </div>
          ))
        )}
      </SectionCard>

    </div>
  );
}
