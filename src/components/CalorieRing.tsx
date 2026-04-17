interface CalorieRingProps {
  consumed: number;
  target: number;
}

export default function CalorieRing({ consumed, target }: CalorieRingProps) {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const strokeDashoffset = circumference - pct * circumference;
  const remaining = Math.max(target - consumed, 0);
  const over = consumed > target;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#27272a"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={over ? '#ef4444' : '#3b82f6'}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${over ? 'text-red-400' : 'text-white'}`}>
          {Math.round(remaining)}
        </span>
        <span className="text-xs text-zinc-400 mt-0.5">kcal restantes</span>
        <span className="text-xs text-zinc-500 mt-1">{Math.round(consumed)} / {Math.round(target)}</span>
      </div>
    </div>
  );
}
