import React from 'react';

/**
 * High-Performance GPU-Accelerated Ambient Aurora Background
 * Replaces heavy 3D WebGL volumetric raymarching with pure CSS hardware-accelerated
 * radial gradients. Eliminates main-thread scroll jank, CPU spikes, and frame drops.
 */
export default function ThreeBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f8fafc',
        contain: 'strict'
      }}
    >
      {/* Orb 1: Soft Cyan / Sky Glow Top-Left */}
      <div
        className="absolute rounded-full blur-3xl opacity-30 dark:opacity-20 animate-ambient-drift-1"
        style={{
          top: '-10%',
          left: '-5%',
          width: '55vw',
          height: '55vw',
          maxWidth: '650px',
          maxHeight: '650px',
          background: 'radial-gradient(circle, #38bdf8 0%, #60a5fa 40%, transparent 70%)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)'
        }}
      />

      {/* Orb 2: Elegant Wisteria / Purple Glow Top-Right */}
      <div
        className="absolute rounded-full blur-3xl opacity-25 dark:opacity-15 animate-ambient-drift-2"
        style={{
          top: '5%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          maxWidth: '600px',
          maxHeight: '600px',
          background: 'radial-gradient(circle, #c084fc 0%, #818cf8 40%, transparent 70%)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)'
        }}
      />

      {/* Orb 3: Warm Solar Horizon Amber Bottom-Center */}
      <div
        className="absolute rounded-full blur-3xl opacity-20 dark:opacity-10 animate-ambient-drift-3"
        style={{
          bottom: '-15%',
          left: '25%',
          width: '60vw',
          height: '45vw',
          maxWidth: '700px',
          maxHeight: '500px',
          background: 'radial-gradient(circle, #fde047 0%, #fb923c 40%, transparent 70%)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)'
        }}
      />

      {/* Subtle Noise / Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
