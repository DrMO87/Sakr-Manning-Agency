import React from "react";

/**
 * AnimatedRobotIcon — An SVG robot face that animates:
 *   - "thinking" state: eyes sweep side-to-side, antenna pulses
 *   - "idle" state: gentle float + subtle blink
 *   - "online" state: steady glow
 */
const AnimatedRobotIcon = ({ size = 48, state = "idle", isDark = false }) => {
  const s = size;

  // Color palette
  const faceColor = isDark ? "#1e293b" : "#e0f2fe";
  const faceBorder = isDark ? "#38bdf8" : "#0284c7";
  const eyeColor = isDark ? "#22d3ee" : "#0369a1";
  const antennaGlow = isDark ? "#22d3ee" : "#0ea5e9";
  const mouthColor = isDark ? "#38bdf8" : "#0284c7";

  return (
    <div
      style={{
        width: s,
        height: s,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <svg
        width={s}
        height={s}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`robot-icon robot-${state}`}
      >
        {/* Antenna */}
        <line
          x1="32"
          y1="8"
          x2="32"
          y2="16"
          stroke={faceBorder}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="antenna-stick"
        />
        <circle
          cx="32"
          cy="6"
          r="3.5"
          fill={antennaGlow}
          className="antenna-tip"
        />

        {/* Head */}
        <rect
          x="10"
          y="16"
          width="44"
          height="36"
          rx="12"
          ry="12"
          fill={faceColor}
          stroke={faceBorder}
          strokeWidth="2.5"
          className="robot-head"
        />

        {/* Left Eye */}
        <ellipse
          cx="24"
          cy="32"
          rx="4.5"
          ry="5"
          fill={eyeColor}
          className="robot-eye robot-eye-left"
        />
        {/* Left Eye pupil/glint */}
        <circle cx="25.5" cy="30.5" r="1.5" fill="white" opacity="0.8" className="robot-pupil-left" />

        {/* Right Eye */}
        <ellipse
          cx="40"
          cy="32"
          rx="4.5"
          ry="5"
          fill={eyeColor}
          className="robot-eye robot-eye-right"
        />
        {/* Right Eye pupil/glint */}
        <circle cx="41.5" cy="30.5" r="1.5" fill="white" opacity="0.8" className="robot-pupil-right" />

        {/* Mouth - changes based on state */}
        {state === "thinking" ? (
          // Thinking: wavy animated mouth
          <path
            d="M24 42 Q28 44 32 42 Q36 40 40 42"
            stroke={mouthColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="robot-mouth-think"
          />
        ) : (
          // Idle/Online: friendly smile
          <path
            d="M24 41 Q32 47 40 41"
            stroke={mouthColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="robot-mouth-smile"
          />
        )}

        {/* Ear bolts */}
        <circle cx="10" cy="32" r="3" fill={faceBorder} opacity="0.5" />
        <circle cx="54" cy="32" r="3" fill={faceBorder} opacity="0.5" />
      </svg>

      <style>{`
        /* === BASE FLOAT === */
        .robot-icon {
          transition: filter 0.3s;
        }

        /* === IDLE STATE: gentle float + blink === */
        .robot-idle {
          animation: robotFloat 3s ease-in-out infinite;
        }
        .robot-idle .antenna-tip {
          animation: antennaPulseIdle 2.5s ease-in-out infinite;
        }
        .robot-idle .robot-eye {
          animation: robotBlink 4s ease-in-out infinite;
        }

        /* === THINKING STATE: eyes scan, antenna rapid pulse, head wobble === */
        .robot-thinking {
          animation: robotThink 1.2s ease-in-out infinite;
          filter: drop-shadow(0 0 6px ${antennaGlow}40);
        }
        .robot-thinking .antenna-tip {
          animation: antennaThinkPulse 0.6s ease-in-out infinite;
        }
        .robot-thinking .robot-eye-left {
          animation: eyeScanLeft 1.4s ease-in-out infinite;
        }
        .robot-thinking .robot-eye-right {
          animation: eyeScanRight 1.4s ease-in-out infinite;
        }
        .robot-thinking .robot-pupil-left {
          animation: pupilScan 1.4s ease-in-out infinite;
        }
        .robot-thinking .robot-pupil-right {
          animation: pupilScan 1.4s ease-in-out infinite;
        }
        .robot-thinking .robot-mouth-think {
          animation: mouthWobble 0.8s ease-in-out infinite;
        }

        /* === ONLINE STATE: steady glow === */
        .robot-online {
          animation: robotFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 0 8px ${antennaGlow}50);
        }
        .robot-online .antenna-tip {
          animation: antennaGlow 1.5s ease-in-out infinite;
        }

        /* ========= KEYFRAMES ========= */
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes robotThink {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-1.5deg); }
          75% { transform: translateY(-2px) rotate(1.5deg); }
        }
        @keyframes antennaPulseIdle {
          0%, 100% { opacity: 0.7; r: 3.5; }
          50% { opacity: 1; r: 4; }
        }
        @keyframes antennaThinkPulse {
          0%, 100% { opacity: 0.5; fill: ${antennaGlow}; r: 3; }
          50% { opacity: 1; fill: #facc15; r: 5; }
        }
        @keyframes antennaGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes robotBlink {
          0%, 42%, 44%, 100% { ry: 5; }
          43% { ry: 0.5; }
        }
        @keyframes eyeScanLeft {
          0%, 100% { cx: 24; }
          30% { cx: 21; }
          70% { cx: 27; }
        }
        @keyframes eyeScanRight {
          0%, 100% { cx: 40; }
          30% { cx: 37; }
          70% { cx: 43; }
        }
        @keyframes pupilScan {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        @keyframes mouthWobble {
          0%, 100% { d: path("M24 42 Q28 44 32 42 Q36 40 40 42"); }
          50% { d: path("M24 42 Q28 40 32 42 Q36 44 40 42"); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedRobotIcon;
