import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import useStore from '../store/useStore';

const DEFAULT_CODE = `# Write your solution here\n`;

export default function Challenge() {
  const { id } = useParams();
  const { user } = useStore();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  // const [code, setCode] = useState(() => {
  //   return localStorage.getItem(`code_challenge_${id}`) || DEFAULT_CODE;
  // });
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

  useEffect(() => {
    api.get(`/challenges/${id}`)
      .then(res => {
        setChallenge(res.data);
        setAttemptCount(res.data.attempt_count || 0);
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
    setLoading(true);
    setResults(null);
    setStatus('');
    try {
      const res = await api.post('/submissions/run', { code, challengeId: parseInt(id) });
      setResults(res.data.results);
    } catch (err) {
      setStatus('Error running code.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResults(null);
    setStatus('');
    try {
      const res = await api.post('/submissions/submit', { code, challengeId: parseInt(id) });
      setStatus(res.data.status);
      setResults(res.data.results);
      setAttemptCount(prev => prev + 1);
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

  if (!challenge) return <div>Loading...</div>;

  return (
    <div className="challenge-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <div className="challenge-layout">
        <div className="challenge-info">
          <h2>{challenge.title}</h2>
          <span className={`difficulty ${challenge.difficulty}`}>{challenge.difficulty}</span>
          <span>+{challenge.xp_reward} XP</span>
          <p>{challenge.description}</p>
          <h4>Sample Test Cases:</h4>
          {challenge.sample_test_cases?.map((tc, i) => (
            <div key={i} className="test-case">
              <p><strong>Input:</strong> {tc.input || '(none)'}</p>
              <p><strong>Expected:</strong> {tc.expected_output}</p>
            </div>
          ))}
        </div>
        <div className="editor-section">
          <Editor
            height="400px"
            language="python"
            value={code}
            onChange={val => {
             setCode(val);
              const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'guest';
              localStorage.setItem(`code_${userId}_challenge_${id}`, val);
            }}
            theme="vs-dark"
          />
          <div className="editor-buttons">
            <button onClick={handleRun} disabled={loading}>
              {loading ? 'Running...' : 'Run'}
            </button>
            <button onClick={handleSubmit} disabled={loading} className="submit-btn">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {status && (
            <div className={`status ${status === 'accepted' ? 'accepted' : status === 'Please write your solution before submitting.' ? 'warn' : 'rejected'}`}>
              {status === 'accepted' ? '🎉 Accepted!' : status === 'Please write your solution before submitting.' ? '✏️ ' + status : '❌ Wrong Answer'}
            </div>
          )}

          <div className="solution-section">
            <button onClick={handleViewSolution} className="solution-btn">
              {showSolution ? '🔒 Hide Solution' : `💡 View Solution (${Math.min(attemptCount, 3)}/3 attempts)`}
            </button>
            {solutionError && <p className="solution-error">{solutionError}</p>}
            {showSolution && solution && (
              <div className="solution-box">
                <p className="solution-note">📖 Solution unlocked! Study it, don't just copy it.</p>
                {solution.solution_code ? (
                  <pre style={{background:'#0f172a', padding:'1rem', borderRadius:'8px', overflowX:'auto', marginTop:'0.5rem', fontSize:'0.85rem'}}>
                    <code>{solution.solution_code}</code>
                  </pre>
                ) : (
                  <p style={{color:'#94a3b8', fontSize:'0.9rem', marginTop:'0.5rem'}}>No solution added yet for this challenge. Ask your instructor.</p>
                )}
              </div>
            )}
          </div>

          {results && (
            <div className="results">
              {results.map((r, i) => (
                <div key={i} className={`result-item ${r.passed ? 'passed' : 'failed'}`}>
                  <span>{r.passed ? '✅' : '❌'} Test {i + 1}: {r.status}</span>
                  {!r.passed && <p>Expected: {r.expected} | Got: {r.actual}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ai-panel">
            <button className="ai-toggle" onClick={() => setAiOpen(!aiOpen)}>
                AI Assistant {aiOpen ? '▲' : '▼'}
            </button>
            {aiOpen && (
                <div className="ai-chat">
                <div className="ai-messages">
                    {aiMessages.length === 0 && (
                    <p className="ai-placeholder">Ask me anything about this challenge or your code!</p>
                    )}
                    {aiMessages.map((msg, i) => (
                    <div key={i} className={`ai-message ${msg.role}`}>
                        <strong>{msg.role === 'user' ? 'You' : '🤖 AI'}:</strong>{' '}
                        {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                    </div>
                    ))}
                    <div ref={aiBottomRef} />
                    {aiLoading && (
                      <div className="ai-message ai typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    )}
                </div>
                <div className="ai-input-row">
                    <textarea
                    rows={1}
                    placeholder="Ask about your code or the challenge... (Shift+Enter for new line)"
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
                    <button onClick={handleAiSend} disabled={aiLoading}>Send</button>
                </div>
                </div>
            )}
          </div>
      </div>
    </div>
  );
}