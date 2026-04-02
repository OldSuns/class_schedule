# Android warning cleanup design

## Goal
Remove the Gradle `flatDir` warnings emitted by `./gradlew.bat clean assembleDebug` using the smallest safe repo-local change.

## Current warning sources
- `android/app/build.gradle` declares:
  - `repositories { flatDir { dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs' } }`
  - `implementation fileTree(include: ['*.jar'], dir: 'libs')`
- `android/capacitor-cordova-android-plugins/build.gradle` declares:
  - `repositories { flatDir { dirs 'src/main/libs', 'libs' } }`
  - `implementation fileTree(dir: 'src/main/libs', include: ['*.jar'])`
- The referenced directories currently contain no jar files, so these declarations are unused and only trigger Gradle warnings.

## Approved scope
Implement only approach 1:
- Remove the unused `flatDir` repository blocks.
- Remove the unused local jar `fileTree(...)` dependencies.
- Do not change Capacitor versions or attempt to remove the `:capacitor-android:compileDebugJavaWithJavac` unchecked-operation note in this pass.

## Design
### Files to change
1. `android/app/build.gradle`
2. `android/capacitor-cordova-android-plugins/build.gradle`

### Changes
- Delete the repo-local `flatDir` configuration from both files.
- Delete the matching local jar dependency declarations.
- Keep all Maven/project dependencies unchanged.

### Expected result
After rerunning `./gradlew.bat clean assembleDebug`:
- The two `Using flatDir should be avoided...` warnings should disappear.
- The `:capacitor-android:compileDebugJavaWithJavac` unchecked-operation note is expected to remain.
- Build output should still be successful.

## Validation
Run:
```bash
cd android
./gradlew.bat clean assembleDebug
```

Success means:
- Build succeeds.
- No `flatDir` warnings are printed for `:app` or `:capacitor-cordova-android-plugins`.
- Only the upstream Capacitor javac note remains.
