import React from 'react';

/**
 * Ultra-Fast 60/120 FPS Ambient Background
 * Zero-GPU overhead: Pure CSS radial gradients without expensive Gaussian blur filters.
 * Eliminates all input latency, mouse cursor stutter, and scroll delay.
 */
export default function ThreeBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(56, 189, 248, 0.14) 0%, transparent 45%),
          radial-gradient(circle at 90% 15%, rgba(192, 132, 252, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 50% 90%, rgba(251, 146, 60, 0.09) 0%, transparent 50%),
          radial-gradient(#0f172a 0.75px, transparent 0.75px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 24px 24px',
        contain: 'strict'
      }}
    />
  );
}

