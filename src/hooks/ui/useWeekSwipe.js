import { useCallback, useEffect, useMemo, useRef } from "react";

const SWIPE_MIN_DISTANCE = 56;
const SWIPE_AXIS_BIAS = 1.2;
const SWIPE_AXIS_LOCK_DISTANCE = 12;
const SUPPRESS_CLICK_MS = 350;

export const useWeekSwipe = ({
  enabled = false,
  onSwipeLeft,
  onSwipeRight
} = {}) => {
  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    axis: null,
    tracking: false
  });
  const suppressClickRef = useRef(false);
  const suppressTimeoutRef = useRef(null);

  const resetTouchState = useCallback(() => {
    touchStateRef.current = {
      startX: 0,
      startY: 0,
      axis: null,
      tracking: false
    };
  }, []);

  const clearSuppressClick = useCallback(() => {
    suppressClickRef.current = false;
    if (typeof window !== "undefined" && suppressTimeoutRef.current !== null) {
      window.clearTimeout(suppressTimeoutRef.current);
      suppressTimeoutRef.current = null;
    }
  }, []);

  const triggerSwipe = useCallback(
    (direction) => {
      if (direction === "left") onSwipeLeft?.();
      else onSwipeRight?.();
      suppressClickRef.current = true;
      if (typeof window !== "undefined") {
        if (suppressTimeoutRef.current !== null) {
          window.clearTimeout(suppressTimeoutRef.current);
        }
        suppressTimeoutRef.current = window.setTimeout(() => {
          suppressClickRef.current = false;
          suppressTimeoutRef.current = null;
        }, SUPPRESS_CLICK_MS);
      }
      resetTouchState();
    },
    [onSwipeLeft, onSwipeRight, resetTouchState]
  );

  const handleTouchStart = useCallback(
    (event) => {
      if (!enabled || event.touches.length !== 1) {
        resetTouchState();
        return;
      }
      const touch = event.touches[0];
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        axis: null,
        tracking: true
      };
    },
    [enabled, resetTouchState]
  );

  const handleTouchMove = useCallback(
    (event) => {
      const state = touchStateRef.current;
      if (!enabled || !state.tracking || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (!state.axis) {
        if (absX < SWIPE_AXIS_LOCK_DISTANCE && absY < SWIPE_AXIS_LOCK_DISTANCE) {
          return;
        }
        state.axis = absX > absY ? "x" : "y";
        if (state.axis === "y") {
          state.tracking = false;
          return;
        }
      }

      if (event.cancelable) event.preventDefault();
      if (absX < SWIPE_MIN_DISTANCE || absX <= absY * SWIPE_AXIS_BIAS) return;
      triggerSwipe(deltaX < 0 ? "left" : "right");
    },
    [enabled, triggerSwipe]
  );

  const handleClickCapture = useCallback((event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useEffect(() => {
    if (enabled) return;
    resetTouchState();
    clearSuppressClick();
  }, [clearSuppressClick, enabled, resetTouchState]);

  useEffect(() => clearSuppressClick, [clearSuppressClick]);

  return useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: resetTouchState,
      onTouchCancel: resetTouchState,
      onClickCapture: handleClickCapture
    }),
    [handleClickCapture, handleTouchMove, handleTouchStart, resetTouchState]
  );
};
