import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { backdropVariants, modalVariants, modalTransition } from '../lib/motion';
import type { Intel } from '@hailmary/types';
import AITutorPanel from './AITutorPanel';

interface SessionManagerProps {
  resource: Intel;
  onClose: () => void;
  user: any; // Using any for user if type is not strictly exported, but better to use user type if available
}

export default function SessionManager({ resource, onClose, user }: SessionManagerProps) {
  const [step, setStep] = useState<'launch' | 'active' | 'reflect'>('launch');
  const [plannedMinutes, setPlannedMinutes] = useState(60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);

  // 1. THE LAUNCH
  const handleStartSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          resource_id: resource.id,
          planned_minutes: plannedMinutes
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setStep('active');
        // Open the actual course in a new tab!
        window.open(resource.link, '_blank');
      }
    } catch (error) {
      console.error("Failed to start session", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. THE REFLECTION
  const handleEndSession = async (feeling: 'great' | 'neutral' | 'stuck') => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: user?.id,
          resource_id: resource.id,
          actual_minutes: plannedMinutes, // For v1, we'll assume they did the planned time
          feeling: feeling
        })
      });

      const data = await res.json();
      
      if (data.needsAITutor) {
        setShowAITutor(true);
        setStep('launch'); // Reset main modal step
      } else {
        if (data.isMilestone) {
          alert(`Milestone Reached! You've completed ${data.totalSessions} sessions.`);
        }
        onClose(); // Close the manager
      }
    } catch (error) {
      console.error("Failed to end session", error);
    } finally {
      setLoading(false);
    }
  };

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
          className="bg-[#13161e] border border-[#1e2535] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center"
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={modalTransition}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-[#7a849a] hover:text-white transition-colors">✕</button>
          <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-[#7a849a] text-sm mb-6">Please sign in to track study sessions.</p>
          <button onClick={onClose} className="w-full bg-[#4fffb0] hover:bg-[#3de89e] text-[#0b0e14] font-bold py-3 rounded-xl transition-colors">Okay</button>
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
        className="bg-[#13161e] border border-[#1e2535] rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={modalTransition}
      >
        
        {/* CLOSE BUTTON */}
        {step !== 'active' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-[#7a849a] hover:text-white transition-colors">
            ✕
          </button>
        )}

        {/* Steps with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* STEP 1: LAUNCH MODAL */}
            {step === 'launch' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Set your intent.</h2>
                <p className="text-[#7a849a] text-sm mb-6">
                  How long are you committing to <strong className="text-white">{resource.title}</strong> right now?
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[30, 60, 120].map((mins) => (
                    <motion.button
                      key={mins}
                      onClick={() => setPlannedMinutes(mins)}
                      className={`py-3 rounded-xl border font-bold transition-all ${
                        plannedMinutes === mins
                          ? 'bg-[#4fffb0]/10 border-[#4fffb0] text-[#4fffb0]'
                          : 'bg-[#1e2535] border-[#2a3145] text-[#7a849a] hover:border-[#4a5568]'
                      }`}
                      whileTap={{ scale: 0.96 }}
                    >
                      {mins / 60 >= 1 ? `${mins / 60} hr` : `${mins} min`}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleStartSession}
                  disabled={loading}
                  className="w-full bg-[#4fffb0] hover:bg-[#3de89e] text-[#0b0e14] font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Launching...' : 'Launch Session'}
                </motion.button>
              </div>
            )}

            {/* STEP 2: ACTIVE SESSION BANNER */}
            {step === 'active' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 border-4 border-[#4fffb0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Session in Progress</h2>
                <p className="text-[#7a849a] text-sm mb-6">You are currently studying {resource.title}.</p>
                <button
                  onClick={() => setStep('reflect')}
                  className="w-full bg-[#1e2535] hover:bg-[#2a3145] text-white font-bold py-3 rounded-xl border border-[#2a3145] transition-colors"
                >
                  I'm back. End Session.
                </button>
              </div>
            )}

            {/* STEP 3: REFLECTION MODAL */}
            {step === 'reflect' && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back.</h2>
                <p className="text-[#7a849a] text-sm mb-6">How did that session go?</p>

                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={() => handleEndSession('great')}
                    className="p-4 bg-[#111520] border border-[#1e2535] hover:border-[#4fffb0]/40 rounded-xl text-left flex items-center gap-3 transition-colors"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">🧠</span>
                    <div>
                      <div className="font-bold text-white">Learned a lot</div>
                      <div className="text-xs text-[#7a849a]">Making solid progress.</div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => handleEndSession('stuck')}
                    className="p-4 bg-[#111520] border border-[#1e2535] hover:border-red-500/40 rounded-xl text-left flex items-center gap-3 transition-colors"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">🧱</span>
                    <div>
                      <div className="font-bold text-white">I got stuck</div>
                      <div className="text-xs text-[#7a849a]">Hit a wall. I need help.</div>
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
