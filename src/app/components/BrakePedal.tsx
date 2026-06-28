import { BLUE } from '../constants/coins';

export default function BrakePedal({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="54" fill="#EEF2FF" stroke={BLUE} strokeWidth="5" />
      {/* Arm */}
      <rect x="50" y="22" width="20" height="50" rx="8" fill={BLUE} opacity="0.85" />
      {/* Joint circle */}
      <circle cx="60" cy="72" r="8" fill={BLUE} />
      {/* Pedal plate */}
      <rect x="20" y="76" width="80" height="22" rx="7" fill={BLUE} />
      {/* Treads */}
      {[30, 42, 54, 66, 78, 90].map((x) => (
        <rect key={x} x={x} y="78" width="5" height="18" rx="2.5" fill="white" opacity="0.25" />
      ))}
      {/* Label */}
      <text
        x="60"
        y="91"
        textAnchor="middle"
        fontSize="8"
        fill="white"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="1"
      >
        BRAKE
      </text>
    </svg>
  );
}
