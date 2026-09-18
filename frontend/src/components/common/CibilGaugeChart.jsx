import React from 'react';

const CibilGaugeChart = ({ score = 785, showFooter = true, isDark = true, compact = false, className = '' }) => {
  // Score normalization between 300 and 900
  const clampedScore = Math.min(Math.max(Number(score) || 300, 300), 900);
  const fraction = (clampedScore - 300) / 600;
  const angleFromLeft = fraction * 180; // 0 to 180 deg
  const needleRotation = angleFromLeft - 90; // -90 (pointing left) to +90 (pointing right)

  // Determine score health category
  let ratingText = 'Excellent';
  let ratingColor = isDark ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (clampedScore < 550) {
    ratingText = 'Poor';
    ratingColor = isDark ? 'text-rose-400 bg-rose-500/20 border-rose-500/30' : 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (clampedScore < 650) {
    ratingText = 'Average';
    ratingColor = isDark ? 'text-orange-400 bg-orange-500/20 border-orange-500/30' : 'text-orange-700 bg-orange-50 border-orange-200';
  } else if (clampedScore < 720) {
    ratingText = 'Fair';
    ratingColor = isDark ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' : 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (clampedScore < 780) {
    ratingText = 'Good';
    ratingColor = isDark ? 'text-lime-400 bg-lime-500/20 border-lime-500/30' : 'text-lime-700 bg-lime-50 border-lime-200';
  }

  // Precomputed exact SVG arc segment paths (cx=100, cy=105, r=80, stroke=15)
  const segments = [
    { path: 'M 20.01 103.60 A 80 80 0 0 1 67.46 31.92', color: '#EA580C', label: 'Poor (300-520)' },
    { path: 'M 70.03 30.83 A 80 80 0 0 1 113.89 26.22', color: '#F97316', label: 'Fair (520-630)' },
    { path: 'M 116.63 26.75 A 80 80 0 0 1 149.25 41.96', color: '#EAB308', label: 'Moderate (630-720)' },
    { path: 'M 151.42 43.72 A 80 80 0 0 1 170.64 67.44', color: '#84CC16', label: 'Good (720-800)' },
    { path: 'M 171.90 69.93 A 80 80 0 0 1 179.99 103.60', color: '#16A34A', label: 'Excellent (800-900)' },
  ];

  return (
    <div className={`flex flex-col items-center justify-center text-center w-full select-none ${className}`}>
      {/* Title */}
      <h3 className={`text-xs sm:text-sm font-black tracking-tight mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Your CIBIL Score
      </h3>

      {/* Speedometer Gauge SVG */}
      <div className={`relative w-full ${compact ? 'max-w-[180px]' : 'max-w-[220px]'} aspect-[200/120]`}>
        <svg
          viewBox="0 0 200 130"
          className="w-full h-full overflow-visible"
        >
          {/* 5 Distinct Colored Arc Segments with subtle spacing */}
          {segments.map((seg, idx) => (
            <path
              key={idx}
              d={seg.path}
              fill="none"
              stroke={seg.color}
              strokeWidth="15"
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          ))}

          {/* Semicircle Center Pivot Hub */}
          <path
            d="M 75 105 A 25 25 0 0 1 125 105 Z"
            fill={isDark ? '#334155' : '#E2E8F0'}
            stroke={isDark ? '#475569' : '#CBD5E1'}
            strokeWidth="1"
          />

          {/* Dynamic Needle Pointer */}
          <g transform={`rotate(${needleRotation}, 100, 105)`} className="transition-transform duration-700 ease-out">
            {/* Tapered Sleek Needle */}
            <line
              x1="100"
              y1="105"
              x2="100"
              y2="28"
              stroke={isDark ? '#FFFFFF' : '#0F172A'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Center needle pin */}
            <circle
              cx="100"
              cy="105"
              r="4.5"
              fill={isDark ? '#38BDF8' : '#0F172A'}
              stroke={isDark ? '#FFFFFF' : 'none'}
              strokeWidth="1"
            />
          </g>

          {/* Semicircle Scale Range Labels */}
          <text
            x="20"
            y="122"
            fill={isDark ? '#CBD5E1' : '#64748B'}
            fontSize="11"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
          >
            300
          </text>
          <text
            x="180"
            y="122"
            fill={isDark ? '#CBD5E1' : '#64748B'}
            fontSize="11"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
          >
            900
          </text>
        </svg>
      </div>

      {/* Prominent High-Contrast Score Display */}
      <div className="mt-0.5 flex flex-col items-center">
        <span className={`text-3xl sm:text-4xl font-black font-sans tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-950'}`}>
          {clampedScore}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mt-1 ${ratingColor}`}>
          {ratingText}
        </span>
      </div>

      {/* Institutional Endorsement Subtext */}
      {showFooter && (
        <div className="mt-2 px-1">
          <p className={`text-[11px] font-extrabold leading-tight ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
            7000+ banks &amp; financial institutions in India
          </p>
          <p className={`text-[10px] mt-0.5 leading-tight ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            rely on CIBIL Score to approve loans/credit cards
          </p>
        </div>
      )}
    </div>
  );
};

export default CibilGaugeChart;
