import React, { useEffect, useRef, useState } from 'react';

const COLS = 6;
const ROWS = 5;
const TOTAL_TILES = COLS * ROWS; // 30
const TILE_SIZE = 42;
const BOARD_W = COLS * TILE_SIZE;
const BOARD_H = ROWS * TILE_SIZE;
const START_Y_OFFSET = TILE_SIZE + 14; // room for the start mat below the board
const BACKSPACE_THRESHOLD = 20;
const BACKSPACE_STEP = 2; // how many tiles to move back on a backspace penalty
const BITE_COOLDOWN_MS = 1500;

// Snakes and ladders now spawn dynamically at the player's current tile
// snake on a wrong submission, ladder on a right one.
const SNAKE_COLORS = ['#dc2626', '#16a34a', '#7c3aed', '#0891b2', '#db2777', '#ea580c'];

function tileToXY(tileNum) {
  const idx = Math.max(0, tileNum - 1);
  const row = Math.floor(idx / COLS); // 0 = bottom row
  const posInRow = idx % COLS;
  const col = row % 2 === 0 ? posInRow : COLS - 1 - posInRow;
  const x = col * TILE_SIZE + TILE_SIZE / 2;
  const y = BOARD_H - row * TILE_SIZE - TILE_SIZE / 2;
  return { x, y };
}

// Little walking character token, reused visual language from StudyBuddy but simplified/tiny
function CharacterToken({ mood }) {
  return (
    <g>
      <ellipse cx="0" cy="10" rx="7" ry="2" fill="#000" opacity="0.15" />
      <circle cx="0" cy="-4" r="15" fill="#ec4899" stroke="#831843" strokeWidth="1.5" />
      <rect x="-5" y="-2" width="10" height="10" rx="3" fill="#2563eb" stroke="#1e3a8a" strokeWidth="0.75" />
      <circle cx="0" cy="-9" r="6" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
      <path d="M-6 -11 Q-5 -16 0 -16 Q5 -16 6 -11 Q4 -13 0 -13 Q-4 -13 -6 -11" fill="#1e293b" />
      {mood === 'bite' ? (
        <>
          {/* droopy sad eyes */}
          <path d="M-4 -8 Q-1.5 -6.5 1 -8.5" fill="none" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M-1 -8 Q1.5 -6.5 4 -8.5" fill="none" stroke="#1e293b" strokeWidth="1.3" strokeLinecap="round" />
          {/* sad wobbly mouth */}
          <path d="M-2.5 -5 Q0 -6.5 2.5 -5" fill="none" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          {/* sweat drop */}
          <path d="M8 -13 Q9.5 -11 8 -9.5 Q6.5 -11 8 -13 Z" fill="#60a5fa" opacity="0.85" className="sl-sweat" />
        </>
      ) : mood === 'ladder' ? (
        <>
          <circle cx="-2" cy="-9" r="1" fill="#1e293b" />
          <circle cx="2" cy="-9" r="1" fill="#1e293b" />
          <path d="M-2 -6 Q0 -4 2 -6" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : mood === 'win' ? (
        <>
          <path d="M-3 -10 Q-2 -8.5 -1 -10" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
          <path d="M1 -10 Q2 -8.5 3 -10" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
          <path d="M-3 -6 Q0 -2.5 3 -6" fill="none" stroke="#92400e" strokeWidth="1.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-2" cy="-9" r="1" fill="#1e293b" />
          <circle cx="2" cy="-9" r="1" fill="#1e293b" />
          <path d="M-2 -6 Q0 -5 2 -6" fill="none" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function Ladder({ from, to }) {
  const a = tileToXY(from);
  const b = tileToXY(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const rungCount = Math.max(3, Math.floor(len / 10));
  const railGap = 6;

  return (
    <g transform={`translate(${a.x}, ${a.y}) rotate(${angle})`} className="sl-ladder-shine">
      <line x1="0" y1={-railGap} x2={len} y2={-railGap} stroke="#b45309" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="0" y1={-railGap - 0.6} x2={len} y2={-railGap - 0.6} stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <line x1="0" y1={railGap} x2={len} y2={railGap} stroke="#b45309" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="0" y1={railGap - 0.6} x2={len} y2={railGap - 0.6} stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      {Array.from({ length: rungCount }, (_, i) => {
        const x = (len / (rungCount - 1)) * i;
        return (
          <g key={i}>
            <line x1={x} y1={-railGap} x2={x} y2={railGap} stroke="#78350f" strokeWidth="3.4" strokeLinecap="round" />
            <line x1={x} y1={-railGap} x2={x} y2={railGap} stroke="#fef3c7" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

function Snake({ head, tail, color }) {
  const h = tileToXY(head);
  const t = tileToXY(tail);
  const cx1 = h.x + (h.y > t.y ? 14 : -14);
  const cy1 = h.y - (h.y - t.y) * 0.3;
  const cx2 = t.x + (h.y > t.y ? -14 : 14);
  const cy2 = t.y + (h.y - t.y) * 0.3;
  const path = `M ${h.x} ${h.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`;
  return (
    <g>
      <path d={path} fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="5.5" strokeLinecap="round" />
      <path d={path} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={h.x} cy={h.y} r="5.5" fill={color} stroke="#000" strokeOpacity="0.2" strokeWidth="1" />
      <circle cx={h.x - 1.5} cy={h.y - 1} r="1" fill="#fff" />
      <circle cx={h.x + 1.5} cy={h.y - 1} r="1" fill="#fff" />
      <path d={`M ${h.x} ${h.y + 4} l -2 2 M ${h.x} ${h.y + 4} l 2 2`} stroke="#dc2626" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

function SnakeLadderBuddy({ state, codeLength = 0, difficulty = 'beginner', attemptCount = 0, isVisible = true }) {
  const [position, setPosition] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [flash, setFlash] = useState(null); // 'bite' | 'ladder' | 'win' | null
  const [message, setMessage] = useState('Start typing to roll the dice');
  const [dynamicFeature, setDynamicFeature] = useState(null); // { type: 'snake' | 'ladder', from, to }
  const [boardToast, setBoardToast] = useState(false);

  const prevCodeLength = useRef(0);
  const lastBiteAt = useRef(0);
  const audioCtxRef = useRef(null);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('slSoundOn') !== 'false');

  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev;
      localStorage.setItem('slSoundOn', String(next));
      return next;
    });
  };

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const makeNoiseBuffer = (ctx, duration) => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  };

  // Comedic "sad trombone" descending wah-wah-wah-waaah (~1.4s) for a funny-but-sad fall
  const playSnakeSound = () => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      // classic sad-trombone: 4 descending notes, last one held + wobbled
      const notes = [
        { freq: 349.23, start: 0,    dur: 0.28 }, // F4
        { freq: 329.63, start: 0.28, dur: 0.28 }, // E4
        { freq: 311.13, start: 0.56, dur: 0.28 }, // Eb4
        { freq: 233.08, start: 0.84, dur: 0.55 }, // Bb3 (held, wobbly)
      ];

      notes.forEach(({ freq, start, dur }, i) => {
        const t = now + start;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.06, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08); // little downward slide into each note

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 900;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.28, t + 0.05);
        gain.gain.setValueAtTime(0.25, t + dur - 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(lowpass).connect(gain).connect(ctx.destination);

        // wobble (vibrato) on the last held note for comic effect
        if (i === notes.length - 1) {
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 7;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 6;
          lfo.connect(lfoGain).connect(osc.frequency);
          lfo.start(t);
          lfo.stop(t + dur);
        }

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch (e) { /* audio not supported / blocked — fail silently */ }
  };

  // Sparkly ascending chime for the ladder achievement (~0.9s)
  const playLadderSound = () => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 E5 G5 C6 E6 — bright major arpeggio

      notes.forEach((freq, i) => {
        const t = now + i * 0.09;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);

        // shimmer harmonic an octave up, quieter
        const shimmer = ctx.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.value = freq * 2;
        const shimmerGain = ctx.createGain();
        shimmerGain.gain.setValueAtTime(0.0001, t);
        shimmerGain.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        shimmer.connect(shimmerGain).connect(ctx.destination);
        shimmer.start(t);
        shimmer.stop(t + 0.35);
      });
    } catch (e) { /* audio not supported / blocked — fail silently */ }
  };
  const prevState = useRef(state);
  const rollTimerRef = useRef(null);
  const positionRef = useRef(0);
  positionRef.current = position;
  const walkModeRef = useRef('forward'); // tracks whether the current walk should resolve ladders

  const getSafeBackTarget = (current, steps) => {
    const floor = hasStarted ? 1 : 0;
    return Math.max(floor, current - steps);
  };

  // Snake bite: drop is a % of how far the player has traveled, and grows
  // with more failed attempts on this challenge.
  const getSnakeBiteTarget = (current, attempts) => {
    const floor = hasStarted ? 1 : 0;
    const traveled = current - floor;
    if (traveled <= 0) return current;
    const attemptBoost = Math.min(attempts * 0.03, 0.25); // up to +25%
    const dropRatio = 0.30 + attemptBoost;
    const drop = Math.max(Math.round(traveled * dropRatio), 4);
    return Math.max(floor, current - drop);
  };

  // Ladder climb: a correct submission always climbs straight to the top.
  const getLadderTarget = () => TOTAL_TILES;

useEffect(() => {
    if (state === 'building') {
      if (!hasStarted) setHasStarted(true);
      rollTimerRef.current = setInterval(() => {
        const remaining = (TOTAL_TILES - 1) - positionRef.current;
        const roll = remaining > 0
          ? Math.max(1, Math.floor(Math.random() * Math.min(6, remaining)) + 1)
          : Math.floor(Math.random() * 6) + 1; // stuck at 29: dice keeps rolling, just doesn't move you
        setRolling(true);
        setDiceValue(roll);
        setTimeout(() => {
          setRolling(false);
          if (remaining <= 0) {
            setMessage(`Rolled a ${roll}, submit to finish!`);
            return;
          }
      setMessage(`Rolled a ${roll}`);
          walkModeRef.current = 'forward';
          setWalkTarget(Math.min(TOTAL_TILES - 1, positionRef.current + roll));
        }, 400);
      }, 2500);
    }
    return () => clearInterval(rollTimerRef.current);
  }, [state, hasStarted]);

  useEffect(() => {
    const prevLen = prevCodeLength.current;
    if (codeLength < prevLen && prevLen >= BACKSPACE_THRESHOLD && hasStarted && walkTarget === null) {
      const now = Date.now();
      if (now - lastBiteAt.current > BITE_COOLDOWN_MS) {
        lastBiteAt.current = now;
        const target = getSafeBackTarget(positionRef.current, BACKSPACE_STEP);
        if (target !== positionRef.current) {
          setMessage('Careful: backtracking!');
          walkModeRef.current = 'backward';
          setWalkTarget(target);
        }
      }
    }
    prevCodeLength.current = codeLength;
  }, [codeLength]);

  // Slides the token directly along a snake/ladder shape (not tile-by-tile).
  const triggerSlide = (type, target) => {
    const from = positionRef.current;
    if (target === from) return;
    const color = type === 'snake' ? SNAKE_COLORS[Math.floor(Math.random() * SNAKE_COLORS.length)] : undefined;
    setDynamicFeature({ type, from, to: target, color });
    // let the snake/ladder render one frame before sliding, so the CSS transition animates
    requestAnimationFrame(() => {
      setSlideOn(true);
      setPosition(target);
      setDisplayPosition(target);
    });
    setFlash(type === 'ladder' ? 'ladder' : 'bite');
    setTimeout(() => {
      setFlash(type === 'ladder' ? 'win' : null);
      setSlideOn(false);
      setDynamicFeature(null);
      if (type === 'ladder') setTimeout(() => setFlash(null), 3500);
    }, 700);
  };

  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;

    if (state === 'error' && hasStarted && walkTarget === null) {
      const target = getSnakeBiteTarget(positionRef.current, attemptCount);
      setMessage('Wrong answer: a snake got you!');
      triggerSlide('snake', target);
      if (isVisible && soundOn) playSnakeSound();
    }

    if (state === 'success' && hasStarted) {
      if (difficulty === 'beginner') {
        setPosition(TOTAL_TILES);
        setDisplayPosition(TOTAL_TILES);
        setFlash('win');
        setMessage('Solved it! You reached the top!');
        setTimeout(() => setFlash(null), 4000);
        if (isVisible && soundOn) playLadderSound();
      } else {
        setMessage('Great job: a ladder appears!');
        triggerSlide('ladder', getLadderTarget());
        setBoardToast(true);
        setTimeout(() => setBoardToast(false), 3500);
        if (isVisible && soundOn) playLadderSound();
      }
    }
  }, [state]);

const [displayPosition, setDisplayPosition] = useState(0);
  const [walkTarget, setWalkTarget] = useState(null);
  const [slideOn, setSlideOn] = useState(false);
  const walkTimerRef = useRef(null);

  const resolveLanding = () => {}; // no-op: snake/ladder now handled directly by triggerSlide

  useEffect(() => {
    if (walkTarget === null) return;
    clearInterval(walkTimerRef.current);
    const mode = walkModeRef.current;

    if (displayPosition === walkTarget) {
      setPosition(walkTarget);
      setWalkTarget(null);
      const t = setTimeout(() => resolveLanding(walkTarget, mode), 350);
      return () => clearTimeout(t);
    }

    const step = displayPosition < walkTarget ? 1 : -1;
    walkTimerRef.current = setInterval(() => {
      setDisplayPosition(prev => {
        const next = prev + step;
        if (next === walkTarget) {
          clearInterval(walkTimerRef.current);
          setPosition(walkTarget);
          setWalkTarget(null);
          setTimeout(() => resolveLanding(walkTarget, mode), 350);
        }
        return next;
      });
    }, 140);

    return () => clearInterval(walkTimerRef.current);
  }, [walkTarget]);

  const onBoard = hasStarted && displayPosition > 0;
  const tokenXY = onBoard ? tileToXY(displayPosition) : { x: TILE_SIZE / 2, y: BOARD_H + START_Y_OFFSET / 2 };

  return (
    <div className="sl-wrap">
      <style>{`
        @keyframes sl-token-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes sl-token-bite { 0% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(3px) rotate(-8deg); } 55% { transform: translateY(6px) rotate(10deg); } 80% { transform: translateY(4px) rotate(-4deg); } 100% { transform: translateY(0) rotate(0deg); } }
        @keyframes sl-token-climb { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.12); } 100% { transform: translateY(0) scale(1); } }
        @keyframes sl-token-win { 0%, 100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-10px) scale(1.15) rotate(-6deg); } 50% { transform: translateY(0) scale(1); } 75% { transform: translateY(-6px) scale(1.1) rotate(6deg); } }
        @keyframes sl-dice-roll { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }
        .sl-token { animation: sl-token-bob 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .sl-token--bite { animation: sl-token-bite 1.1s ease-in-out; }
        @keyframes sl-sweat-drip { 0% { opacity: 0; transform: translateY(-2px); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(6px); } }
        .sl-sweat { animation: sl-sweat-drip 1.1s ease-in-out; transform-box: fill-box; transform-origin: center; }
        .sl-dizzy { animation: sl-dizzy-spin 0.8s linear; transform-origin: center; }
        @keyframes sl-dizzy-spin { 0% { opacity: 0; transform: rotate(0deg); } 30% { opacity: 1; } 100% { opacity: 0; transform: rotate(180deg); } }
        .sl-token--ladder { animation: sl-token-climb 0.8s ease-in-out; }
        .sl-token--win { animation: sl-token-win 1s ease-in-out infinite; }
        .sl-confetti { animation: sl-confetti-burst 1.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes sl-confetti-burst { 0% { opacity: 1; transform: scale(0.4) translateY(0); } 100% { opacity: 0; transform: scale(1.2) translateY(24px) rotate(180deg); } }
        .sl-dice--rolling { animation: sl-dice-roll 0.4s ease-in-out; }
        @keyframes sl-ladder-glow { 0%, 100% { filter: drop-shadow(0 0 2px #fbbf24); } 50% { filter: drop-shadow(0 0 7px #fde68a); } }
        .sl-ladder-shine { animation: sl-ladder-glow 1s ease-in-out infinite; }
        @keyframes sl-dust-rise { 0% { opacity: 0; transform: scale(0.3) translateY(4px); } 25% { opacity: 0.7; } 100% { opacity: 0; transform: scale(1.3) translateY(-6px); } }
        .sl-dust-puff { animation: sl-dust-rise 0.9s ease-out 0.55s; opacity: 0; }
        @keyframes sl-toast-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.95); } 15% { opacity: 1; transform: translateY(0) scale(1); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateY(-4px); } }
        .sl-board-toast {
          text-align: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #78350f;
          background: linear-gradient(90deg, #fde68a, #fbbf24);
          border-radius: 8px;
          padding: 0.4rem 0.6rem;
          margin: 0.4rem auto 0;
          max-width: 220px;
          animation: sl-toast-pop 3.5s ease-in-out forwards;
        }
      `}</style>

      <svg width="100%" height="auto" viewBox={`0 0 ${BOARD_W} ${BOARD_H + START_Y_OFFSET}`} style={{ maxWidth: '260px', display: 'block', margin: '0 auto' }}>
        {Array.from({ length: TOTAL_TILES }, (_, i) => i + 1).map(t => {
          const { x, y } = tileToXY(t);
          const isGoal = t === TOTAL_TILES;
          const isMilestone = t === 10 || t === 20;
          return (
            <g key={t}>
              <rect
                x={x - TILE_SIZE / 2 + 1.5}
                y={y - TILE_SIZE / 2 + 1.5}
                width={TILE_SIZE - 3}
                height={TILE_SIZE - 3}
                rx="4"
                fill={isGoal ? '#eab308' : (t % 2 === 0 ? '#e7d9b8' : '#f3e9d0')}
                stroke="#c9b689"
                strokeWidth="1"
              />
              {isMilestone && (
                <text x={x + 12} y={y - 10} fontSize="10" textAnchor="middle">⭐</text>
              )}
              {isGoal && (
                <text x={x + 12} y={y - 10} fontSize="11" textAnchor="middle">🏁</text>
              )}
              <text x={x} y={y + 3} fontSize="8" textAnchor="middle" fill="#8a6d42">{t}</text>
            </g>
          );
        })}

        {dynamicFeature?.type === 'ladder' && <Ladder from={dynamicFeature.from} to={dynamicFeature.to} />}
        {dynamicFeature?.type === 'snake' && <Snake head={dynamicFeature.from} tail={dynamicFeature.to} color={dynamicFeature.color || '#dc2626'} />}
        {flash === 'bite' && (() => {
          const landXY = tileToXY(dynamicFeature?.to ?? position);
          return (
            <g className="sl-dust-puff">
              <circle cx={landXY.x - 6} cy={landXY.y + 6} r="3" fill="#94a3b8" opacity="0.5" />
              <circle cx={landXY.x + 5} cy={landXY.y + 7} r="2.4" fill="#94a3b8" opacity="0.45" />
              <circle cx={landXY.x} cy={landXY.y + 8} r="2.8" fill="#94a3b8" opacity="0.4" />
            </g>
          );
        })()} 

        {/* Start mat below the board */}
        <rect
          x={2} y={BOARD_H + 4}
          width={TILE_SIZE - 4} height={START_Y_OFFSET - 8}
          rx="4"
          fill="var(--bg-input)"
          stroke="var(--border-mid)"
          strokeDasharray="3 2"
        />

        <g
          transform={`translate(${tokenXY.x}, ${tokenXY.y})`}
          style={{ transition: slideOn ? 'transform 650ms cubic-bezier(0.4,0,0.2,1)' : 'none' }}
        >
          <g className={`sl-token ${flash === 'bite' ? 'sl-token--bite' : ''} ${flash === 'ladder' ? 'sl-token--ladder' : ''} ${flash === 'win' ? 'sl-token--win' : ''}`}>
            <CharacterToken mood={flash} />
          </g>
        </g>
        {flash === 'win' && (
          <g>
            {Array.from({ length: 14 }, (_, i) => {
              const goalXY = tileToXY(TOTAL_TILES);
              const colors = ['#f59e0b', '#ec4899', '#22d3ee', '#a78bfa', '#4ade80'];
              const angle = (i / 14) * Math.PI * 2;
              const dist = 20 + (i % 3) * 8;
              return (
                <rect
                  key={i}
                  x={goalXY.x + Math.cos(angle) * dist - 2}
                  y={goalXY.y + Math.sin(angle) * dist - 2}
                  width="4" height="4"
                  fill={colors[i % colors.length]}
                  className="sl-confetti"
                  style={{ animationDelay: `${(i % 5) * 0.08}s` }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {boardToast && (
        <div className="sl-board-toast"> You beat the board, not just the challenge!</div>
      )}
      <div className="sl-hud">
        <button
          type="button"
          onClick={toggleSound}
          title={soundOn ? 'Mute snake sound' : 'Unmute snake sound'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
        >
          {soundOn ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
        <div className={`sl-dice ${rolling ? 'sl-dice--rolling' : ''}`}>🎲 {diceValue}</div>
        <div className="sl-progress">{position} / {TOTAL_TILES}</div>
      </div>
      <p className="sl-caption">{message}</p>
    </div>
  );
}

export default SnakeLadderBuddy;