import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import vantaCloudsFactory from '../utils/vantaClouds';

export default function ThreeBackground() {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    try {
      // Ensure THREE is globally available for Vanta shaders
      window.THREE = THREE;

      // Initialize the Vanta CLOUDS 3D Volumetric Raymarching Effect
      effectRef.current = vantaCloudsFactory({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 2.0,
        skyColor: 0x5b86e5,        // Blue Eclipse / California Beaches
        cloudColor: 0xc3d9ff,      // Soft Wisteria Cloud Mist
        cloudShadowColor: 0x1e293b,// Stormy Morning Contrast
        sunColor: 0xf59e0b,        // Glowing Horizon Solar Amber
        sunlightColor: 0xfbbf24,   // Golden Hour Sunlight
        sunGlareColor: 0xf97316,   // Warm Sun Glare
        backgroundColor: 0xf8fafc, // Clean White/Slate Foundation
        speed: 0.85
      });
    } catch (err) {
      console.warn('Vanta 3D Clouds initialization warning:', err);
    }

    // Cleanup on unmount
    return () => {
      if (effectRef.current && typeof effectRef.current.destroy === 'function') {
        try {
          effectRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40 dark:opacity-25 transition-opacity"
      aria-hidden="true"
      style={{
        width: '100vw',
        height: '100vh'
      }}
    />
  );
}
