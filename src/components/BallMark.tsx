export function BallMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <clipPath id="termin-ball-clip">
          <circle cx="32" cy="32" r="29" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="31" fill="#14241c" />
      <g clipPath="url(#termin-ball-clip)">
        <circle cx="32" cy="32" r="29" fill="#f6f3ec" />
        <path
          fill="none"
          stroke="#14241c"
          strokeWidth="1.7"
          strokeLinejoin="round"
          d="M32 21 32 10 46.11 12.58 52.92 25.2 42.46 28.6
             M42.46 28.6 52.92 25.2 54.83 39.42 44.93 49.8 38.47 40.9
             M38.47 40.9 44.93 49.8 32 56 19.07 49.8 25.53 40.9
             M25.53 40.9 19.07 49.8 9.17 39.42 11.08 25.2 21.54 28.6
             M21.54 28.6 11.08 25.2 17.89 12.58 32 10 32 21"
        />
        <polygon
          fill="#14241c"
          points="32,21 42.46,28.6 38.47,40.9 25.53,40.9 21.54,28.6"
        />
        <polygon fill="#14241c" points="51.98,4.5 54.53,12.32 47.87,17.16 41.21,12.32 43.76,4.5" />
        <polygon fill="#14241c" points="64.34,42.5 57.68,47.34 51.02,42.5 53.57,34.68 61.79,34.68" />
        <polygon fill="#14241c" points="32,66 25.34,61.16 27.89,53.34 36.11,53.34 38.66,61.16" />
        <polygon fill="#14241c" points="-0.34,42.5 2.21,34.68 10.43,34.68 12.98,42.5 6.32,47.34" />
        <polygon fill="#14241c" points="12.02,4.5 20.24,4.5 22.79,12.32 16.13,17.16 9.47,12.32" />
      </g>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="#14241c"
        strokeWidth="2.2"
      />
    </svg>
  );
}
