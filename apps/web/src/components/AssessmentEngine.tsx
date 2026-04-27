import { useEffect, useRef, useState } from 'react';
import './AssessmentEngine.css';
import { useAssessmentStore } from '../store/useAssessmentStore';
import type { GradedAnswer, SectionBreakdown } from '../store/useAssessmentStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function StartScreen() {
  const { startAssessment, status, error } = useAssessmentStore();
  const [company, setCompany] = useState('');

  const handleStart = () => {
    if (company.trim()) startAssessment(company.trim());
  };

  return (
    <div className="assessment-start-screen">
      <div className="assessment-start-card">
        <div className="assessment-start-badge">Corporate Assessment Engine</div>
        <h1 className="assessment-start-title">
          Ready to prove your <span className="assessment-accent">skills?</span>
        </h1>
        <p className="assessment-start-subtitle">
          50 questions · 30 minutes · Adaptive difficulty · Instant results
        </p>

        <div className="assessment-start-rules">
          {[
            ['🕐', '30 minutes', 'The timer starts immediately. No pausing.'],
            ['📋', '50 Questions', 'Fetched specifically for your target company.'],
            ['⚡', 'Auto-submit', 'When time runs out, your answers are submitted automatically.'],
            ['🔒', 'No going back', 'You can skip and return, but cannot re-open the test.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="assessment-rule-item">
              <span className="assessment-rule-icon">{icon}</span>
              <div>
                <div className="assessment-rule-title">{title}</div>
                <div className="assessment-rule-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="assessment-company-input-group">
          <label className="assessment-label" htmlFor="company-input">
            Target Company
          </label>
          <input
            id="company-input"
            className="assessment-input"
            type="text"
            placeholder="e.g. Google, Amazon, Microsoft"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
        </div>

        {error && <div className="assessment-error">{error}</div>}

        <button
          className="assessment-btn-primary"
          onClick={handleStart}
          disabled={!company.trim() || status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="assessment-btn-loading">
              <span className="assessment-spinner" /> Loading questions…
            </span>
          ) : (
            'Start Assessment →'
          )}
        </button>
      </div>
    </div>
  );
}

function QuizInterface() {
  const {
    questions, answers, currentQuestionIndex, timeLeftSeconds,
    selectAnswer, nextQuestion, prevQuestion, jumpToQuestion,
    skipQuestion, submitAssessment, status,
  } = useAssessmentStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { tickTimer } = useAssessmentStore.getState();

  useEffect(() => {
    timerRef.current = setInterval(tickTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tickTimer]);

  const q = questions[currentQuestionIndex];
  if (!q) return null;

  const answered   = answers[currentQuestionIndex];
  const isUrgent   = timeLeftSeconds < 300;
  const isCritical = timeLeftSeconds < 60;

  const getQuestionStatus = (i: number) => {
    const a = answers[i];
    if (i === currentQuestionIndex) return 'current';
    if (a === null)                  return 'unanswered';
    if (a === -1)                    return 'skipped';
    return 'answered';
  };

  const answeredCount = answers.filter((a) => a !== null && a !== -1).length;
  const skippedCount  = answers.filter((a) => a === -1).length;

  return (
    <div className="assessment-quiz-layout">
      <header className="assessment-quiz-header">
        <div className="assessment-quiz-header-left">
          <span className="assessment-quiz-brand">Assessment Engine</span>
          <span className="assessment-quiz-company">{useAssessmentStore.getState().company}</span>
        </div>

        <div className="assessment-quiz-progress-wrap">
          <div className="assessment-quiz-progress-bar">
            <div
              className="assessment-quiz-progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="assessment-quiz-progress-label">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>

        <div className={`assessment-timer ${isUrgent ? 'assessment-timer--urgent' : ''} ${isCritical ? 'assessment-timer--critical' : ''}`}>
          <span className="assessment-timer-icon">⏱</span>
          {formatTime(timeLeftSeconds)}
        </div>
      </header>

      <div className="assessment-quiz-body">
        <aside className="assessment-sidebar">
          <div className="assessment-sidebar-stats">
            <div className="assessment-stat">
              <span className="assessment-stat-val assessment-stat-val--answered">{answeredCount}</span>
              <span className="assessment-stat-label">Answered</span>
            </div>
            <div className="assessment-stat">
              <span className="assessment-stat-val assessment-stat-val--skipped">{skippedCount}</span>
              <span className="assessment-stat-label">Skipped</span>
            </div>
            <div className="assessment-stat">
              <span className="assessment-stat-val">{questions.length - answeredCount - skippedCount}</span>
              <span className="assessment-stat-label">Remaining</span>
            </div>
          </div>

          <div className="assessment-grid">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`assessment-grid-cell assessment-grid-cell--${getQuestionStatus(i)}`}
                onClick={() => jumpToQuestion(i)}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="assessment-sidebar-legend">
            {[
              ['answered', 'Answered'],
              ['skipped', 'Skipped'],
              ['current', 'Current'],
              ['unanswered', 'Not visited'],
            ].map(([cls, label]) => (
              <div key={cls} className="assessment-legend-item">
                <span className={`assessment-legend-dot assessment-legend-dot--${cls}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <button
            className="assessment-btn-submit"
            onClick={submitAssessment}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit Test'}
          </button>
        </aside>

        <main className="assessment-question-panel">
          <div className="assessment-question-meta">
            <span className={`assessment-difficulty assessment-difficulty--${q.difficulty}`}>
              {q.difficulty}
            </span>
            <span className="assessment-section-tag">{q.section}</span>
            <span className="assessment-question-num">Q{currentQuestionIndex + 1}</span>
          </div>

          <h2 className="assessment-question-text">{q.question_text}</h2>

          <ul className="assessment-options-list">
            {q.options.map((option, idx) => (
              <li key={idx}>
                <button
                  className={`assessment-option ${answered === idx ? 'assessment-option--selected' : ''}`}
                  onClick={() => selectAnswer(currentQuestionIndex, idx)}
                >
                  <span className="assessment-option-label">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="assessment-option-text">{option}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="assessment-question-nav">
            <button
              className="assessment-btn-secondary"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Prev
            </button>

            <button className="assessment-btn-ghost" onClick={skipQuestion}>
              Skip →
            </button>

            <button
              className="assessment-btn-secondary"
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function ResultScreen() {
  const { result, company, resetAssessment } = useAssessmentStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!result) return null;

  const { percentageScore, totalCorrect, totalQuestions, timeTakenSeconds,
          sectionBreakdowns, gradedAnswers } = result;

  const grade = percentageScore >= 85 ? 'Excellent' :
                percentageScore >= 70 ? 'Good' :
                percentageScore >= 50 ? 'Average' : 'Needs Work';

  const gradeColor = percentageScore >= 85 ? 'assessment-grade--excellent' :
                     percentageScore >= 70 ? 'assessment-grade--good' :
                     percentageScore >= 50 ? 'assessment-grade--average' : 'assessment-grade--poor';

  return (
    <div className="assessment-result-screen">
      <div className="assessment-result-hero">
        <div className={`assessment-result-score ${gradeColor}`}>
          {percentageScore}%
        </div>
        <h1 className="assessment-result-grade">{grade}</h1>
        <p className="assessment-result-summary">
          {totalCorrect} of {totalQuestions} correct · {formatTime(timeTakenSeconds)} taken · {company}
        </p>
      </div>

      <div className="assessment-section-grid">
        {sectionBreakdowns.map((s: SectionBreakdown) => (
          <div key={s.section} className="assessment-section-card">
            <div className="assessment-section-name">{s.section}</div>
            <div className="assessment-section-score">{s.score}%</div>
            <div className="assessment-section-bar-track">
              <div
                className="assessment-section-bar-fill"
                style={{ width: `${s.score}%` }}
              />
            </div>
            <div className="assessment-section-fraction">{s.correct}/{s.total}</div>
          </div>
        ))}
      </div>

      <div className="assessment-review-list">
        <h2 className="assessment-review-title">Question Review</h2>
        {gradedAnswers.map((a: GradedAnswer, i) => (
          <div
            key={a.questionId}
            className={`assessment-review-item ${a.isCorrect ? 'assessment-review-item--correct' : 'assessment-review-item--wrong'}`}
          >
            <button
              className="assessment-review-toggle"
              onClick={() => setExpandedId(expandedId === a.questionId ? null : a.questionId)}
            >
              <span className="assessment-review-indicator">
                {a.isCorrect ? '✓' : '✗'}
              </span>
              <span className="assessment-review-q-num">Q{i + 1}</span>
              <span className="assessment-review-q-text">{a.questionText}</span>
              <span className="assessment-review-chevron">
                {expandedId === a.questionId ? '▲' : '▼'}
              </span>
            </button>

            {expandedId === a.questionId && (
              <div className="assessment-review-detail">
                <ul className="assessment-review-options">
                  {a.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={`assessment-review-option
                        ${idx === a.correctAnswerIndex ? 'assessment-review-option--correct' : ''}
                        ${idx === a.selectedOptionIndex && !a.isCorrect ? 'assessment-review-option--wrong' : ''}
                      `}
                    >
                      <span className="assessment-option-label">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </li>
                  ))}
                </ul>
                {a.explanation && (
                  <div className="assessment-explanation">
                    <span className="assessment-explanation-icon">💡</span>
                    {a.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="assessment-result-actions">
        <button className="assessment-btn-primary" onClick={resetAssessment}>
          Take Another Assessment
        </button>
      </div>
    </div>
  );
}

export function AssessmentEngine() {
  const status = useAssessmentStore((s) => s.status);

  return (
    <div className="assessment-engine">
      {(status === 'idle' || status === 'loading') && <StartScreen />}
      {status === 'in-progress'                    && <QuizInterface />}
      {status === 'submitting'                     && (
        <div className="assessment-submitting">
          <div className="assessment-spinner assessment-spinner--lg" />
          <p>Grading your answers…</p>
        </div>
      )}
      {status === 'completed' && <ResultScreen />}
    </div>
  );
}

export default AssessmentEngine;
