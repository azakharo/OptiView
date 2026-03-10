/**
 * Fixed breakpoints for responsive images
 * Per ADR-003: Fixed Breakpoints with Rounding
 */
export const BREAKPOINTS = [320, 640, 768, 1024, 1280, 1920] as const;

export type Breakpoint = (typeof BREAKPOINTS)[number];

/**
 * Round a given width to the nearest breakpoint
 * @param width - The requested image width
 * @returns The nearest breakpoint value
 */
export function roundToBreakpoint(width: number): Breakpoint {
  // Clamp to valid range
  const clampedWidth = Math.max(
    BREAKPOINTS[0],
    Math.min(width, BREAKPOINTS[BREAKPOINTS.length - 1]),
  );

  // Find nearest breakpoint
  return BREAKPOINTS.reduce((prev, curr) =>
    Math.abs(curr - clampedWidth) < Math.abs(prev - clampedWidth) ? curr : prev,
  );
}

/**
 * Get all breakpoints up to and including a maximum width
 * @param maxWidth - Maximum width to include
 * @returns Array of breakpoints up to maxWidth
 */
export function getBreakpointsUpTo(maxWidth: number): Breakpoint[] {
  return BREAKPOINTS.filter((bp) => bp <= maxWidth);
}

/**
 * Check if a value is a valid breakpoint
 */
export function isValidBreakpoint(value: number): value is Breakpoint {
  return BREAKPOINTS.includes(value as Breakpoint);
}
