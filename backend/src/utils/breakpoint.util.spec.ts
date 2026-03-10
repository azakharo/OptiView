import {
  roundToBreakpoint,
  BREAKPOINTS,
  isValidBreakpoint,
  getBreakpointsUpTo,
} from './breakpoint.util';

describe('BreakpointUtil', () => {
  describe('roundToBreakpoint', () => {
    it('should return 320 for very small widths', () => {
      expect(roundToBreakpoint(100)).toBe(320);
      expect(roundToBreakpoint(1)).toBe(320);
      expect(roundToBreakpoint(0)).toBe(320);
      expect(roundToBreakpoint(-50)).toBe(320);
    });

    it('should return 1920 for very large widths', () => {
      expect(roundToBreakpoint(3000)).toBe(1920);
      expect(roundToBreakpoint(5000)).toBe(1920);
      expect(roundToBreakpoint(10000)).toBe(1920);
    });

    it('should round to nearest breakpoint', () => {
      expect(roundToBreakpoint(500)).toBe(640); // Closer to 640 than 320
      expect(roundToBreakpoint(700)).toBe(640); // Closer to 640 than 768
      expect(roundToBreakpoint(720)).toBe(768); // Closer to 768 than 640
      expect(roundToBreakpoint(900)).toBe(1024); // Closer to 1024 than 768
      expect(roundToBreakpoint(895)).toBe(768); // 895 is closer to 768 (127) than 1024 (129)
      expect(roundToBreakpoint(894)).toBe(768); // 894 is closer to 768 (126) than 1024 (130)
    });

    it('should return exact breakpoints unchanged', () => {
      BREAKPOINTS.forEach((bp) => {
        expect(roundToBreakpoint(bp)).toBe(bp);
      });
    });

    it('should handle midpoint between 320 and 640', () => {
      // 480 is exactly midpoint between 320 and 640
      // Algorithm picks first one found when distances are equal
      const result = roundToBreakpoint(480);
      expect([320, 640]).toContain(result);
    });
  });

  describe('isValidBreakpoint', () => {
    it('should return true for valid breakpoints', () => {
      BREAKPOINTS.forEach((bp) => {
        expect(isValidBreakpoint(bp)).toBe(true);
      });
    });

    it('should return false for invalid values', () => {
      expect(isValidBreakpoint(500)).toBe(false);
      expect(isValidBreakpoint(100)).toBe(false);
      expect(isValidBreakpoint(1000)).toBe(false);
      expect(isValidBreakpoint(2000)).toBe(false);
    });
  });

  describe('getBreakpointsUpTo', () => {
    it('should return all breakpoints up to max width', () => {
      expect(getBreakpointsUpTo(640)).toEqual([320, 640]);
      expect(getBreakpointsUpTo(768)).toEqual([320, 640, 768]);
      expect(getBreakpointsUpTo(1024)).toEqual([320, 640, 768, 1024]);
      expect(getBreakpointsUpTo(1920)).toEqual([
        320, 640, 768, 1024, 1280, 1920,
      ]);
    });

    it('should return only smaller breakpoints when max is between breakpoints', () => {
      expect(getBreakpointsUpTo(500)).toEqual([320]);
      expect(getBreakpointsUpTo(700)).toEqual([320, 640]);
      expect(getBreakpointsUpTo(1500)).toEqual([320, 640, 768, 1024, 1280]);
    });

    it('should return empty array for values below minimum breakpoint', () => {
      expect(getBreakpointsUpTo(100)).toEqual([]);
      expect(getBreakpointsUpTo(0)).toEqual([]);
    });
  });
});
