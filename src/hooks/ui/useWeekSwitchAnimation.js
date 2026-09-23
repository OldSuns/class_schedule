import { useEffect, useRef } from "react";
import { useAnimationControls, useReducedMotion } from "framer-motion";

const WEEK_SWITCH_OFFSET_PX = 12;
const WEEK_SWITCH_TRANSITION = {
  duration: 0.16,
  ease: [0.22, 1, 0.36, 1]
};

// 周切换时的轻量滑入动画；尊重系统"减少动态效果"设置
export const useWeekSwitchAnimation = (currentWeek) => {
  const previousWeekRef = useRef(currentWeek);
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const previousWeek = previousWeekRef.current;
    if (previousWeek === currentWeek) {
      controls.set({ opacity: 1, x: 0 });
      return;
    }

    previousWeekRef.current = currentWeek;

    if (prefersReducedMotion) {
      controls.set({ opacity: 1, x: 0 });
      return;
    }

    const direction = currentWeek > previousWeek ? 1 : -1;
    controls.set({
      opacity: 0.96,
      x: direction > 0 ? WEEK_SWITCH_OFFSET_PX : -WEEK_SWITCH_OFFSET_PX
    });

    const animationFrame = window.requestAnimationFrame(() => {
      controls.start({
        opacity: 1,
        x: 0,
        transition: WEEK_SWITCH_TRANSITION
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentWeek, prefersReducedMotion, controls]);

  return controls;
};
