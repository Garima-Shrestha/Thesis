import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import useStore from '../store/useStore';
import StudyBuddy from '../components/StudyBuddy';

const DEFAULT_CODE = `# Write your solution here\n`;

function DifficultyStars({ difficulty }) {
  const levels = { beginner: 1, intermediate: 2, advanced: 3 };
  const filled = levels[difficulty] || 1;
  return (
    <div className="chal-stars">
      {[1, 2, 3].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= filled ? '#f59e0b' : '#1e293b'}
          stroke={i <= filled ? '#d97706' : '#334155'}
          strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      <span className="chal-diff-text">{difficulty}</span>
    </div>
  );
}


export default function Challenge() {
  const { id } = useParams();
  const { user } = useStore();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [totalSolvedCount, setTotalSolvedCount] = useState(0);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [code, setCode] = useState(() => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest';
    return localStorage.getItem(`code_${userId}_challenge_${id}`) || DEFAULT_CODE;
  });
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const aiBottomRef = useRef(null);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRequestsUsed, setAiRequestsUsed] = useState(0);

  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionError, setSolutionError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const [showSolutionPrompt, setShowSolutionPrompt] = useState(false);
  const [promptDismissedAt, setPromptDismissedAt] = useState(null);
  const [solutionAccessGranted, setSolutionAccessGranted] = useState(false);

  const [robotState, setRobotState] = useState('idle');
  const typingTimer = useRef(null);

  const solvedProgress = totalQuestionCount > 0
    ? totalSolvedCount / totalQuestionCount
    : 0;

  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest';
  const typingStorageKey = `typing_progress_${userId}_challenge_${id}`;

  const [typingProgress, setTypingProgress] = useState(() => {
    const uid = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest';
    const key = `typing_progress_${uid}_challenge_${id}`;
    const saved = parseFloat(localStorage.getItem(key) || '0');
    return isNaN(saved) ? 0 : saved;
  });

  // Display progress = solved baseline + typing contribution, never below solved
  const houseProgress = Math.min(
    Math.max(solvedProgress, solvedProgress + typingProgress),
    1
  );

  useEffect(() => {
    api.get(`/challenges/${id}`)
      .then(res => {
        setChallenge(res.data);
        setAttemptCount(res.data.attempt_count || 0);

        setTotalSolvedCount(res.data.total_solved_count || 0);
        setTotalQuestionCount(res.data.total_question_count || 1);
      })
      .catch(() => navigate('/dashboard'));
  }, [id]);

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    const newMessages = [...aiMessages, { role: 'user', text: userMsg }];
    setAiMessages(newMessages);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await api.post('/users/ai-assist', {
        challengeDescription: challenge.description,
        code,
        userMessage: userMsg,
        history: newMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
      });
      setAiMessages(prev => [...prev, { role: 'ai', text: res.data.message }]);
      setAiRequestsUsed(res.data.requestsUsed);
    } catch (err) {
      const msg = err.response?.data?.message || 'AI error.';
      setAiMessages(prev => [...prev, { role: 'ai', text: msg }]);
    }
    setAiLoading(false);
    setTimeout(() => aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleRun = async () => {
    clearTimeout(typingTimer.current);
    setLoading(true);
    setResults(null);
    setStatus('');
    try {
      const res = await api.post('/submissions/run', { code, challengeId: parseInt(id) });
      setResults(res.data.results);
      setRobotState('idle');
    } catch (err) {
      setStatus('Error running code.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    clearTimeout(typingTimer.current);
    setLoading(true);
    setRobotState('thinking');
    setResults(null);
    setStatus('');
    try {
      const res = await api.post('/submissions/submit', { code, challengeId: parseInt(id) });
      setStatus(res.data.status);
      setResults(res.data.results);
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);

      // Show solution prompt at attempt 5, then every 2 after
      if (!challenge.is_solved && res.data.status !== 'accepted') {
        const threshold = promptDismissedAt === null ? 5 : promptDismissedAt + 2;
        if (newCount >= threshold) {
          setShowSolutionPrompt(true);
        }
      }
      setRobotState(res.data.status === 'accepted' ? 'success' : 'error');

      if (res.data.status === 'accepted') {
        const challengeRes = await api.get(`/challenges/${id}`);
        setTotalSolvedCount(challengeRes.data.total_solved_count || 0);
        setTotalQuestionCount(challengeRes.data.total_question_count || 1);
        // Reset typing progress: solved question now covers this permanently
        setTypingProgress(0);
        localStorage.setItem(typingStorageKey, '0');
      }

      setTimeout(() => setRobotState('idle'), 3000);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Error submitting code.');
    }
    setLoading(false);
  };

  const handleViewSolution = async () => {
    if (showSolution) { setShowSolution(false); return; }
    setSolutionError('');
    try {
      const res = await api.get(`/challenges/${id}/solution`);
      setSolution(res.data);
      setShowSolution(true);
    } catch (err) {
      setSolutionError(err.response?.data?.message || 'Could not load solution.');
    }
  };

  const handlePromptAccept = async () => {
    setShowSolutionPrompt(false);
    setSolutionAccessGranted(true);
    try {
      await api.post('/users/deduct-xp');
    } catch (_) {}
    try {
      const res = await api.get(`/challenges/${id}/solution`);
      setSolution(res.data);
      setShowSolution(true);
    } catch (err) {
      setSolutionError(err.response?.data?.message || 'Could not load solution.');
    }
  };

  const handlePromptDecline = () => {
    setShowSolutionPrompt(false);
    setPromptDismissedAt(attemptCount);
  };

  if (!challenge) return (
    <div className="chal-loading">Loading mission...</div>
  );

  // Logic: unlocked if already solved OR has 3+ attempts
  const solutionUnlocked = challenge.is_solved || solutionAccessGranted;
  const attemptsDisplay = Math.min(attemptCount, 5);

  return (
    <div className="chal-shell">

      {/* Top bar */}
      <div className="chal-topbar">
        <button className="chal-back" onClick={() => navigate('/dashboard')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
        <div className="chal-topbar-mid">
          <span className="chal-topbar-title">{challenge.title}</span>
          <DifficultyStars difficulty={challenge.difficulty} />
        </div>
        <div className="chal-topbar-right">
          <span className="chal-xp-label">+{challenge.xp_reward} XP</span>
          <span className="chal-attempt-label">Attempts: {attemptCount}</span>
        </div>
      </div>

      {/* Body */}
      <div className="chal-body">

        {/* LEFT: Briefing panel */}
        <div className="chal-briefing">

          <p className="chal-section-label">Objective</p>
          <p className="chal-desc">{challenge.description}</p>

          <StudyBuddy
            state={robotState}
            progress={houseProgress}
          />
          <div style={{ height: '1px', background: '#1e293b', margin: '0.25rem 0 0.5rem' }} />

          <p className="chal-section-label">Sample Cases</p>

          <div className="chal-cases">
            {challenge.sample_test_cases?.length === 0 && (
              <p className="chal-cases-empty">No sample cases for this challenge.</p>
            )}
            {challenge.sample_test_cases?.map((tc, i) => (
              <div key={i} className="chal-case">
                <div className="chal-case-row">
                  <span className="chal-case-key">Input</span>
                  <code className="chal-case-val">{tc.input || '(none)'}</code>
                </div>
                <div className="chal-case-row">
                  <span className="chal-case-key">Output</span>
                  <code className="chal-case-val chal-case-val--out">{tc.expected_output}</code>
                </div>
              </div>
            ))}
          </div>

          {/* Solution unlock */}
          <div className="chal-solution-area">
            <button
              className={`chal-solution-btn ${solutionUnlocked ? 'chal-solution-btn--on' : 'chal-solution-btn--off'}`}
              onClick={solutionUnlocked ? handleViewSolution : undefined}
              disabled={!solutionUnlocked}
            >
             {solutionUnlocked ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              )}
              {/* {solutionUnlocked
                ? (showSolution ? 'Hide solution' : 'View solution')
                : `Solution locked: ${attemptsDisplay}/3 attempts`
              } */}
              {solutionUnlocked
                ? (showSolution ? 'Hide solution' : 'View solution')
                : `Solution locked: ${attemptsDisplay}/5 attempts`
              }
            </button>
            {solutionError && <p className="chal-solution-err">{solutionError}</p>}
            {showSolution && solution && (
              <div className="chal-solution-box">
                <p className="chal-solution-note">Study it, understand it, don't just copy it.</p>
                {solution.solution_code
                  ? <pre className="chal-solution-code"><code>{solution.solution_code}</code></pre>
                  : <p className="chal-solution-none">No solution added yet. Ask your instructor.</p>
                }
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Coding arena */}
        <div className="chal-arena">

          <div className="chal-editor-card">
            <div className="chal-editor-bar">
              <span className="chal-file-tab">solution.py</span>
              {loading && <span className="chal-running">running...</span>}
            </div>
            <Editor
              height="400px"
              language="python"
              value={code}
              onChange={val => {
                setCode(val);
                const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest';
                localStorage.setItem(`code_${userId}_challenge_${id}`, val);

                // Builder starts building
                setRobotState('building');

                // Progress based on code length, not keystrokes
                // So deleting reduces it, typing increases it
                const codeLength = (val || '').length;
                const maxTypingBoost = 0.12;
                const newTypingProgress = Math.min((codeLength / 400) * maxTypingBoost, maxTypingBoost);

                setTypingProgress(newTypingProgress);
                localStorage.setItem(typingStorageKey, String(newTypingProgress));

                // Stop previous timer
                clearTimeout(typingTimer.current);

                // After 2 seconds without typing -> thinking
                typingTimer.current = setTimeout(() => {
                  setRobotState('thinking');
                }, 2000);
              }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 12, bottom: 12 },
              }}
            />
            <div className="chal-actions">
              <button className="chal-btn-run" onClick={handleRun} disabled={loading}>
                {loading ? 'Running...' : 'Run'}
              </button>
              <button className="chal-btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Verdict */}
          {status && (
            <div className={`chal-verdict ${status === 'accepted' ? 'chal-verdict--pass' : 'chal-verdict--fail'}`}>
              <div className="chal-verdict-inner">
                {status === 'accepted' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Accepted, all test cases passed</span>
                    <span className="chal-verdict-xp">+{challenge.xp_reward} XP</span>
                  </>
                ) : (
                  <>
                    <span>
                      {status === 'Please write a proper Python solution before submitting. Your code seems incomplete.'
                        ? status
                        : 'Wrong answer, check the results below'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="chal-results">
              {results.map((r, i) => (
                <div key={i} className={`chal-result ${r.passed ? 'chal-result--pass' : 'chal-result--fail'}`}>
                  <div className="chal-result-top">
                    <span className="chal-result-dot" />
                    <span>Test {i + 1}</span>
                    <span className="chal-result-status">{r.status}</span>
                  </div>
                  {!r.passed && (
                    <div className="chal-result-diff">
                      <span>Expected: <code>{r.expected}</code></span>
                      <span>Got: <code>{r.actual}</code></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI button */}
      <button className="chal-ai-fab" onClick={() => setAiOpen(!aiOpen)} title="AI Tutor">
        {aiOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* AI drawer */}
      {aiOpen && (
        <div className="chal-ai-drawer">
          <div className="chal-ai-head">
            <span className="chal-ai-head-title">AI Tutor</span>
            <span className="chal-ai-head-sub">Hints only. Won't give full answers</span>
          </div>
          <div className="chal-ai-messages">
            {aiMessages.length === 0 && (
              <p className="chal-ai-empty">Stuck? Ask me anything about this challenge or your code.</p>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} className={`chal-ai-msg chal-ai-msg--${msg.role}`}>
                {msg.role === 'ai'
                  ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                  : msg.text
                }
              </div>
            ))}
            {aiLoading && (
              <div className="chal-ai-msg chal-ai-msg--ai">
                <div className="chal-typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={aiBottomRef} />
          </div>
          <div className="chal-ai-input">
            <textarea
              rows={1}
              placeholder="Ask a question... (Enter to send)"
              value={aiInput}
              onChange={e => {
                setAiInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAiSend();
                }
              }}
            />
            <button onClick={handleAiSend} disabled={aiLoading} className="chal-ai-send">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

    {showSolutionPrompt && (
        <div className="solution-prompt-overlay">
          <div className="solution-prompt-box">
            <p className="solution-prompt-title">View solution?</p>
            <p className="solution-prompt-body">You've made {attemptCount} failed attempts. You can view the solution, but <strong>5 XP will be deducted</strong> and you won't earn XP for this challenge.</p>
            <div className="solution-prompt-actions">
              <button className="solution-prompt-yes" onClick={handlePromptAccept}>Yes, show it</button>
              <button className="solution-prompt-no" onClick={handlePromptDecline}>No, keep trying</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}