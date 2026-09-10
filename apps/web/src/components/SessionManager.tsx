import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { backdropVariants, modalVariants, modalTransition } from '../lib/motion';
import { api } from '../lib/api';
import type { Intel } from '@hailmary/types';
import AITutorPanel from './AITutorPanel';
import { ChallengeModal } from './ChallengeModal';
import { useAppTheme } from '../lib/ThemeProvider';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface SessionStartResponse {
  sessionId: string;
}

interface SessionEndResponse {
  isMilestone: boolean;
  totalSessions: number;
  needsAITutor: boolean;
}

interface SessionManagerProps {
  resource: Intel;
  onClose: () => void;
  user: { id: string } | null;
  onVerified?: () => void;
}

export default function SessionManager({ resource, onClose, user, onVerified }: SessionManagerProps) {
  const { theme } = useAppTheme();
  const [step, setStep] = useState<'launch' | 'active' | 'reflect'>('launch');
  const [plannedMinutes, setPlannedMinutes] = useState(60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const modalRef = useModalFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'active') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const data = await api.post<SessionStartResponse>('/api/sessions/start', {
        resource_id: resource.id,
        planned_minutes: plannedMinutes
      });
      setSessionId(data.sessionId);
      setStep('active');
      window.open(resource.link, '_blank');
    } catch (error) {
      console.error('Failed to start session', error);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (feeling: 'great' | 'neutral' | 'stuck') => {
    const data = await api.post<SessionEndResponse>('/api/sessions/end', {
      session_id: sessionId,
      resource_id: resource.id,
      actual_minutes: plannedMinutes,
      feeling
    });
    return data;
  };

  const handleEndSession = async (feeling: 'great' | 'neutral' | 'stuck') => {
    setLoading(true);
    try {
      const data = await endSession(feeling);

      if (data.needsAITutor) {
        setShowAITutor(true);
        setStep('launch');
      } else {
        if (data.isMilestone) {
          alert(`Milestone Reached! You've completed ${data.totalSessions} sessions.`);
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to end session', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUnderstanding = async () => {
    setLoading(true);
    try {
      await endSession('great');
      setShowCheckpoint(true);
    } catch (error) {
      console.error('Failed to end session', error);
    } finally {
      setLoading(false);
    }
  };

  if (showCheckpoint) {
    return (
      <ChallengeModal
        intel={resource}
        mode="initial"
        onClose={onClose}
        onSuccess={() => onVerified?.()}
      />
    );
  }

  if (!user) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18 }}
      >
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-auth-title"
          tabIndex={-1}
          className="rounded-2xl w-full max-w-md p-6 relative text-center border backdrop-blur-xl"
          style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={modalTransition}
        >
          <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 transition-colors" style={{ color: theme.muted }}>✕</button>
          <h2 id="session-auth-title" className="text-xl font-bold mb-4" style={{ color: theme.heading }}>Authentication Required</h2>
          <p className="text-sm mb-6" style={{ color: theme.muted }}>Please sign in to track study sessions.</p>
          <button
            onClick={onClose}
            className="w-full font-bold py-3 rounded-xl transition-colors"
            style={{ background: theme.accentText, color: theme.bgBase }}
          >
            Okay
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.18 }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-modal-title"
        tabIndex={-1}
        className="rounded-2xl w-full max-w-md p-6 relative border backdrop-blur-xl"
        style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={modalTransition}
      >
        {step !== 'active' && (
          <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 transition-colors" style={{ color: theme.muted }}>
            ✕
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'launch' && (
              <div className="text-center">
                <h2 id="session-modal-title" className="text-2xl font-bold mb-2" style={{ color: theme.heading }}>Set your intent.</h2>
                <p className="text-sm mb-6" style={{ color: theme.muted }}>
                  How long are you committing to <strong style={{ color: theme.heading }}>{resource.title}</strong> right now?
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[30, 60, 120].map((mins) => (
                    <motion.button
                      key={mins}
                      onClick={() => setPlannedMinutes(mins)}
                      className="py-3 rounded-xl border font-bold transition-all"
                      style={plannedMinutes === mins
                        ? { background: theme.accentSoftBg, borderColor: theme.accentText, color: theme.accentText }
                        : { background: theme.cardBg, borderColor: theme.cardBorder, color: theme.muted }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {mins / 60 >= 1 ? `${mins / 60} hr` : `${mins} min`}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleStartSession}
                  disabled={loading}
                  className="w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                  style={{ background: theme.accentText, color: theme.bgBase }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Launching...' : 'Launch Session'}
                </motion.button>
              </div>
            )}

            {step === 'active' && (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: theme.accentText, borderTopColor: 'transparent' }}
                />
                <h2 id="session-modal-title" className="text-xl font-bold mb-2" style={{ color: theme.heading }}>Session in Progress</h2>
                <p className="text-sm mb-6" style={{ color: theme.muted }}>You are currently studying {resource.title}.</p>
                <button
                  onClick={() => setStep('reflect')}
                  className="w-full font-bold py-3 rounded-xl border transition-colors"
                  style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.heading }}
                >
                  I'm back. End Session.
                </button>
              </div>
            )}

            {step === 'reflect' && (
              <div className="text-center">
                <h2 id="session-modal-title" className="text-2xl font-bold mb-2" style={{ color: theme.heading }}>Welcome back.</h2>
                <p className="text-sm mb-6" style={{ color: theme.muted }}>How did that session go?</p>

                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleVerifyUnderstanding}
                    disabled={loading}
                    className="p-4 rounded-xl text-left flex items-center gap-3 transition-colors border disabled:opacity-60"
                    style={{ background: theme.accentSoftBg, borderColor: theme.accentBorderStrong }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">🧠</span>
                    <div>
                      <div className="font-bold" style={{ color: theme.heading }}>I can explain this</div>
                      <div className="text-xs" style={{ color: theme.muted }}>Prove it with a Feynman checkpoint to complete the mission.</div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => handleEndSession('great')}
                    disabled={loading}
                    className="p-4 rounded-xl text-left flex items-center gap-3 transition-colors border disabled:opacity-60"
                    style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
                    whileHover={{ x: 4, borderColor: theme.accentBorderStrong }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">📖</span>
                    <div>
                      <div className="font-bold" style={{ color: theme.heading }}>Learned a lot</div>
                      <div className="text-xs" style={{ color: theme.muted }}>Making progress — not ready to be tested yet.</div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => handleEndSession('stuck')}
                    disabled={loading}
                    className="p-4 rounded-xl text-left flex items-center gap-3 transition-colors border disabled:opacity-60"
                    style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
                    whileHover={{ x: 4, borderColor: 'rgba(239,68,68,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">🧱</span>
                    <div>
                      <div className="font-bold" style={{ color: theme.heading }}>I got stuck</div>
                      <div className="text-xs" style={{ color: theme.muted }}>Hit a wall. I need help.</div>
                    </div>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </motion.div>

      {showAITutor && (
        <AITutorPanel
          resource={resource}
          user={user}
          onClose={onClose}
        />
      )}
    </motion.div>
  );
}
