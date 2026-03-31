import { useCallback, useEffect, useMemo, useRef } from "react";

const SWIPE_MIN_DISTANCE = 56;
const SWIPE_AXIS_BIAS = 1.2;
const SWIPE_AXIS_LOCK_DISTANCE = 12;
const SUPPRESS_CLICK_MS = 350;

export const useWeekSwipe = ({
  enabled = false,
  onSwipeLeft,
  onSwipeRight,
  minDistance = SWIPE_MIN_DISTANCE,
  axisBias = SWIPE_AXIS_BIAS,
  axisLockDistance = SWIPE_AXIS_LOCK_DISTANCE
} = {}) => {
  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    axis: null,
    tracking: false,
    triggered: false
  });
  const suppressClickRef = useRef(false);
  const suppressTimeoutRef = useRef(null);

  const resetTouchState = useCallback(() => {
    touchStateRef.current = {
      startX: 0,
      startY: 0,
      axis: null,
      tracking: false,
      triggered: false
    };
  }, []);

  const clearSuppressClick = useCallback(() => {
    suppressClickRef.current = false;
    if (typeof window !== "undefined" && suppressTimeoutRef.current !== null) {
      window.clearTimeout(suppressTimeoutRef.current);
      suppressTimeoutRef.current = null;
    }
  }, []);

  const startSuppressClickWindow = useCallback(() => {
    suppressClickRef.current = true;
    if (typeof window === "undefined") return;
    if (suppressTimeoutRef.current !== null) {
      window.clearTimeout(suppressTimeoutRef.current);
    }
    suppressTimeoutRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressTimeoutRef.current = null;
    }, SUPPRESS_CLICK_MS);
  }, []);

  const triggerSwipe = useCallback(
    (direction) => {
      if (direction === "left") {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
      startSuppressClickWindow();
      resetTouchState();
    },
    [onSwipeLeft, onSwipeRight, resetTouchState, startSuppressClickWindow]
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
        tracking: true,
        triggered: false
      };
    },
    [enabled, resetTouchState]
  );

  const handleTouchMove = useCallback(
    (event) => {
      const state = touchStateRef.current;
      if (!enabled || !state.tracking || state.triggered || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (!state.axis) {
        if (absX < axisLockDistance && absY < axisLockDistance) {
          return;
        }

        state.axis = absX > absY ? "x" : "y";
        if (state.axis === "y") {
          state.tracking = false;
          return;
        }
      }

      if (state.axis !== "x") {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      if (absX < minDistance || absX <= absY * axisBias) {
        return;
      }

      state.triggered = true;
      triggerSwipe(deltaX < 0 ? "left" : "right");
    },
    [axisBias, axisLockDistance, enabled, minDistance, triggerSwipe]
  );

  const handleTouchEnd = useCallback(() => {
    resetTouchState();
  }, [resetTouchState]);

  const handleClickCapture = useCallback(
    (event) => {
      if (!suppressClickRef.current) return;
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const isSwipeLocked = useCallback(() => suppressClickRef.current, []);

  useEffect(() => {
    if (enabled) return;
    resetTouchState();
    clearSuppressClick();
  }, [clearSuppressClick, enabled, resetTouchState]);

  useEffect(
    () => () => {
      clearSuppressClick();
    },
    [clearSuppressClick]
  );

  return useMemo(
    () => ({
      handlers: {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
        onClickCapture: handleClickCapture
      },
      isSwipeLocked
    }),
    [handleClickCapture, handleTouchEnd, handleTouchMove, handleTouchStart, isSwipeLocked]
  );
};
