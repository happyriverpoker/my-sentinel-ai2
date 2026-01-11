
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Main Brand Gradients */}
          <linearGradient id="vora-grad-primary" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#4338CA" />
          </linearGradient>
          
          <linearGradient id="vora-grad-secondary" x1="80" y1="20" x2="20" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Inner Spark Gradient */}
          <radialGradient id="spark-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Hexagonal Frame (Faint) */}
        <path 
          d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeOpacity="0.1"
          className="text-slate-500"
        />

        {/* The "V" Facets - Modern Split Chevron */}
        <path 
          d="M25 30L50 55L50 85L20 45L25 30Z" 
          fill="url(#vora-grad-primary)" 
          className="drop-shadow-sm"
        />
        <path 
          d="M75 30L50 55L50 85L80 45L75 30Z" 
          fill="url(#vora-grad-secondary)"
          fillOpacity="0.9"
          className="drop-shadow-sm"
        />

        {/* The "Intelligence" Spark - Central Node */}
        <circle 
          cx="50" 
          cy="50" 
          r="8" 
          fill="url(#spark-grad)" 
          className="animate-pulse"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="3" 
          fill="#22D3EE" 
          filter="url(#logo-glow)"
        />

        {/* Accent Diamond (Floating Insight) */}
        <path 
          d="M50 15L56 25L50 35L44 25L50 15Z" 
          fill="#818CF8" 
          className="animate-bounce"
          style={{ animationDuration: '3s' }}
        />
      </svg>
    </div>
  );
};

export default Logo;
