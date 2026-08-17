import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Github, Globe, FileText, Layers,
  Loader2, FolderOpen, AlertCircle, Pencil, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import type { HailMaryProject, ProjectStatus } from '../types/project';
import { ProjectModal } from '../components/ProjectModal';
import { staggerContainer, staggerItem } from '../lib/motion';

// ─── Constants ────────────────────────────────────────────────────────────────

type FilterTab = 'All' | ProjectStatus;
const FILTER_TABS: FilterTab[] = ['All', 'Ongoing', 'Finished', 'Not Started'];

const STATUS_CONFIG: Record<
  ProjectStatus,
  { border: string; glow: string; dot: string; badge: string }
> = {
  'Ongoing': {
    border: 'border-green-500/60',
    glow:   '0 0 20px rgba(34,197,94,0.15), 0 0 1px rgba(34,197,94,0.4)',
    dot:    'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]',
    badge:  'bg-green-500/10 text-green-400 border-green-500/30',
  },
  'Finished': {
    border: 'border-blue-500/60',
    glow:   '0 0 20px rgba(59,130,246,0.15), 0 0 1px rgba(59,130,246,0.4)',
    dot:    'bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]',
    badge:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  'Not Started': {
    border: 'border-[#2a3040]',
    glow:   'none',
    dot:    'bg-[#3d4558]',
    badge:  'bg-[#1a1e28] text-[#7a849a] border-[#2a3040]',
  },
};

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: HailMaryProject;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg = STATUS_CONFIG[project.status];
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await supabase.from('hailmary_projects').delete().eq('id', project.id);
    onDelete();
  }

  return (
    <article
      className={`relative flex flex-col rounded-2xl border ${cfg.border} bg-[#1e222d]
        transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden`}
      style={{ boxShadow: cfg.glow }}
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-px ${
          project.status === 'Ongoing'
            ? 'bg-gradient-to-r from-transparent via-green-500/60 to-transparent'
            : project.status === 'Finished'
            ? 'bg-gradient-to-r from-transparent via-blue-500/60 to-transparent'
            : 'bg-gradient-to-r from-transparent via-[#2a3040] to-transparent'
        }`}
      />

      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
              text-[10px] font-mono font-semibold border mb-3 ${cfg.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${
              project.status === 'Ongoing' ? 'animate-pulse' : ''
            }`} />
            {project.status}
          </span>
          <h3 className="text-base font-bold text-white leading-tight line-clamp-2">
            {project.title}
          </h3>
        </div>

        {/* Action buttons — appear on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-[#7a849a] hover:text-[#4fffb0] hover:bg-[#4fffb0]/10 transition-all"
            title="Edit project"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-[#7a849a] hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete project"
          >
            {deleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Notes preview */}
      {project.raw_notes && (
        <p className="px-5 pb-3 text-xs text-[#7a849a] line-clamp-2 leading-relaxed font-mono">
          {project.raw_notes}
        </p>
      )}

      {/* Tech stack pills */}
      {(project.tech_stack || []).length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {(project.tech_stack || []).slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium
                bg-[#13161e] border border-[#252b3b] text-[#4fffb0]"
            >
              {tech}
            </span>
          ))}
          {(project.tech_stack || []).length > 5 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#3d4558] border border-[#252b3b]">
              +{(project.tech_stack || []).length - 5}
            </span>
          )}
        </div>
      )}

      {/* Metrics chip */}
      {project.metrics && (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400/80
            bg-amber-500/5 border border-amber-500/15 px-2.5 py-1 rounded-lg">
            📈 {project.metrics}
          </span>
        </div>
      )}

      {/* Links row */}
      {(project.github_url || project.live_url) && (
        <div className="px-5 pb-3 flex items-center gap-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-mono text-[#7a849a]
                hover:text-[#4fffb0] transition-colors"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-mono text-[#7a849a]
                hover:text-blue-400 transition-colors"
            >
              <Globe className="h-3 w-3" />
              Live
            </a>
          )}
        </div>
      )}

      {/* Card footer — sync indicators */}
      <div className="mt-auto px-5 py-3 flex items-center gap-3 border-t border-[#1a1e2a]">
        <div
          className={`flex items-center gap-1.5 text-[10px] font-mono rounded-md px-2 py-1
            transition-colors ${
              project.sync_to_resume
                ? 'bg-[#4fffb0]/5 text-[#4fffb0] border border-[#4fffb0]/15'
                : 'text-[#2a3040] border border-[#1e2535]'
            }`}
        >
          <FileText className="h-3 w-3" />
          Resume
        </div>
        <div
          className={`flex items-center gap-1.5 text-[10px] font-mono rounded-md px-2 py-1
            transition-colors ${
              project.sync_to_portfolio
                ? 'bg-purple-500/5 text-purple-400 border border-purple-500/15'
                : 'text-[#2a3040] border border-[#1e2535]'
            }`}
        >
          <Layers className="h-3 w-3" />
          Portfolio
        </div>

        {/* Created date — far right */}
        <span className="ml-auto text-[9px] font-mono text-[#2a3040]">
          {new Date(project.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: '2-digit',
          })}
        </span>
      </div>
    </article>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered, onNew }: { filtered: boolean; onNew: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div
        className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(79,255,176,0.08) 0%, rgba(79,255,176,0.02) 100%)',
          border: '1px solid rgba(79,255,176,0.12)',
        }}
      >
        <FolderOpen className="h-9 w-9 text-[#4fffb0]/60" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        {filtered ? 'No projects match this filter' : 'No projects yet'}
      </h3>
      <p className="text-sm font-mono text-[#7a849a] mb-6 max-w-xs">
        {filtered
          ? 'Try switching to "All" or changing your search query.'
          : 'Every great career starts with a single project. Start capturing yours.'}
      </p>
      {!filtered && (
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
            bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e] transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Your First Project
        </button>
      )}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function IncubatorPage() {
  const { user, isLoggedIn } = useAuth();

  const [projects,  setProjects]  = useState<HailMaryProject[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // UI state
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<HailMaryProject | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }
    async function fetchProjects() {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('hailmary_projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) setFetchError(error.message);
      else setProjects((data ?? []) as HailMaryProject[]);
      setLoading(false);
    }
    fetchProjects();
  }, [user, isLoggedIn]);

  // ── Filter + Search ────────────────────────────────────────────────────────
  const visibleProjects = useMemo(() => {
    let list = projects || [];
    if (activeFilter !== 'All') {
      list = list.filter((p) => p.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.raw_notes?.toLowerCase().includes(q) ||
          (p.tech_stack || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, activeFilter, searchQuery]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function openNew() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(project: HailMaryProject) {
    setEditTarget(project);
    setModalOpen(true);
  }

  function handleSaved(saved: HailMaryProject) {
    setProjects((prev) => {
      const existing = prev.findIndex((p) => p.id === saved.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center text-center px-4">
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(79,255,176,0.08) 0%, rgba(79,255,176,0.02) 100%)',
            border: '1px solid rgba(79,255,176,0.12)',
          }}
        >
          <FolderOpen className="h-9 w-9 text-[#4fffb0]/60" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Project Incubator</h1>
        <p className="text-sm font-mono text-[#7a849a] mb-6 max-w-sm">
          Sign in to track your projects, log metrics, and feed your resume engine.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
            bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e] transition-all"
        >
          Initialize Session →
        </button>
      </div>
    );
  }

  // ── Counts for filter badges ───────────────────────────────────────────────
  const counts: Record<FilterTab, number> = {
    All:           (projects || []).length,
    Ongoing:       (projects || []).filter((p) => p.status === 'Ongoing').length,
    Finished:      (projects || []).filter((p) => p.status === 'Finished').length,
    'Not Started': (projects || []).filter((p) => p.status === 'Not Started').length,
  };

  return (
    <div className="min-h-screen bg-[#13161e] text-white">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-[#4fffb0] mb-1 tracking-widest uppercase">
              Build → Project Incubator
            </p>
            <h1 className="text-2xl font-black text-white">
              Your Projects
            </h1>
            <p className="text-sm font-mono text-[#7a849a] mt-1">
              {(projects || []).length} project{(projects || []).length !== 1 ? 's' : ''} tracked
              {(projects || []).filter((p) => p.sync_to_resume).length > 0 &&
                ` · ${(projects || []).filter((p) => p.sync_to_resume).length} synced to resume`}
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e] transition-all duration-200
              shadow-[0_0_20px_rgba(79,255,176,0.2)] hover:shadow-[0_0_30px_rgba(79,255,176,0.35)]
              flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* ── Top bar: Search + Filters ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d4558]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, notes, or tech stack…"
            className="w-full bg-[#1e222d] border border-[#252b3b] rounded-xl
              pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#3d4558]
              outline-none focus:border-[#4fffb0]/50 focus:ring-1 focus:ring-[#4fffb0]/10
              transition-all duration-200"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#1e222d] border border-[#252b3b] rounded-xl p-1 flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold
                transition-all duration-200 ${
                  activeFilter === tab
                    ? 'bg-[#13161e] text-[#4fffb0] shadow-sm'
                    : 'text-[#7a849a] hover:text-white'
                }`}
            >
              {tab === 'Not Started' ? 'Idle' : tab}
              {counts[tab] > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1
                    rounded-full text-[9px] font-bold ${
                      activeFilter === tab
                        ? 'bg-[#4fffb0]/20 text-[#4fffb0]'
                        : 'bg-[#252b3b] text-[#7a849a]'
                    }`}
                >
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
          <p className="text-sm font-mono text-[#7a849a]">Loading projects…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm font-mono text-red-400">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-mono text-[#7a849a] hover:text-white underline transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {visibleProjects.length === 0 ? (
            <EmptyState
              filtered={activeFilter !== 'All' || searchQuery.trim() !== ''}
              onNew={openNew}
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {visibleProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={staggerItem}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                    layout
                  >
                    <ProjectCard
                      project={project}
                      onEdit={() => openEdit(project)}
                      onDelete={() => handleDeleted(project.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      )}

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <ProjectModal
          project={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
