import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as storage from "../../../storage";
import { THEMES, STORAGE_KEYS } from "../../config/constants";

const isValidTheme = (theme) =>
  theme === THEMES.M3 || theme === THEMES.MINIMAL;

const applyThemeClass = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("theme-m3", "theme-minimal");
  document.documentElement.classList.add(`theme-${theme}`);
};

/**
 * 管理主题切换（M3 / 简约）
 */
export const useTheme = () => {
  const initialTheme =
    storage.getItemSync(STORAGE_KEYS.THEME) || THEMES.M3;
  const validInitialTheme = isValidTheme(initialTheme) ? initialTheme : THEMES.M3;

  const [theme, setTheme] = useState(validInitialTheme);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasUserChangedThemeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadSavedTheme = async () => {
      const saved = await storage.getItem(STORAGE_KEYS.THEME);
      if (cancelled) return;

      if (!hasUserChangedThemeRef.current && isValidTheme(saved)) {
        setTheme(saved);
      } else if (!saved && !hasUserChangedThemeRef.current) {
        await storage.setItem(STORAGE_KEYS.THEME, THEMES.M3);
      }
      if (!cancelled) {
        setIsLoaded(true);
      }
    };

    loadSavedTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    storage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme, isLoaded]);

  // 在浏览器绘制前同步应用主题 class，避免闪烁。
  // 仅依赖 theme：普通重渲染不会重新执行，因此不会用初始值覆盖用户的选择。
  useLayoutEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const handleThemeChange = useCallback((newTheme) => {
    if (isValidTheme(newTheme)) {
      hasUserChangedThemeRef.current = true;
      setTheme(newTheme);
    }
  }, []);

  return {
    theme,
    onThemeChange: handleThemeChange
  };
};
