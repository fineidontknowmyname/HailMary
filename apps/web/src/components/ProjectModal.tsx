import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import {
  X, Github, Globe, Loader2,
  BookOpen, Zap, Trophy, Layers, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import type { HailMaryProject, ProjectFormData, ProjectStatus } from '../types/project';
import { EMPTY_FORM } from '../types/project';

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModalLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-mono font-semibold text-[#7a849a] uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}

function ModalInput({
  value, onChange, placeholder, type = 'text', className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-[#0d1017] border border-[#252b3b] rounded-xl px-4 py-3 text-sm text-white
        placeholder-[#3d4558] outline-none transition-all duration-200
        focus:border-[#4fffb0] focus:ring-1 focus:ring-[#4fffb0]/20 ${className}`}
    />
  );
}

function ModalTextarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#0d1017] border border-[#252b3b] rounded-xl px-4 py-3 text-sm text-white
        placeholder-[#3d4558] outline-none transition-all duration-200 resize-none
        focus:border-[#4fffb0] focus:ring-1 focus:ring-[#4fffb0]/20"
    />
  );
}

function Toggle({
  checked, onChange, label, sublabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-4 rounded-xl border border-[#252b3b]
        bg-[#0d1017] hover:border-[#4fffb0]/30 transition-all duration-200 group"
    >
      <div className="text-left">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs font-mono text-[#7a849a] mt-0.5">{sublabel}</div>
      </div>
      <div className={`transition-colors duration-200 ${checked ? 'text-[#4fffb0]' : 'text-[#3d4558]'}`}>
        {checked
          ? <ToggleRight className="h-7 w-7" />
          : <ToggleLeft className="h-7 w-7" />}
      </div>
    </button>
  );
}

// ─── Tech Stack Tag Input ─────────────────────────────────────────────────────

function TechStackInput({
  tags, onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) { setInput(''); return; }
    onChange([...tags, tag]);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && input === '' && (tags || []).length > 0) {
      onChange((tags || []).slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange((tags || []).filter((t) => t !== tag));
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="min-h-[48px] flex flex-wrap gap-2 items-center bg-[#0d1017] border border-[#252b3b]
        rounded-xl px-3 py-2 cursor-text transition-all duration-200
        focus-within:border-[#4fffb0] focus-within:ring-1 focus-within:ring-[#4fffb0]/20"
    >
      {(tags || []).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono
            font-medium bg-[#1a2535] border border-[#2a3548] text-[#4fffb0]"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-[#7a849a] hover:text-red-400 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={(tags || []).length === 0 ? 'Type a tech, press Enter…' : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-[#3d4558] outline-none"
      />
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function FormSection({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1e2535]">
        <span className="text-[#4fffb0]">{icon}</span>
        <span className="text-xs font-mono font-bold text-[#4fffb0] uppercase tracking-widest">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Main Modal Component ─────────────────────────────────────────────────────

export interface ProjectModalProps {
  /** null = Add mode; populated = Edit mode */
  project: HailMaryProject | null;
  onClose: () => void;
  onSaved: (project: HailMaryProject) => void;
}

const STATUS_OPTIONS: ProjectStatus[] = ['Not Started', 'Ongoing', 'Finished'];

const STATUS_STYLES: Record<ProjectStatus, string> = {
  'Not Started': 'border-[#3d4558] text-[#7a849a]',
  'Ongoing':     'border-green-500/60 text-green-400',
  'Finished':    'border-blue-500/60 text-blue-400',
};

export function ProjectModal({ project, onClose, onSaved }: ProjectModalProps) {
  const { user } = useAuth();
  const isEdit = !!project;

  const [form, setForm] = useState<ProjectFormData>(() =>
    project
      ? {
          title:                 project.title,
          status:                project.status,
          raw_notes:             project.raw_notes             ?? '',
          technical_challenges:  project.technical_challenges  ?? '',
          metrics:               project.metrics               ?? '',
          tech_stack:            project.tech_stack            ?? [],
          github_url:            project.github_url            ?? '',
          live_url:              project.live_url              ?? '',
          sync_to_portfolio:     project.sync_to_portfolio,
          sync_to_resume:        project.sync_to_resume,
        }
      : { ...EMPTY_FORM }
  );

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function patch<K extends keyof ProjectFormData>(field: K) {
    return (value: ProjectFormData[K]) =>
      setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!user) { setError('You must be logged in.'); return; }
    if (!form.title.trim()) { setError('Title is required.'); return; }

    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      title:                form.title.trim(),
      raw_notes:            form.raw_notes            || null,
      technical_challenges: form.technical_challenges || null,
      metrics:              form.metrics              || null,
      github_url:           form.github_url           || null,
      live_url:             form.live_url             || null,
      user_id:              user.id,
    };

    if (isEdit && project) {
      const { data, error: sbError } = await supabase
        .from('hailmary_projects')
        .update(payload)
        .eq('id', project.id)
        .select()
        .single();

      setSaving(false);
      if (sbError) { setError(sbError.message); return; }
      onSaved(data as HailMaryProject);
    } else {
      const { data, error: sbError } = await supabase
        .from('hailmary_projects')
        .insert(payload)
        .select()
        .single();

      setSaving(false);
      if (sbError) { setError(sbError.message); return; }
      onSaved(data as HailMaryProject);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8, 10, 16, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl
          border border-[#252b3b] flex flex-col"
        style={{ background: '#161a24', boxShadow: '0 0 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,255,176,0.05)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          border-b border-[#252b3b] backdrop-blur-sm"
          style={{ background: 'rgba(22, 26, 36, 0.97)' }}
        >
          <div>
            <h2 className="text-base font-bold text-white">
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-xs font-mono text-[#7a849a] mt-0.5">
              {isEdit ? `editing · ${project.title}` : 'capture every detail — feed the resume engine'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#7a849a] hover:text-white hover:bg-[#252b3b] transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-8">

          {/* ── Core Identity ─── */}
          <FormSection icon={<Layers className="h-4 w-4" />} title="Core Identity">
            <div>
              <ModalLabel>Project Title *</ModalLabel>
              <ModalInput
                value={form.title}
                onChange={patch('title')}
                placeholder="e.g. Real-time Collaboration Engine"
              />
            </div>

            <div>
              <ModalLabel>Status</ModalLabel>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => patch('status')(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold border transition-all duration-200
                      ${form.status === s
                        ? `${STATUS_STYLES[s]} bg-[#0d1017]`
                        : 'border-[#252b3b] text-[#3d4558] hover:border-[#3d4558] hover:text-[#7a849a]'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>

          {/* ── The Narrative ─── */}
          <FormSection icon={<BookOpen className="h-4 w-4" />} title="The Narrative">
            <div>
              <ModalLabel>What are you building?</ModalLabel>
              <ModalTextarea
                value={form.raw_notes ?? ''}
                onChange={patch('raw_notes') as (v: string) => void}
                placeholder="Give a full brain dump. What problem does it solve? Who is it for? What's the architecture?"
                rows={4}
              />
            </div>

            <div>
              <ModalLabel>What is the hardest technical challenge you solved?</ModalLabel>
              <ModalTextarea
                value={form.technical_challenges ?? ''}
                onChange={patch('technical_challenges') as (v: string) => void}
                placeholder="Be specific — the resume engine mines this for ATS keywords. E.g. 'Implemented optimistic UI updates with conflict resolution using CRDTs…'"
                rows={3}
              />
            </div>
          </FormSection>

          {/* ── The Win ─── */}
          <FormSection icon={<Trophy className="h-4 w-4" />} title="The Win">
            <div>
              <ModalLabel>Log a quantifiable metric</ModalLabel>
              <ModalInput
                value={form.metrics ?? ''}
                onChange={patch('metrics') as (v: string) => void}
                placeholder="e.g. Reduced API latency by 40%, serving 10k concurrent users"
              />
              <p className="text-xs font-mono text-[#3d4558] mt-2">
                Numbers on a resume get interviews. "Reduced load time by 20%" &gt; "improved performance".
              </p>
            </div>
          </FormSection>

          {/* ── Tech Stack ─── */}
          <FormSection icon={<Zap className="h-4 w-4" />} title="Tech Stack">
            <div>
              <ModalLabel>Technologies used</ModalLabel>
              <TechStackInput
                tags={form.tech_stack}
                onChange={patch('tech_stack')}
              />
              <p className="text-xs font-mono text-[#3d4558] mt-2">
                Press Enter or comma to add a tag. Backspace removes the last one.
              </p>
            </div>
          </FormSection>

          {/* ── Links ─── */}
          <FormSection icon={<Github className="h-4 w-4" />} title="Links">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ModalLabel>GitHub URL</ModalLabel>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d4558]" />
                  <ModalInput
                    value={form.github_url ?? ''}
                    onChange={patch('github_url') as (v: string) => void}
                    placeholder="https://github.com/…"
                    type="url"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <ModalLabel>Live / Vercel URL</ModalLabel>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d4558]" />
                  <ModalInput
                    value={form.live_url ?? ''}
                    onChange={patch('live_url') as (v: string) => void}
                    placeholder="https://yourproject.example.com"
                    type="url"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* ── Distribution ─── */}
          <FormSection icon={<Globe className="h-4 w-4" />} title="Distribution">
            <div className="space-y-3">
              <Toggle
                checked={form.sync_to_resume}
                onChange={patch('sync_to_resume')}
                label="Sync to Resume Generator"
                sublabel="sync_to_resume · This project will be available for the ATS builder"
              />
              <Toggle
                checked={form.sync_to_portfolio}
                onChange={patch('sync_to_portfolio')}
                label="Sync to Portfolio"
                sublabel="sync_to_portfolio · This project will appear on your public portfolio page"
              />
            </div>
          </FormSection>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-4 px-6 py-4
          border-t border-[#252b3b]"
          style={{ background: 'rgba(22, 26, 36, 0.97)' }}
        >
          {error && (
            <p className="text-xs font-mono text-red-400 flex-1">{error}</p>
          )}
          {!error && <div className="flex-1" />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-mono text-[#7a849a]
                border border-[#252b3b] hover:text-white hover:border-[#3d4558] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold
                bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e] disabled:opacity-60
                disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
