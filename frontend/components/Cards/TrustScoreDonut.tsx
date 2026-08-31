"use client";

type TrustScoreDonutProps = {
  score?: number | null;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
};

export default function TrustScoreDonut({
  score = 0,
  size = 26,
  strokeWidth = 3,
  showLabel = true,
}: TrustScoreDonutProps) {
  const safeScore = Math.max(0, Math.min(10, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 10) * circumference;

  // Gradation Color Rules:
  // 1 - 5 : Kuning (Yellow / Amber gradient)
  // 6 - 10 : Hijau (Emerald / Green gradient)
  const isGreen = safeScore >= 6;
  const isZero = safeScore === 0;

  const startColor = isZero ? "#9CA3AF" : isGreen ? "#34D399" : "#FBBF24";
  const stopColor = isZero ? "#6B7280" : isGreen ? "#059669" : "#D97706";
  const textColor = isZero ? "text-gray-500" : isGreen ? "text-emerald-700" : "text-amber-700";
  const gradientId = `donut-grad-${safeScore}-${size}`;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      title={`Trust Score: ${safeScore}/10 (${isGreen ? "High Trust (6-10)" : "Low/Medium Trust (1-5)"})`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={stopColor} />
          </linearGradient>
        </defs>

        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Donut Progress Bar Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center Score Number */}
      {showLabel && (
        <span
          className={`absolute text-[9px] font-extrabold ${textColor} select-none leading-none`}
        >
          {safeScore}
        </span>
      )}
    </div>
  );
}
