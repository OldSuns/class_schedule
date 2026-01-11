# Android 应用构建指南

本文档说明如何将课表应用打包成 Android APK。

## 方案选择

### 方案 1: 使用 Capacitor（推荐）

Capacitor 是 Ionic 团队开发的跨平台应用运行时，可以将 Web 应用打包成原生 Android/iOS 应用。

#### 优点：
- ✅ 代码已经适配完成（使用 storage.js）
- ✅ 支持原生功能（相机、文件系统等）
- ✅ 性能好，接近原生应用
- ✅ 支持 Android、iOS、Web 三端

#### 构建步骤：

**1. 安装 Capacitor**

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/preferences
npx cap init
```

在初始化时输入：
- App name: `课程表`
- App ID: `com.yourname.schedule`（自定义包名）
- Web directory: `dist`（或 `build`，取决于你的构建输出目录）

**2. 添加 Android 平台**

```bash
npm install @capacitor/android
npx cap add android
```

**3. 构建 Web 应用**

```bash
npm run build
```

**4. 同步到 Android**

```bash
npx cap sync android
```

**5. 打开 Android Studio**

```bash
npx cap open android
```

**6. 在 Android Studio 中构建 APK**

- 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
- 等待构建完成
- APK 文件位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

### 方案 2: 使用 WebView（最简单）

如果你只需要简单的 Android 应用，可以使用原生 WebView。

#### 优点：
- ✅ 无需修改代码
- ✅ localStorage 自动工作
- ✅ 构建简单快速

#### 缺点：
- ❌ 功能受限（无法使用原生功能）
- ❌ 性能略差

#### 构建步骤：

1. 在 Android Studio 中创建新项目
2. 在 `MainActivity.kt` 中添加 WebView
3. 加载你的 Web 应用 URL 或本地 HTML 文件

---

### 方案 3: 使用 React Native

如果你想要完全原生的体验，可以使用 React Native 重写应用。

#### 优点：
- ✅ 完全原生性能
- ✅ 丰富的原生组件

#### 缺点：
- ❌ 需要重写大量代码
- ❌ 学习成本高

---

## 配置说明

### Capacitor 配置文件 (capacitor.config.json)

```json
{
  "appId": "com.yourname.schedule",
  "appName": "课程表",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#4F46E5"
    }
  }
}
```

### Android 权限配置

在 `android/app/src/main/AndroidManifest.xml` 中添加必要权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 常见问题

### Q1: 如何修改应用图标？

**答：** 将图标文件放在以下位置：
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

或使用在线工具生成：https://icon.kitchen/

### Q2: 如何生成签名的 APK（用于发布）？

**答：** 在 Android Studio 中：
1. 点击 `Build` → `Generate Signed Bundle / APK`
2. 选择 `APK`
3. 创建或选择密钥库
4. 选择 `release` 构建类型
5. 构建完成后，APK 位于 `android/app/release/`

### Q3: 缓存功能在 Android 上不工作？

**答：** 确保已安装 `@capacitor/preferences`：
```bash
npm install @capacitor/preferences
npx cap sync
```

### Q4: 如何调试 Android 应用？

**答：**
1. 连接 Android 设备或启动模拟器
2. 在 Android Studio 中点击运行按钮
3. 打开 Chrome，访问 `chrome://inspect`
4. 找到你的应用并点击 `inspect`

---

## 推荐工具

- **Android Studio**: https://developer.android.com/studio
- **Capacitor 文档**: https://capacitorjs.com/docs
- **图标生成器**: https://icon.kitchen/
- **启动屏幕生成器**: https://www.appicon.co/

---

## 下一步

构建完成后，你可以：

1. **测试应用**：在真机或模拟器上安装测试
2. **优化性能**：使用 Chrome DevTools 分析性能
3. **发布应用**：上传到 Google Play Store
4. **添加功能**：集成推送通知、日历同步等

---

## 技术支持

如果遇到问题，可以：
- 查看 Capacitor 官方文档
- 在 GitHub Issues 中提问
- 查看 Stack Overflow 相关问题
