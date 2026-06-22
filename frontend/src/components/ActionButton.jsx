const ACTION_CONFIG = {
  attack: {
    label: 'Attack',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 20L20 4M20 4H13M20 4V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: '#ff5a7a',
  },
  defend: {
    label: 'Defend',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V12C4 17 7.5 20.5 12 22C16.5 20.5 20 17 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
    color: '#3fd0ff',
  },
  special: {
    label: 'Special',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.5 9H22L16 13.5L18 21L12 16.5L6 21L8 13.5L2 9H9.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    color: '#ffc857',
  },
};

export default function ActionButton({ action, onClick, disabled, cooldown, selected }) {
  const config = ACTION_CONFIG[action];
  const onCooldown = cooldown > 0;

  return (
    <button
      onClick={onClick}
      disabled={disabled || onCooldown}
      className={`action-card relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-4 sm:py-5 flex-1 disabled:opacity-40 disabled:cursor-not-allowed ${
        selected ? 'bg-panel2' : 'bg-panel'
      }`}
      style={{
        borderColor: selected ? config.color : '#2a2a3a',
        color: config.color,
        boxShadow: selected ? `0 0 20px ${config.color}55` : 'none',
      }}
    >
      {config.icon}
      <span className="font-display font-semibold text-sm sm:text-base tracking-wide text-fg">
        {config.label}
      </span>
      {onCooldown && (
        <span className="absolute top-1.5 right-1.5 bg-void text-muted text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-line">
          {cooldown}
        </span>
      )}
    </button>
  );
}
