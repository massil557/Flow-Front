export default function LoginLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Text */}
      <span className="text-3xl font-semibold text-white tracking-tight">
        flow
      </span>

      {/* Animated wave */}
      <svg
        width="60"
        height="24"
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        <path
          fill="none"
          stroke="url(#waveGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            dur="2s"
            repeatCount="indefinite"
            values="
              M0 20 C 30 5, 90 35, 120 20;
              M0 20 C 30 35, 90 5, 120 20;
              M0 20 C 30 5, 90 35, 120 20
            "
          />
        </path>
      </svg>
    </div>
  );
}
