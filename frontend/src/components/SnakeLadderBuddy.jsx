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

// Ladders: land exactly on "from" -> climb to "to"
const LADDERS = [
  { from: 4, to: 12 },
  { from: 9, to: 19 },
  { from: 15, to: 24 },
];

// Decorative snakes drawn on the board (visual theme only; the real penalty is backspacing)
const SNAKES = [
  { head: 21, tail: 8, color: '#16a34a' },
  { head: 26, tail: 14, color: '#7c3aed' },
  { head: 18, tail: 6, color: '#dc2626' },
];

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
          <path d="M-3 -9 Q-1.5 -7 0 -9" fill="none" stroke="#1e293b" strokeWidth="1" />
          <path d="M0 -9 Q1.5 -7 3 -9" fill="none" stroke="#1e293b" strokeWidth="1" />
          <path d="M-2 -6 Q0 -4.5 2 -6" fill="none" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <g className="sl-dizzy">
            <text x="-9" y="-19" fontSize="7">✨</text>
            <text x="6" y="-21" fontSize="6">⭐</text>
            <text x="-2" y="-23" fontSize="6">✨</text>
          </g>
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
    <g transform={`translate(${a.x}, ${a.y}) rotate(${angle})`}>
      <line x1="0" y1={-railGap} x2={len} y2={-railGap} stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="0" y1={railGap} x2={len} y2={railGap} stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
      {Array.from({ length: rungCount }, (_, i) => {
        const x = (len / (rungCount - 1)) * i;
        return <line key={i} x1={x} y1={-railGap} x2={x} y2={railGap} stroke="#d97706" strokeWidth="2" />;
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

function SnakeLadderBuddy({ state, codeLength = 0 }) {
  const [position, setPosition] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [flash, setFlash] = useState(null); // 'bite' | 'ladder' | 'win' | null
  const [message, setMessage] = useState('Start typing to roll the dice');

  const prevCodeLength = useRef(0);
  const lastBiteAt = useRef(0);
  const prevState = useRef(state);
  const rollTimerRef = useRef(null);
  const positionRef = useRef(0);
  positionRef.current = position;
  const walkModeRef = useRef('forward'); // tracks whether the current walk should resolve ladders

  const getSafeBackTarget = (current, steps) => {
    const floor = hasStarted ? 1 : 0;
    let target = Math.max(floor, current - steps);
    // never let a backward move land exactly on a ladder's bottom tile
    while (LADDERS.some(l => l.from === target) && target > floor) {
      target -= 1;
    }
    return target;
  };

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

  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state === 'success' && hasStarted) {
      setPosition(TOTAL_TILES);
      setDisplayPosition(TOTAL_TILES);
      setFlash('win');
      setMessage('Solved it! You reached the top!');
      setTimeout(() => setFlash(null), 4000); // celebration plays for 4s, then settles
    }
  }, [state]);

const [displayPosition, setDisplayPosition] = useState(0);
  const [walkTarget, setWalkTarget] = useState(null);
  const [slideOn, setSlideOn] = useState(false);
  const walkTimerRef = useRef(null);

  const resolveLanding = (tile, mode = 'forward') => {
    const ladder = mode === 'forward' ? LADDERS.find(l => l.from === tile) : null;
    const snake = SNAKES.find(s => s.head === tile);
    if (!ladder && !snake) return;

    const finalTile = ladder ? ladder.to : snake.tail;
    setFlash(ladder ? 'ladder' : 'bite');
    setMessage(ladder ? 'Found a ladder, climbing up!' : 'Landed on a snake, sliding down!');
    setSlideOn(true);
    setPosition(finalTile);
    setDisplayPosition(finalTile);
    setTimeout(() => { setFlash(null); setSlideOn(false); }, 700);
  };

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
        @keyframes sl-token-bite { 0% { transform: translateY(0) rotate(0deg); } 40% { transform: translateY(5px) rotate(12deg); } 100% { transform: translateY(0) rotate(0deg); } }
        @keyframes sl-token-climb { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.12); } 100% { transform: translateY(0) scale(1); } }
        @keyframes sl-token-win { 0%, 100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-10px) scale(1.15) rotate(-6deg); } 50% { transform: translateY(0) scale(1); } 75% { transform: translateY(-6px) scale(1.1) rotate(6deg); } }
        @keyframes sl-dice-roll { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }
        .sl-token { animation: sl-token-bob 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .sl-token--bite { animation: sl-token-bite 0.8s ease-in-out; }
        .sl-dizzy { animation: sl-dizzy-spin 0.8s linear; transform-origin: center; }
        @keyframes sl-dizzy-spin { 0% { opacity: 0; transform: rotate(0deg); } 30% { opacity: 1; } 100% { opacity: 0; transform: rotate(180deg); } }
        .sl-token--ladder { animation: sl-token-climb 0.8s ease-in-out; }
        .sl-token--win { animation: sl-token-win 1s ease-in-out infinite; }
        .sl-confetti { animation: sl-confetti-burst 1.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes sl-confetti-burst { 0% { opacity: 1; transform: scale(0.4) translateY(0); } 100% { opacity: 0; transform: scale(1.2) translateY(24px) rotate(180deg); } }
        .sl-dice--rolling { animation: sl-dice-roll 0.4s ease-in-out; }
      `}</style>

      <svg width="100%" height="auto" viewBox={`0 0 ${BOARD_W} ${BOARD_H + START_Y_OFFSET}`} style={{ maxWidth: '260px', display: 'block', margin: '0 auto' }}>
        {Array.from({ length: TOTAL_TILES }, (_, i) => i + 1).map(t => {
          const { x, y } = tileToXY(t);
          const isGoal = t === TOTAL_TILES;
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
              <text x={x} y={y + 3} fontSize="8" textAnchor="middle" fill="#8a6d42">{t}</text>
            </g>
          );
        })}

        {LADDERS.map((l, i) => <Ladder key={i} from={l.from} to={l.to} />)}
        {SNAKES.map((s, i) => <Snake key={i} head={s.head} tail={s.tail} color={s.color} />)}

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

      <div className="sl-hud">
        <div className={`sl-dice ${rolling ? 'sl-dice--rolling' : ''}`}>🎲 {diceValue}</div>
        <div className="sl-progress">{position} / {TOTAL_TILES}</div>
      </div>
      <p className="sl-caption">{message}</p>
    </div>
  );
}

export default SnakeLadderBuddy;