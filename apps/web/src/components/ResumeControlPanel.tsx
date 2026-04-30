import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Trash2, 
  User, GraduationCap, Briefcase, FolderKanban, Sparkles, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { upsertProfile } from '../lib/profile';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience, EducationFormData, ExperienceFormData } from '../types/resume';
import { EMPTY_EDUCATION, EMPTY_EXPERIENCE } from '../types/resume';

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

function SectionCard({ title, icon, defaultOpen = false, children }: { title: string, icon: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#1e222d] border border-[#2a3040] rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between bg-[#1e222d] hover:bg-[#252a36] transition-colors"
      >
        <div className="flex items-center gap-3 text-white font-bold">
          <span className="text-[#4fffb0]">{icon}</span>
          {title}
        </div>
        <div className="text-[#7a849a]">
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#2a3040] pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-mono text-[#7a849a] mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#13161e] border border-[#2a3040] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3d4558] focus:border-[#4fffb0] focus:ring-1 focus:ring-[#4fffb0]/20 outline-none transition-all"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-mono text-[#7a849a] mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#13161e] border border-[#2a3040] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3d4558] focus:border-[#4fffb0] focus:ring-1 focus:ring-[#4fffb0]/20 outline-none transition-all resize-none"
      />
    </div>
  );
}

export function ResumeControlPanel({
  profile, setProfile,
  education, setEducation,
  experience, setExperience,
  projects, setProjects
}: Props) {
  const { user } = useAuth();

  // Profile Save State
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    await upsertProfile(user.id, profile);
    setSavingProfile(false);
  }

  // --- Education Handlers ---
  const [eduForm, setEduForm] = useState<EducationFormData | null>(null);
  
  async function saveEdu() {
    if (!user || !eduForm) return;
    const { data, error } = await supabase.from('hailmary_education').insert({ ...eduForm, user_id: user.id }).select().single();
    if (!error && data) {
      setEducation([data as HailMaryEducation, ...education]);
      setEduForm(null);
    }
  }

  async function deleteEdu(id: string) {
    await supabase.from('hailmary_education').delete().eq('id', id);
    setEducation(education.filter(e => e.id !== id));
  }

  // --- Experience Handlers ---
  const [expForm, setExpForm] = useState<ExperienceFormData | null>(null);

  async function saveExp() {
    if (!user || !expForm) return;
    const { data, error } = await supabase.from('hailmary_experience').insert({ ...expForm, user_id: user.id }).select().single();
    if (!error && data) {
      setExperience([data as HailMaryExperience, ...experience]);
      setExpForm(null);
    }
  }

  async function deleteExp(id: string) {
    await supabase.from('hailmary_experience').delete().eq('id', id);
    setExperience(experience.filter(e => e.id !== id));
  }

  // --- Project Handlers ---
  async function toggleProjectSync(id: string, currentVal: boolean) {
    const nextVal = !currentVal;
    // optimistic update
    setProjects(projects.map(p => p.id === id ? { ...p, sync_to_resume: nextVal } : p));
    await supabase.from('hailmary_projects').update({ sync_to_resume: nextVal }).eq('id', id);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-black text-white">Command Center</h2>
        <p className="text-sm font-mono text-[#7a849a]">Build your ATS-optimized single-column resume.</p>
      </div>

      {/* ── IDENTITY ── */}
      <SectionCard title="Identity & Links" icon={<User className="h-5 w-5" />} defaultOpen>
        <TextInput label="Full Name" value={profile.name || ''} onChange={(v) => setProfile({ ...profile, name: v })} />
        <TextInput label="Location" value={profile.location || ''} onChange={(v) => setProfile({ ...profile, location: v })} />
        <TextArea label="Tagline / Short Bio" value={profile.bio || ''} onChange={(v) => setProfile({ ...profile, bio: v })} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="GitHub URL" value={profile.github_url || ''} onChange={(v) => setProfile({ ...profile, github_url: v })} />
          <TextInput label="LinkedIn URL" value={profile.linkedin_url || ''} onChange={(v) => setProfile({ ...profile, linkedin_url: v })} />
        </div>
        <TextInput label="Website URL" value={profile.website_url || ''} onChange={(v) => setProfile({ ...profile, website_url: v })} />
        
        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-2 w-full py-2.5 bg-[#4fffb0]/10 text-[#4fffb0] hover:bg-[#4fffb0]/20 font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
        >
          {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
          {savingProfile ? 'Saving...' : 'Save Identity'}
        </button>
      </SectionCard>

      {/* ── EDUCATION ── */}
      <SectionCard title="Education" icon={<GraduationCap className="h-5 w-5" />}>
        {education.map(edu => (
          <div key={edu.id} className="bg-[#13161e] border border-[#2a3040] rounded-lg p-4 mb-3 flex justify-between items-start">
            <div>
              <div className="font-bold text-sm text-white">{edu.degree}</div>
              <div className="text-xs text-[#7a849a]">{edu.institution}</div>
              <div className="text-[10px] font-mono text-[#4fffb0] mt-1">{edu.start_date || '?'} - {edu.end_date || 'Present'}</div>
            </div>
            <button onClick={() => deleteEdu(edu.id)} className="text-[#7a849a] hover:text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        
        {eduForm ? (
          <div className="bg-[#13161e] border border-[#4fffb0]/30 rounded-lg p-4 mt-4">
            <TextInput label="Institution" value={eduForm.institution} onChange={(v) => setEduForm({ ...eduForm, institution: v })} placeholder="University of..." />
            <TextInput label="Degree" value={eduForm.degree} onChange={(v) => setEduForm({ ...eduForm, degree: v })} placeholder="B.S. Computer Science" />
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Start Date" value={eduForm.start_date || ''} onChange={(v) => setEduForm({ ...eduForm, start_date: v })} placeholder="2018-08" />
              <TextInput label="End Date" value={eduForm.end_date || ''} onChange={(v) => setEduForm({ ...eduForm, end_date: v })} placeholder="2022-05 or Present" />
            </div>
            <TextInput label="GPA / CGPA (Optional)" value={eduForm.cgpa || ''} onChange={(v) => setEduForm({ ...eduForm, cgpa: v })} placeholder="3.8/4.0" />
            
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEduForm(null)} className="flex-1 py-2 text-xs font-bold text-[#7a849a] border border-[#2a3040] rounded-lg hover:text-white">Cancel</button>
              <button onClick={saveEdu} className="flex-1 py-2 text-xs font-bold text-[#0b0e14] bg-[#4fffb0] rounded-lg hover:bg-[#3de89e]">Add</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEduForm({ ...EMPTY_EDUCATION })} className="w-full py-3 border border-dashed border-[#2a3040] rounded-lg text-[#7a849a] text-sm font-bold flex items-center justify-center gap-2 hover:text-[#4fffb0] hover:border-[#4fffb0]/50 transition-colors">
            <Plus className="h-4 w-4" /> Add Education
          </button>
        )}
      </SectionCard>

      {/* ── EXPERIENCE ── */}
      <SectionCard title="Experience" icon={<Briefcase className="h-5 w-5" />}>
        {experience.map(exp => (
          <div key={exp.id} className="bg-[#13161e] border border-[#2a3040] rounded-lg p-4 mb-3 flex justify-between items-start">
            <div>
              <div className="font-bold text-sm text-white">{exp.role}</div>
              <div className="text-xs text-[#7a849a]">{exp.company}</div>
              <div className="text-[10px] font-mono text-[#4fffb0] mt-1">{exp.start_date || '?'} - {exp.end_date || 'Present'}</div>
            </div>
            <button onClick={() => deleteExp(exp.id)} className="text-[#7a849a] hover:text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        
        {expForm ? (
          <div className="bg-[#13161e] border border-[#4fffb0]/30 rounded-lg p-4 mt-4">
            <TextInput label="Company" value={expForm.company} onChange={(v) => setExpForm({ ...expForm, company: v })} placeholder="Acme Corp" />
            <TextInput label="Role" value={expForm.role} onChange={(v) => setExpForm({ ...expForm, role: v })} placeholder="Software Engineer" />
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Start Date" value={expForm.start_date || ''} onChange={(v) => setExpForm({ ...expForm, start_date: v })} placeholder="2020-01" />
              <TextInput label="End Date" value={expForm.end_date || ''} onChange={(v) => setExpForm({ ...expForm, end_date: v })} placeholder="Present" />
            </div>
            <TextArea label="Bullet Points (Raw Notes)" value={expForm.raw_notes || ''} onChange={(v) => setExpForm({ ...expForm, raw_notes: v })} placeholder="• Developed feature X using Y...&#10;• Reduced latency by 20%..." />
            
            <div className="flex gap-2 mt-4">
              <button onClick={() => setExpForm(null)} className="flex-1 py-2 text-xs font-bold text-[#7a849a] border border-[#2a3040] rounded-lg hover:text-white">Cancel</button>
              <button onClick={saveExp} className="flex-1 py-2 text-xs font-bold text-[#0b0e14] bg-[#4fffb0] rounded-lg hover:bg-[#3de89e]">Add</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setExpForm({ ...EMPTY_EXPERIENCE })} className="w-full py-3 border border-dashed border-[#2a3040] rounded-lg text-[#7a849a] text-sm font-bold flex items-center justify-center gap-2 hover:text-[#4fffb0] hover:border-[#4fffb0]/50 transition-colors">
            <Plus className="h-4 w-4" /> Add Experience
          </button>
        )}
      </SectionCard>

      {/* ── PROJECTS ── */}
      <SectionCard title="Projects" icon={<FolderKanban className="h-5 w-5" />}>
        {projects.length === 0 ? (
          <p className="text-xs text-[#7a849a] font-mono text-center py-4">No projects found. Add them in the Incubator first.</p>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="bg-[#13161e] border border-[#2a3040] rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-sm text-white line-clamp-1">{proj.title}</div>
                <label className="flex items-center cursor-pointer ml-3 flex-shrink-0">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={proj.sync_to_resume} onChange={() => toggleProjectSync(proj.id, proj.sync_to_resume)} />
                    <div className={`block w-8 h-5 rounded-full transition-colors ${proj.sync_to_resume ? 'bg-[#4fffb0]' : 'bg-[#2a3040]'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${proj.sync_to_resume ? 'transform translate-x-3' : ''}`}></div>
                  </div>
                </label>
              </div>
              <div className="text-xs text-[#7a849a] line-clamp-2 mb-3">{proj.raw_notes}</div>
              <button className="w-full py-2 bg-[#1e222d] border border-[#2a3040] rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all">
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
