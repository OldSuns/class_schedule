import { useCallback, useEffect, useRef, useState } from "react";
import * as storage from "../../../storage";
import { DISPLAY_MODES, STORAGE_KEYS } from "../../config/constants";

const isValidMode = (mode) =>
  mode === DISPLAY_MODES.ALL || mode === DISPLAY_MODES.CURRENT_ONLY;

/**
 * 管理课程显示模式（仅本周 / 显示全部）
 */
export const useDisplayMode = () => {
  const initialMode =
    storage.getItemSync(STORAGE_KEYS.DISPLAY_MODE) || DISPLAY_MODES.CURRENT_ONLY;
  const [displayMode, setDisplayMode] = useState(
    isValidMode(initialMode) ? initialMode : DISPLAY_MODES.CURRENT_ONLY
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const hasUserChangedModeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadSavedMode = async () => {
      const saved = await storage.getItem(STORAGE_KEYS.DISPLAY_MODE);
      if (cancelled) return;

      if (!hasUserChangedModeRef.current && isValidMode(saved)) {
        setDisplayMode(saved);
      } else if (!saved && !hasUserChangedModeRef.current) {
        await storage.setItem(STORAGE_KEYS.DISPLAY_MODE, DISPLAY_MODES.CURRENT_ONLY);
      }
      if (!cancelled) {
        setIsLoaded(true);
      }
    };

    loadSavedMode();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    storage.setItem(STORAGE_KEYS.DISPLAY_MODE, displayMode);
  }, [displayMode, isLoaded]);

  const handleDisplayModeChange = useCallback((mode) => {
    if (isValidMode(mode)) {
      hasUserChangedModeRef.current = true;
      setDisplayMode(mode);
    }
  }, []);

  return {
    displayMode,
    onDisplayModeChange: handleDisplayModeChange
  };
};
