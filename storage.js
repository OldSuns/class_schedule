/**
 * 跨平台存储工具
 * 支持 Web (localStorage) 和 Android (Capacitor Preferences)
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// 检测是否在 Capacitor 原生平台中
const isCapacitor = () => {
  return Capacitor.isNativePlatform();
};

/**
 * 保存数据到存储
 * @param {string} key - 存储键名
 * @param {string} value - 存储值
 */
export const setItem = async (key, value) => {
  try {
    if (isCapacitor()) {
      // Android/iOS: 使用 Capacitor Preferences
      await Preferences.set({ key, value });
      console.log(`移动端保存数据: ${key} = ${value}`);
    } else {
      // Web: 使用 localStorage
      localStorage.setItem(key, value);
      console.log(`Web端保存数据: ${key} = ${value}`);
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
    if (isCapacitor()) {
      // Android/iOS: 使用 Capacitor Preferences
      const { value } = await Preferences.get({ key });
      console.log(`移动端读取数据: ${key} = ${value}`);
      return value;
    } else {
      // Web: 使用 localStorage
      const value = localStorage.getItem(key);
      console.log(`Web端读取数据: ${key} = ${value}`);
      return value;
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
    if (isCapacitor()) {
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
    if (isCapacitor()) {
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
