/**
 * 跨平台存储工具
 * 支持 Web (localStorage) 和 Android (Capacitor Preferences)
 */

// 检测是否在 Capacitor 环境中
const isCapacitor = () => {
  return typeof window !== 'undefined' &&
         window.Capacitor !== undefined;
};

// 动态导入 Capacitor Preferences（仅在 Capacitor 环境中）
let Preferences = null;
if (isCapacitor()) {
  try {
    // 在 Capacitor 环境中导入
    import('@capacitor/preferences').then(module => {
      Preferences = module.Preferences;
    });
  } catch (error) {
    console.warn('Capacitor Preferences not available:', error);
  }
}

/**
 * 保存数据到存储
 * @param {string} key - 存储键名
 * @param {string} value - 存储值
 */
export const setItem = async (key, value) => {
  try {
    if (isCapacitor() && Preferences) {
      // Android/iOS: 使用 Capacitor Preferences
      await Preferences.set({ key, value });
    } else {
      // Web: 使用 localStorage
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('存储数据失败:', error);
  }
};

/**
 * 从存储中读取数据
 * @param {string} key - 存储键名
 * @returns {Promise<string|null>} 存储的值
 */
export const getItem = async (key) => {
  try {
    if (isCapacitor() && Preferences) {
      // Android/iOS: 使用 Capacitor Preferences
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      // Web: 使用 localStorage
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.error('读取数据失败:', error);
    return null;
  }
};

/**
 * 从存储中删除数据
 * @param {string} key - 存储键名
 */
export const removeItem = async (key) => {
  try {
    if (isCapacitor() && Preferences) {
      // Android/iOS: 使用 Capacitor Preferences
      await Preferences.remove({ key });
    } else {
      // Web: 使用 localStorage
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('删除数据失败:', error);
  }
};

/**
 * 清空所有存储数据
 */
export const clear = async () => {
  try {
    if (isCapacitor() && Preferences) {
      // Android/iOS: 使用 Capacitor Preferences
      await Preferences.clear();
    } else {
      // Web: 使用 localStorage
      localStorage.clear();
    }
  } catch (error) {
    console.error('清空数据失败:', error);
  }
};

// 同步版本的 getItem（仅用于初始化状态）
export const getItemSync = (key) => {
  try {
    if (isCapacitor()) {
      // Capacitor 环境下返回 null，需要在 useEffect 中异步加载
      return null;
    } else {
      // Web 环境下可以同步读取
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.error('同步读取数据失败:', error);
    return null;
  }
};
