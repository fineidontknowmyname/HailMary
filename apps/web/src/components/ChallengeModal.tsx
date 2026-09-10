import { useState, useEffect } from 'react';
import { X, Send, BrainCircuit, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import type { Intel } from '@hailmary/types';
import { backdropVariants, modalVariants, modalTransition } from '../lib/motion';
import { useAppTheme } from '../lib/ThemeProvider';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface ChallengeModalProps {
  intel: Intel;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'initial' | 'retest';
}

interface EvaluationResult {
  passed: boolean;
  feedback: string;
  verifiedBy?: 'ai' | 'fallback' | null;
  misconception?: string | null;
}

export function ChallengeModal({ intel, onClose, onSuccess, mode = 'initial' }: ChallengeModalProps) {
  const { theme } = useAppTheme();
  const isRetest = mode === 'retest';
  const [step, setStep] = useState<'loading_challenge' | 'answering' | 'evaluating' | 'result'>('loading_challenge');
  const [challenge, setChallenge] = useState<string>('');
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useModalFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;

    const fetchChallenge = async () => {
      try {
        const question = await api.post<string>('/api/ai/challenge', {
          intelId: intel.id,
          context: { title: intel.title, description: intel.description, tags: intel.tags }
        });
        if (isMounted) {
          setChallenge(question);
          setStep('answering');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to generate challenge.');
          setStep('answering');
        }
      }
    };

    fetchChallenge();
    return () => { isMounted = false; };
  }, [intel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;

    setStep('evaluating');
    setError(null);

    try {
      const result = await api.post<EvaluationResult>('/api/ai/evaluate', {
        intelId: intel.id,
        challenge,
        response: response.trim(),
        context: { title: intel.title, description: intel.description, tags: intel.tags }
      });

      setEvaluation(result);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed.');
      setStep('answering');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
        aria-labelledby="challenge-modal-title"
        tabIndex={-1}
        className="rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col border backdrop-blur-xl"
        style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={modalTransition}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme.cardBorder, background: theme.bgBase }}>
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5" style={{ color: theme.accentText }} />
            <div>
              <h3 id="challenge-modal-title" className="font-bold tracking-tight" style={{ color: theme.heading }}>
                {isRetest ? 'Re-verify Understanding' : 'Feynman Checkpoint'}
              </h3>
              <p className="text-xs font-mono" style={{ color: theme.muted }}>
                {isRetest ? `${intel.title} — due for a refresher` : 'Verify your understanding'}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="transition-colors p-1" style={{ color: theme.muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
          {step === 'loading_challenge' && (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: theme.accentText }}>
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span className="font-mono text-sm animate-pulse">Analyzing material & generating challenge...</span>
            </div>
          )}

          {(step === 'answering' || step === 'evaluating') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="rounded-xl p-5 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                <h4 className="font-mono text-sm mb-2 uppercase tracking-wide" style={{ color: theme.accentText }}>The Challenge</h4>
                <p style={{ color: theme.heading }} className="leading-relaxed">{challenge || error || 'Explain the core concept of this material.'}</p>
              </div>

              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={step === 'evaluating'}
                placeholder="Explain it simply, as if teaching a beginner..."
                maxLength={2000}
                className="w-full h-40 rounded-xl p-4 text-sm outline-none transition-colors resize-none font-mono"
                style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
              />

              <button
                type="submit"
                disabled={!response.trim() || step === 'evaluating'}
                className="flex items-center justify-center gap-2 w-full font-bold py-3 rounded-xl disabled:opacity-50 transition-colors"
                style={{ background: theme.accentText, color: theme.bgBase }}
              >
                {step === 'evaluating' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating Response...</>
                ) : (
                  <><Send className="w-5 h-5" /> Submit Explanation</>
                )}
              </button>
            </form>
          )}

          {step === 'result' && evaluation && (() => {
            const unverified = evaluation.passed && evaluation.verifiedBy === 'fallback';

            return (
              <div className="flex flex-col items-center text-center py-8">
                {!evaluation.passed ? (
                  <XCircle className="w-16 h-16 text-red-400 mb-4" />
                ) : unverified ? (
                  <AlertTriangle className="w-16 h-16 mb-4" style={{ color: '#f59e0b' }} />
                ) : (
                  <CheckCircle2 className="w-16 h-16 mb-4" style={{ color: theme.accentText }} />
                )}

                <h3 className="text-xl font-bold mb-2" style={{ color: theme.heading }}>
                  {!evaluation.passed
                    ? 'Requires Revision'
                    : unverified
                      ? 'Marked Complete — Not Verified'
                      : 'Mission Accomplished'}
                </h3>

                {!evaluation.passed && evaluation.misconception && (
                  <span
                    className="mb-3 inline-block rounded-full border px-3 py-1 text-xs font-mono"
                    style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}
                  >
                    {evaluation.misconception}
                  </span>
                )}

                <p className="mb-8 max-w-md leading-relaxed" style={{ color: theme.muted }}>
                  {evaluation.feedback}
                </p>

                <div className="flex gap-4 w-full">
                  {!evaluation.passed && (
                    <button
                      onClick={() => setStep('answering')}
                      className="flex-1 py-3 px-4 border rounded-xl transition-colors font-bold"
                      style={{ borderColor: theme.cardBorder, color: theme.heading }}
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (evaluation.passed) onSuccess();
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 font-bold rounded-xl transition-colors"
                    style={evaluation.passed
                      ? { background: theme.accentText, color: theme.bgBase }
                      : { background: theme.cardBg, color: theme.heading, border: `1px solid ${theme.cardBorder}` }}
                  >
                    {evaluation.passed ? 'Continue' : 'Skip & Close'}
                  </button>
                </div>
              </div>
            );
          })()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
