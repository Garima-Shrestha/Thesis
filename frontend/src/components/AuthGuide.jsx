import React from 'react';

export default function AuthGuide() {
  return (
    <div className="auth-guide">
      <style>{`
        @keyframes guide-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes guide-blink {
          0%, 85%, 100% { transform: scaleY(1); }
          90% { transform: scaleY(0.08); }
        }
        @keyframes guide-cape {
          0%, 100% { transform: rotate(0deg); transform-origin: top left; }
          50% { transform: rotate(4deg); transform-origin: top left; }
        }
        .guide-body {
          animation: guide-float 3.5s ease-in-out infinite;
        }
        .guide-blink {
          animation: guide-blink 4s ease-in-out infinite;
          transform-origin: 38px 36px;
        }
        .guide-blink2 {
          animation: guide-blink 4s ease-in-out infinite 0.15s;
          transform-origin: 52px 36px;
        }
        .guide-cape {
          animation: guide-cape 3s ease-in-out infinite;
        }
      `}</style>

      <svg
        width="110"
        height="180"
        viewBox="0 0 110 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="guide-body">

          {/* Shadow */}
          <ellipse cx="55" cy="172" rx="20" ry="4" fill="#000" opacity="0.2"/>

          {/* Cape */}
          <path
            d="M34 68 Q24 88 26 118 Q34 124 40 114 Q43 92 45 86 Q50 78 55 86 Q60 78 65 86 Q67 92 70 114 Q76 124 84 118 Q86 88 76 68 Z"
            fill="#1e3a5f"
            className="guide-cape"
          />
          <path
            d="M36 68 Q28 86 30 112"
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
            className="guide-cape"
          />

          {/* Legs */}
          <rect x="38" y="114" width="12" height="26" rx="5" fill="#1e3a5f" stroke="#1d4ed8" strokeWidth="1"/>
          <rect x="60" y="114" width="12" height="26" rx="5" fill="#1e3a5f" stroke="#1d4ed8" strokeWidth="1"/>

          {/* Boots */}
          <ellipse cx="44" cy="140" rx="10" ry="5" fill="#0f172a"/>
          <ellipse cx="66" cy="140" rx="10" ry="5" fill="#0f172a"/>

          {/* Body */}
          <rect x="32" y="68" width="46" height="50" rx="10" fill="#1d4ed8"/>

          {/* Hoodie pocket */}
          <rect x="44" y="96" width="22" height="14" rx="4" fill="#1e40af"/>

          {/* Belt */}
          <rect x="32" y="104" width="46" height="6" rx="2" fill="#0f172a"/>
          <rect x="50" y="103" width="10" height="8" rx="2" fill="#3b82f6"/>

          {/* Arms — relaxed */}
          <line x1="32" y1="78" x2="16" y2="98" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round"/>
          <line x1="78" y1="78" x2="94" y2="98" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round"/>

          {/* Hands */}
          <circle cx="14" cy="100" r="7" fill="#fde68a"/>
          <circle cx="96" cy="100" r="7" fill="#fde68a"/>

          {/* Left hand holding scroll */}
          <rect x="2" y="95" width="14" height="18" rx="3" fill="#d4a96a"/>
          <rect x="4" y="97" width="10" height="14" rx="2" fill="#fef3c7"/>
          <line x1="6" y1="100" x2="12" y2="100" stroke="#92400e" strokeWidth="1"/>
          <line x1="6" y1="103" x2="12" y2="103" stroke="#92400e" strokeWidth="1"/>
          <line x1="6" y1="106" x2="10" y2="106" stroke="#92400e" strokeWidth="1"/>

          {/* Right hand holding glowing orb */}
          <circle cx="96" cy="100" r="7" fill="#fde68a"/>
          <circle cx="96" cy="88" r="6" fill="#3b82f6" opacity="0.9"/>
          <circle cx="96" cy="88" r="9" fill="#3b82f6" opacity="0.15"/>
          <circle cx="94" cy="86" r="2" fill="white" opacity="0.6"/>

          {/* Neck */}
          <rect x="48" y="52" width="14" height="18" rx="4" fill="#fde68a"/>

          {/* Head */}
          <ellipse cx="55" cy="38" rx="24" ry="22" fill="#fde68a"/>
          <ellipse cx="63" cy="34" rx="10" ry="8" fill="#fbbf24" opacity="0.2"/>

          {/* Hair — short dark techy */}
          <path
            d="M32 32 Q30 16 40 12 Q44 20 46 14 Q50 6 55 8 Q60 6 64 14 Q66 20 70 12 Q80 16 78 32"
            fill="#1e293b"
          />
          {/* Hair highlight */}
          <path
            d="M34 26 Q33 18 38 16"
            fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"
          />

          {/* Eyes */}
          <circle cx="44" cy="38" r="6" fill="white" className="guide-blink"/>
          <circle cx="66" cy="38" r="6" fill="white" className="guide-blink2"/>
          <circle cx="45" cy="38" r="3" fill="#1e293b" className="guide-blink"/>
          <circle cx="67" cy="38" r="3" fill="#1e293b" className="guide-blink2"/>
          <circle cx="46" cy="37" r="1" fill="white" className="guide-blink"/>
          <circle cx="68" cy="37" r="1" fill="white" className="guide-blink2"/>

          {/* Friendly smile */}
          <path
            d="M44 48 Q55 56 66 48"
            fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"
          />

          {/* Headband with blue gem */}
          <rect x="32" y="28" width="46" height="7" rx="3.5" fill="#1e3a5f"/>
          <rect x="48" y="26" width="14" height="11" rx="3" fill="#1d4ed8"/>
          <circle cx="55" cy="31" r="3" fill="#60a5fa"/>

          {/* Snake on shoulder — Python nod */}
          <path
            d="M78 80 Q88 74 90 80 Q92 86 84 88 Q80 89 82 94"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="82" cy="96" r="3" fill="#22c55e"/>
          <circle cx="81" cy="95" r="0.8" fill="#0f172a"/>
          <circle cx="83" cy="95" r="0.8" fill="#0f172a"/>

        </g>
      </svg>

      <p className="auth-guide-text">Your guide awaits.</p>
    </div>
  );
}