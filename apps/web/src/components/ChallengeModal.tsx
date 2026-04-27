import { useState, useEffect } from 'react';
import { X, Send, BrainCircuit, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Intel } from '@hailmary/types';

interface ChallengeModalProps {
  intel: Intel;
  onClose: () => void;
  onSuccess: () => void;
}

interface EvaluationResult {
  passed: boolean;
  feedback: string;
}

export function ChallengeModal({ intel, onClose, onSuccess }: ChallengeModalProps) {
  const [step, setStep] = useState<'loading_challenge' | 'answering' | 'evaluating' | 'result'>('loading_challenge');
  const [challenge, setChallenge] = useState<string>('');
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to generate challenge.');
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
    } catch (err: any) {
      setError(err.message || 'Evaluation failed.');
      setStep('answering');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111520] border border-[#1e2535] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        
        <div className="flex items-center justify-between p-5 border-b border-[#1e2535] bg-[#0b0e14]">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-[#7c6aff]" />
            <div>
              <h3 className="font-bold text-white tracking-tight">Feynman Checkpoint</h3>
              <p className="text-xs text-[#7a849a] font-mono">Verify your understanding</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#7a849a] hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'loading_challenge' && (
            <div className="flex flex-col items-center justify-center py-12 text-[#7c6aff]">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span className="font-mono text-sm animate-pulse">Analyzing material & generating challenge...</span>
            </div>
          )}

          {(step === 'answering' || step === 'evaluating') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-5">
                <h4 className="text-[#4fffb0] font-mono text-sm mb-2 uppercase tracking-wide">The Challenge</h4>
                <p className="text-white leading-relaxed">{challenge || error || 'Explain the core concept of this material.'}</p>
              </div>

              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={step === 'evaluating'}
                placeholder="Explain it simply, as if teaching a beginner..."
                className="w-full h-40 bg-[#0b0e14] border border-[#1e2535] rounded-xl p-4 text-sm text-white placeholder-[#7a849a] focus:outline-none focus:border-[#7c6aff] transition-colors resize-none font-mono"
              />

              <button
                type="submit"
                disabled={!response.trim() || step === 'evaluating'}
                className="flex items-center justify-center gap-2 w-full bg-[#7c6aff] text-white font-bold py-3 rounded-xl hover:bg-[#6b5ae0] disabled:opacity-50 transition-colors"
              >
                {step === 'evaluating' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating Response...</>
                ) : (
                  <><Send className="w-5 h-5" /> Submit Explanation</>
                )}
              </button>
            </form>
          )}

          {step === 'result' && evaluation && (
            <div className="flex flex-col items-center text-center py-8">
              {evaluation.passed ? (
                <CheckCircle2 className="w-16 h-16 text-[#4fffb0] mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-400 mb-4" />
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">
                {evaluation.passed ? 'Mission Accomplished' : 'Requires Revision'}
              </h3>
              
              <p className="text-[#7a849a] mb-8 max-w-md leading-relaxed">
                {evaluation.feedback}
              </p>

              <div className="flex gap-4 w-full">
                {!evaluation.passed && (
                  <button
                    onClick={() => setStep('answering')}
                    className="flex-1 py-3 px-4 border border-[#1e2535] text-white rounded-xl hover:bg-[#1e2535] transition-colors font-bold"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => {
                    if (evaluation.passed) onSuccess();
                    onClose();
                  }}
                  className={`flex-1 py-3 px-4 font-bold rounded-xl transition-colors ${
                    evaluation.passed 
                      ? 'bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e]' 
                      : 'bg-[#1e2535] text-white hover:bg-[#2a3145]'
                  }`}
                >
                  {evaluation.passed ? 'Complete Mission' : 'Skip & Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}