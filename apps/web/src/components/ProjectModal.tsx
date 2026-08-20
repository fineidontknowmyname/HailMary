import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import {
  X, Github, Globe, Loader2,
  BookOpen, Zap, Trophy, Layers, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import type { HailMaryProject, ProjectFormData, ProjectStatus } from '../types/project';
import { EMPTY_FORM } from '../types/project';
import { backdropVariants, modalVariants, modalTransition } from '../lib/motion';
import { useAppTheme } from '../lib/ThemeProvider';
import type { AppTheme } from '../lib/theme';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

function ModalLabel({ children, theme }: { children: React.ReactNode; theme: AppTheme }) {
  return (
    <label className="block text-xs font-mono font-semibold uppercase tracking-widest mb-2" style={{ color: theme.muted }}>
      {children}
    </label>
  );
}

function ModalInput({
  value, onChange, placeholder, type = 'text', className = '', theme,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  theme: AppTheme;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 ${className}`}
      style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
    />
  );
}

function ModalTextarea({
  value, onChange, placeholder, rows = 3, theme,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  theme: AppTheme;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 resize-none"
      style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
    />
  );
}

function Toggle({
  checked, onChange, label, sublabel, theme,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sublabel: string;
  theme: AppTheme;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-200 group"
      style={{ background: theme.inputBg, borderColor: theme.cardBorder }}
    >
      <div className="text-left">
        <div className="text-sm font-semibold" style={{ color: theme.heading }}>{label}</div>
        <div className="text-xs font-mono mt-0.5" style={{ color: theme.muted }}>{sublabel}</div>
      </div>
      <div className="transition-colors duration-200" style={{ color: checked ? theme.accentText : theme.dim }}>
        {checked
          ? <ToggleRight className="h-7 w-7" />
          : <ToggleLeft className="h-7 w-7" />}
      </div>
    </button>
  );
}

function TechStackInput({
  tags, onChange, theme,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  theme: AppTheme;
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
      className="min-h-[48px] flex flex-wrap gap-2 items-center rounded-xl px-3 py-2 cursor-text transition-all duration-200"
      style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}` }}
    >
      {(tags || []).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
          style={{ background: theme.accentSoftBg, border: `1px solid ${theme.accentBorder}`, color: theme.accentText }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-red-400 transition-colors"
            style={{ color: theme.muted }}
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
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
        style={{ color: theme.heading }}
      />
    </div>
  );
}

function FormSection({
  icon, title, children, theme,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  theme: AppTheme;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: theme.cardBorder }}>
        <span style={{ color: theme.accentText }}>{icon}</span>
        <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: theme.accentText }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export interface ProjectModalProps {
  project: HailMaryProject | null;
  onClose: () => void;
  onSaved: (project: HailMaryProject) => void;
}

const STATUS_OPTIONS: ProjectStatus[] = ['Not Started', 'Ongoing', 'Finished'];

export function ProjectModal({ project, onClose, onSaved }: ProjectModalProps) {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const isEdit = !!project;

  function statusStyle(status: ProjectStatus, active: boolean): React.CSSProperties {
    if (!active) return { borderColor: theme.cardBorder, color: theme.dim, background: theme.inputBg };
    if (status === 'Ongoing') return { borderColor: theme.accentText, color: theme.accentText, background: theme.accentSoftBg };
    if (status === 'Finished') return { borderColor: theme.electricText, color: theme.electricText, background: theme.accentSoftBg };
    return { borderColor: theme.muted, color: theme.muted, background: theme.inputBg };
  }

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
  const modalRef = useModalFocusTrap<HTMLDivElement>();

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
    };

    try {
      const data = isEdit && project
        ? await api.put<HailMaryProject>(`/api/projects/${project.id}`, payload)
        : await api.post<HailMaryProject>('/api/projects', payload);

      setSaving(false);
      onSaved(data);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Failed to save project.');
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8, 10, 16, 0.85)', backdropFilter: 'blur(6px)' }}
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.18 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border flex flex-col backdrop-blur-xl"
        style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={modalTransition}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm"
          style={{ borderColor: theme.cardBorder, background: theme.headerBg }}
        >
          <div>
            <h2 id="project-modal-title" className="text-base font-bold" style={{ color: theme.heading }}>
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: theme.muted }}>
              {isEdit ? `editing · ${project.title}` : 'capture every detail — feed the resume engine'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg transition-all"
            style={{ color: theme.muted }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-8">

          <FormSection icon={<Layers className="h-4 w-4" />} title="Core Identity" theme={theme}>
            <div>
              <ModalLabel theme={theme}>Project Title *</ModalLabel>
              <ModalInput
                value={form.title}
                onChange={patch('title')}
                placeholder="e.g. Real-time Collaboration Engine"
                theme={theme}
              />
            </div>

            <div>
              <ModalLabel theme={theme}>Status</ModalLabel>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => patch('status')(s)}
                    className="flex-1 py-2 rounded-xl text-xs font-mono font-semibold border transition-all duration-200"
                    style={statusStyle(s, form.status === s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>

          <FormSection icon={<BookOpen className="h-4 w-4" />} title="The Narrative" theme={theme}>
            <div>
              <ModalLabel theme={theme}>What are you building?</ModalLabel>
              <ModalTextarea
                value={form.raw_notes ?? ''}
                onChange={patch('raw_notes') as (v: string) => void}
                placeholder="Give a full brain dump. What problem does it solve? Who is it for? What's the architecture?"
                rows={4}
                theme={theme}
              />
            </div>

            <div>
              <ModalLabel theme={theme}>What is the hardest technical challenge you solved?</ModalLabel>
              <ModalTextarea
                value={form.technical_challenges ?? ''}
                onChange={patch('technical_challenges') as (v: string) => void}
                placeholder="Be specific — the resume engine mines this for ATS keywords. E.g. 'Implemented optimistic UI updates with conflict resolution using CRDTs…'"
                rows={3}
                theme={theme}
              />
            </div>
          </FormSection>

          <FormSection icon={<Trophy className="h-4 w-4" />} title="The Win" theme={theme}>
            <div>
              <ModalLabel theme={theme}>Log a quantifiable metric</ModalLabel>
              <ModalInput
                value={form.metrics ?? ''}
                onChange={patch('metrics') as (v: string) => void}
                placeholder="e.g. Reduced API latency by 40%, serving 10k concurrent users"
                theme={theme}
              />
              <p className="text-xs font-mono mt-2" style={{ color: theme.dim }}>
                Numbers on a resume get interviews. "Reduced load time by 20%" &gt; "improved performance".
              </p>
            </div>
          </FormSection>

          <FormSection icon={<Zap className="h-4 w-4" />} title="Tech Stack" theme={theme}>
            <div>
              <ModalLabel theme={theme}>Technologies used</ModalLabel>
              <TechStackInput
                tags={form.tech_stack}
                onChange={patch('tech_stack')}
                theme={theme}
              />
              <p className="text-xs font-mono mt-2" style={{ color: theme.dim }}>
                Press Enter or comma to add a tag. Backspace removes the last one.
              </p>
            </div>
          </FormSection>

          <FormSection icon={<Github className="h-4 w-4" />} title="Links" theme={theme}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ModalLabel theme={theme}>GitHub URL</ModalLabel>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: theme.dim }} />
                  <ModalInput
                    value={form.github_url ?? ''}
                    onChange={patch('github_url') as (v: string) => void}
                    placeholder="https://github.com/…"
                    type="url"
                    className="pl-10"
                    theme={theme}
                  />
                </div>
              </div>
              <div>
                <ModalLabel theme={theme}>Live / Vercel URL</ModalLabel>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: theme.dim }} />
                  <ModalInput
                    value={form.live_url ?? ''}
                    onChange={patch('live_url') as (v: string) => void}
                    placeholder="https://yourproject.example.com"
                    type="url"
                    className="pl-10"
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection icon={<Globe className="h-4 w-4" />} title="Distribution" theme={theme}>
            <div className="space-y-3">
              <Toggle
                checked={form.sync_to_resume}
                onChange={patch('sync_to_resume')}
                label="Sync to Resume Generator"
                sublabel="sync_to_resume · This project will be available for the ATS builder"
                theme={theme}
              />
              <Toggle
                checked={form.sync_to_portfolio}
                onChange={patch('sync_to_portfolio')}
                label="Sync to Portfolio"
                sublabel="sync_to_portfolio · This project will appear on your public portfolio page"
                theme={theme}
              />
            </div>
          </FormSection>
        </div>

        <div
          className="sticky bottom-0 flex items-center justify-between gap-4 px-6 py-4 border-t backdrop-blur-sm"
          style={{ borderColor: theme.cardBorder, background: theme.headerBg }}
        >
          {error && (
            <p className="text-xs font-mono text-red-400 flex-1">{error}</p>
          )}
          {!error && <div className="flex-1" />}

          <div className="flex items-center gap-3">
            <motion.button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-mono border transition-all"
              style={{ color: theme.muted, borderColor: theme.cardBorder }}
              whileTap={{ scale: 0.96 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              style={{ background: theme.accentText, color: theme.bgBase }}
              whileTap={{ scale: 0.97 }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProjectModal;
