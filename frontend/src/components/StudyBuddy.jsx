import React from 'react';


function StudyBuddy({ state, progress }) {
  const isIdle = state === 'idle';
  const isThinking = state === 'thinking';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isBuilding = state === 'building';


  const foundationBricks = [
    { x:178, y:126, show:0.08 },
    { x:188, y:126, show:0.16 },
    { x:198, y:126, show:0.24 },
    { x:208, y:126, show:0.32 },
    { x:218, y:126, show:0.40 },
    { x:228, y:126, show:0.48 },
    ];


    const wallBricks = [
    { x:184, y:120, show:0.55 },
    { x:193, y:120, show:0.57 },
    { x:202, y:120, show:0.59 },
    { x:211, y:120, show:0.61 },
    { x:220, y:120, show:0.63 },


    { x:188, y:115, show:0.66 },
    { x:197, y:115, show:0.68 },
    { x:206, y:115, show:0.70 },
    { x:215, y:115, show:0.72 },
  ];


  const reveal = (start, end) => {
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    return (progress - start) / (end - start);
  };


  const wallProgress = reveal(0.25, 0.60);


  const totalBricks = 40;
  const visibleBricks = Math.floor(wallProgress * totalBricks);


  const bricks = [];


  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      bricks.push({
        x: 184 + col * 6,
        y: 120 - row * 6,
        color: (row + col) % 2 === 0 ? "#c96f4a" : "#b85c38",
      });
    }
  }


  return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          padding: '0.75rem 0',
          width: '100%',
        }}
      >
      <style>{`
        @keyframes hero-idle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
        }
        @keyframes hero-think {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes hero-success {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          20% { transform: translateY(-16px) rotate(-6deg); }
          40% { transform: translateY(-10px) rotate(4deg); }
          60% { transform: translateY(-18px) rotate(-4deg); }
          80% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes hero-error {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-7px) rotate(-5deg); }
          35% { transform: translateX(7px) rotate(5deg); }
          55% { transform: translateX(-5px) rotate(-3deg); }
          75% { transform: translateX(5px) rotate(3deg); }
          90% { transform: translateX(-2px); }
        }
        @keyframes hero-blink {
          0%, 85%, 100% { transform: scaleY(1); }
          90% { transform: scaleY(0.1); }
        }
        @keyframes hero-cape {
          0%, 100% { transform: rotate(0deg); transform-origin: top right; }
          50% { transform: rotate(8deg); transform-origin: top right; }
        }
        @keyframes star-fly {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }
        }
        @keyframes hero-pencil-write {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes hero-build {
            0%   { transform: rotate(-35deg); }
            40%  { transform: rotate(15deg); }
            55%  { transform: rotate(10deg); }
            100% { transform: rotate(-35deg); }
        }


            @keyframes dust{
            0%{
                opacity:0;
                transform:translate(0,0) scale(.2);
            }
            40%{
                opacity:.7;
            }
            100%{
                opacity:0;
                transform:translate(8px,-8px) scale(1);
            }
        }
        .hero-body {
            animation: ${
                isSuccess ? 'hero-success 0.8s ease-in-out infinite' :
                isError ? 'hero-error 0.5s ease-in-out' :
                isThinking ? 'none' :
                'hero-idle 3s ease-in-out infinite'
            };
            transform-origin: 50px 100px;
            transform: ${isBuilding ? 'rotate(10deg)' : 'rotate(0deg)'};
        }
        .hero-blink { animation: hero-blink 3.5s ease-in-out infinite; transform-origin: 50px 44px; }
        .hero-blink2 { animation: hero-blink 3.5s ease-in-out infinite 0.1s; transform-origin: 62px 44px; }
        .hero-cape { animation: hero-cape 2s ease-in-out infinite; }
        .hero-pencil{
            animation:
            ${
                isBuilding
                ? 'hero-build 1.8s ease-in-out infinite'
                : isThinking
                ? 'hero-pencil-write .6s ease-in-out infinite'
                : 'none'
            };
            transform-origin:80px 60px;
            }


            .dust{
                animation:dust 2s ease-out infinite;
            }
        .star1 { animation: star-fly 0.9s ease-out forwards; --sx: -22px; --sy: -24px; }
        .star2 { animation: star-fly 0.9s ease-out forwards 0.1s; --sx: 24px; --sy: -20px; }
        .star3 { animation: star-fly 0.9s ease-out forwards 0.05s; --sx: -10px; --sy: -30px; }


        @keyframes smoke-rise{
            0%{
                transform:translate(0px,0px) scale(.85);
                opacity:.18;
            }


            35%{
                transform:translate(1px,-6px) scale(.95);
                opacity:.22;
            }


            70%{
                transform:translate(-1px,-12px) scale(1.05);
                opacity:.15;
            }


            100%{
                transform:translate(0px,-20px) scale(1.15);
                opacity:0;
            }
        }


        .smoke1{
            animation:smoke-rise 6s ease-in-out infinite;
        }


        .smoke2{
            animation:smoke-rise 6s ease-in-out infinite 2s;
        }


        .smoke3{
            animation:smoke-rise 6s ease-in-out infinite 4s;
        }
      `}</style>


      <svg
        width="320"
        height="180"
        viewBox="0 0 320 180"
      >


        {/* <g transform="translate(20,20)"> */}
        <g transform="translate(12,18)">
        <g className="hero-body">


        {/* Shadow */}
        <ellipse cx="50" cy="146" rx="18" ry="4" fill="#000" opacity="0.2"/>


        {/* Cape / cloak  */}
        <path
          d="M36 72 Q28 90 30 115 Q38 120 44 112 Q46 90 50 85 Q54 90 56 112 Q62 120 70 115 Q72 90 64 72 Z"
          fill={isSuccess ? '#166534' : isError ? '#7f1d1d' : '#1e3a5f'}
          className="hero-cape"
        />
        {/* Cape highlight */}
        <path
          d="M38 72 Q32 88 33 108"
          fill="none" stroke={isSuccess ? '#22c55e' : isError ? '#ef4444' : '#3b82f6'}
          strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
          className="hero-cape"
        />


        {/* Legs */}
        <rect x="36" y="112" width="11" height="24" rx="5"
          fill={isSuccess ? '#14532d' : isError ? '#450a0a' : '#1e3a5f'}
          stroke={isSuccess ? '#166534' : isError ? '#7f1d1d' : '#1d4ed8'}
          strokeWidth="1"/>
        <rect x="53" y="112" width="11" height="24" rx="5"
          fill={isSuccess ? '#14532d' : isError ? '#450a0a' : '#1e3a5f'}
          stroke={isSuccess ? '#166534' : isError ? '#7f1d1d' : '#1d4ed8'}
          strokeWidth="1"/>
        {/* Boots */}
        <ellipse cx="41" cy="136" rx="10" ry="6"
          fill={isSuccess ? '#052e16' : isError ? '#2d0a0a' : '#172554'}/>
        <ellipse cx="59" cy="136" rx="10" ry="6"
          fill={isSuccess ? '#052e16' : isError ? '#2d0a0a' : '#172554'}/>


        {/* Body / tunic */}
        <rect x="30" y="70" width="40" height="46" rx="12"
          fill={isSuccess ? '#15803d' : isError ? '#b91c1c' : '#2563eb'}/>
        {/* Belt */}
        <rect x="30" y="96" width="40" height="6" rx="2"
          fill={isSuccess ? '#052e16' : isError ? '#450a0a' : '#172554'}/>
        <rect x="46" y="95" width="8" height="8" rx="2"
          fill={isSuccess ? '#22c55e' : isError ? '#ef4444' : '#60a5fa'}/>


        {/* Arms */}
        {isSuccess ? (
        <>
            <line x1="30" y1="80" x2="12" y2="58" stroke="#15803d" strokeWidth="9" strokeLinecap="round"/>
            <line x1="70" y1="80" x2="88" y2="58" stroke="#15803d" strokeWidth="9" strokeLinecap="round"/>
            <circle cx="11" cy="56" r="7" fill="#fde68a"/>
            <circle cx="89" cy="56" r="7" fill="#fde68a"/>
        </>
        ) : isError ? (
        <>
            <line x1="30" y1="80" x2="16" y2="70" stroke="#b91c1c" strokeWidth="9" strokeLinecap="round"/>
            <line x1="16" y1="70" x2="28" y2="56" stroke="#b91c1c" strokeWidth="9" strokeLinecap="round"/>
            <circle cx="29" cy="54" r="7" fill="#fde68a"/>
            <line x1="70" y1="80" x2="84" y2="96" stroke="#b91c1c" strokeWidth="9" strokeLinecap="round"/>
            <circle cx="85" cy="98" r="7" fill="#fde68a"/>
        </>
        ) : isBuilding ? (
        <>
            {/* Left arm */}
            <line x1="30" y1="80" x2="18" y2="92" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"/>
            <circle cx="17" cy="94" r="7" fill="#fde68a"/>


            {/* Right arm */}
            <line
            x1="70"
            y1="80"
            x2="84"
            y2="70"
            stroke="#2563eb"
            strokeWidth="9"
            strokeLinecap="round"
            className="hero-pencil"
            />


            <circle
            cx="85"
            cy="68"
            r="7"
            fill="#fde68a"
            className="hero-pencil"
            />


            {/* Hammer handle */}
            <line
                x1="85" y1="68"
                x2="96" y2="52"
                stroke="#8b5e3c"
                strokeWidth="3"
                strokeLinecap="round"
                className="hero-pencil"
            />
            {/* Hammer head */}
            <rect  
                x="93" y="46"
                width="10" height="6"
                rx="1.5"
                fill="#64748b"
                className="hero-pencil"
                transform="rotate(-30 93 46)"
            />


            {/* Impact dust */}
            <circle cx="92" cy="68" r="1.5" fill="#d1d5db" className="dust" opacity="0.7"/>
            <circle cx="96" cy="65" r="1" fill="#d1d5db" className="dust" opacity="0.5"/>
        </>
        ) : isThinking ? (
        <>
            <line x1="30" y1="80" x2="16" y2="72" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"/>
            <line x1="16" y1="72" x2="22" y2="60" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"/>
            <circle cx="23" cy="58" r="7" fill="#fde68a"/>


            <line x1="70" y1="80" x2="82" y2="68" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"/>


            <circle cx="83" cy="66" r="7" fill="#fde68a"/>
        </>
        ) : (
        <>
            <line x1="30" y1="80" x2="14" y2="96" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"/>
            <line x1="70" y1="80" x2="86" y2="96" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"/>
            <circle cx="13" cy="97" r="7" fill="#fde68a"/>
            <circle cx="87" cy="97" r="7" fill="#fde68a"/>
        </>
        )}


        {/* Neck */}
        <rect x="43" y="56" width="14" height="16" rx="4" fill="#fde68a"/>


        {/* Head */}
        <ellipse cx="50" cy="42" rx="24" ry="22"
          fill="#fde68a"/>
        {/* Head shading */}
        <ellipse cx="58" cy="38" rx="10" ry="8" fill="#fbbf24" opacity="0.25"/>


        {/* Hair */}
        {isSuccess ? (
          /* Spiky happy hair */
          <>
            <path d="M28 36 Q26 20 34 18 Q36 26 38 22 Q42 14 50 12 Q58 14 62 22 Q64 26 66 18 Q74 20 72 36"
              fill="#92400e"/>
            <path d="M30 32 Q29 22 35 21" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        ) : isError ? (
          /* Messy stressed hair */
          <>
            <path d="M28 38 Q24 22 32 16 Q36 24 38 18 Q44 10 50 12 Q56 10 62 18 Q64 24 68 16 Q76 22 72 38"
              fill="#92400e"/>
            <path d="M30 30 Q28 20 33 18 M70 30 Q72 20 67 18" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Stress lines */}
            <line x1="22" y1="28" x2="18" y2="22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            <line x1="78" y1="28" x2="82" y2="22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </>
        ) : (
          /* Normal hair */
          <>
            <path d="M28 38 Q26 22 34 18 Q38 26 40 20 Q44 12 50 12 Q56 12 60 20 Q62 26 66 18 Q74 22 72 38"
              fill="#92400e"/>
          </>
        )}


        {/* Eyes */}
        {isError ? (
          /* Swirly confused eyes */
          <>
            <circle cx="40" cy="44" r="7" fill="white"/>
            <circle cx="60" cy="44" r="7" fill="white"/>
            <path d="M37 44 Q40 40 43 44 Q40 48 37 44" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
            <path d="M57 44 Q60 40 63 44 Q60 48 57 44" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
            <circle cx="40" cy="44" r="2" fill="#1e293b"/>
            <circle cx="60" cy="44" r="2" fill="#1e293b"/>
          </>
        ) : isSuccess ? (
          /* Happy arc eyes */
          <>
            <path d="M33 42 Q40 36 47 42" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" className="hero-blink"/>
            <path d="M53 42 Q60 36 67 42" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" className="hero-blink2"/>
          </>
        ) : (isThinking || isBuilding) ? (
          /* One eyebrow raised */
          <>
            <circle cx="40" cy="44" r="7" fill="white" className="hero-blink"/>
            <circle cx="60" cy="44" r="7" fill="white" className="hero-blink2"/>
            <circle cx={isBuilding ? 44 : 41} cy="44" r="3" fill="#1e293b" className="hero-blink"/>
            <circle cx={isBuilding ? 64 : 61} cy="44" r="3" fill="#1e293b" className="hero-blink2"/>
            <circle cx={isBuilding ? 45 : 42} cy="43" r="1" fill="white" className="hero-blink"/>
            <circle cx={isBuilding ? 65 : 62} cy="43" r="1" fill="white" className="hero-blink2"/>
            {/* One eyebrow raised */}
            <path d="M34 36 Q40 32 46 35" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M54 35 Q60 33 66 36" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
          </>
        ) : (
          /* Normal alert eyes */
          <>
            <circle cx="40" cy="44" r="7" fill="white" className="hero-blink"/>
            <circle cx="60" cy="44" r="7" fill="white" className="hero-blink2"/>
            <circle cx="41" cy="44" r="3.5" fill="#1e293b" className="hero-blink"/>
            <circle cx="61" cy="44" r="3.5" fill="#1e293b" className="hero-blink2"/>
            <circle cx="42" cy="43" r="1.2" fill="white" className="hero-blink"/>
            <circle cx="62" cy="43" r="1.2" fill="white" className="hero-blink2"/>
          </>
        )}


        {/* Mouth */}
        {isSuccess && (
          <path d="M38 55 Q50 65 62 55" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"/>
        )}
        {isError && (
          <path d="M38 60 Q50 53 62 60" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"/>
        )}
        {isThinking && (
          <path d="M40 57 Q50 60 60 55" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
        )}
        {isIdle && (
          <path d="M40 56 Q50 62 60 56" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
        )}


        {/* Headband */}
        <rect x="27" y="34" width="46" height="7" rx="3.5"
          fill={isSuccess ? '#166534' : isError ? '#b91c1c' : '#1d4ed8'}/>
        <rect x="44" y="32" width="12" height="11" rx="3"
          fill={isSuccess ? '#22c55e' : isError ? '#ef4444' : '#3b82f6'}/>


        {/* Success stars */}
        {isSuccess && <>
          <text x="20" y="28" fontSize="16" fill="#fbbf24" className="star1">★</text>
          <text x="72" y="24" fontSize="12" fill="#fbbf24" className="star2">★</text>
          <text x="46" y="18" fontSize="10" fill="#fbbf24" className="star3">★</text>
        </>}


        {/* Thinking bubble */}
        {isThinking && (
        <>
            <circle cx="72" cy="22" r="2" fill="#475569" opacity="0.8"/>
            <circle cx="78" cy="13" r="3" fill="#475569" opacity="0.8"/>
            <circle cx="85" cy="6" r="4" fill="#475569" opacity="0.7"/>


            {/* Cloud */}
            <circle cx="102" cy="4" r="12" fill="#243554"/>
            <circle cx="116" cy="-1" r="14" fill="#243554"/>
            <circle cx="132" cy="4" r="12" fill="#243554"/>
            <circle cx="108" cy="12" r="11" fill="#243554"/>
            <circle cx="124" cy="12" r="11" fill="#243554"/>
            <ellipse cx="116" cy="10" rx="22" ry="12" fill="#243554"/>
            <ellipse cx="116" cy="10" rx="22" ry="12" fill="none" stroke="#334155" strokeWidth="1" opacity="0.5"/>


            {/* Grass */}
            <ellipse cx="116" cy="13" rx="18" ry="3" fill="#86efac"/>


            {/* Dream house */}
            <rect x="106" y="3" width="16" height="10" fill="#bb7242"/>
            <polygon points="104,3 116,-4 128,3" fill="#b65b38"/>
            <rect x="113" y="6" width="3" height="7" fill="#6d4328"/>
            <rect x="107" y="5" width="3" height="3" fill="#ffe08a"/>
            <rect x="118" y="5" width="3" height="3" fill="#ffe08a"/>
            <rect x="121" y="-2" width="2" height="5" fill="#a0522d"/>
            <circle cx="122" cy="-4" r="1.5" fill="#94a3b8" opacity="0.4"/>
            <circle cx="122" cy="-6" r="2" fill="#94a3b8" opacity="0.25"/>
            <circle cx="107" cy="5" r="5" fill="#ffd76a" opacity="0.1"/>


            {/* Tree */}
            <rect x="129" y="3" width="2" height="9" fill="#8b5e3c"/>
            <circle cx="130" cy="1" r="5" fill="#22c55e"/>
            <circle cx="127" cy="3" r="3" fill="#4ade80"/>


            {/* Bush left */}
            <circle cx="101" cy="12" r="3" fill="#4ade80"/>
            <circle cx="104" cy="11" r="2" fill="#22c55e"/>


            {/* Flowers */}
            <circle cx="108" cy="13" r="1" fill="#f472b6"/>
            <circle cx="112" cy="12" r="1" fill="#facc15"/>
            <circle cx="120" cy="13" r="1" fill="#60a5fa"/>


            {/* Mini fence */}
            <line x1="101" y1="12" x2="107" y2="12" stroke="#d4a96a" strokeWidth="0.8"/>
            <rect x="101" y="10" width="1" height="3" fill="#d4a96a"/>
            <rect x="104" y="10" width="1" height="3" fill="#d4a96a"/>
            <rect x="107" y="10" width="1" height="3" fill="#d4a96a"/>
        </>
        )}


        </g>




        {/* House Area */}
        <g
            id="house"
            transform={`translate(172, 140) scale(${0.45 + progress * 1.15}) translate(-206, -140)`}
        >
            {/* Ground */}
            {/* <line x1="155" y1="140" x2="300" y2="140" stroke="#84cc16" strokeWidth="4" strokeLinecap="round"/> */}
           
            {/* Shadow under house */}
            {progress > 0.25 && <ellipse cx="206" cy="141" rx="32" ry="5" fill="#000" opacity="0.12"/>}
            {/* Grass */}
            {progress > 0 && <ellipse cx="220" cy="140" rx="70" ry="10" fill="#86efac"/>}


            {progress === 0 && (
                <>
                    <ellipse cx="206" cy="139" rx="40" ry="6" fill="#5c4033" opacity="0.35"/>
                    <line x1="206" y1="120" x2="206" y2="138" stroke="#8b5e3c" strokeWidth="2.5" strokeLinecap="round"/>
                    <rect x="196" y="110" width="20" height="12" rx="2" fill="#bb7242" stroke="#8b5e3c" strokeWidth="1.2"/>
                    <line x1="200" y1="114" x2="212" y2="114" stroke="#fde68a" strokeWidth="1" strokeLinecap="round"/>
                    <line x1="200" y1="117" x2="210" y2="117" stroke="#fde68a" strokeWidth="1" strokeLinecap="round"/>
                </>
            )}


            {/* Construction Area */}
            <g id="construction">


                {/* Animation progress */}
                {(() => {
                const ground = reveal(0.00, 0.10);
                const foundation = reveal(0.10, 0.25);
                const walls = reveal(0.25, 0.60);
                const roof = reveal(0.60, 0.80);
                const finish = reveal(0.80, 1.00);


                return (
                    <>


                    {/* Prepared ground */}
                    <rect
                        x="172"
                        y="132"
                        width={70 * ground}
                        height="4"
                        rx="2"
                        fill="#b08968"
                    />


                    {/* Foundation */}
                    <rect
                        x="176"
                        y="124"
                        width={56 * foundation}
                        height="10"
                        rx="1"
                        fill="#9ca3af"
                    />


                    <line
                        x1="176"
                        y1="129"
                        x2={176 + (56 * foundation)}
                        y2="129"
                        stroke="#7b8794"
                        strokeWidth="1"
                    />


                    {/* Main wall */}
                    <rect
                        x="182"
                        y={124 - (36 * walls)}
                        width="48"
                        height={36 * walls}
                        rx="1.5"
                        fill="#bb7242"
                    />


                    {/* Horizontal brick lines */}
                    {Array.from({ length: 6 }).map((_, i) => (
                    <line
                        key={`h-${i}`}
                        x1="182"
                        x2="230"
                        y1={124 - i * 6}
                        y2={124 - i * 6}
                        stroke="#8b4513"
                        strokeWidth="0.7"
                        opacity={walls}
                    />
                    ))}


                    {/* Vertical brick lines */}
                    {Array.from({ length: 5 }).map((_, row) =>
                        Array.from({ length: 5 }).map((_, col) => (
                            <line
                            key={`${row}-${col}`}
                            x1={190 + col * 8 + (row % 2 ? 4 : 0)}
                            x2={190 + col * 8 + (row % 2 ? 4 : 0)}
                            y1={124 - row * 6}
                            y2={118 - row * 6}
                            stroke="#8b4513"
                            strokeWidth="0.7"
                            opacity={walls}
                            />
                        ))
                    )}


                    {/* Door frame */}
                    {walls > 0.45 && (
                        <rect
                        x="201"
                        y="104"
                        width="8"
                        height="20"
                        fill="#7c4a2d"
                        />
                    )}


                    {/* Window frame */}
                    {walls > 0.55 && (() => {
                        const wo = Math.min((walls - 0.55) / 0.15, 1);
                        return (
                            <>
                            <rect x="188" y="98" width="10" height="10" fill="#dbeafe" stroke="#7c4a2d" strokeWidth="1" opacity={wo}/>
                            <line x1="193" y1="98" x2="193" y2="108" stroke="#7c4a2d" strokeWidth="0.8" opacity={wo * 0.6}/>
                            <line x1="188" y1="103" x2="198" y2="103" stroke="#7c4a2d" strokeWidth="0.8" opacity={wo * 0.6}/>
                            <rect x="218" y="98" width="10" height="10" fill="#dbeafe" stroke="#7c4a2d" strokeWidth="1" opacity={wo}/>
                            <line x1="223" y1="98" x2="223" y2="108" stroke="#7c4a2d" strokeWidth="0.8" opacity={wo * 0.6}/>
                            <line x1="218" y1="103" x2="228" y2="103" stroke="#7c4a2d" strokeWidth="0.8" opacity={wo * 0.6}/>
                            </>
                        );
                    })()}
                    {/* Roof beams */}
                    {/* <line
                        x1="178"
                        y1={90 + (1 - roof) * 25}
                        x2="205"
                        y2={72 + (1 - roof) * 25}
                        stroke="#8b5e3c"
                        strokeWidth="3"
                        opacity={roof}
                    />


                    <line
                        x1="232"
                        y1={90 + (1 - roof) * 25}
                        x2="205"
                        y2={72 + (1 - roof) * 25}
                        stroke="#8b5e3c"
                        strokeWidth="3"
                        opacity={roof}
                    /> */}


                    {/* Roof */}
                    {/* {roof > 0 && (
                        <polygon
                            points={`176,90 ${206},${68 - (16 * roof)} 236,90`}
                            fill="#b65b38"
                        />
                    )} */}

                    {/* Roof beams appear first */}
                    {roof > 0 && (() => {
                        const currentPeak = 90 - (90 - 50) * roof;
                        const beamOpacity = Math.min(roof / 0.3, 1);
                        return (
                            <>
                            <line x1="174" y1="90" x2="206" y2={currentPeak}
                                stroke="#8b5e3c" strokeWidth="2.5" strokeLinecap="round" opacity={beamOpacity}/>
                            <line x1="238" y1="90" x2="206" y2={currentPeak}
                                stroke="#8b5e3c" strokeWidth="2.5" strokeLinecap="round" opacity={beamOpacity}/>
                            </>
                        );
                    }   )()}

                    {/* Roof surface starts immediately with roof, rises to full peak */}
                    {roof > 0 && (() => {
                        const currentPeak = 90 - (90 - 50) * roof;
                        return (
                            <polygon
                                points={`174,90 206,${currentPeak} 238,90`}
                                fill="#b65b38" opacity={Math.min(roof / 0.15, 1)}
                            />
                        );
                    })()}


                    {/* Roof overhang */}
                    {/* <rect
                        x="174"
                        y="89"
                        width="64"
                        height="3"
                        fill="#8d472b"
                        opacity={roof}
                    /> */}


                    {/* Roof ridge */}
                    {/* <line
                        x1="206"
                        y1={68 - (16 * roof)}
                        x2="206"
                        y2="90"
                        stroke="#8d472b"
                        strokeWidth="1.2"
                        opacity={roof}
                    /> */}


                    {/* Roof shadow */}
                    {/* <polygon
                        points={`206,${66 - (18 * roof)} 236,90 232,94 206,72`}
                        fill="#96452a"
                        opacity={roof}
                    /> */}

                    {/* Roof overhang only after roof surface is mostly there */}
                    {roof > 0 && (
                        <rect
                            x="174"
                            y="89"
                            width="64"
                            height="3"
                            fill="#8d472b"
                            opacity={Math.min(roof / 0.15, 1)}
                        />
                    )}

                    {/* Roof shadow */}
                    {roof > 0 && (() => {
                        const currentPeak = 90 - (90 - 50) * roof;
                        return (
                            <polygon
                                points={`206,${currentPeak} 238,90 234,90 206,${currentPeak + 4}`}
                                fill="#96452a"
                                opacity={Math.min(roof / 0.15, 1) * 0.35}
                            />
                        );
                    })()}


                    {/* Chimney */}
                    {finish > 0.35 && (
                    <>
                        <rect
                            x="220"
                            y="62"
                            width="8"
                            height="18"
                            rx="1"
                            fill="#a0522d"
                        />


                        <rect
                            x="218"
                            y="60"
                            width="12"
                            height="3"
                            rx="1"
                            fill="#7c4a2d"
                        />
                    </>
                    )}


                    {/* Smoke */}
                    {finish > 0.7 && (
                    <>
                        <circle
                            cx="224"
                            cy="58"
                            r="3"
                            fill="#cbd5e1"
                            opacity="0.5"
                            className="smoke1"
                        />


                        <circle
                            cx="225"
                            cy="55"
                            r="4"
                            fill="#cbd5e1"
                            opacity="0.35"
                            className="smoke2"
                        />


                        <circle
                            cx="224"
                            cy="52"
                            r="5"
                            fill="#cbd5e1"
                            opacity="0.2"
                            className="smoke3"
                        />
                    </>
                    )}


                    {/* Door */}
                    <rect
                        x="200"
                        y="102"
                        width="11"
                        height={22 * finish}
                        rx="1"
                        fill="#6d4328"
                    />


                    <circle
                        cx="208"
                        cy="113"
                        r="1"
                        fill="#facc15"
                        opacity={finish}
                    />


                    {finish > 0.5 && (
                    <>
                        {/* Warm light: left window */}
                        <rect x="188" y="98" width="10" height="10" fill="#ffe08a" stroke="#7c4a2d" strokeWidth="1"/>
                        <line x1="193" y1="98" x2="193" y2="108" stroke="#7c4a2d" strokeWidth="0.8" opacity="0.6"/>
                        <line x1="188" y1="103" x2="198" y2="103" stroke="#7c4a2d" strokeWidth="0.8" opacity="0.6"/>
                        {/* Warm light: right window */}
                        <rect x="218" y="98" width="10" height="10" fill="#ffe08a" stroke="#7c4a2d" strokeWidth="1"/>
                        <line x1="223" y1="98" x2="223" y2="108" stroke="#7c4a2d" strokeWidth="0.8" opacity="0.6"/>
                        <line x1="218" y1="103" x2="228" y2="103" stroke="#7c4a2d" strokeWidth="0.8" opacity="0.6"/>
                        {/* Glow halos */}
                        <circle cx="193" cy="103" r="10" fill="#ffd76a" opacity="0.08"/>
                        <circle cx="223" cy="103" r="10" fill="#ffd76a" opacity="0.08"/>
                    </>
                    )}
                    </>
                );
                })()}
            </g>


            {/* Nature */}
            <g id="nature">


               {/* Construction materials */}
                {progress > 0.05 && progress < 0.9 ? (
                <>
                    {/* Brick stack */}
                    <rect x="160" y="126" width="8" height="4" fill="#b85c38"/>
                    <rect x="169" y="126" width="8" height="4" fill="#c96f4a"/>
                    <rect x="164" y="122" width="8" height="4" fill="#b85c38"/>


                    {/* Wooden planks */}
                    <rect x="238" y="122" width="18" height="2" rx="1" fill="#8b5e3c" transform="rotate(-18 238 122)"/>
                    <rect x="240" y="128" width="18" height="2" rx="1" fill="#8b5e3c" transform="rotate(12 240 128)"/>
                </>
                ) : progress >= 0.9 ? (


                <>
                    {/* Bush */}
                    {/* <circle cx="168" cy="128" r="6" fill="#4ade80"/>
                    <circle cx="174" cy="125" r="5" fill="#22c55e"/>
                    <circle cx="180" cy="128" r="6" fill="#4ade80"/> */}

                    {/* Bush — grows from 0.75 */}
                    {(() => {
                    const bs = Math.min(Math.max((progress - 0.75) / 0.15, 0), 1);
                    if (bs === 0) return null;
                    return (
                        <>
                        <circle cx="168" cy="128" r={6 * bs} fill="#4ade80"/>
                        <circle cx="174" cy="125" r={5 * bs} fill="#22c55e"/>
                        <circle cx="180" cy="128" r={6 * bs} fill="#4ade80"/>
                        </>
                    );
                    })()}


                    {/* Flowers */}
                    <circle cx="244" cy="130" r="1.5" fill="#f472b6"/>
                    <circle cx="248" cy="128" r="1.5" fill="#facc15"/>
                    <circle cx="252" cy="130" r="1.5" fill="#60a5fa"/>

                    {/* Tree grows gradually from 0.78 */}
                    {(() => {
                    const ts = Math.min(Math.max((progress - 0.78) / 0.18, 0), 1);
                    if (ts === 0) return null;
                    const trunkH = 20 * ts;
                    return (
                        <>
                        <ellipse cx="257" cy="138" rx={7 * ts} ry={2 * ts} fill="#000" opacity="0.1"/>
                        <rect x="254" y={138 - trunkH} width="3" height={trunkH} rx="1" fill="#8b5e3c"/>
                        <circle cx="255" cy={138 - trunkH} r={8 * ts} fill="#22c55e"/>
                        <circle cx="251" cy={138 - trunkH + 3 * ts} r={6 * ts} fill="#4ade80"/>
                        <circle cx="259" cy={138 - trunkH + 2 * ts} r={6 * ts} fill="#16a34a"/>
                        {/* Birds on tree appear near completion */}
                        {ts > 0.7 && (() => {
                          const bo = Math.min((ts - 0.7) / 0.3, 1);
                          const birdY = 138 - trunkH - 2;
                          return (
                            <>
                              <path d={`M250,${birdY} Q252,${birdY - 2} 254,${birdY}`}
                                fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity={bo}/>
                              <path d={`M256,${birdY - 3} Q258,${birdY - 5} 260,${birdY - 3}`}
                                fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" opacity={bo}/>
                            </>
                          );
                        })()}
                        </>
                    );
                    })()}


                    {/* Fence fades in from 0.82, fully visible at 0.92 */}
                    {(() => {
                    const fo = Math.min(Math.max((progress - 0.82) / 0.10, 0), 1);
                    if (fo === 0) return null;
                    return (
                        <>
                        {[160, 166, 172, 178, 184].map((x, i) => (
                            <rect key={i} x={x} y="128" width="2" height="8" rx="1" fill="#d4a96a" opacity={fo}/>
                        ))}
                        <line x1="160" y1="131" x2="186" y2="131" stroke="#d4a96a" strokeWidth="1.5" strokeLinecap="round" opacity={fo}/>
                        <line x1="160" y1="134" x2="186" y2="134" stroke="#d4a96a" strokeWidth="1.5" strokeLinecap="round" opacity={fo}/>
                        </>
                    );
                    })()}


                    {/* Right side garden */}
                    <circle cx="236" cy="131" r="1.2" fill="#f472b6"/>
                    <circle cx="240" cy="129" r="1.2" fill="#facc15"/>
                    <circle cx="244" cy="131" r="1.2" fill="#60a5fa"/>
                    <circle cx="238" cy="128" r="3" fill="#4ade80"/>
                    <circle cx="243" cy="127" r="2.5" fill="#22c55e"/>
                </>
                ) : null }


            </g>


            {/* Decorations */}
            <g id="decorations">


                {progress > 0.05 && progress < 0.75 ? (              
                <>
                    {/* Scaffold */}
                    <line x1="176" y1="88" x2="176" y2="132" stroke="#8b5e3c" strokeWidth="2"/>
                    <line x1="236" y1="88" x2="236" y2="132" stroke="#8b5e3c" strokeWidth="2"/>
                    <line x1="176" y1="100" x2="236" y2="100" stroke="#8b5e3c" strokeWidth="2"/>
                </>
                ) : progress >= 0.75 ? (
                <>
                    {/* Stone path */}
                    <ellipse cx="206" cy="136" rx="16" ry="3" fill="#b8b8b8"/>
                </>
                ) : null }


            </g>
        </g>


        </g>
        </svg>
    </div>
    );
}


export default StudyBuddy;