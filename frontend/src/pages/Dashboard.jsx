import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';


function HouseScene({ solved, total }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  // const effectiveTotal = total || 8;
  // const pct = Math.min(solved / effectiveTotal, 1);
  // const s = Math.floor(pct * 8);

  const effectiveTotal = Math.max(total, 1);
  const progress = Math.min(solved / effectiveTotal, 1);

  // Continuous progress (0 → 1)
  const ground = Math.min(progress / 0.10, 1);
  const foundation = Math.max(0, Math.min((progress - 0.10) / 0.10, 1));
  const walls = Math.max(0, Math.min((progress - 0.20) / 0.20, 1));
  const roof = Math.max(0, Math.min((progress - 0.40) / 0.20, 1));
  const details = Math.max(0, Math.min((progress - 0.60) / 0.20, 1));
  const world = Math.max(0, Math.min((progress - 0.80) / 0.20, 1));

  // Keep the existing day/night logic
  const pct = progress;
  const s = Math.floor(progress * 8);

  const isNight = s >= 5;
  const isDusk = s === 4;

  const stages = [
    "Your plot awaits: solve a challenge to begin!",
    "Foundation laid: the journey begins!",
    "Walls rising: keep going!",
    "Roof on: looking like a home!",
    "Windows and door: almost there!",
    "The sun sets: garden is blooming!",
    "Night falls: trees stand tall!",
    "Stars out: your home glows!",
    "Dream home complete under the stars!",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const draw = () => {
      frame++;
      const birdX = (frame * 0.45) % 760 - 40;
      const wing = Math.sin(frame * 0.18) * 4;
      const W = 680, H = 320;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient based on stage
      const skyColors = [
        ['#e0f2fe', '#bae6fd'], // s0 pale blue
        ['#dbeafe', '#bfdbfe'], // s1
        ['#dbeafe', '#93c5fd'], // s2
        ['#bfdbfe', '#60a5fa'], // s3
        ['#fde68a', '#fb923c'], // s4 dusk
        ['#1e1b4b', '#312e81'], // s5 night
        ['#0f0a2e', '#1e1b4b'], // s6 deep night
        ['#050314', '#0f0a2e'], // s7
        ['#000010', '#050314'], // s8
      ];
      const [skyTop, skyBot] = skyColors[Math.min(s, 8)];
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars (night only)
      if (s >= 5) {
        const stars = [[60,30],[120,15],[200,40],[300,20],[400,10],[480,35],[560,18],[620,42],[150,55],[350,50],[500,60],[80,70]];
        stars.forEach(([sx, sy]) => {
          const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.05 + sx);
          ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.9})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Sun or Moon
      if (s <= 3) {
        // Sun with rays
        ctx.fillStyle = '#fef08a';
        ctx.beginPath(); ctx.arc(60, 55, 28, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
          ctx.beginPath();
          ctx.moveTo(60 + Math.cos(angle) * 34, 55 + Math.sin(angle) * 34);
          ctx.lineTo(60 + Math.cos(angle) * 44, 55 + Math.sin(angle) * 44);
          ctx.stroke();
        }
      } else if (s === 4) {
        // Dusk sun low
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(90, 200, 36, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(251,146,60,0.3)';
        ctx.beginPath(); ctx.arc(90, 200, 55, 0, Math.PI * 2); ctx.fill();
      } else {
        // Moon
        const moonX = 580, moonY = 55;
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath(); ctx.arc(moonX, moonY, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = skyTop;
        ctx.beginPath(); ctx.arc(moonX + 8, moonY - 5, 18, 0, Math.PI * 2); ctx.fill();
        // Moon glow
        ctx.fillStyle = 'rgba(241,245,249,0.08)';
        ctx.beginPath(); ctx.arc(moonX, moonY, 36, 0, Math.PI * 2); ctx.fill();
      }

      // Clouds (day only)
      if (s <= 3) {
        const cloudX = ((frame * 0.3) % 800) - 100;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        [[cloudX, 60, 40, 22], [cloudX + 35, 52, 30, 20], [cloudX + 65, 60, 35, 20],
         [cloudX + 320, 90, 35, 18], [cloudX + 355, 82, 28, 17], [cloudX + 380, 90, 30, 17]
        ].forEach(([cx, cy, rx, ry]) => {
          ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        });
      }

      // Ground
      const groundY = 260;
      const groundColors = s >= 5
        ? ['#14532d', '#166534']
        : s >= 1
        ? ['#16a34a', '#22c55e']
        : ['#94a3b8', '#cbd5e1'];
      const gGrad = ctx.createLinearGradient(0, groundY, 0, H);
      gGrad.addColorStop(0, groundColors[0]);
      gGrad.addColorStop(1, groundColors[1]);
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // Ground texture: grass blades
      if (s >= 1) {
        ctx.strokeStyle = s >= 5 ? '#15803d' : '#15803d';
        ctx.lineWidth = 1;
        for (let gx = 10; gx < W; gx += 18) {
          const wave = Math.sin(frame * 0.04 + gx * 0.1) * 3;
          ctx.beginPath();
          ctx.moveTo(gx, groundY);
          ctx.quadraticCurveTo(gx + wave, groundY - 10, gx + wave * 0.5, groundY - 16);
          ctx.stroke();
        }
      }

      // HOUSE BUILDING 

      if (foundation > 0) {
        // Foundation: stone texture
        ctx.fillStyle = '#78716c';
        ctx.fillRect(195, 242, 290, 20);
        ctx.fillStyle = '#a8a29e';
        for (let bx = 200; bx < 480; bx += 30) {
          ctx.fillRect(bx, 244, 24, 8);
          ctx.fillRect(bx + 15, 253, 24, 7);
        }
      }

      if (walls > 0) {
        // Main wall brick-like
        const wallColor = s >= 5 ? '#92400e' : '#d97706';
        const wallShade = s >= 5 ? '#78350f' : '#b45309';
        ctx.fillStyle = wallColor;
        ctx.fillRect(215, 170, 250, 74);
        // Brick lines
        ctx.strokeStyle = wallShade;
        ctx.lineWidth = 0.8;
        for (let wy = 174; wy < 244; wy += 12) {
          ctx.beginPath(); ctx.moveTo(215, wy); ctx.lineTo(465, wy); ctx.stroke();
        }
        for (let wy = 170; wy < 244; wy += 24) {
          for (let wx = 215; wx < 465; wx += 32) {
            ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + 12); ctx.stroke();
          }
        }
        for (let wy = 182; wy < 244; wy += 24) {
          for (let wx = 231; wx < 465; wx += 32) {
            ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + 12); ctx.stroke();
          }
        }
        // Side walls
        ctx.fillStyle = wallShade;
        ctx.fillRect(195, 170, 22, 74);
        ctx.fillRect(463, 170, 22, 74);
      }

      if (roof > 0) {
        // Roof tiled look
        ctx.fillStyle = s >= 5 ? '#991b1b' : '#dc2626';
        ctx.beginPath();
        ctx.moveTo(175, 172); ctx.lineTo(505, 172); ctx.lineTo(340, 95);
        ctx.closePath(); ctx.fill();
        // Roof tiles
        ctx.strokeStyle = s >= 5 ? '#7f1d1d' : '#b91c1c';
        ctx.lineWidth = 1;
        for (let row = 0; row < 5; row++) {
          const rowY = 172 - row * 15;
          const rowW = row * 33;
          for (let tx = 340 - rowW; tx < 340 + rowW; tx += 22) {
            ctx.beginPath();
            ctx.moveTo(tx, rowY);
            ctx.lineTo(tx + 11, rowY - 15);
            ctx.lineTo(tx + 22, rowY);
            ctx.stroke();
          }
        }
        // Roof edge trim
        ctx.fillStyle = s >= 5 ? '#7f1d1d' : '#b91c1c';
        ctx.fillRect(172, 170, 336, 6);
        // Gable details
        ctx.fillStyle = s >= 5 ? '#78350f' : '#b45309';
        ctx.fillRect(325, 120, 30, 55);
      }

      if (details > 0) {
        // Windows: glowing at night
        const winGlow = s >= 5 ? '#fef08a' : '#bae6fd';
        const winFrame = s >= 5 ? '#b45309' : '#0369a1';

        // Left window
        ctx.fillStyle = winFrame;
        ctx.fillRect(228, 183, 58, 46);
        ctx.fillStyle = winGlow;
        ctx.fillRect(232, 187, 50, 38);
        if (s >= 5) {
          // Night glow effect
          ctx.fillStyle = 'rgba(254,240,138,0.15)';
          ctx.beginPath(); ctx.ellipse(257, 206, 35, 28, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = winFrame; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(257, 187); ctx.lineTo(257, 225); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(232, 206); ctx.lineTo(282, 206); ctx.stroke();

        // Right window
        ctx.fillStyle = winFrame;
        ctx.fillRect(394, 183, 58, 46);
        ctx.fillStyle = winGlow;
        ctx.fillRect(398, 187, 50, 38);
        if (s >= 5) {
          ctx.fillStyle = 'rgba(254,240,138,0.15)';
          ctx.beginPath(); ctx.ellipse(423, 206, 35, 28, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = winFrame; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(423, 187); ctx.lineTo(423, 225); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(398, 206); ctx.lineTo(448, 206); ctx.stroke();

        // Door
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(316, 244); ctx.lineTo(316, 200);
        ctx.quadraticCurveTo(316, 192, 324, 192);
        ctx.lineTo(356, 192);
        ctx.quadraticCurveTo(364, 192, 364, 200);
        ctx.lineTo(364, 244);
        ctx.closePath(); ctx.fill();
        // Door knob
        ctx.fillStyle = s >= 5 ? '#fef08a' : '#fbbf24';
        ctx.beginPath(); ctx.arc(352, 220, 4, 0, Math.PI * 2); ctx.fill();
        // Door panel detail
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
        ctx.strokeRect(321, 196, 17, 22);
        ctx.strokeRect(342, 196, 17, 22);

        // Path to door: cobblestone
        ctx.fillStyle = '#a8a29e';
        ctx.fillRect(306, 244, 68, 18);
        const stones = [[308,246],[322,248],[336,245],[350,247],[364,246],[308,254],[322,252],[336,255],[350,253],[364,254]];
        ctx.fillStyle = '#78716c';
        stones.forEach(([px, py]) => {
          ctx.beginPath(); ctx.ellipse(px + 4, py + 2, 6, 4, 0.3, 0, Math.PI * 2); ctx.fill();
        });
      }

      if (world > 0.10) {
        const plantScale = Math.min(world / 0.35, 1);
        // Garden left: bushes
        const bushGreen = s >= 6 ? '#15803d' : '#16a34a';
        ctx.fillStyle = '#14532d';
        ctx.beginPath(); ctx.ellipse(148, 256, 42, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bushGreen;
        // ctx.beginPath(); ctx.ellipse(158, 248, 32, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse( 158, 248 + (1 - plantScale) * 14, 32 * plantScale, 18 * plantScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#166534';
        // ctx.beginPath(); ctx.ellipse(138, 250, 26, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse( 138, 250 + (1 - plantScale) * 12, 26 * plantScale, 15 * plantScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#92400e'; ctx.fillRect(148, 255, 5, 12);

        // Flowers
        const flowerColors = ['#f87171', '#fbbf24', '#a78bfa', '#34d399', '#f472b6'];
        [[490,258],[505,252],[475,256],[462,260],[518,256]].forEach(([fx, fy], fi) => {
          ctx.fillStyle = flowerColors[fi % flowerColors.length];
          ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#15803d'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(fx, fy + 5); ctx.lineTo(fx, fy + 12); ctx.stroke();
        });

        // Garden right bush
        ctx.fillStyle = '#14532d';
        ctx.beginPath(); ctx.ellipse(528, 256, 38, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bushGreen;
        ctx.beginPath(); ctx.ellipse(535, 249, 28, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#92400e'; ctx.fillRect(525, 255, 5, 12);
      }

      if (world > 0.35) {
        // Left tree
        ctx.fillStyle = '#92400e'; ctx.fillRect(98, 210, 9, 52);
        ctx.fillStyle = '#14532d';
        ctx.beginPath(); ctx.ellipse(102, 195, 25, 32, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.beginPath(); ctx.ellipse(94, 205, 20, 26, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath(); ctx.ellipse(110, 202, 18, 24, 0, 0, Math.PI * 2); ctx.fill();
        

        // Right tree
        ctx.fillStyle = '#92400e'; ctx.fillRect(572, 205, 9, 57);
        ctx.fillStyle = '#14532d';
        ctx.beginPath(); ctx.ellipse(576, 188, 27, 34, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.beginPath(); ctx.ellipse(568, 200, 20, 26, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath(); ctx.ellipse(584, 198, 20, 26, 0, 0, Math.PI * 2); ctx.fill();
      }

      if (world > 0.60) {
        // Chimney with animated smoke
        ctx.fillStyle = '#78716c';
        ctx.fillRect(388, 100, 26, 40);
        ctx.fillStyle = '#a8a29e';
        ctx.fillRect(384, 96, 34, 8);
        // Smoke puffs
        for (let p = 0; p < 3; p++) {
          const py = (frame * 0.5 + p * 20) % 50;
          const px = Math.sin(frame * 0.05 + p) * 5;
          const alpha = 1 - py / 50;
          ctx.fillStyle = `rgba(203,213,225,${alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(401 + px, 90 - py, 6 + py * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fence
        ctx.fillStyle = s >= 5 ? '#78350f' : '#b45309';
        ctx.fillRect(550, 244, 100, 5);
        ctx.fillRect(550, 255, 100, 5);
        [553,563,573,583,593,603,613,623,633,643].forEach(x => {
          ctx.fillRect(x, 238, 5, 28);
          // Pointed tops
          ctx.beginPath();
          ctx.moveTo(x, 238);
          ctx.lineTo(x + 2.5, 233);
          ctx.lineTo(x + 5, 238);
          ctx.closePath();
          ctx.fill();
        });

        // Mailbox
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(170, 238, 22, 16);
        ctx.beginPath();
        ctx.arc(181, 238, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(179, 236, 4, 18);
        ctx.fillStyle = '#78716c'; ctx.fillRect(175, 254, 4, 10);
      }

      if (world > 0.90) {
        // Window light glow pulses
        const glowAlpha = 0.1 + 0.06 * Math.sin(frame * 0.04);
        ctx.fillStyle = `rgba(254,240,138,${glowAlpha})`;
        ctx.beginPath(); ctx.ellipse(257, 210, 55, 40, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(423, 210, 55, 40, 0, 0, Math.PI * 2); ctx.fill();

        // Fireflies
        const fireflies = [[130,220],[550,215],[80,240],[600,230],[160,200],[540,195]];
        fireflies.forEach(([fx, fy], fi) => {
          const drift = Math.sin(frame * 0.03 + fi * 1.5) * 8;
          const drifty = Math.cos(frame * 0.025 + fi) * 6;
          const glow = 0.4 + 0.6 * Math.sin(frame * 0.08 + fi * 2);
          ctx.fillStyle = `rgba(250,204,21,${glow})`;
          ctx.beginPath();
          ctx.arc(fx + drift, fy + drifty, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(250,204,21,${glow * 0.3})`;
          ctx.beginPath();
          ctx.arc(fx + drift, fy + drifty, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        // Blue bird sitting on the left side of the roof
        ctx.save();

        ctx.translate(580, 170);
        ctx.scale(-1, 1);

        // body
        ctx.fillStyle = "#60a5fa";
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // wing
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.ellipse(-1, 0, 3, 2, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // head
        ctx.fillStyle = "#60a5fa";
        ctx.beginPath();
        ctx.arc(6, -4, 3, 0, Math.PI * 2);
        ctx.fill();

        // eye
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(7, -5, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // beak
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(9, -4);
        ctx.lineTo(13, -3);
        ctx.lineTo(9, -1);
        ctx.closePath();
        ctx.fill();

        // tail
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-11, -3);
        ctx.moveTo(-6, 1);
        ctx.lineTo(-11, 2);
        ctx.stroke();

        // legs
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-1, 4);
        ctx.lineTo(-1, 7);
        ctx.moveTo(2, 4);
        ctx.lineTo(2, 7);
        ctx.stroke();

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [s]);

  return (
    <div className="house-card">
      <div className="house-header">
        <span className="house-title">Your Home</span>
        <span className="house-stage-badge">{stages[s]}</span>
      </div>
      <canvas ref={canvasRef} width={680} height={320} className="house-canvas" />
      <div className="house-footer">
        <div className="house-progress-labels">
          <span>{solved} / {effectiveTotal} challenges solved</span>
          <span>{Math.round(pct * 100)}% built</span>
        </div>
        <div className="house-track">
          <div className="house-fill" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function XPPopup({ amount, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, []);
  return <div className="xp-popup">+{amount} XP</div>;
}

function LevelUpBanner({ level, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="levelup-overlay">
      <div className="levelup-box">
        <div className="levelup-label">Level Up</div>
        <div className="levelup-number">{level}</div>
        <div className="levelup-sub">Keep going: your home is growing!</div>
      </div>
    </div>
  );
}


function WorldMap({ groups, navigate }) {
  return (
    <div className="worldmap">
      {groups.map((group, gi) => {
        const allSolved = group.challenges.every(c => c.is_solved);
        return (
          <div key={group.id} className={`zone ${!group.is_unlocked ? 'zone-is-locked' : ''}`}>
            <div className="zone-header">
              <div className="zone-header-left">
                <span className="zone-tag">Zone {gi + 1}</span>
                <span className="zone-name">{group.name}</span>
              </div>
              <div className="zone-header-right">
                {group.is_unlocked ? (
                  <span className="zone-progress-text">
                    {group.challenges.filter(c => c.is_solved).length} / {group.challenges.length}
                  </span>
                ) : (
                  <span className="zone-lock-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}}>
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Locked
                  </span>
                )}
              </div>
            </div>

            <div className="zone-track">
              {group.challenges.map((c, ci) => {
                const isEvenRow = ci % 6 < 3;
                const isLast = ci === group.challenges.length - 1;
                return (
                  <div key={c.id} className="node-col">
                    <div className="node-with-connector">
                      <div className="node-and-label">
                        <button
                          className={`challenge-node
                            ${c.is_solved ? 'node-solved' : ''}
                            ${!group.is_unlocked ? 'node-locked' : ''}
                            ${group.is_unlocked && !c.is_solved ? 'node-available' : ''}
                          `}
                          onClick={() => group.is_unlocked && navigate(`/challenge/${c.id}`)}
                          disabled={!group.is_unlocked}
                        >
                          {c.is_solved ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : !group.is_unlocked ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          ) : (
                            <span className="node-number">{ci + 1}</span>
                          )}
                        </button>
                        <div className="node-label">
                          <span className="node-title">{c.title}</span>
                          <span className={`node-diff diff-${c.difficulty}`}>{c.difficulty}</span>
                          <span className="node-xp">+{c.xp_reward} XP</span>
                        </div>
                      </div>
                      {!isLast && (
                        <div className={`node-connector ${c.is_solved ? 'connector-done' : ''}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {gi < groups.length - 1 && (
              <div className="zone-bridge">
                <div className={`bridge-line ${allSolved ? 'bridge-done' : ''}`} />
                <span className={`bridge-label ${allSolved ? 'bridge-label-done' : ''}`}>
                  {allSolved ? 'Zone complete: next zone unlocked!' : 'Complete all challenges to unlock the next zone'}
                </span>
                <div className={`bridge-line ${allSolved ? 'bridge-done' : ''}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [profile, setProfile] = useState(null);
  const [prevProfile, setPrevProfile] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const { logout, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, profileRes] = await Promise.all([
          api.get('/challenges'),
          api.get('/users/profile'),
        ]);
        setGroups(groupsRes.data);
        setProfile(prev => {
          if (prev) {
            if (profileRes.data.total_xp > prev.total_xp) {
              setXpPopup(profileRes.data.total_xp - prev.total_xp);
            }
            if (profileRes.data.current_level > prev.current_level) {
              setLevelUp(profileRes.data.current_level);
            }
          }
          return profileRes.data;
        });
      } catch (err) {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="game-shell">
      {xpPopup && <XPPopup amount={xpPopup} onDone={() => setXpPopup(null)} />}
      {levelUp && <LevelUpBanner level={levelUp} onDone={() => setLevelUp(null)} />}

      <div className="game-sidebar">
        {profile && (
          <>
            <div className="player-card">
              <div className="player-avatar">{profile.display_name.charAt(0).toUpperCase()}</div>
              <div className="player-name">{profile.display_name}</div>
              <div className="player-level">Level {profile.current_level}</div>
              <div className="player-xp-track">
                <div className="player-xp-fill" style={{ width: `${Math.min((profile.total_xp % 500) / 5, 100)}%` }} />
              </div>
              <div className="player-xp-label">{profile.total_xp} XP total</div>
            </div>
            <div className="stat-grid">
              <div className="stat-cell">
                <div className="stat-val">{profile.problems_solved}</div>
                <div className="stat-key">Solved</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">{profile.current_streak}</div>
                <div className="stat-key">Streak</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">{profile.weekly_xp}</div>
                <div className="stat-key">Weekly XP</div>
              </div>
              <div className="stat-cell">
                <div className="stat-val">{profile.badges?.length || 0}</div>
                <div className="stat-key">Badges</div>
              </div>
            </div>
            <div className="sidebar-nav">
              <button className="nav-btn" onClick={() => navigate('/profile')}>Profile</button>
              <button className="nav-btn" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
              {user?.role === 'admin' && <button className="nav-btn" onClick={() => navigate('/admin')}>Admin</button>}
              <button className="nav-btn nav-btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}
      </div>

      <div className="game-main">
        {profile && <HouseScene solved={profile.problems_solved} total={groups.reduce((acc, g) => acc + g.challenges.length, 0)} />}
        <h2 className="map-title">Challenge Map</h2>
        <WorldMap groups={groups} navigate={navigate} />
      </div>
    </div>
  );
}