import { useEffect, useState } from 'react';

export default function RoundTimer({ durationMs, startedAt }) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRemaining(Math.max(0, durationMs - elapsed));
    }, 100);
    return () => clearInterval(interval);
  }, [durationMs, startedAt]);

  const pct = (remaining / durationMs) * 100;
  const seconds = Math.ceil(remaining / 1000);
  const isUrgent = pct <= 30;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
        <circle cx="30" cy="30" r={radius} fill="none" stroke="#2a2a3a" strokeWidth="5" />
        <circle
          cx="30" cy="30" r={radius}
          fill="none"
          stroke={isUrgent ? '#ff4757' : '#3fd0ff'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-mono font-bold text-lg ${isUrgent ? 'text-danger' : 'text-fg'}`}>
          {seconds}
        </span>
      </div>
    </div>
  );
}
