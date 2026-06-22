export default function HPBar({ hp, maxHp = 100, color, label, reverse = false }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const isLow = pct <= 25;

  return (
    <div className={reverse ? 'text-right' : ''}>
      <div className={`flex items-baseline gap-2 mb-1 ${reverse ? 'flex-row-reverse' : ''}`}>
        <span className="font-display font-semibold text-sm tracking-wide" style={{ color }}>
          {label}
        </span>
        <span className="font-mono text-xs text-muted">{Math.round(hp)} / {maxHp}</span>
      </div>
      <div className="h-3 bg-panel2 rounded-full overflow-hidden border border-line">
        <div
          className={`hp-bar-fill h-full rounded-full ${isLow ? 'animate-pulse' : ''} ${reverse ? 'ml-auto' : ''}`}
          style={{
            width: `${pct}%`,
            background: isLow
              ? 'linear-gradient(90deg, #ff4757, #ff8a8a)'
              : `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>
    </div>
  );
}
