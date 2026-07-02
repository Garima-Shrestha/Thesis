import React, { useEffect, useRef, useState } from 'react';

const ARENA_W = 320;
const ARENA_H = 200;
const SEGMENT_GAP = 9;
const MIN_LEN = 3;
const MAX_LEN = 22;
const FOOD_COUNT = 8;
const EAT_DIST = 11;
const PAD = 14;

const FOOD_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#a78bfa', '#14b8a6'];
const GEM_COLOR = '#22d3ee';
const STAR_COLOR = '#fde047';
const STAR_COUNT = 2;

function randGem() {
  return {
    x: PAD + 6 + Math.random() * (ARENA_W - (PAD + 6) * 2),
    y: PAD + 6 + Math.random() * (ARENA_H - (PAD + 6) * 2),
    id: Math.random().toString(36).slice(2),
  };
}

function randStar() {
  return {
    x: PAD + 6 + Math.random() * (ARENA_W - (PAD + 6) * 2),
    y: PAD + 6 + Math.random() * (ARENA_H - (PAD + 6) * 2),
    id: Math.random().toString(36).slice(2),
  };
}

function randPos() {
  return {
    x: PAD + Math.random() * (ARENA_W - PAD * 2),
    y: PAD + Math.random() * (ARENA_H - PAD * 2),
    color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
    id: Math.random().toString(36).slice(2),
  };
}

function WormBuddy({ state }) {
  const [, forceRender] = useState(0);
  const [flash, setFlash] = useState(null);

  const headRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2 });
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const pathRef = useRef([{ x: ARENA_W / 2, y: ARENA_H / 2 }]);
  const lengthRef = useRef(MIN_LEN);
  const foodsRef = useRef(Array.from({ length: FOOD_COUNT }, randPos));
  const gemRef = useRef(randGem());
  const gemTimerRef = useRef(0);
  const starsRef = useRef(Array.from({ length: STAR_COUNT }, randStar));
  const rafRef = useRef(null);
  const frameRef = useRef(0);
  const prevState = useRef(state);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const speedFor = (s) => (s === 'building' ? 0.90 : s === 'thinking' ? 0.6 : 0.8);

    const tick = () => {
      const s = stateRef.current;
      const sp = speedFor(s);
      const head = headRef.current;

      let targetAngle = angleRef.current;
      if (s === 'building') {
        let nearest = null, nd = Infinity;
        foodsRef.current.forEach(f => {
          const d = Math.hypot(f.x - head.x, f.y - head.y);
          if (d < nd) { nd = d; nearest = f; }
        });
        if (nearest) targetAngle = Math.atan2(nearest.y - head.y, nearest.x - head.x);
      } else {
        targetAngle += (Math.random() - 0.5) * 0.5;
      }
      let diff = Math.atan2(Math.sin(targetAngle - angleRef.current), Math.cos(targetAngle - angleRef.current));
      angleRef.current += diff * 0.12 + (Math.random() - 0.5) * 0.06;

      let nx = head.x + Math.cos(angleRef.current) * sp;
      let ny = head.y + Math.sin(angleRef.current) * sp;
      if (nx < PAD || nx > ARENA_W - PAD) { angleRef.current = Math.PI - angleRef.current; nx = Math.max(PAD, Math.min(ARENA_W - PAD, nx)); }
      if (ny < PAD || ny > ARENA_H - PAD) { angleRef.current = -angleRef.current; ny = Math.max(PAD, Math.min(ARENA_H - PAD, ny)); }

      headRef.current = { x: nx, y: ny };
      pathRef.current.unshift({ x: nx, y: ny });
      if (pathRef.current.length > MAX_LEN * SEGMENT_GAP + 20) pathRef.current.length = MAX_LEN * SEGMENT_GAP + 20;

      if (s === 'building') {
        foodsRef.current = foodsRef.current.map(f => {
          if (Math.hypot(f.x - nx, f.y - ny) < EAT_DIST) {
            lengthRef.current = Math.min(MAX_LEN, lengthRef.current + 1);
            return randPos();
          }
          return f;
        });
      }
      gemTimerRef.current++;
      const gem = gemRef.current;
      if (s === 'building' && Math.hypot(gem.x - nx, gem.y - ny) < EAT_DIST + 2) {
        lengthRef.current = Math.min(MAX_LEN, lengthRef.current + 3);
        gemRef.current = randGem();
        gemTimerRef.current = 0;
      } else if (gemTimerRef.current > 600) {
        gemRef.current = randGem();
        gemTimerRef.current = 0;
      }

      if (s === 'building') {
        starsRef.current = starsRef.current.map(st => {
          if (Math.hypot(st.x - nx, st.y - ny) < EAT_DIST) {
            lengthRef.current = Math.min(MAX_LEN, lengthRef.current + 2);
            return randStar();
          }
          return st;
        });
      }

      frameRef.current++;
      if (frameRef.current % 2 === 0) forceRender(n => n + 1); // throttle re-renders to ~30fps
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state === 'run_error') {
      lengthRef.current = Math.max(1, Math.floor(lengthRef.current / 2));
      setFlash('run_error');
      setTimeout(() => setFlash(null), 700);
    }
    if (state === 'error') {
      lengthRef.current = 1;
      setFlash('error');
      setTimeout(() => setFlash(null), 900);
    }
    if (state === 'success') {
      setFlash('success');
      setTimeout(() => setFlash(null), 1200);
    }
  }, [state]);

  const path = pathRef.current;
  const segments = [path[0] || headRef.current];
  let dist = 0;
  for (let i = 1; i < path.length && segments.length < lengthRef.current; i++) {
    dist += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    if (dist >= SEGMENT_GAP) { segments.push(path[i]); dist = 0; }
  }

  const color =
    flash === 'error' ? '#ef4444' :
    flash === 'run_error' ? '#f97316' :
    flash === 'success' ? '#22c55e' :
    '#16a34a';

  return (
    <div className="snake-wrap">
      <style>{`
        @keyframes snake-death-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        @keyframes snake-eat-spark {
          0% { opacity: 1; transform: scale(0.4); }
          100% { opacity: 0; transform: scale(1.8); }
        }
        @keyframes food-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes gem-spin-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.3) rotate(45deg); }
        }
        .snake-gem { animation: gem-spin-pulse 1.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes star-twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .snake-star { animation: star-twinkle 1.3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .snake-head-g { animation: ${flash === 'error' ? 'snake-death-shake 0.4s ease-in-out 2' : 'none'}; transform-origin: center; transform-box: fill-box; }
        .snake-food { animation: food-pulse 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .snake-spark { animation: snake-eat-spark 0.4s ease-out forwards; }
      `}</style>

      <svg width="100%" height="100%" viewBox={`0 0 ${ARENA_W} ${ARENA_H}`}>
        {foodsRef.current.map(f => (
          <g key={f.id} className="snake-food">
            <circle cx={f.x} cy={f.y} r="4.5" fill={f.color} stroke="#fff" strokeWidth="0.8" />
            <circle cx={f.x - 1} cy={f.y - 1} r="1" fill="#fff" opacity="0.8" />
          </g>
        ))}
        
        {starsRef.current.map(st => (
          <text key={st.id} x={st.x} y={st.y + 3} fontSize="10" textAnchor="middle" fill={STAR_COLOR} className="snake-star">★</text>
        ))}

        <g className="snake-gem">
          <polygon
            points={`${gemRef.current.x},${gemRef.current.y - 6} ${gemRef.current.x + 5},${gemRef.current.y} ${gemRef.current.x},${gemRef.current.y + 6} ${gemRef.current.x - 5},${gemRef.current.y}`}
            fill={GEM_COLOR}
            stroke="#fff"
            strokeWidth="0.8"
          />
          <circle cx={gemRef.current.x - 1.5} cy={gemRef.current.y - 2} r="1" fill="#fff" opacity="0.9" />
        </g>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={seg.x} cy={seg.y}
            r={i === 0 ? 9 : 7}
            fill={color}
            stroke="#14532d"
            strokeWidth="1.3"
          />
        ))}
        {segments[0] && (
          <g className="snake-head-g">
            <circle cx={segments[0].x - 3} cy={segments[0].y - 2} r="1.4" fill="white" />
            <circle cx={segments[0].x + 3} cy={segments[0].y - 2} r="1.4" fill="white" />
          </g>
        )}
      </svg>

      <p className="snake-caption">
        
        {flash === 'error'
          ? 'Oh no, the snake died, try again!'
          : flash === 'run_error'
          ? 'Ouch, lost some length!'
          : flash === 'success'
          ? 'Snake feast! Great job!'
          : state === 'building'
          ? 'Snake is hunting for food...'
          : 'Snake is roaming around...'}
      </p>
    </div>
  );
}

export default WormBuddy;