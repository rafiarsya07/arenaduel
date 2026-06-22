export default function FloatingDamage({ amount, outcome, visible }) {
  if (!visible || amount === undefined) return null;

  const isZero = amount === 0;
  const text = isZero
    ? outcome === 'blocked'
      ? 'BLOCKED'
      : outcome === 'neutral'
      ? '—'
      : '0'
    : `-${amount}`;

  const color = isZero ? '#3fd0ff' : '#ff4757';

  return (
    <div
      className="absolute -top-2 left-1/2 -translate-x-1/2 animate-floatUp font-display font-bold text-2xl pointer-events-none whitespace-nowrap"
      style={{ color }}
    >
      {text}
    </div>
  );
}
