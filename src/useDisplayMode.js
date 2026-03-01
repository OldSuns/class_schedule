import { useCallback, useEffect, useState } from "react";
import * as storage from "../storage";
import { DISPLAY_MODES, STORAGE_KEYS } from "./constants";

const isValidMode = (mode) =>
  mode === DISPLAY_MODES.ALL || mode === DISPLAY_MODES.CURRENT_ONLY;

/**
 * 管理课程显示模式（仅本周 / 显示全部）
 */
export const useDisplayMode = () => {
  const initialMode =
    storage.getItemSync(STORAGE_KEYS.DISPLAY_MODE) || DISPLAY_MODES.ALL;
  const [displayMode, setDisplayMode] = useState(
    isValidMode(initialMode) ? initialMode : DISPLAY_MODES.ALL
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSavedMode = async () => {
      const saved = await storage.getItem(STORAGE_KEYS.DISPLAY_MODE);
      if (isValidMode(saved)) {
        setDisplayMode(saved);
      } else if (!saved) {
        await storage.setItem(STORAGE_KEYS.DISPLAY_MODE, DISPLAY_MODES.ALL);
      }
      setIsLoaded(true);
    };

    loadSavedMode();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    storage.setItem(STORAGE_KEYS.DISPLAY_MODE, displayMode);
  }, [displayMode, isLoaded]);

  const handleDisplayModeChange = useCallback((mode) => {
    if (isValidMode(mode)) {
      setDisplayMode(mode);
    }
  }, []);

  return {
    displayMode,
    onDisplayModeChange: handleDisplayModeChange
  };
};
