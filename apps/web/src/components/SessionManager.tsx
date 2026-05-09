import { useState } from 'react';
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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#13161e] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
          <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 text-sm mb-6">Please sign in to track study sessions.</p>
          <button onClick={onClose} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors">Okay</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#13161e] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        
        {/* CLOSE BUTTON */}
        {step !== 'active' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
            ✕
          </button>
        )}

        {/* STEP 1: LAUNCH MODAL */}
        {step === 'launch' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Set your intent.</h2>
            <p className="text-gray-400 text-sm mb-6">
              How long are you committing to <strong>{resource.title}</strong> right now?
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[30, 60, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setPlannedMinutes(mins)}
                  className={`py-3 rounded-xl border font-bold transition-all ${
                    plannedMinutes === mins 
                      ? 'bg-green-500/10 border-green-500 text-green-400' 
                      : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {mins / 60 >= 1 ? `${mins / 60} hr` : `${mins} min`}
                </button>
              ))}
            </div>

            <button 
              onClick={handleStartSession}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Launching...' : 'Launch Session'}
            </button>
          </div>
        )}

        {/* STEP 2: ACTIVE SESSION BANNER */}
        {step === 'active' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Session in Progress</h2>
            <p className="text-gray-400 text-sm mb-6">You are currently studying {resource.title}.</p>
            
            <button 
              onClick={() => setStep('reflect')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-700 transition-colors"
            >
              I'm back. End Session.
            </button>
          </div>
        )}

        {/* STEP 3: REFLECTION MODAL */}
        {step === 'reflect' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back.</h2>
            <p className="text-gray-400 text-sm mb-6">How did that session go?</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => handleEndSession('great')} className="p-4 bg-gray-900 border border-gray-700 hover:border-green-500 rounded-xl text-left flex items-center gap-3 transition-colors">
                <span className="text-2xl">🧠</span>
                <div>
                  <div className="font-bold text-white">Learned a lot</div>
                  <div className="text-xs text-gray-400">Making solid progress.</div>
                </div>
              </button>

              <button onClick={() => handleEndSession('stuck')} className="p-4 bg-gray-900 border border-gray-700 hover:border-red-500 rounded-xl text-left flex items-center gap-3 transition-colors">
                <span className="text-2xl">🧱</span>
                <div>
                  <div className="font-bold text-white">I got stuck</div>
                  <div className="text-xs text-gray-400">Hit a wall. I need help.</div>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>

      {showAITutor && (
        <AITutorPanel 
          resource={resource}
          user={user}
          onClose={onClose}
        />
      )}
    </div>
  );
}
