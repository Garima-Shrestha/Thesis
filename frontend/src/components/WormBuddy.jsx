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

const WORM_BIG_LEN = 7;
const TRANSFORM_LEN = 11;
const DRAGON_LEN = 15;
const FIRE_LEN = 19;
const EPIC_LEN = 22; // final majestic form, unlocked at max growth
const SLEEPY_MS = 15000;
const FIRE_BREATH_INTERVAL_MS = 4500; // how often the fire dragon breathes fire
const FIRE_BREATH_DURATION_MS = 1000; // how long each fire puff lasts

const STAGE_WORM_SMALL = 'worm_small';
const STAGE_WORM_BIG = 'worm_big';
const STAGE_TRANSFORM = 'transform';
const STAGE_DRAGON = 'dragon';
const STAGE_FIRE = 'fire';
const STAGE_EPIC = 'epic';

function stageFromLength(len) {
  if (len >= EPIC_LEN) return STAGE_EPIC;
  if (len >= FIRE_LEN) return STAGE_FIRE;
  if (len >= DRAGON_LEN) return STAGE_DRAGON;
  if (len >= TRANSFORM_LEN) return STAGE_TRANSFORM;
  if (len >= WORM_BIG_LEN) return STAGE_WORM_BIG;
  return STAGE_WORM_SMALL;
}

const STAGE_ORDER = [STAGE_WORM_SMALL, STAGE_WORM_BIG, STAGE_TRANSFORM, STAGE_DRAGON, STAGE_FIRE, STAGE_EPIC];
function stageRank(stage) {
  return STAGE_ORDER.indexOf(stage);
}

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


const DRAGON_HALF_EXTENT = 48;

// Cute dragon character, drawn to resemble a proper little dragon 
function DragonCharacter({ cx, cy, facingRight, scale, isFire, isEpic, isTransform, sad, sleepy, wiggle, breathingFire }) {
  const flip = facingRight ? 1 : -1;
  const fiery = isFire || isEpic;

  const bodyMain = isEpic ? '#b91c1c' : fiery ? '#dc2626' : '#2dd4bf';
  const bodyDark = isEpic ? '#450a0a' : fiery ? '#7f1d1d' : '#0f766e';
  const bellyColor = isEpic ? '#10b981' : fiery ? '#fecaca' : '#99f6e4';
  const spikeColor = isEpic ? '#facc15' : fiery ? '#facc15' : '#0f766e';
  const wingColor = isEpic ? '#34d399' : fiery ? '#f87171' : '#5eead4';
  const glowColor = '#4ade80';

  const mouthOpen = fiery && breathingFire && !sad;

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${flip * scale}, ${scale})`}>
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>

        {/* Shadow */}
        <ellipse cx="0" cy="15" rx="20" ry="2.6" fill="#000" opacity="0.14" />

        {/* Tail, sweeping back and slightly up */}
        <path
          d={isEpic
            ? "M -8 6 Q -20 4 -26 -4 Q -30 -10 -25 -14"
            : "M -8 6 Q -17 5 -21 -1 Q -24 -6 -19 -9"}
          fill="none"
          stroke={bodyMain}
          strokeWidth={isEpic ? 5.5 : 5}
          strokeLinecap="round"
        />
        <path d={isEpic ? "M -25 -14 l -4 -2 l 5 -3 l 2 4 z" : "M -19 -9 l -3.5 -1.5 l 4 -2.5 l 1.5 3 z"} fill={spikeColor} />

        <g className={sleepy ? "" : "dragon-back-leg"}>
          <ellipse cx="-9" cy="10" rx="4.5" ry="3.6" fill={bodyMain} />
          <path d="M -12 12.5 l -1 2.3 M -9.5 13 l -0.3 2.4 M -7 12.5 l 1 2.3"
            stroke={bodyDark}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Back wing, attached at the shoulder, swept up */}
        <path
          d={isEpic
            ? "M 2 -3 Q 6 -16 -2 -26 Q 8 -22 14 -14 Q 16 -8 12 -2 Q 15 -6 18 -4 Q 15 2 8 2 Z"
            : "M 2 -3 Q 5 -13 -1 -21 Q 6 -18 11 -11 Q 13 -6 9 -1 Q 12 -4 14 -3 Q 12 2 6 2 Z"}
          fill={wingColor}
          stroke={bodyDark}
          strokeWidth="0.7"
          className="snake-wing"
        />

        {/* Back ridge spikes, following the spine from hip to head */}
        <path d="M -3 -1 l -1.5 -5 l 3 2 z" fill={spikeColor} />
        <path d="M 1 -3 l -0.5 -6 l 3.5 2.5 z" fill={spikeColor} />
        <path d="M 5 -5 l 0.5 -6 l 3.5 3 z" fill={spikeColor} />
        <path d="M 9 -7 l 1.5 -5.5 l 3 3.5 z" fill={spikeColor} />

        <g className={sleepy ? "" : "dragon-front-leg"}>
          <ellipse cx="5" cy="11" rx="4.2" ry="3.6" fill={bodyMain} />
          <path d="M 2 13.5 l -1 2.3 M 4.5 14 l -0.2 2.4 M 7 13.5 l 1 2.3"
            stroke={bodyDark}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Body: elongated horizontal barrel from hip to shoulder */}
        <path
          d="M -11 6 Q -12 -3 -3 -6 Q 6 -8 11 -3 Q 13 4 8 9 Q -2 12 -11 6 Z"
          fill={bodyMain}
        />
        {/* Belly stripe */}
        <path
          d="M -8 6 Q -6 1 0 0 Q 6 -1 9 2 Q 8 7 2 8 Q -4 9 -8 6 Z"
          fill={bellyColor}
        />
        {isEpic && (
          <>
            <circle cx="-4" cy="2" r="0.9" fill={glowColor} opacity="0.9" />
            <circle cx="2" cy="4" r="0.8" fill={glowColor} opacity="0.9" />
            <circle cx="6" cy="1" r="0.7" fill={glowColor} opacity="0.9" />
          </>
        )}

        {/* Front arm/claw, raised slightly */}
        <path d="M 8 1 Q 13 0 15 4" fill="none" stroke={bodyMain} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M 14 2.5 l 2 -1.5 M 15.5 4 l 2 0 M 14.5 5.5 l 1.5 1.5" stroke={bodyDark} strokeWidth="1" strokeLinecap="round" />

        {/* Neck, connecting body to head, angled up */}
        <path
          d="M 8 -4 Q 14 -9 20 -8 Q 24 -7 25 -3 Q 20 -3 16 -1 Q 10 1 8 3 Z"
          fill={bodyMain}
        />

        <g
          className={wiggle ? 'dragon-head-bob' : ''}
          style={{ transformBox: 'fill-box', transformOrigin: '18px -8px' }}
        >
          {/* Head: elongated snout profile, not a round blob */}
          <path
            d="M 18 -14 Q 26 -15 32 -9 Q 35 -6 33 -3 Q 31 -1 27 -1 Q 25 2 21 1 Q 16 0 14 -5 Q 14 -11 18 -14 Z"
            fill={bodyMain}
          />
          {/* Jaw / open mouth wedge */}
          <path
            d={mouthOpen
              ? "M 27 -1 Q 33 2 36 5 Q 30 4 25 2 Z"
              : "M 27 -1 Q 31 1 33 3 Q 29 2.5 25 1.5 Z"}
            fill={bodyDark}
          />
          {mouthOpen && (
            <path d="M 27 -1 L 29 2 L 31 -1 L 33 2 L 35 0" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Nostril */}
          <circle cx="31" cy="-7" r="0.8" fill={bodyDark} />

          {/* Horns, swept back over the head */}
          {isEpic && (
            <ellipse cx="20" cy="-19" rx="7" ry="1.8" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.85" transform="rotate(-18 20 -19)" />
          )}
          <path d="M 16 -14 Q 12 -20 15 -25 Q 19 -20 18 -14 Z" fill={bodyMain} stroke={bodyDark} strokeWidth="0.6" />
          <path d="M 21 -14 Q 20 -21 25 -24 Q 26 -18 23 -13 Z" fill={bodyMain} stroke={bodyDark} strokeWidth="0.6" />
          {isEpic && (
            <>
              <circle cx="14.5" cy="-23.5" r="0.8" fill="#fde047" />
              <circle cx="25.5" cy="-22.5" r="0.8" fill="#fde047" />
            </>
          )}

          {/* Eye */}
          {sleepy ? (
            <path d="M 22 -10 q 3 1.6 5.5 0" fill="none" stroke="#134e4a" strokeWidth="1.1" strokeLinecap="round" />
          ) : sad ? (
            <path d="M 22 -9.5 q 3 2.4 5.5 0" fill="none" stroke="#134e4a" strokeWidth="1.1" strokeLinecap="round" />
          ) : (
            <>
              <circle cx="25" cy="-10" r="2.6" fill="#fff" />
              <circle cx="25.5" cy="-9.6" r="1.6" fill="#0f172a" />
              <circle cx="24.9" cy="-10.3" r="0.5" fill="#fff" />
            </>
          )}

          {/* Sleepy Z's */}
          {sleepy && (
            <>
              <text x="34" y="-14" fontSize="5.5" fill="#94a3b8" className="snake-sleepy-z">Z</text>
              <text x="38" y="-19" fontSize="4" fill="#cbd5e1" className="snake-sleepy-z" style={{ animationDelay: '0.6s' }}>Z</text>
            </>
          )}

          {/* Fire breath: bigger burst during the victory head-bob */}
          {mouthOpen && (
            <g className="snake-fire">
              <circle cx="38" cy="4" r={wiggle ? 4.2 : 2.6} fill="#f97316" />
              <circle cx="43" cy="5" r={wiggle ? 3.2 : 1.9} fill="#fde047" />
              <circle cx="48" cy="4" r={wiggle ? 2.4 : 1.3} fill="#fef08a" />
              {wiggle && (
                <>
                  <circle cx="53" cy="3" r="1.8" fill="#fef9c3" />
                  <circle cx="41" cy="1" r="2" fill="#fb923c" opacity="0.85" />
                  <circle cx="46" cy="7" r="1.6" fill="#f97316" opacity="0.8" />
                </>
              )}
            </g>
          )}
        </g>
      </g>
    </g>
  );
}

function WormBuddy({ state, isVisible = true }) {
  const [, forceRender] = useState(0);
  const [flash, setFlash] = useState(null); // 'error' | 'run_error' | 'celebrate' | null

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
  const lastActiveRef = useRef(Date.now());
  const [isSleepy, setIsSleepy] = useState(false);
  const [breathingFire, setBreathingFire] = useState(false);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('wormFireSoundOn') !== 'false');
  const audioCtxRef = useRef(null);
  const facingRightRef = useRef(true); // stable facing, updated with hysteresis in the tick loop
  // Highest stage reached via celebration this session. Only resets on remount (refresh/leave/return).
  const unlockedStageRef = useRef(STAGE_WORM_SMALL);

  const getEffectiveStage = () => {
    const rawStage = stageFromLength(lengthRef.current);
    return stageRank(unlockedStageRef.current) > stageRank(rawStage) ? unlockedStageRef.current : rawStage;
  };

  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev;
      localStorage.setItem('wormFireSoundOn', String(next));
      return next;
    });
  };

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

// Victory power-up: ascending sweep + triumphant chord stabs + light percussion (~1.1s)
  const playFireSound = () => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      // 1. Rising "power-up" sweep bright square wave gliding up, like charging up energy
      const sweep = ctx.createOscillator();
      sweep.type = 'square';
      sweep.frequency.setValueAtTime(220, now);
      sweep.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      const sweepFilter = ctx.createBiquadFilter();
      sweepFilter.type = 'lowpass';
      sweepFilter.frequency.setValueAtTime(800, now);
      sweepFilter.frequency.linearRampToValueAtTime(4000, now + 0.35);
      const sweepGain = ctx.createGain();
      sweepGain.gain.setValueAtTime(0, now);
      sweepGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      sweepGain.gain.setTargetAtTime(0, now + 0.3, 0.06);
      sweep.connect(sweepFilter).connect(sweepGain).connect(ctx.destination);
      sweep.start(now);
      sweep.stop(now + 0.4);

      // 2. Triumphant chord stabs two quick punchy major chords, like a heroic "ta-DA!"
      const chordTimes = [now + 0.32, now + 0.55];
      const chordFreqSets = [
        [392.0, 493.88, 587.33],   // G4 B4 D5
        [523.25, 659.25, 783.99],  // C5 E5 G5 resolves up, feels like a win
      ];
      chordFreqSets.forEach((freqs, ci) => {
        const t = chordTimes[ci];
        const isFinal = ci === chordFreqSets.length - 1;
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const gain = ctx.createGain();
          const peak = isFinal ? 0.22 : 0.16;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(peak, t + 0.015);
          gain.gain.setTargetAtTime(isFinal ? peak * 0.7 : 0, t + (isFinal ? 0.1 : 0.08), isFinal ? 0.25 : 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.7 : 0.2));
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + (isFinal ? 0.75 : 0.25));

          // Bright overtone layer for extra shine on the final chord
          if (isFinal) {
            const overtone = ctx.createOscillator();
            overtone.type = 'sine';
            overtone.frequency.value = freq * 2;
            const overtoneGain = ctx.createGain();
            overtoneGain.gain.setValueAtTime(0, t);
            overtoneGain.gain.linearRampToValueAtTime(0.07, t + 0.015);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            overtone.connect(overtoneGain).connect(ctx.destination);
            overtone.start(t);
            overtone.stop(t + 0.65);
          }
        });
      });

      // 3. Light percussive "clap" accents under each chord stab for punch (no low rumble)
      chordTimes.forEach((t) => {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 2000;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.08);
      });

      // 4. Sparkle shimmer trailing off after the final chord celebratory glitter
      const sparkleStart = now + 0.65;
      for (let i = 0; i < 5; i++) {
        const t = sparkleStart + Math.random() * 0.35;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 1600 + Math.random() * 1600;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      }
    } catch (e) { /* audio not supported / blocked fail silently */ }
  };

  useEffect(() => {
    // Slower glide speeds than before
    const speedFor = (s) => (s === 'building' ? 0.55 : s === 'thinking' ? 0.38 : 0.5);

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
      angleRef.current += diff * 0.1 + (Math.random() - 0.5) * 0.05;

      let nx = head.x + Math.cos(angleRef.current) * sp;
      let ny = head.y + Math.sin(angleRef.current) * sp;
      if (nx < PAD || nx > ARENA_W - PAD) { angleRef.current = Math.PI - angleRef.current; nx = Math.max(PAD, Math.min(ARENA_W - PAD, nx)); }
      if (ny < PAD || ny > ARENA_H - PAD) { angleRef.current = -angleRef.current; ny = Math.max(PAD, Math.min(ARENA_H - PAD, ny)); }

      // Only flip facing once the horizontal direction is clearly committed,
      // to stop rapid left/right flicker from small steering jitter.
      const vx = Math.cos(angleRef.current);
      if (vx > 0.25) facingRightRef.current = true;
      else if (vx < -0.25) facingRightRef.current = false;

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
      if (frameRef.current % 2 === 0) forceRender(n => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (state === 'building') {
      lastActiveRef.current = Date.now();
      if (isSleepy) setIsSleepy(false);
    }
  }, [state]);

  useEffect(() => {
    const iv = setInterval(() => {
      const idle = Date.now() - lastActiveRef.current > SLEEPY_MS;
      setIsSleepy(idle && stateRef.current !== 'building');
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Periodic fire breathing only puffs every few seconds instead of constantly
  useEffect(() => {
    const iv = setInterval(() => {
      const stageNow = stageFromLength(lengthRef.current);
      const isFireNow = stageNow === STAGE_FIRE || stageNow === STAGE_EPIC || flash === 'celebrate';
      if (!isFireNow) return;
      setBreathingFire(true);
      setTimeout(() => setBreathingFire(false), FIRE_BREATH_DURATION_MS);
    }, FIRE_BREATH_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [flash]);

  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;

    // Run failures only show a sad reaction no stage regression.
    if (state === 'run_error') {
      setFlash('run_error');
      setTimeout(() => setFlash(null), 700);
    }

    // Submit failures regress the stage.
    if (state === 'error') {
      const curStage = getEffectiveStage();
      if (curStage === STAGE_FIRE || curStage === STAGE_EPIC) {
        lengthRef.current = DRAGON_LEN; // loses fire only, stays dragon
        unlockedStageRef.current = STAGE_DRAGON;
      } else if (curStage === STAGE_DRAGON || curStage === STAGE_TRANSFORM) {
        lengthRef.current = MIN_LEN; // reverts to worm
        unlockedStageRef.current = STAGE_WORM_SMALL;
      } else {
        lengthRef.current = MIN_LEN; // stays initial worm
        unlockedStageRef.current = STAGE_WORM_SMALL;
      }
      setFlash('error');
      setTimeout(() => setFlash(null), 900);
    }

    if (state === 'success') {
      setFlash('celebrate'); // always shows as fire dragon, regardless of real stage
      unlockedStageRef.current = STAGE_EPIC; // persists after the flash ends, until remount
      setBreathingFire(true);
      if (isVisible && soundOn) playFireSound();
      setTimeout(() => setBreathingFire(false), FIRE_BREATH_DURATION_MS);
      setTimeout(() => setFlash(null), 1800);
    }
  }, [state]);

  const actualStage = getEffectiveStage();
  const stage =
  flash === 'celebrate'
    ? (actualStage === STAGE_WORM_SMALL || actualStage === STAGE_WORM_BIG
        ? STAGE_EPIC
        : actualStage)
    : actualStage;
  const sad = flash === 'error' || flash === 'run_error';
  const isDragonBody = stage === STAGE_TRANSFORM || stage === STAGE_DRAGON || stage === STAGE_FIRE || stage === STAGE_EPIC;

  const path = pathRef.current;
  const segments = [path[0] || headRef.current];
  let dist = 0;
  for (let i = 1; i < path.length && segments.length < Math.max(lengthRef.current, 3); i++) {
    dist += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    if (dist >= SEGMENT_GAP) { segments.push(path[i]); dist = 0; }
  }

  const wormColor = stage === STAGE_WORM_BIG ? '#22c55e' : '#16a34a';
  const wormColorFinal = sad ? '#ef4444' : wormColor;

  const head = segments[0] || headRef.current;
  const wiggle = flash === 'celebrate';

  // Bigger than before at every dragon stage
  const dragonScale =
    stage === STAGE_EPIC ? 1.7 :
    stage === STAGE_FIRE ? 1.5 :
    stage === STAGE_DRAGON ? 1.3 :
    0.95; // transform stage, still small/cute

  // Clamp the dragon's drawing position so it always stays inside the arena rectangle
  const halfExtent = DRAGON_HALF_EXTENT * dragonScale;
  const clampedX = Math.min(Math.max(head.x, halfExtent), ARENA_W - halfExtent);
  const clampedY = Math.min(Math.max(head.y, halfExtent), ARENA_H - halfExtent);

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
        .snake-head-g { animation: ${sad && flash === 'error' ? 'snake-death-shake 0.4s ease-in-out 2' : 'none'}; transform-origin: center; transform-box: fill-box; }
        .snake-food { animation: food-pulse 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .snake-spark { animation: snake-eat-spark 0.4s ease-out forwards; }
        @keyframes dragon-wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-10deg) scale(1.08); }
          40% { transform: rotate(10deg) scale(1.08); }
          60% { transform: rotate(-8deg) scale(1.1); }
          80% { transform: rotate(8deg) scale(1.06); }
        }
        .snake-celebrate { animation: dragon-wiggle 0.55s ease-in-out 3; }
        @keyframes dragon-head-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-6deg); }
          50% { transform: translateY(1px) rotate(3deg); }
          75% { transform: translateY(-2px) rotate(-4deg); }
        }
        .dragon-head-bob { animation: dragon-head-bob 0.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 18px -8px; }
        @keyframes fire-flicker {
          0% { opacity: 0.6; transform: scale(0.7) translateX(0); }
          50% { opacity: 1; transform: scale(1.2) translateX(3px); }
          100% { opacity: 0; transform: scale(0.4) translateX(8px); }
        }
        .snake-fire { animation: fire-flicker 0.45s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes sleepy-z {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-14px) scale(1.1); }
        }
        .snake-sleepy-z { animation: sleepy-z 2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes dragon-leg-front {
          0%,100% { transform: rotate(16deg); }
          50% { transform: rotate(-18deg); }
        }

        @keyframes dragon-leg-back {
          0%,100% { transform: rotate(-18deg); }
          50% { transform: rotate(16deg); }
        }

        .dragon-front-leg{
          animation:dragon-leg-front 1.2s ease-in-out infinite;
          transform-origin:8px 1px;
          transform-box:fill-box;
        }

        .dragon-back-leg{
          animation:dragon-leg-back 1.2s ease-in-out infinite;
          transform-origin:-9px 2px;
          transform-box:fill-box;
        }
        @keyframes wing-flap {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-12deg); }
        }
        .snake-wing { animation: wing-flap 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom right; }
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

        {isDragonBody ? (
          <DragonCharacter
            cx={clampedX}
            cy={clampedY}
            facingRight={facingRightRef.current}
            scale={dragonScale}
            isFire={stage === STAGE_FIRE}
            isEpic={stage === STAGE_EPIC}
            isTransform={stage === STAGE_TRANSFORM}
            sad={sad}
            sleepy={isSleepy}
            wiggle={wiggle}
            breathingFire={breathingFire}
          />
        ) : (
          <>
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={seg.x} cy={seg.y}
                r={i === 0 ? (stage === STAGE_WORM_BIG ? 10.5 : 9) : (stage === STAGE_WORM_BIG ? 8.5 : 7)}
                fill={wormColorFinal}
                stroke="#14532d"
                strokeWidth="1.3"
              />
            ))}
            {segments[0] && (
              <g className="snake-head-g">
                {isSleepy ? (
                  <>
                    <path d={`M ${head.x - 4.5} ${head.y - 2} q 3 1.5 3 0`} fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                    <path d={`M ${head.x + 1.5} ${head.y - 2} q 3 1.5 3 0`} fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                    <text x={head.x + 8} y={head.y - 10} fontSize="6" fill="#94a3b8" className="snake-sleepy-z">Z</text>
                    <text x={head.x + 12} y={head.y - 15} fontSize="4.5" fill="#cbd5e1" className="snake-sleepy-z" style={{ animationDelay: '0.6s' }}>Z</text>
                  </>
                ) : sad ? (
                  <>
                    <path d={`M ${head.x - 4.5} ${head.y - 3} q 1.5 2 3 0`} fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                    <path d={`M ${head.x + 1.5} ${head.y - 3} q 1.5 2 3 0`} fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                    <path d={`M ${head.x - 3} ${head.y + 5} q 3 -2 6 0`} fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx={head.x - 3} cy={head.y - 2} r="1.4" fill="white" />
                    <circle cx={head.x + 3} cy={head.y - 2} r="1.4" fill="white" />
                    <circle cx={head.x - 3} cy={head.y - 2} r="0.6" fill="#1e293b" />
                    <circle cx={head.x + 3} cy={head.y - 2} r="0.6" fill="#1e293b" />
                  </>
                )}
              </g>
            )}
          </>
        )}
      </svg>

      <button
        type="button"
        onClick={toggleSound}
        title={soundOn ? 'Mute fire sound' : 'Unmute fire sound'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--text-secondary)' }}
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
      <p className="snake-caption">
        {flash === 'error'
          ? (actualStage === STAGE_FIRE ? 'Ouch, the fire went out!'
             : (actualStage === STAGE_DRAGON || actualStage === STAGE_TRANSFORM) ? 'Oh no, back to a worm!'
             : 'Oh no, the worm shrank, try again!')
          : flash === 'run_error'
          ? (isDragonBody ? 'Ouch, the dragon winced!' : 'Ouch, the worm winced!')
          : flash === 'celebrate'
          ? 'Dragon dance! Great job!'
          : isSleepy
          ? (stage === STAGE_EPIC ? 'The ancient dragon slumbers...' : isDragonBody ? 'Dragon is dozing off...' : 'Worm is getting sleepy...')
          : state === 'building'
          ? (stage === STAGE_EPIC ? 'The ancient dragon stirs...' : isDragonBody ? 'Dragon is hunting for food...' : 'Worm is hunting for food...')
          : (stage === STAGE_EPIC ? 'The ancient dragon watches over the land...' : isDragonBody ? 'Dragon is roaming around...' : 'Worm is roaming around...')}
      </p>
    </div>
  );
}

export default WormBuddy;