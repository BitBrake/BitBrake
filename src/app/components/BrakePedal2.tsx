import { BLUE } from '../constants/coins';

export default function BrakePedal2({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="54" fill="#fecaca" stroke="#fecaca" strokeWidth="5" />
      <rect x="28" y="46" width="64" height="28" rx="8" fill="#ef4444" />
      <text
        x="60"
        y="65"
        textAnchor="middle"
        fontSize="13"
        fill="white"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="2"
      >
        BRAKE
      </text>
    </svg>
  );
}
