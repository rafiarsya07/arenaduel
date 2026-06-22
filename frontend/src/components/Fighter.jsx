// A geometric "fighter" rendered entirely in SVG — no image assets.
// The shape reacts to `pose` (idle | attack | defend | special | hit) via
// CSS transforms and color shifts, driven by simple state, not a sprite sheet.

const POSES = {
  idle: { rotate: 0, scaleY: 1, armAngle: 0 },
  attack: { rotate: -8, scaleY: 1.05, armAngle: -35 },
  defend: { rotate: 0, scaleY: 0.92, armAngle: 15 },
  special: { rotate: -4, scaleY: 1.1, armAngle: -50 },
  hit: { rotate: 6, scaleY: 0.95, armAngle: 10 },
};

export default function Fighter({ color, glowColor, pose = 'idle', facing = 1, shaking = false }) {
  const { rotate, scaleY, armAngle } = POSES[pose] || POSES.idle;

  return (
    <div
      className={`transition-transform duration-300 ${shaking ? 'animate-shake' : ''}`}
      style={{
        transform: `scaleX(${facing}) rotate(${rotate}deg) scaleY(${scaleY})`,
      }}
    >
      <svg width="120" height="150" viewBox="0 0 120 150" fill="none">
        {pose === 'special' && (
          <circle cx="60" cy="80" r="55" fill={glowColor} opacity="0.25" className="animate-pulseGlow" style={{ color: glowColor }} />
        )}

        <line
          x1="60" y1="70"
          x2={60 - 30 * Math.cos((armAngle * Math.PI) / 180)}
          y2={70 + 30 * Math.sin((-armAngle * Math.PI) / 180)}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />

        <rect x="40" y="45" width="40" height="55" rx="14" fill={color} />

        <circle cx="60" cy="28" r="20" fill={color} />

        <rect x="48" y="24" width="24" height="6" rx="3" fill={glowColor} />

        <line
          x1="60" y1="70"
          x2={60 + 32 * Math.cos((armAngle * Math.PI) / 180)}
          y2={70 + 32 * Math.sin((-armAngle * Math.PI) / 180)}
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx={60 + 32 * Math.cos((armAngle * Math.PI) / 180)}
          cy={70 + 32 * Math.sin((-armAngle * Math.PI) / 180)}
          r="9"
          fill={glowColor}
        />

        <rect x="42" y="98" width="14" height="40" rx="6" fill={color} />
        <rect x="64" y="98" width="14" height="40" rx="6" fill={color} />

        <ellipse cx="60" cy="144" rx="28" ry="5" fill="black" opacity="0.3" />
      </svg>
    </div>
  );
}
