export default function AccelPedal({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="54" fill="#fff1f2" stroke="#dc2626" strokeWidth="5" />
      {/* Speed lines */}
      <line x1="14" y1="44" x2="38" y2="44" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.3" />
      <line x1="10" y1="57" x2="36" y2="57" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <line x1="14" y1="70" x2="38" y2="70" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.3" />
      {/* Arm - slightly angled forward */}
      <rect
        x="50"
        y="22"
        width="20"
        height="50"
        rx="8"
        fill="#dc2626"
        opacity="0.85"
        transform="rotate(-6 60 47)"
      />
      {/* Joint */}
      <circle cx="60" cy="72" r="8" fill="#dc2626" />
      {/* Pedal plate */}
      <rect x="20" y="76" width="80" height="22" rx="7" fill="#dc2626" />
      {[30, 42, 54, 66, 78, 90].map((x) => (
        <rect key={x} x={x} y="78" width="5" height="18" rx="2.5" fill="white" opacity="0.25" />
      ))}
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
        ACCEL
      </text>
    </svg>
  );
}
