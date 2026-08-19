import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, FolderOpen, AlertCircle, Loader2, Pencil, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import type { HailMaryProject, ProjectStatus } from '../types/project';
import { ProjectModal } from '../components/ProjectModal';
import { staggerContainer, staggerItem } from '../lib/motion';
import { useAppTheme } from '../lib/ThemeProvider';
import type { AppTheme } from '../lib/theme';

type FilterTab = 'All' | ProjectStatus;
const FILTER_TABS: FilterTab[] = ['All', 'Ongoing', 'Finished', 'Not Started'];

function statusConfig(status: ProjectStatus, theme: AppTheme) {
  if (status === 'Ongoing') {
    return {
      border: theme.accentBorderStrong,
      accentBar: theme.accentText,
      dot: theme.accentText,
      badgeBg: theme.accentSoftBg,
      badgeText: theme.accentText,
      badgeBorder: theme.accentBorder,
      pulse: true,
    };
  }
  if (status === 'Finished') {
    return {
      border: theme.electricText,
      accentBar: theme.electricText,
      dot: theme.electricText,
      badgeBg: 'rgba(59,130,246,0.1)',
      badgeText: theme.electricText,
      badgeBorder: 'rgba(59,130,246,0.3)',
      pulse: false,
    };
  }
  return {
    border: theme.cardBorder,
    accentBar: theme.cardBorder,
    dot: theme.dim,
    badgeBg: theme.cardBg,
    badgeText: theme.muted,
    badgeBorder: theme.cardBorder,
    pulse: false,
  };
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
  theme,
}: {
  project: HailMaryProject;
  onEdit: () => void;
  onDelete: () => void;
  theme: AppTheme;
}) {
  const cfg = statusConfig(project.status, theme);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/projects/${project.id}`);
      onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project.');
      setDeleting(false);
    }
  }

  return (
    <article
      className="relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden"
      style={{ borderColor: cfg.border, background: theme.cardBg, boxShadow: theme.shadowCard }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: cfg.accentBar }} />

      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border mb-3"
            style={{ background: cfg.badgeBg, color: cfg.badgeText, borderColor: cfg.badgeBorder }}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.pulse ? 'animate-pulse' : ''}`} style={{ background: cfg.dot }} />
            {project.status}
          </span>
          <h3 className="text-base font-bold leading-tight line-clamp-2" style={{ color: theme.heading }}>
            {project.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: theme.muted }}
            title="Edit project"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:text-red-400 transition-all"
            style={{ color: theme.muted }}
            title="Delete project"
          >
            {deleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {project.raw_notes && (
        <p className="px-5 pb-3 text-xs line-clamp-2 leading-relaxed font-mono" style={{ color: theme.muted }}>
          {project.raw_notes}
        </p>
      )}

      {(project.tech_stack || []).length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {(project.tech_stack || []).slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border"
              style={{ background: theme.bgBase, borderColor: theme.cardBorder, color: theme.accentText }}
            >
              {tech}
            </span>
          ))}
          {(project.tech_stack || []).length > 5 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono border" style={{ color: theme.dim, borderColor: theme.cardBorder }}>
              +{(project.tech_stack || []).length - 5}
            </span>
          )}
        </div>
      )}

      {project.metrics && (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg border" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}>
            📈 {project.metrics}
          </span>
        </div>
      )}

      {(project.github_url || project.live_url) && (
        <div className="px-5 pb-3 flex items-center gap-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-mono transition-colors"
              style={{ color: theme.muted }}
            >
              Source
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-mono transition-colors"
              style={{ color: theme.muted }}
            >
              Live
            </a>
          )}
        </div>
      )}

      <div className="mt-auto px-5 py-3 flex items-center gap-3 border-t" style={{ borderColor: theme.cardBorder }}>
        <div
          className="flex items-center gap-1.5 text-[10px] font-mono rounded-md px-2 py-1 border transition-colors"
          style={project.sync_to_resume
            ? { background: theme.accentSoftBg, color: theme.accentText, borderColor: theme.accentBorder }
            : { color: theme.dim, borderColor: theme.cardBorder }}
        >
          Resume
        </div>
        <div
          className="flex items-center gap-1.5 text-[10px] font-mono rounded-md px-2 py-1 border transition-colors"
          style={project.sync_to_portfolio
            ? { background: 'rgba(59,130,246,0.08)', color: theme.electricText, borderColor: 'rgba(59,130,246,0.25)' }
            : { color: theme.dim, borderColor: theme.cardBorder }}
        >
          Portfolio
        </div>

        <span className="ml-auto text-[9px] font-mono" style={{ color: theme.dim }}>
          {new Date(project.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: '2-digit',
          })}
        </span>
      </div>
    </article>
  );
}

function EmptyState({ filtered, onNew, theme }: { filtered: boolean; onNew: () => void; theme: AppTheme }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div
        className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6 border"
        style={{ background: theme.accentSoftBg, borderColor: theme.accentBorder }}
      >
        <FolderOpen className="h-9 w-9" style={{ color: theme.accentText, opacity: 0.6 }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: theme.heading }}>
        {filtered ? 'No projects match this filter' : 'No projects yet'}
      </h3>
      <p className="text-sm font-mono mb-6 max-w-xs" style={{ color: theme.muted }}>
        {filtered
          ? 'Try switching to "All" or changing your search query.'
          : 'Every great career starts with a single project. Start capturing yours.'}
      </p>
      {!filtered && (
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
          style={{ background: theme.accentText, color: theme.bgBase }}
        >
          <Plus className="h-4 w-4" />
          Add Your First Project
        </button>
      )}
    </div>
  );
}

export default function IncubatorPage() {
  const { theme } = useAppTheme();
  const { user, isLoggedIn } = useAuth();

  const [projects,  setProjects]  = useState<HailMaryProject[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<HailMaryProject | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }
    async function fetchProjects() {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await api.get<HailMaryProject[]>('/api/projects');
        setProjects(data ?? []);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load projects.');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [user, isLoggedIn]);

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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: theme.bgBase }}>
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6 border"
          style={{ background: theme.accentSoftBg, borderColor: theme.accentBorder }}
        >
          <FolderOpen className="h-9 w-9" style={{ color: theme.accentText, opacity: 0.6 }} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: theme.heading }}>Project Incubator</h1>
        <p className="text-sm font-mono mb-6 max-w-sm" style={{ color: theme.muted }}>
          Sign in to track your projects, log metrics, and feed your resume engine.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: theme.accentText, color: theme.bgBase }}
        >
          Initialize Session →
        </button>
      </div>
    );
  }

  const counts: Record<FilterTab, number> = {
    All:           (projects || []).length,
    Ongoing:       (projects || []).filter((p) => p.status === 'Ongoing').length,
    Finished:      (projects || []).filter((p) => p.status === 'Finished').length,
    'Not Started': (projects || []).filter((p) => p.status === 'Not Started').length,
  };

  return (
    <div className="min-h-screen" style={{ color: theme.heading }}>

      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono mb-1 tracking-widest uppercase" style={{ color: theme.accentText }}>
              Build → Project Incubator
            </p>
            <h1 className="text-2xl font-black" style={{ color: theme.heading }}>
              Your Projects
            </h1>
            <p className="text-sm font-mono mt-1" style={{ color: theme.muted }}>
              {(projects || []).length} project{(projects || []).length !== 1 ? 's' : ''} tracked
              {(projects || []).filter((p) => p.sync_to_resume).length > 0 &&
                ` · ${(projects || []).filter((p) => p.sync_to_resume).length} synced to resume`}
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex-shrink-0"
            style={{ background: theme.accentText, color: theme.bgBase }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: theme.dim }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, notes, or tech stack…"
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all duration-200"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
          />
        </div>

        <div className="flex gap-1 rounded-xl p-1 flex-shrink-0 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className="relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200"
              style={activeFilter === tab
                ? { background: theme.bgBase, color: theme.accentText }
                : { color: theme.muted }}
            >
              {tab === 'Not Started' ? 'Idle' : tab}
              {counts[tab] > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[9px] font-bold"
                  style={activeFilter === tab
                    ? { background: theme.accentSoftBg, color: theme.accentText }
                    : { background: theme.cardBorder, color: theme.muted }}
                >
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.accentText }} />
          <p className="text-sm font-mono" style={{ color: theme.muted }}>Loading projects…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm font-mono text-red-400">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-mono underline transition-colors"
            style={{ color: theme.muted }}
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
              theme={theme}
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
                      theme={theme}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      )}

      <AnimatePresence>
        {modalOpen && (
          <ProjectModal
            project={editTarget}
            onClose={() => { setModalOpen(false); setEditTarget(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
