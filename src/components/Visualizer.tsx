import { useState, useEffect, useRef } from 'react';

export default function Visualizer() {
  const [listening, setListening] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-stop after 10 seconds on first mount
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setListening(false);
    }, 10000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggle = () => {
    // Clear auto-stop timer if still running
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setListening((prev) => !prev);
  };

  const bars = [30, 45, 60, 70, 60, 45, 30];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative py-8">
      {/* Voice Visualizer Circle - Clickable */}
      <div className="relative">
        <button
          onClick={handleToggle}
          className={`w-[280px] h-[280px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
            listening ? 'animate-pulse-glow' : ''
          }`}
          style={{
            background: listening
              ? 'radial-gradient(circle, var(--color-bg) 0%, var(--color-bg) 60%, transparent 60%), conic-gradient(from 0deg, var(--color-accent-cyan), var(--color-accent-purple), var(--color-accent-cyan))'
              : 'radial-gradient(circle, var(--color-bg) 0%, var(--color-bg) 60%, transparent 60%), conic-gradient(from 0deg, #374151, #4b5563, #374151)',
          }}
        >
          <div className={`w-[220px] h-[220px] rounded-full bg-theme-panel border-2 flex items-center justify-center transition-colors duration-500 ${
            listening ? 'border-theme-border' : 'border-gray-700'
          }`}>
            {/* Sound Bars */}
            <div className="flex items-center gap-1.5 h-20">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-500 ${
                    listening
                      ? 'bg-gradient-to-t from-cyan-primary to-purple-primary'
                      : 'bg-gray-600'
                  } ${
                    listening
                      ? i % 2 === 0
                        ? 'animate-sound-wave'
                        : 'animate-sound-wave-alt'
                      : ''
                  }`}
                  style={{ height: listening ? `${h}px` : '15px' }}
                />
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* Status */}
      <div className="mt-8 text-center">
        <div className={`text-3xl font-light tracking-[0.5em] mb-2 transition-colors duration-500 ${
          listening ? 'text-theme-text' : 'text-theme-text-muted'
        }`}>
          {listening ? 'LISTENING' : 'NOT LISTENING'}
        </div>
        <div className={`font-mono text-sm transition-colors duration-500 ${
          listening ? 'text-cyan-primary' : 'text-gray-600'
        }`}>
          {listening ? 'VOICE_CAPTURE_ACTIVE :: DB_84' : 'VOICE_CAPTURE_PAUSED :: IDLE'}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-16 mt-12 pt-8 border-t border-dark-border">
        <div className="text-center">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">
            Latency
          </div>
          <div className="text-xl font-semibold">{listening ? '24ms' : '--'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">
            Confidence
          </div>
          <div className="text-xl font-semibold">{listening ? '99.2%' : '--'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">
            Environment
          </div>
          <div className="text-xl font-semibold text-cyan-primary">
            Production
          </div>
        </div>
      </div>
    </div>
  );
}
