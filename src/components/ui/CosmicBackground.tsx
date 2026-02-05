'use client';

/**
 * CosmicBackground - Animated mesh gradient background with floating orbs
 * Creates a deep space atmosphere with slowly moving color gradients
 */
export function CosmicBackground() {
  return (
    <div className="cosmic-bg" aria-hidden="true">
      {/* Floating orbs for depth - proves glass transparency */}
      <div className="cosmic-orb cosmic-orb-1" />
      <div className="cosmic-orb cosmic-orb-2" />
      <div className="cosmic-orb cosmic-orb-3" />
    </div>
  );
}
