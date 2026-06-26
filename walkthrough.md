# Walkthrough: Splash Screens, Offline Model Bundling & Latency Optimizations

We have successfully integrated native splash screens, bundled the Whisper and KWS models directly inside the application, and optimized latency parameters to provide a snappy, fully offline experience.

---

## 1. Native Splash Screens Integration

- **Logo Generation**: Created a high-resolution logo graphic containing the "Focus Aid" branding and clinical suite information, converting the background to transparent.
- **Android**: Configured a themed launcher splash screen using [launch_screen.xml](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/android/app/src/main/res/drawable/launch_screen.xml) to show the logo instantly on startup and transition smoothly.
- **iOS**: Updated [LaunchScreen.storyboard](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/ios/HearingTriggerRN/LaunchScreen.storyboard) to present a centered `UIImageView` using the new logo asset, forcing a white background in all system themes.

---

## 2. Offline Model Bundling & linking

### Whisper and Sherpa-ONNX Models Staged:

- **Android**: Plist & Model assets copied to `android/app/src/main/assets/models/`.
- **iOS**: Copied to `ios/models/`.

### iOS Xcode Project Linking:

- We wrote and executed a custom Swift compilation tool using the XcodeProj library in the `scratch/` directory to link the `ios/models/` folder reference directly to `HearingTriggerRN.xcodeproj`.
- Verified that the folder reference correctly appears in the resources copy build phase under [project.pbxproj](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/ios/HearingTriggerRN.xcodeproj/project.pbxproj).

### JS Asset Copy Logic:

- Updated [modelManager.ts](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/src/services/modelManager.ts) to check for local model existence in `RNFS.DocumentDirectoryPath`. On first run, the app extracts the models from native assets (using `copyFileAssets` on Android or bundle path `copyFile` on iOS) to the filesystem instead of downloading over the internet.
- Updated [paths.ts](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/src/utils/paths.ts), [HomeScreen.tsx](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/src/screens/HomeScreen.tsx), and [SettingsScreen.tsx](file:///Users/sathyapriya/Desktop/React-Native/hearing-trigger-rn/src/screens/SettingsScreen.tsx) to use the quantized medium model (`medium.en-q5_0`) by default.

---

## 3. Latency & Logging Optimizations

- **Pre-roll Tuning**: Reduced the pre-roll capture buffer to **0.5 seconds** (down from 1.0s) on both Android (`HearingForegroundService.kt`) and iOS (`HearingTriggerModule.swift`) to minimize audio chunk sizes processed by Whisper.
- **VAD Sensitivity**: Lowered the minimum sustained speech verification threshold to **350ms** (down from 700ms) on both Android and iOS for faster, near-instant speech detection.
- **Post-Capture Window**: Reduced the keyword post-capture recording duration to **1.0 second** (down from 1.5s/3.0s) in `kwsService.ts` to decrease wait delay after speech onset.
- **Whisper Multithreading**: Configured Whisper to utilize **4 CPU threads** during transcription in `whisperService.ts`.
- **Instantaneous KWS Logging**: Separated the logging stages in `audioBridge.ts` so the `[AudioBridge] KWS Triggered (Native VAD)` message prints immediately when the native module detects speech, rather than waiting for Whisper to transcribe first. It also tracks and prints the exact Whisper transcription duration (e.g., `Whisper Transcript (230ms)`).

---

## 4. Compilation Verification

- **Android**: Executed `./gradlew assembleDebug` successfully with all assets bundled.
- **iOS**: Executed `xcodebuild` successfully on the simulator target workspace with resources linked.
